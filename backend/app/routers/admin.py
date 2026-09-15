"""
routers/admin.py — Stage 3 Government Admin governance endpoints.
Includes: Pending queue, AI prediction review, Approval, Rejection, AI Override, University Assignment, and Audit Logging.
"""
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models.user import User, UserRole
from app.models.university import University
from app.models.challenge import Challenge, ChallengeStatus, AIPrediction, PriorityLabel
from app.models.assignment import ChallengeAssignment
from app.models.audit import AdminAction
from app.schemas.challenge import ChallengeOut, AIPredictionOut
from app.schemas.admin import (
    ChallengeApproveRequest,
    ChallengeRejectRequest,
    AIOverrideRequest,
    ChallengeAssignRequest,
    AuditLogOut
)
from app.schemas.solution import SolutionSubmissionOut, SolutionReviewRequest
from app.schemas.industry import IndustryInterestOut
from app.models.solution import SolutionSubmission, SolutionStatus
from app.models.industry import IndustryInterest, IndustryInterestStatus
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/admin", tags=["State Governance Admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Authorization guard: Enforce Admin role."""
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="State Administrative privileges required for this action."
        )
    return current_user


def require_admin_or_officer(current_user: User = Depends(get_current_user)) -> User:
    """Authorization guard: Enforce Admin or Officer role (read-only oversight)."""
    if current_user.role not in (UserRole.admin, UserRole.officer):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="State Administrative or Oversight privileges required for this action."
        )
    return current_user


@router.get(
    "/challenges",
    response_model=List[ChallengeOut],
    summary="Get challenges filtered by pipeline tab for Admin/Officer dashboard"
)
def get_admin_pipeline_challenges(
    tab: Optional[str] = "all",
    current_user: User = Depends(require_admin_or_officer),
    db: Session = Depends(get_db)
):
    query = db.query(Challenge)
    if tab == "pending":
        query = query.filter(Challenge.status == ChallengeStatus.UNDER_REVIEW)
    elif tab == "assigned":
        query = query.filter(Challenge.status == ChallengeStatus.ASSIGNED)
    elif tab == "in_progress":
        query = query.filter(Challenge.status == ChallengeStatus.IN_PROGRESS)
    elif tab == "solution_review":
        query = query.filter(Challenge.status == ChallengeStatus.SOLUTION_SUBMITTED)
    elif tab == "industry_support":
        query = query.filter(Challenge.status == ChallengeStatus.SOLUTION_APPROVED)
    elif tab == "completed":
        query = query.filter(Challenge.status.in_([ChallengeStatus.COMPLETED, ChallengeStatus.VALIDATED]))
    elif tab == "rejected":
        query = query.filter(Challenge.status == ChallengeStatus.REJECTED)
    
    return query.order_by(Challenge.updated_at.desc()).all()


@router.get(
    "/challenges/pending",
    response_model=List[ChallengeOut],
    summary="Get challenges awaiting state administrative review (status: UNDER_REVIEW)"
)
def get_pending_challenges(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    challenges = db.query(Challenge).filter(
        Challenge.status == ChallengeStatus.UNDER_REVIEW
    ).order_by(Challenge.created_at.asc()).all()
    return challenges


@router.get(
    "/challenges/{challenge_identifier}/ai",
    response_model=AIPredictionOut,
    summary="Get AI classification and recommendation breakdown for a challenge"
)
def get_challenge_ai_prediction(
    challenge_identifier: str,
    admin: User = Depends(require_admin),
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

    if not challenge.ai_prediction:
        raise HTTPException(status_code=404, detail="AI Prediction record not found for this challenge.")

    return challenge.ai_prediction


@router.post(
    "/challenges/{challenge_identifier}/approve",
    response_model=ChallengeOut,
    summary="Approve a pending challenge (UNDER_REVIEW -> APPROVED). Makes challenge visible to universities as AVAILABLE."
)
def approve_challenge(
    challenge_identifier: str,
    payload: Optional[ChallengeApproveRequest] = None,
    admin: User = Depends(require_admin),
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

    if challenge.status != ChallengeStatus.UNDER_REVIEW:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve challenge with status '{challenge.status}'. Must be UNDER_REVIEW."
        )

    old_status = str(challenge.status)
    reason = payload.reason if payload else "Approved after state administrative review."

    # Update status: UNDER_REVIEW -> APPROVED
    challenge.status = ChallengeStatus.APPROVED
    challenge.updated_at = datetime.now(timezone.utc)

    # Create Audit Log
    audit = AdminAction(
        actor_id=admin.id,
        action_type="APPROVE_CHALLENGE",
        entity_type="CHALLENGE",
        entity_id=str(challenge.short_id),
        old_value={"status": old_status},
        new_value={"status": "APPROVED"},
        reason=reason
    )
    db.add(audit)
    db.commit()
    db.refresh(challenge)
    return challenge


@router.post(
    "/challenges/{challenge_identifier}/reject",
    response_model=ChallengeOut,
    summary="Reject a challenge (UNDER_REVIEW -> REJECTED). Prevents university discovery."
)
def reject_challenge(
    challenge_identifier: str,
    payload: ChallengeRejectRequest,
    admin: User = Depends(require_admin),
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

    if challenge.status != ChallengeStatus.UNDER_REVIEW:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject challenge with status '{challenge.status}'. Must be UNDER_REVIEW."
        )

    old_status = str(challenge.status)

    # Update status: UNDER_REVIEW -> REJECTED
    challenge.status = ChallengeStatus.REJECTED
    challenge.updated_at = datetime.now(timezone.utc)

    # Create Audit Log
    audit = AdminAction(
        actor_id=admin.id,
        action_type="REJECT_CHALLENGE",
        entity_type="CHALLENGE",
        entity_id=str(challenge.short_id),
        old_value={"status": old_status},
        new_value={"status": "REJECTED"},
        reason=payload.reason
    )
    db.add(audit)
    db.commit()
    db.refresh(challenge)
    return challenge


@router.patch(
    "/challenges/{challenge_identifier}/override-ai",
    response_model=ChallengeOut,
    summary="Override AI prediction outputs (preserves original AI prediction while storing Admin Final Decision)"
)
def override_ai(
    challenge_identifier: str,
    payload: AIOverrideRequest,
    admin: User = Depends(require_admin),
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

    ai_pred = challenge.ai_prediction
    if not ai_pred:
        raise HTTPException(status_code=404, detail="AI Prediction record missing.")

    old_state = {
        "primary_sector": ai_pred.primary_sector,
        "subcategory": ai_pred.subcategory,
        "priority_score": ai_pred.priority_score,
        "priority_label": str(ai_pred.priority_label),
        "suggested_domain": ai_pred.suggested_domain
    }

    new_state = {}

    if payload.primary_sector:
        ai_pred.primary_sector = payload.primary_sector
        challenge.category = payload.primary_sector
        new_state["primary_sector"] = payload.primary_sector

    if payload.subcategory:
        ai_pred.subcategory = payload.subcategory
        challenge.subcategory = payload.subcategory
        new_state["subcategory"] = payload.subcategory

    if payload.priority_score is not None:
        ai_pred.priority_score = payload.priority_score
        new_state["priority_score"] = payload.priority_score

    if payload.priority_label:
        ai_pred.priority_label = payload.priority_label
        new_state["priority_label"] = str(payload.priority_label)

    if payload.suggested_domain:
        ai_pred.suggested_domain = payload.suggested_domain
        new_state["suggested_domain"] = payload.suggested_domain

    if payload.recommended_institution:
        new_state["recommended_institution_override"] = payload.recommended_institution

    ai_pred.overall_explanation = f"{ai_pred.overall_explanation} [ADMIN OVERRIDE NOTE: {payload.reason}]"

    # Audit Log
    audit = AdminAction(
        actor_id=admin.id,
        action_type="OVERRIDE_AI",
        entity_type="AI_PREDICTION",
        entity_id=str(challenge.short_id),
        old_value=old_state,
        new_value=new_state,
        reason=payload.reason
    )
    db.add(audit)
    db.commit()
    db.refresh(challenge)
    return challenge


@router.post(
    "/challenges/{challenge_identifier}/assign",
    response_model=ChallengeOut,
    summary="Assign an APPROVED challenge to an authentic Jharkhand university"
)
def assign_university(
    challenge_identifier: str,
    payload: ChallengeAssignRequest,
    admin: User = Depends(require_admin),
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

    # 1. Check if already assigned
    if challenge.status == ChallengeStatus.ASSIGNED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Challenge is already assigned to a university."
        )

    existing_assign = db.query(ChallengeAssignment).filter(
        ChallengeAssignment.challenge_id == challenge.id,
        ChallengeAssignment.status == "ACTIVE"
    ).first()
    if existing_assign:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Challenge is already assigned to a university."
        )

    # 2. Verify Status is APPROVED or UNDER_REVIEW
    if challenge.status not in (ChallengeStatus.APPROVED, ChallengeStatus.UNDER_REVIEW):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot assign challenge with status '{challenge.status}'. Must be UNDER_REVIEW or APPROVED."
        )

    # 3. Verify Target University Exists and is Active
    university = db.query(University).filter(University.id == payload.university_id).first()
    if not university:
        raise HTTPException(status_code=404, detail=f"University with ID '{payload.university_id}' not found.")

    if not university.is_active:
        raise HTTPException(status_code=400, detail=f"University '{university.name}' is currently inactive.")

    # 4. Create ChallengeAssignment record
    assignment = ChallengeAssignment(
        challenge_id=challenge.id,
        university_id=university.id,
        assigned_by=admin.id,
        assigned_at=datetime.now(timezone.utc),
        status="ACTIVE",
        notes=payload.notes
    )
    db.add(assignment)

    # 5. Transition Challenge Status -> ASSIGNED
    old_status = str(challenge.status)
    challenge.status = ChallengeStatus.ASSIGNED
    challenge.updated_at = datetime.now(timezone.utc)

    # 6. Audit Log
    audit = AdminAction(
        actor_id=admin.id,
        action_type="ASSIGN_UNIVERSITY",
        entity_type="CHALLENGE",
        entity_id=str(challenge.short_id),
        old_value={"status": old_status},
        new_value={"status": "ASSIGNED", "university_id": str(university.id), "university_name": university.name},
        reason=payload.notes or f"Assigned to {university.short_name} by state admin."
    )
    db.add(audit)
    db.commit()
    db.refresh(challenge)
    return challenge


@router.get(
    "/audit-log",
    response_model=List[AuditLogOut],
    summary="Get all administrative governance audit logs"
)
def get_audit_logs(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    logs = db.query(AdminAction).order_by(AdminAction.created_at.desc()).all()
    return logs


@router.get(
    "/universities",
    summary="Get list of active Jharkhand university institutions for administrative assignment"
)
def get_admin_universities(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    universities = db.query(University).filter(University.is_active == True).all()
    return [{"id": str(u.id), "name": u.name, "short_name": u.short_name, "city": u.city} for u in universities]


@router.get(
    "/challenges/approved",
    response_model=List[ChallengeOut],
    summary="Get approved challenges awaiting university assignment"
)
def get_approved_challenges(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    active_assigned_ids = db.query(ChallengeAssignment.challenge_id).filter(
        ChallengeAssignment.status == "ACTIVE"
    )
    challenges = db.query(Challenge).filter(
        Challenge.status == ChallengeStatus.APPROVED,
        ~Challenge.id.in_(active_assigned_ids)
    ).order_by(Challenge.updated_at.desc()).all()
    return challenges


@router.get(
    "/challenges/assigned",
    response_model=List[ChallengeOut],
    summary="Get assigned and in-progress university R&D projects"
)
def get_assigned_challenges(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    challenges = db.query(Challenge).filter(
        Challenge.status.in_([ChallengeStatus.ASSIGNED, ChallengeStatus.IN_PROGRESS, ChallengeStatus.SOLUTION_SUBMITTED, ChallengeStatus.COMPLETED])
    ).order_by(Challenge.updated_at.desc()).all()
    return challenges


@router.get(
    "/solutions/pending",
    response_model=List[ChallengeOut],
    summary="Get submitted solutions awaiting state administrative review"
)
def get_pending_solutions(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    challenges = db.query(Challenge).filter(
        Challenge.status == ChallengeStatus.SOLUTION_SUBMITTED
    ).order_by(Challenge.updated_at.asc()).all()
    return challenges


@router.post(
    "/solutions/{challenge_identifier}/review",
    response_model=ChallengeOut,
    summary="Review university solution submission (ACCEPT -> COMPLETED, REQUEST_CHANGES -> IN_PROGRESS)"
)
def review_solution(
    challenge_identifier: str,
    payload: SolutionReviewRequest,
    admin: User = Depends(require_admin),
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

    if challenge.status != ChallengeStatus.SOLUTION_SUBMITTED:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot review solution for challenge with status '{challenge.status}'. Must be SOLUTION_SUBMITTED."
        )

    solution = db.query(SolutionSubmission).filter(
        SolutionSubmission.challenge_id == challenge.id,
        SolutionSubmission.status == SolutionStatus.PENDING_REVIEW
    ).order_by(SolutionSubmission.submitted_at.desc()).first()

    action_upper = payload.action.upper()
    old_status = str(challenge.status)

    if action_upper == "ACCEPT":
        challenge.status = ChallengeStatus.SOLUTION_APPROVED
        if solution:
            solution.status = SolutionStatus.ACCEPTED
            solution.admin_feedback = payload.feedback or "Solution approved by State Governance Admin."
            solution.reviewed_by = admin.id
            solution.reviewed_at = datetime.now(timezone.utc)

        audit = AdminAction(
            actor_id=admin.id,
            action_type="ACCEPT_SOLUTION",
            entity_type="CHALLENGE",
            entity_id=str(challenge.short_id),
            old_value={"status": old_status},
            new_value={"status": "SOLUTION_APPROVED"},
            reason=payload.feedback or "Solution validated and approved."
        )
        db.add(audit)

    elif action_upper in ("REQUEST_CHANGES", "REJECT"):
        challenge.status = ChallengeStatus.IN_PROGRESS
        if solution:
            solution.status = SolutionStatus.CHANGES_REQUESTED
            solution.admin_feedback = payload.feedback or "Changes requested by State Governance Admin."
            solution.reviewed_by = admin.id
            solution.reviewed_at = datetime.now(timezone.utc)

        audit = AdminAction(
            actor_id=admin.id,
            action_type="REQUEST_SOLUTION_CHANGES",
            entity_type="CHALLENGE",
            entity_id=str(challenge.short_id),
            old_value={"status": old_status},
            new_value={"status": "IN_PROGRESS"},
            reason=payload.feedback or "Reverted to IN_PROGRESS for revision."
        )
        db.add(audit)

    else:
        raise HTTPException(status_code=400, detail="Invalid action. Must be 'ACCEPT' or 'REQUEST_CHANGES'.")

    challenge.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(challenge)
    return challenge


@router.get(
    "/industry-requests",
    response_model=List[IndustryInterestOut],
    summary="[READ-ONLY MONITORING] View all industry CSR/partnership interest records"
)
def get_industry_requests(
    admin: User = Depends(require_admin_or_officer),
    db: Session = Depends(get_db)
):
    """
    Admin/Officer read-only monitoring view of all industry partnership records.
    Shows: project, university (via challenge), industry, proposal stage,
           support type, confirmation date, and non-confidential details.

    Admin does NOT accept or decline the commercial funding agreement.
    The University and Industry manage the proposal directly.
    """
    requests = db.query(IndustryInterest).order_by(IndustryInterest.created_at.desc()).all()
    return requests


@router.get(
    "/stats",
    summary="Get real database administrative governance metrics and queue counts"
)
def get_admin_stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    pending_review = db.query(Challenge).filter(Challenge.status == ChallengeStatus.UNDER_REVIEW).count()
    approved = db.query(Challenge).filter(Challenge.status == ChallengeStatus.APPROVED).count()
    assigned = db.query(Challenge).filter(Challenge.status == ChallengeStatus.ASSIGNED).count()
    in_progress = db.query(Challenge).filter(Challenge.status == ChallengeStatus.IN_PROGRESS).count()
    solutions_pending = db.query(Challenge).filter(Challenge.status == ChallengeStatus.SOLUTION_SUBMITTED).count()
    industry_support_requested = db.query(Challenge).filter(Challenge.status == ChallengeStatus.INDUSTRY_SUPPORT_REQUESTED).count()
    completed = db.query(Challenge).filter(Challenge.status.in_([ChallengeStatus.COMPLETED, ChallengeStatus.VALIDATED])).count()
    rejected = db.query(Challenge).filter(Challenge.status == ChallengeStatus.REJECTED).count()
    # Active industry partnerships (not declined/withdrawn)
    industry_active = db.query(IndustryInterest).filter(
        IndustryInterest.status.notin_([
            IndustryInterestStatus.DECLINED,
            IndustryInterestStatus.WITHDRAWN
        ])
    ).count()
    industry_confirmed = db.query(IndustryInterest).filter(
        IndustryInterest.status.in_([
            IndustryInterestStatus.SUPPORT_CONFIRMED,
            IndustryInterestStatus.FUNDING_CONFIRMED,
            IndustryInterestStatus.PROJECT_FUNDED,
        ])
    ).count()

    return {
        "pending_review": pending_review,
        "approved_awaiting": approved,
        "assigned": assigned,
        "in_progress": in_progress,
        "solutions_pending": solutions_pending,
        "industry_support_requested": industry_support_requested,
        "completed": completed,
        "rejected": rejected,
        "industry_active_partnerships": industry_active,
        "industry_confirmed_funded": industry_confirmed,
        "total_challenges": pending_review + approved + assigned + in_progress + solutions_pending + industry_support_requested + completed + rejected
    }
