"""
models/solution.py — Solution submission model for university R&D projects.
"""
import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class SolutionStatus(str, enum.Enum):
    PENDING_REVIEW    = "PENDING_REVIEW"
    ACCEPTED          = "ACCEPTED"
    CHANGES_REQUESTED = "CHANGES_REQUESTED"


class SolutionSubmission(Base):
    __tablename__ = "solution_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id"), nullable=False)
    university_id = Column(UUID(as_uuid=True), ForeignKey("universities.id"), nullable=False)
    submitted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    prototype_url = Column(String(500), nullable=True)
    technology_stack = Column(String(255), nullable=True)

    status = Column(SAEnum(SolutionStatus, name="solutionstatus"), default=SolutionStatus.PENDING_REVIEW, nullable=False)
    admin_feedback = Column(Text, nullable=True)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    submitted_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    challenge = relationship("Challenge")
    university = relationship("University")

    def __repr__(self) -> str:
        return f"<SolutionSubmission challenge_id={self.challenge_id} status={self.status}>"
