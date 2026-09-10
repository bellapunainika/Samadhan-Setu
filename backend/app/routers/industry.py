"""
routers/industry.py — Stage 3 Industry Partnership & CSR Opportunities Endpoints.
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models.user import User, UserRole
from app.models.challenge import Challenge, ChallengeStatus
from app.models.industry import IndustryInterest, IndustryInterestStatus
from app.schemas.challenge import ChallengeOut
from app.schemas.industry import ExpressInterestRequest, IndustryInterestOut
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/industry", tags=["Industry & CSR Partnership"])


def require_industry(current_user: User = Depends(get_current_user)) -> User:
    """Authorization guard: Enforce Industry role."""
    if current_user.role != UserRole.industry:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Industry/CSR account privileges required for this action."
        )
    return current_user


@router.get(
    "/opportunities",
    response_model=List[ChallengeOut],
    summary="Get eligible R&D opportunities for industry CSR investment & co-development"
)
def get_industry_opportunities(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Industry opportunities include approved, assigned, in-progress, solution submitted, and completed challenges
    eligible_statuses = [
        ChallengeStatus.APPROVED,
        ChallengeStatus.ASSIGNED,
        ChallengeStatus.IN_PROGRESS,
        ChallengeStatus.SOLUTION_SUBMITTED,
        ChallengeStatus.COMPLETED,
        ChallengeStatus.VALIDATED
    ]

    opportunities = db.query(Challenge).filter(
        Challenge.status.in_(eligible_statuses)
    ).order_by(Challenge.updated_at.desc()).all()

    return opportunities


@router.post(
    "/opportunities/{challenge_identifier}/express-interest",
    response_model=IndustryInterestOut,
    summary="Express CSR partnership or tech mentorship interest in a project"
)
def express_interest(
    challenge_identifier: str,
    payload: ExpressInterestRequest,
    user: User = Depends(require_industry),
    db: Session = Depends(get_db)
):
    challenge = None
    try:
        val = uuid.UUID(challenge_identifier)
        challenge = db.query(Challenge).filter(Challenge.id == str(val)).first()
    except (ValueError, AttributeError):
        pass

    if not challenge:
        challenge = db.query(Challenge).filter(Challenge.short_id == challenge_identifier).first()

    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found.")

    # Check for duplicate pending/accepted request by same industry user for same challenge
    existing = db.query(IndustryInterest).filter(
        IndustryInterest.challenge_id == challenge.id,
        IndustryInterest.industry_user_id == user.id,
        IndustryInterest.status.in_([IndustryInterestStatus.PENDING_ADMIN_REVIEW, IndustryInterestStatus.ACCEPTED])
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Your organization has already submitted an active interest request for this project."
        )

    req = IndustryInterest(
        challenge_id=challenge.id,
        industry_user_id=user.id,
        company_name=payload.company_name,
        contact_email=payload.contact_email,
        support_type=payload.support_type,
        message=payload.message,
        status=IndustryInterestStatus.PENDING_ADMIN_REVIEW,
        created_at=datetime.now(timezone.utc)
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@router.get(
    "/my-interests",
    response_model=List[IndustryInterestOut],
    summary="Get requests submitted by the logged-in industry identity"
)
def get_my_interests(
    user: User = Depends(require_industry),
    db: Session = Depends(get_db)
):
    requests = db.query(IndustryInterest).filter(
        IndustryInterest.industry_user_id == user.id
    ).order_by(IndustryInterest.created_at.desc()).all()
    return requests


@router.get(
    "/stats",
    summary="Get real database industry partnership metrics"
)
def get_industry_stats(
    user: User = Depends(require_industry),
    db: Session = Depends(get_db)
):
    eligible_count = db.query(Challenge).filter(
        Challenge.status.in_([
            ChallengeStatus.APPROVED,
            ChallengeStatus.ASSIGNED,
            ChallengeStatus.IN_PROGRESS,
            ChallengeStatus.SOLUTION_SUBMITTED,
            ChallengeStatus.COMPLETED
        ])
    ).count()

    my_interests = db.query(IndustryInterest).filter(
        IndustryInterest.industry_user_id == user.id
    )

    pending_count = my_interests.filter(IndustryInterest.status == IndustryInterestStatus.PENDING_ADMIN_REVIEW).count()
    accepted_count = my_interests.filter(IndustryInterest.status == IndustryInterestStatus.ACCEPTED).count()
    declined_count = my_interests.filter(IndustryInterest.status == IndustryInterestStatus.DECLINED).count()

    return {
        "available_opportunities": eligible_count,
        "total_my_interests": my_interests.count(),
        "pending_requests": pending_count,
        "accepted_requests": accepted_count,
        "declined_requests": declined_count
    }
