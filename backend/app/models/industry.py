"""
models/industry.py — Industry interest/partnership model.

IndustryInterest records are ONLY created when a real Industry user expresses
interest. The University "Seek Industry Support" action sets ChallengeStatus to
INDUSTRY_SUPPORT_REQUESTED (on the Challenge model) — it does NOT create an
IndustryInterest record.

Status Progression:
  INTEREST_EXPRESSED        ← Industry expresses interest (Industry-initiated)
  → PROPOSAL_INITIATED      ← University initiates proposal (University-initiated)
  → PROPOSAL_UNDER_DISCUSSION ← Either party
  → SUPPORT_CONFIRMED       ← University confirms their side of agreement
  → FUNDING_CONFIRMED       ← Industry confirms funding commitment
  → PROJECT_FUNDED          ← Marks project complete (→ Challenge.COMPLETED)

Terminal states:
  DECLINED                  ← Either party declines
  WITHDRAWN                 ← Industry withdraws interest
"""
import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class IndustryInterestStatus(str, enum.Enum):
    INTEREST_EXPRESSED        = "INTEREST_EXPRESSED"
    PROPOSAL_INITIATED        = "PROPOSAL_INITIATED"
    PROPOSAL_UNDER_DISCUSSION = "PROPOSAL_UNDER_DISCUSSION"
    SUPPORT_CONFIRMED         = "SUPPORT_CONFIRMED"
    FUNDING_CONFIRMED         = "FUNDING_CONFIRMED"
    PROJECT_FUNDED            = "PROJECT_FUNDED"
    DECLINED                  = "DECLINED"
    WITHDRAWN                 = "WITHDRAWN"


class IndustryInterest(Base):
    __tablename__ = "industry_interests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id"), nullable=False)

    # MUST be a real Industry-role user — never a University or platform placeholder
    industry_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    company_name = Column(String(255), nullable=False)
    contact_email = Column(String(255), nullable=False)
    support_type = Column(String(100), default="CSR Funding & Mentorship", nullable=False)
    pledged_amount = Column(String(100), nullable=True)   # Filled only when explicitly stated
    proposal_summary = Column(Text, nullable=True)
    message = Column(Text, nullable=False)

    status = Column(
        SAEnum(IndustryInterestStatus, name="industryintereststatus"),
        default=IndustryInterestStatus.INTEREST_EXPRESSED,
        nullable=False
    )

    # Governance/audit fields — read-only by Admin, NOT used for Accept/Decline
    admin_response = Column(Text, nullable=True)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    confirmed_at = Column(DateTime(timezone=True), nullable=True)  # Set at SUPPORT_CONFIRMED+

    challenge = relationship("Challenge", back_populates="industry_interests")
    industry_user = relationship("User", foreign_keys=[industry_user_id])

    def __repr__(self) -> str:
        return f"<IndustryInterest company={self.company_name} challenge_id={self.challenge_id} status={self.status}>"
