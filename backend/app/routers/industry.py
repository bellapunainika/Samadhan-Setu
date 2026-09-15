"""
routers/industry.py — Industry Partnership & Validated Solution Opportunities.

Workflow:
  1. University clicks "Seek Industry Support" (universities router) →
     ChallengeStatus becomes INDUSTRY_SUPPORT_REQUESTED (no IndustryInterest created).
  2. Industry sees INDUSTRY_SUPPORT_REQUESTED challenges in /opportunities.
  3. Industry calls POST .../express-interest → ONE real IndustryInterest record created
     with status INTEREST_EXPRESSED. industry_user_id = actual Industry-role user.
  4. Proposal progresses via /proposals/{id}/update-status with role-appropriate gates:
       University may advance: INTEREST_EXPRESSED → PROPOSAL_INITIATED
                               PROPOSAL_INITIATED → PROPOSAL_UNDER_DISCUSSION
                               PROPOSAL_UNDER_DISCUSSION → SUPPORT_CONFIRMED
       Industry may advance:   INTEREST_EXPRESSED → PROPOSAL_INITIATED (if university hasn't)
                               PROPOSAL_INITIATED → PROPOSAL_UNDER_DISCUSSION
                               SUPPORT_CONFIRMED → FUNDING_CONFIRMED
                               FUNDING_CONFIRMED → PROJECT_FUNDED
  5. PROJECT_FUNDED → ChallengeStatus set to COMPLETED. Admin NOT involved.
"""
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models.user import User, UserRole
from app.models.challenge import Challenge, ChallengeStatus
from app.models.industry import IndustryInterest, IndustryInterestStatus
from app.schemas.challenge import ChallengeOut
from app.schemas.industry import ExpressInterestRequest, IndustryInterestOut, ProposalStatusUpdateRequest
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


def require_industry_or_university(current_user: User = Depends(get_current_user)) -> User:
    """Authorization guard: Allow Industry or University roles."""
    if current_user.role not in (UserRole.industry, UserRole.university):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Industry or University account required for this action."
        )
    return current_user


# ── Role-based transition rules ────────────────────────────────────────────
# Maps (from_status, calling_role) → list of allowed target statuses
ALLOWED_TRANSITIONS = {
    # University may initiate proposal and confirm their side
    (IndustryInterestStatus.INTEREST_EXPRESSED,        UserRole.university): [IndustryInterestStatus.PROPOSAL_INITIATED],
    (IndustryInterestStatus.PROPOSAL_INITIATED,        UserRole.university): [IndustryInterestStatus.PROPOSAL_UNDER_DISCUSSION],
    (IndustryInterestStatus.PROPOSAL_UNDER_DISCUSSION, UserRole.university): [IndustryInterestStatus.SUPPORT_CONFIRMED],

    # Industry may also initiate/discuss, and must confirm funding
    (IndustryInterestStatus.INTEREST_EXPRESSED,        UserRole.industry):   [IndustryInterestStatus.PROPOSAL_INITIATED],
    (IndustryInterestStatus.PROPOSAL_INITIATED,        UserRole.industry):   [IndustryInterestStatus.PROPOSAL_UNDER_DISCUSSION],
    (IndustryInterestStatus.SUPPORT_CONFIRMED,         UserRole.industry):   [IndustryInterestStatus.FUNDING_CONFIRMED],
    (IndustryInterestStatus.FUNDING_CONFIRMED,         UserRole.industry):   [IndustryInterestStatus.PROJECT_FUNDED],

    # Either side may decline or withdraw
    (IndustryInterestStatus.INTEREST_EXPRESSED,        UserRole.university): [IndustryInterestStatus.PROPOSAL_INITIATED, IndustryInterestStatus.DECLINED],
    (IndustryInterestStatus.INTEREST_EXPRESSED,        UserRole.industry):   [IndustryInterestStatus.PROPOSAL_INITIATED, IndustryInterestStatus.WITHDRAWN],
    (IndustryInterestStatus.PROPOSAL_INITIATED,        UserRole.industry):   [IndustryInterestStatus.PROPOSAL_UNDER_DISCUSSION, IndustryInterestStatus.WITHDRAWN],
    (IndustryInterestStatus.PROPOSAL_UNDER_DISCUSSION, UserRole.industry):   [IndustryInterestStatus.SUPPORT_CONFIRMED, IndustryInterestStatus.WITHDRAWN],
}


def get_allowed_targets(current_status: IndustryInterestStatus, role: UserRole) -> List[IndustryInterestStatus]:
    return ALLOWED_TRANSITIONS.get((current_status, role), [])


# ── Endpoints ───────────────────────────────────────────────────────────────

@router.get(
    "/opportunities",
    response_model=List[ChallengeOut],
    summary="Get validated solutions where the University is actively seeking industry support"
)
def get_industry_opportunities(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns only challenges with status INDUSTRY_SUPPORT_REQUESTED.
    These are solutions that have been:
      1. Validated by Admin (SOLUTION_APPROVED)
      2. Explicitly flagged by the University as seeking industry support
    """
    opportunities = db.query(Challenge).filter(
        Challenge.status == ChallengeStatus.INDUSTRY_SUPPORT_REQUESTED
    ).order_by(Challenge.updated_at.desc()).all()
    return opportunities


@router.post(
    "/opportunities/{challenge_identifier}/express-interest",
    response_model=IndustryInterestOut,
    summary="Express interest in funding/supporting a validated university solution"
)
def express_interest(
    challenge_identifier: str,
    payload: ExpressInterestRequest,
    user: User = Depends(require_industry),
    db: Session = Depends(get_db)
):
    """
    Creates ONE real IndustryInterest record. Caller must be an Industry-role user.
    The challenge must have status INDUSTRY_SUPPORT_REQUESTED.
    Duplicate active records per (industry_user_id, challenge_id) are rejected.
    Does NOT change ChallengeStatus.
    """
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

    if challenge.status != ChallengeStatus.INDUSTRY_SUPPORT_REQUESTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This solution is not currently seeking industry support (status: {challenge.status}). "
                   "The university must first seek industry support before interest can be expressed."
        )

    # Duplicate protection: one active record per (industry_user_id, challenge_id)
    existing = db.query(IndustryInterest).filter(
        IndustryInterest.challenge_id == challenge.id,
        IndustryInterest.industry_user_id == user.id,
        IndustryInterest.status.notin_([
            IndustryInterestStatus.DECLINED,
            IndustryInterestStatus.WITHDRAWN
        ])
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Your organization has already submitted an active interest request for this project."
        )

    req = IndustryInterest(
        challenge_id=challenge.id,
        industry_user_id=user.id,   # Real Industry user only
        company_name=payload.company_name,
        contact_email=payload.contact_email,
        support_type=payload.support_type,
        pledged_amount=payload.pledged_amount,
        message=payload.message,
        status=IndustryInterestStatus.INTEREST_EXPRESSED,
        created_at=datetime.now(timezone.utc)
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@router.get(
    "/my-interests",
    response_model=List[IndustryInterestOut],
    summary="Get all funding interests submitted by the logged-in Industry account"
)
def get_my_interests(
    user: User = Depends(require_industry),
    db: Session = Depends(get_db)
):
    """Returns INTEREST_EXPRESSED, PROPOSAL_INITIATED, PROPOSAL_UNDER_DISCUSSION records."""
    requests = db.query(IndustryInterest).filter(
        IndustryInterest.industry_user_id == user.id,
        IndustryInterest.status.in_([
            IndustryInterestStatus.INTEREST_EXPRESSED,
            IndustryInterestStatus.PROPOSAL_INITIATED,
            IndustryInterestStatus.PROPOSAL_UNDER_DISCUSSION,
        ])
    ).order_by(IndustryInterest.created_at.desc()).all()
    return requests


@router.get(
    "/active-funding",
    response_model=List[IndustryInterestOut],
    summary="Get confirmed/active funding partnerships for the logged-in Industry account"
)
def get_active_funding(
    user: User = Depends(require_industry),
    db: Session = Depends(get_db)
):
    """Returns SUPPORT_CONFIRMED, FUNDING_CONFIRMED records."""
    requests = db.query(IndustryInterest).filter(
        IndustryInterest.industry_user_id == user.id,
        IndustryInterest.status.in_([
            IndustryInterestStatus.SUPPORT_CONFIRMED,
            IndustryInterestStatus.FUNDING_CONFIRMED,
        ])
    ).order_by(IndustryInterest.updated_at.desc()).all()
    return requests


@router.get(
    "/history",
    response_model=List[IndustryInterestOut],
    summary="Get completed funded projects history for the logged-in Industry account"
)
def get_industry_history(
    user: User = Depends(require_industry),
    db: Session = Depends(get_db)
):
    """Returns PROJECT_FUNDED records (fully completed partnerships)."""
    requests = db.query(IndustryInterest).filter(
        IndustryInterest.industry_user_id == user.id,
        IndustryInterest.status == IndustryInterestStatus.PROJECT_FUNDED
    ).order_by(IndustryInterest.updated_at.desc()).all()
    return requests


@router.post(
    "/proposals/{request_id}/update-status",
    response_model=IndustryInterestOut,
    summary="Advance proposal status (role-gated: University or Industry)"
)
def update_proposal_status(
    request_id: str,
    payload: ProposalStatusUpdateRequest,
    user: User = Depends(require_industry_or_university),
    db: Session = Depends(get_db)
):
    """
    Role-gated status transitions.

    University may: INTEREST_EXPRESSED→PROPOSAL_INITIATED, PROPOSAL_INITIATED→PROPOSAL_UNDER_DISCUSSION,
                    PROPOSAL_UNDER_DISCUSSION→SUPPORT_CONFIRMED
    Industry may:   INTEREST_EXPRESSED→PROPOSAL_INITIATED, PROPOSAL_INITIATED→PROPOSAL_UNDER_DISCUSSION,
                    SUPPORT_CONFIRMED→FUNDING_CONFIRMED, FUNDING_CONFIRMED→PROJECT_FUNDED

    Only PROJECT_FUNDED triggers ChallengeStatus → COMPLETED.
    Admin has NO role in this flow.
    """
    try:
        val = uuid.UUID(request_id)
        req = db.query(IndustryInterest).filter(IndustryInterest.id == str(val)).first()
    except (ValueError, AttributeError):
        req = None

    if not req:
        raise HTTPException(status_code=404, detail="Proposal record not found.")

    # Parse target status
    target_str = payload.status.upper()
    if target_str not in IndustryInterestStatus.__members__:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{payload.status}'. Valid values: {list(IndustryInterestStatus.__members__.keys())}"
        )
    target_status = IndustryInterestStatus[target_str]

    # Check role-appropriate transition
    allowed = get_allowed_targets(req.status, user.role)
    if target_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Your role ({user.role}) cannot move this proposal from '{req.status}' to '{target_status}'. "
                   f"Allowed transitions from current status: {[s.value for s in allowed]}"
        )

    old_status = req.status
    req.status = target_status
    req.updated_at = datetime.now(timezone.utc)

    if payload.proposal_summary:
        req.proposal_summary = payload.proposal_summary
    if payload.pledged_amount:
        req.pledged_amount = payload.pledged_amount

    # Set confirmed_at when reaching a confirmed state
    if target_status in (
        IndustryInterestStatus.SUPPORT_CONFIRMED,
        IndustryInterestStatus.FUNDING_CONFIRMED,
        IndustryInterestStatus.PROJECT_FUNDED
    ):
        req.confirmed_at = datetime.now(timezone.utc)

    # PROJECT_FUNDED → mark Challenge as COMPLETED
    if target_status == IndustryInterestStatus.PROJECT_FUNDED:
        challenge = db.query(Challenge).filter(Challenge.id == req.challenge_id).first()
        if challenge and challenge.status not in (ChallengeStatus.COMPLETED, ChallengeStatus.VALIDATED):
            challenge.status = ChallengeStatus.COMPLETED
            challenge.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(req)
    return req


@router.get(
    "/stats",
    summary="Get industry partnership metrics for the logged-in Industry account"
)
def get_industry_stats(
    user: User = Depends(require_industry),
    db: Session = Depends(get_db)
):
    available_count = db.query(Challenge).filter(
        Challenge.status == ChallengeStatus.INDUSTRY_SUPPORT_REQUESTED
    ).count()

    my_interests = db.query(IndustryInterest).filter(
        IndustryInterest.industry_user_id == user.id
    )

    active_count = my_interests.filter(
        IndustryInterest.status.in_([
            IndustryInterestStatus.INTEREST_EXPRESSED,
            IndustryInterestStatus.PROPOSAL_INITIATED,
            IndustryInterestStatus.PROPOSAL_UNDER_DISCUSSION,
        ])
    ).count()

    confirmed_count = my_interests.filter(
        IndustryInterest.status.in_([
            IndustryInterestStatus.SUPPORT_CONFIRMED,
            IndustryInterestStatus.FUNDING_CONFIRMED,
        ])
    ).count()

    funded_count = my_interests.filter(
        IndustryInterest.status == IndustryInterestStatus.PROJECT_FUNDED
    ).count()

    declined_count = my_interests.filter(
        IndustryInterest.status.in_([
            IndustryInterestStatus.DECLINED,
            IndustryInterestStatus.WITHDRAWN,
        ])
    ).count()

    return {
        "available_opportunities": available_count,
        "total_my_interests": my_interests.count(),
        "active_proposals": active_count,
        "active_funding": confirmed_count,
        "funded_projects": funded_count,
        "declined_withdrawn": declined_count,
    }
