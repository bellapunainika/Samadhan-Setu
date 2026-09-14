"""
schemas/industry.py — Industry interest request Pydantic models.
"""
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator
from app.models.industry import IndustryInterestStatus


class ExpressInterestRequest(BaseModel):
    company_name: str
    contact_email: str
    support_type: Optional[str] = "CSR Funding & Technical Mentorship"
    pledged_amount: Optional[str] = None
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


class IndustryReviewRequest(BaseModel):
    action: str  # ACCEPT or DECLINE
    response: Optional[str] = None


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
    admin_response: Optional[str] = None
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    confirmed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
