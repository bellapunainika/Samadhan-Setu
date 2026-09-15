"""
schemas/industry.py — Industry interest/partnership Pydantic models.
"""
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator
from app.models.industry import IndustryInterestStatus


class ExpressInterestRequest(BaseModel):
    """
    Submitted by a real Industry user to express interest in a validated solution.
    The challenge must have status INDUSTRY_SUPPORT_REQUESTED.
    """
    company_name: str
    contact_email: str
    support_type: Optional[str] = "CSR Funding & Technical Mentorship"
    pledged_amount: Optional[str] = None   # Not required; do not fabricate
    message: str

    @field_validator("company_name")
    @classmethod
    def validate_company(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Company name cannot be empty.")
        return v.strip()

    @field_validator("message")
    @classmethod
    def validate_msg(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Partnership proposal message cannot be empty.")
        return v.strip()


class ProposalStatusUpdateRequest(BaseModel):
    """
    Used by University OR Industry to advance the proposal through the pipeline.
    Role-gated in the router — only valid transitions for the caller's role are allowed.
    """
    status: str           # Target IndustryInterestStatus value
    proposal_summary: Optional[str] = None
    pledged_amount: Optional[str] = None


class IndustryInterestOut(BaseModel):
    id: uuid.UUID
    challenge_id: uuid.UUID
    industry_user_id: uuid.UUID
    company_name: str
    contact_email: str
    support_type: str
    pledged_amount: Optional[str] = None
    proposal_summary: Optional[str] = None
    message: str
    status: IndustryInterestStatus
    admin_response: Optional[str] = None   # Governance notes only (read-only)
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    confirmed_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
