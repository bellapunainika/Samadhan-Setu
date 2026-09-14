"""
routers/queries.py — Stakeholder database-backed queries router.
"""
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User, UserRole
from app.models.challenge import Challenge
from app.models.query import ChallengeQuery, QueryStatus
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/queries", tags=["Stakeholder Queries"])


class QueryCreateRequest(BaseModel):
    challenge_id: str
    message: str
    subject: Optional[str] = "Project Query"


class QueryResponseRequest(BaseModel):
    response: str


class QueryOut(BaseModel):
    id: uuid.UUID
    challenge_id: uuid.UUID
    sender_id: uuid.UUID
    sender_role: str
    subject: Optional[str]
    message: str
    status: QueryStatus
    admin_response: Optional[str]
    created_at: datetime
    resolved_at: Optional[datetime]

    model_config = {"from_attributes": True}


@router.post("/", response_model=QueryOut, summary="Submit a query regarding a challenge")
def create_query(
    payload: QueryCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    challenge = None
    try:
        val = uuid.UUID(payload.challenge_id)
        challenge = db.query(Challenge).filter(Challenge.id == str(val)).first()
    except (ValueError, AttributeError):
        pass

    if not challenge:
        challenge = db.query(Challenge).filter(Challenge.short_id == payload.challenge_id).first()

    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found.")

    query = ChallengeQuery(
        challenge_id=challenge.id,
        sender_id=current_user.id,
        sender_role=current_user.role.value,
        subject=payload.subject,
        message=payload.message,
        status=QueryStatus.PENDING,
        created_at=datetime.now(timezone.utc)
    )
    db.add(query)
    db.commit()
    db.refresh(query)
    return query


@router.get("/my", response_model=List[QueryOut], summary="Get queries submitted by current user")
def get_my_queries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    queries = db.query(ChallengeQuery).filter(
        ChallengeQuery.sender_id == current_user.id
    ).order_by(ChallengeQuery.created_at.desc()).all()
    return queries


@router.get("/admin", response_model=List[QueryOut], summary="Get all queries for Admin review")
def get_admin_queries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin privileges required.")
    queries = db.query(ChallengeQuery).order_by(ChallengeQuery.created_at.desc()).all()
    return queries


@router.post("/{query_id}/respond", response_model=QueryOut, summary="Respond to and resolve a query")
def respond_query(
    query_id: str,
    payload: QueryResponseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin privileges required.")

    query = None
    try:
        val = uuid.UUID(query_id)
        query = db.query(ChallengeQuery).filter(ChallengeQuery.id == str(val)).first()
    except (ValueError, AttributeError):
        pass

    if not query:
        raise HTTPException(status_code=404, detail="Query record not found.")

    query.admin_response = payload.response
    query.responded_by = current_user.id
    query.status = QueryStatus.RESOLVED
    query.resolved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(query)
    return query
