"""
schemas/solution.py — Solution submission Pydantic models.
"""
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator
from app.models.solution import SolutionStatus


class SolutionSubmitRequest(BaseModel):
    title: str
    description: str
    prototype_url: Optional[str] = None
    technology_stack: Optional[str] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Solution title cannot be empty.")
        return v.strip()

    @field_validator("description")
    @classmethod
    def validate_desc(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Solution description cannot be empty.")
        return v.strip()


class SolutionReviewRequest(BaseModel):
    action: str  # ACCEPT or REQUEST_CHANGES
    feedback: Optional[str] = None


class SolutionSubmissionOut(BaseModel):
    id: uuid.UUID
    challenge_id: uuid.UUID
    university_id: uuid.UUID
    submitted_by: uuid.UUID
    title: str
    description: str
    prototype_url: Optional[str] = None
    technology_stack: Optional[str] = None
    status: SolutionStatus
    admin_feedback: Optional[str] = None
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
