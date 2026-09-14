"""
schemas/admin.py — Pydantic request/response models for Stage 3 Admin endpoints.
"""
import uuid
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, field_validator
from app.models.challenge import PriorityLabel


class ChallengeApproveRequest(BaseModel):
    reason: Optional[str] = "Approved after state nodal administrative review."
    university_id: Optional[uuid.UUID] = None


class ChallengeRejectRequest(BaseModel):
    reason: str

    @field_validator("reason")
    @classmethod
    def reason_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Rejection reason cannot be empty.")
        return v.strip()


class AIOverrideRequest(BaseModel):
    primary_sector: Optional[str] = None
    subcategory: Optional[str] = None
    priority_score: Optional[float] = None
    priority_label: Optional[PriorityLabel] = None
    suggested_domain: Optional[str] = None
    recommended_institution: Optional[str] = None
    reason: str

    @field_validator("reason")
    @classmethod
    def reason_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Override rationale/reason is required.")
        return v.strip()


class ChallengeAssignRequest(BaseModel):
    university_id: uuid.UUID
    notes: Optional[str] = None


class AuditLogOut(BaseModel):
    id: uuid.UUID
    actor_id: uuid.UUID
    action_type: str
    entity_type: str
    entity_id: str
    old_value: Optional[Any] = None
    new_value: Optional[Any] = None
    reason: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
