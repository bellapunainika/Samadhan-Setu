"""
models/industry.py — Industry interest request model.
"""
import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class IndustryInterestStatus(str, enum.Enum):
    PENDING_ADMIN_REVIEW = "PENDING_ADMIN_REVIEW"
    ACCEPTED             = "ACCEPTED"
    DECLINED             = "DECLINED"


class IndustryInterest(Base):
    __tablename__ = "industry_interests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id"), nullable=False)
    industry_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    company_name = Column(String(255), nullable=False)
    contact_email = Column(String(255), nullable=False)
    support_type = Column(String(100), default="CSR Funding & Mentorship", nullable=False)
    message = Column(Text, nullable=False)

    status = Column(
        SAEnum(IndustryInterestStatus, name="industryintereststatus"),
        default=IndustryInterestStatus.PENDING_ADMIN_REVIEW,
        nullable=False
    )
    admin_response = Column(Text, nullable=True)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    challenge = relationship("Challenge")
    industry_user = relationship("User", foreign_keys=[industry_user_id])

    def __repr__(self) -> str:
        return f"<IndustryInterest company={self.company_name} challenge_id={self.challenge_id} status={self.status}>"
