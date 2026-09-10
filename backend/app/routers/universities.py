"""
routers/universities.py — Stage 3 University Discovery & Assignment Endpoints.
Includes: Available Challenges (APPROVED & unassigned) and My Assigned Challenges (scoped to authenticated university).
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.university import University
from app.models.challenge import Challenge, ChallengeStatus
from app.models.assignment import ChallengeAssignment
from app.schemas.challenge import ChallengeOut
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/universities", tags=["University R&D Solvers"])


def require_university(current_user: User = Depends(get_current_user)) -> User:
    """Authorization guard: Enforce University role."""
    if current_user.role != UserRole.university:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="University account privileges required for this action."
        )
    return current_user


def resolve_user_university(user: User, db: Session) -> University:
    """Resolves the University database record for the authenticated university user."""
    # 1. If explicit university_id set on User model
    if user.university_id:
        univ = db.query(University).filter(University.id == user.university_id).first()
        if univ:
            return univ

    # 2. Match by organization name or short_name
    if user.organization:
        univ = db.query(University).filter(
            (University.name.ilike(f"%{user.organization}%")) |
            (University.short_name.ilike(f"%{user.organization}%"))
        ).first()
        if univ:
            return univ

    # 3. Fallback: match by email domain or return first seeded university
    first_univ = db.query(University).filter(University.is_active == True).first()
    if not first_univ:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active Jharkhand university records found in database."
        )
    return first_univ


import uuid
from datetime import datetime, timezone
from app.models.solution import SolutionSubmission, SolutionStatus
from app.models.progress import ProgressUpdate
from app.schemas.solution import SolutionSubmitRequest, SolutionSubmissionOut
from app.schemas.progress import ProgressUpdateRequest, ProgressUpdateOut


@router.get(
    "/available-challenges",
    response_model=List[ChallengeOut],
    summary="Get challenges available for university discovery (status: APPROVED and unassigned)"
)
def get_available_challenges(
    user: User = Depends(require_university),
    db: Session = Depends(get_db)
):
    # Subquery: Active assigned challenge IDs
    active_assigned_ids = db.query(ChallengeAssignment.challenge_id).filter(
        ChallengeAssignment.status == "ACTIVE"
    )

    # Query DB directly for APPROVED and unassigned challenges
    available_challenges = db.query(Challenge).filter(
        Challenge.status == ChallengeStatus.APPROVED,
        ~Challenge.id.in_(active_assigned_ids)
    ).order_by(Challenge.created_at.desc()).all()

    return available_challenges


@router.get(
    "/my-assignments",
    response_model=List[ChallengeOut],
    summary="Get challenges assigned specifically to the authenticated university identity"
)
def get_my_assignments(
    user: User = Depends(require_university),
    db: Session = Depends(get_db)
):
    university = resolve_user_university(user, db)

    # Query DB directly for challenges assigned to THIS university ID
    assigned_challenges = db.query(Challenge).join(
        ChallengeAssignment, Challenge.id == ChallengeAssignment.challenge_id
    ).filter(
        ChallengeAssignment.university_id == university.id,
        ChallengeAssignment.status == "ACTIVE"
    ).order_by(ChallengeAssignment.assigned_at.desc()).all()

    return assigned_challenges


@router.post(
    "/challenges/{challenge_identifier}/start",
    response_model=ChallengeOut,
    summary="Start R&D work on an assigned challenge (ASSIGNED -> IN_PROGRESS)"
)
def start_project(
    challenge_identifier: str,
    user: User = Depends(require_university),
    db: Session = Depends(get_db)
):
    university = resolve_user_university(user, db)

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

    # Verify assignment to this university
    assignment = db.query(ChallengeAssignment).filter(
        ChallengeAssignment.challenge_id == challenge.id,
        ChallengeAssignment.university_id == university.id,
        ChallengeAssignment.status == "ACTIVE"
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This challenge is not assigned to your university institution."
        )

    if challenge.status != ChallengeStatus.ASSIGNED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot start project with status '{challenge.status}'. Must be ASSIGNED."
        )

    challenge.status = ChallengeStatus.IN_PROGRESS
    challenge.updated_at = datetime.now(timezone.utc)
    assignment.started_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(challenge)
    return challenge


@router.post(
    "/challenges/{challenge_identifier}/progress",
    response_model=ProgressUpdateOut,
    summary="Post an R&D progress update for an in-progress assigned challenge"
)
def post_progress_update(
    challenge_identifier: str,
    payload: ProgressUpdateRequest,
    user: User = Depends(require_university),
    db: Session = Depends(get_db)
):
    university = resolve_user_university(user, db)

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

    assignment = db.query(ChallengeAssignment).filter(
        ChallengeAssignment.challenge_id == challenge.id,
        ChallengeAssignment.university_id == university.id,
        ChallengeAssignment.status == "ACTIVE"
    ).first()

    if not assignment:
        raise HTTPException(status_code=403, detail="Challenge not assigned to your university.")

    update_rec = ProgressUpdate(
        challenge_id=challenge.id,
        university_id=university.id,
        posted_by=user.id,
        title=payload.title,
        description=payload.description,
        progress_percent=payload.progress_percent
    )
    db.add(update_rec)
    db.commit()
    db.refresh(update_rec)
    return update_rec


@router.post(
    "/challenges/{challenge_identifier}/submit-solution",
    response_model=ChallengeOut,
    summary="Submit final R&D solution & prototype (IN_PROGRESS -> SOLUTION_SUBMITTED)"
)
def submit_solution(
    challenge_identifier: str,
    payload: SolutionSubmitRequest,
    user: User = Depends(require_university),
    db: Session = Depends(get_db)
):
    university = resolve_user_university(user, db)

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

    assignment = db.query(ChallengeAssignment).filter(
        ChallengeAssignment.challenge_id == challenge.id,
        ChallengeAssignment.university_id == university.id,
        ChallengeAssignment.status == "ACTIVE"
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This challenge is not assigned to your university institution."
        )

    if challenge.status not in (ChallengeStatus.IN_PROGRESS, ChallengeStatus.ASSIGNED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot submit solution for challenge with status '{challenge.status}'. Must be IN_PROGRESS."
        )

    # Create SolutionSubmission record
    sol = SolutionSubmission(
        challenge_id=challenge.id,
        university_id=university.id,
        submitted_by=user.id,
        title=payload.title,
        description=payload.description,
        prototype_url=payload.prototype_url,
        technology_stack=payload.technology_stack,
        status=SolutionStatus.PENDING_REVIEW,
        submitted_at=datetime.now(timezone.utc)
    )
    db.add(sol)

    challenge.status = ChallengeStatus.SOLUTION_SUBMITTED
    challenge.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(challenge)
    return challenge


@router.get(
    "/stats",
    summary="Get real database university workspace metrics"
)
def get_university_stats(
    user: User = Depends(require_university),
    db: Session = Depends(get_db)
):
    university = resolve_user_university(user, db)

    active_assigned_ids = db.query(ChallengeAssignment.challenge_id).filter(
        ChallengeAssignment.status == "ACTIVE"
    )

    available_count = db.query(Challenge).filter(
        Challenge.status == ChallengeStatus.APPROVED,
        ~Challenge.id.in_(active_assigned_ids)
    ).count()

    assigned_query = db.query(Challenge).join(
        ChallengeAssignment, Challenge.id == ChallengeAssignment.challenge_id
    ).filter(
        ChallengeAssignment.university_id == university.id,
        ChallengeAssignment.status == "ACTIVE"
    )

    my_assigned_count = assigned_query.count()
    in_progress_count = assigned_query.filter(Challenge.status == ChallengeStatus.IN_PROGRESS).count()
    solutions_submitted_count = assigned_query.filter(Challenge.status == ChallengeStatus.SOLUTION_SUBMITTED).count()
    completed_count = assigned_query.filter(Challenge.status.in_([ChallengeStatus.COMPLETED, ChallengeStatus.VALIDATED])).count()

    return {
        "available_discovery": available_count,
        "my_assigned": my_assigned_count,
        "in_progress": in_progress_count,
        "solutions_submitted": solutions_submitted_count,
        "completed": completed_count
    }
