"""
models/query.py — Database model for challenge stakeholder queries.
"""
import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class QueryStatus(str, enum.Enum):
    PENDING  = "PENDING"
    RESOLVED = "RESOLVED"


class ChallengeQuery(Base):
    __tablename__ = "challenge_queries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    sender_role = Column(String(50), nullable=False)
    
    subject = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)

    status = Column(
        SAEnum(QueryStatus, name="querystatus"),
        default=QueryStatus.PENDING,
        nullable=False
    )

    admin_response = Column(Text, nullable=True)
    responded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    challenge = relationship("Challenge")
    sender = relationship("User", foreign_keys=[sender_id])
    responder = relationship("User", foreign_keys=[responded_by])

    def __repr__(self) -> str:
        return f"<ChallengeQuery id={self.id} challenge_id={self.challenge_id} status={self.status}>"
