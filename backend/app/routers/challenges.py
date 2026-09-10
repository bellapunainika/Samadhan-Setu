"""
routers/challenges.py — Challenge submission and AI analysis endpoints.
"""
import random
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.district import District
from app.models.challenge import Challenge, AIPrediction, ChallengeStatus
from app.schemas.challenge import ChallengeCreateRequest, ChallengeOut
from app.auth.dependencies import get_current_user
from app.services.ai_service import (
    classify_challenge,
    calculate_priority_score,
    recommend_universities,
    detect_duplicates
)

router = APIRouter(prefix="/api/challenges", tags=["Challenges"])


def generate_short_id(db: Session) -> str:
    """Generates a unique JH-2026-XXXX short ID."""
    for _ in range(100):
        rand_num = random.randint(1000, 9999)
        sid = f"JH-2026-{rand_num}"
        existing = db.query(Challenge).filter(Challenge.short_id == sid).first()
        if not existing:
            return sid
    raise HTTPException(status_code=500, detail="Failed to generate unique challenge ID.")


@router.post(
    "/",
    response_model=ChallengeOut,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a new grassroots challenge for AI classification & university matching",
)
def create_challenge(
    payload: ChallengeCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Validate District Existence
    district = db.query(District).filter(District.id == payload.district_id).first()
    if not district:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid district_id '{payload.district_id}'. Select a valid Jharkhand district.",
        )

    # 2. Create Challenge Record (Status: UNDER_REVIEW)
    short_id = generate_short_id(db)
    challenge = Challenge(
        short_id=short_id,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        district_id=payload.district_id,
        block_locality=payload.block_locality,
        latitude=payload.latitude,
        longitude=payload.longitude,
        affected_population=payload.affected_population,
        citizen_severity=payload.citizen_severity,
        submitter_id=current_user.id,
        submitter_type=payload.submitter_type or "Individual Citizen",
        submitter_name=payload.submitter_name or current_user.full_name,
        original_language=payload.original_language or "en",
        status=ChallengeStatus.UNDER_REVIEW,
    )
    db.add(challenge)
    db.flush()

    # 3. Trigger Deterministic AI Service
    primary_sector, subcategory, keywords = classify_challenge(
        title=payload.title,
        description=payload.description,
        category_hint=payload.category
    )

    priority_score, priority_label, prio_explanation = calculate_priority_score(
        citizen_severity=payload.citizen_severity,
        affected_pop=payload.affected_population or 50,
        extracted_keywords=keywords,
        primary_sector=primary_sector
    )

    recommendations = recommend_universities(
        db=db,
        primary_sector=primary_sector,
        challenge_district_id=payload.district_id
    )

    is_duplicate, sim_score, similar_ids, sim_class = detect_duplicates(
        db=db,
        title=payload.title,
        description=payload.description,
        district_id=payload.district_id,
        exclude_challenge_id=challenge.id,
        exclude_short_id=challenge.short_id
    )

    # Update challenge subcategory
    challenge.subcategory = subcategory

    # 4. Save AI Prediction Record
    ai_prediction = AIPrediction(
        challenge_id=challenge.id,
        primary_sector=primary_sector,
        subcategory=subcategory,
        priority_score=priority_score,
        priority_label=priority_label,
        keywords=keywords,
        suggested_domain=primary_sector,
        duplicate_flag=is_duplicate,
        similarity_score=sim_score,
        similar_challenge_ids=similar_ids,
        recommended_universities=recommendations,
        overall_explanation=prio_explanation,
        model_version="rule-hybrid-v1"
    )
    db.add(ai_prediction)
    db.commit()
    db.refresh(challenge)

    return challenge


@router.get(
    "/my",
    response_model=List[ChallengeOut],
    summary="Get challenges submitted by the authenticated citizen",
)
def get_my_challenges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    challenges = db.query(Challenge).filter(Challenge.submitter_id == current_user.id).order_by(Challenge.created_at.desc()).all()
    return challenges


@router.get(
    "/stats/citizen",
    summary="Get real database citizen dashboard metrics for the authenticated citizen user"
)
def get_citizen_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Challenge).filter(Challenge.submitter_id == current_user.id)
    total = query.count()
    under_review = query.filter(Challenge.status == ChallengeStatus.UNDER_REVIEW).count()
    approved = query.filter(Challenge.status == ChallengeStatus.APPROVED).count()
    assigned = query.filter(Challenge.status == ChallengeStatus.ASSIGNED).count()
    in_progress = query.filter(Challenge.status == ChallengeStatus.IN_PROGRESS).count()
    solution_submitted = query.filter(Challenge.status == ChallengeStatus.SOLUTION_SUBMITTED).count()
    completed = query.filter(Challenge.status.in_([ChallengeStatus.COMPLETED, ChallengeStatus.VALIDATED])).count()
    rejected = query.filter(Challenge.status == ChallengeStatus.REJECTED).count()

    return {
        "total": total,
        "under_review": under_review,
        "approved": approved,
        "assigned": assigned,
        "in_progress": in_progress,
        "solution_submitted": solution_submitted,
        "completed": completed,
        "rejected": rejected
    }


import uuid

@router.get(
    "/{challenge_identifier}",
    response_model=ChallengeOut,
    summary="Get challenge details and AI analysis by UUID or short_id",
)
def get_challenge(
    challenge_identifier: str,
    db: Session = Depends(get_db)
):
    challenge = None
    # 1. If challenge_identifier is a valid UUID format, query by UUID primary key
    try:
        val = uuid.UUID(challenge_identifier)
        challenge = db.query(Challenge).filter(Challenge.id == str(val)).first()
    except (ValueError, AttributeError):
        pass

    # 2. If not found by UUID or if challenge_identifier is a short_id string, query by short_id
    if not challenge:
        challenge = db.query(Challenge).filter(Challenge.short_id == challenge_identifier).first()

    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Challenge with identifier '{challenge_identifier}' not found.",
        )

    return challenge
