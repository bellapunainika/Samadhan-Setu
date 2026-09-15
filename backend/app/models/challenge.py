"""
models/challenge.py — Challenge, Evidence, and AI Prediction models.
"""
import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, Enum as SAEnum, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class ChallengeStatus(str, enum.Enum):
    SUBMITTED                   = "SUBMITTED"
    UNDER_REVIEW                = "UNDER_REVIEW"
    APPROVED                    = "APPROVED"
    REJECTED                    = "REJECTED"
    ASSIGNED                    = "ASSIGNED"
    IN_PROGRESS                 = "IN_PROGRESS"
    SOLUTION_SUBMITTED          = "SOLUTION_SUBMITTED"
    SOLUTION_APPROVED           = "SOLUTION_APPROVED"
    INDUSTRY_SUPPORT_REQUESTED  = "INDUSTRY_SUPPORT_REQUESTED"  # University seeks industry funding
    COMPLETED                   = "COMPLETED"
    VALIDATED                   = "VALIDATED"


class PriorityLabel(str, enum.Enum):
    LOW      = "LOW"
    MEDIUM   = "MEDIUM"
    HIGH     = "HIGH"
    CRITICAL = "CRITICAL"


class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    short_id = Column(String(50), unique=True, nullable=False, index=True) # JH-2026-XXXX
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    subcategory = Column(String(100), nullable=True)

    district_id = Column(String(50), ForeignKey("districts.id"), nullable=False)
    block_locality = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    affected_population = Column(Integer, default=50, nullable=True)
    citizen_severity = Column(Integer, default=3, nullable=False) # 1-5 rating

    submitter_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    submitter_type = Column(String(100), default="Individual Citizen", nullable=False)
    submitter_name = Column(String(255), nullable=True)
    original_language = Column(String(10), default="en", nullable=False)

    status = Column(SAEnum(ChallengeStatus, name="challengestatus"), default=ChallengeStatus.UNDER_REVIEW, nullable=False)

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

    evidence_files = relationship("ChallengeEvidence", back_populates="challenge", cascade="all, delete-orphan")
    ai_prediction = relationship("AIPrediction", uselist=False, back_populates="challenge", cascade="all, delete-orphan")
    assignment = relationship("ChallengeAssignment", uselist=False, back_populates="challenge", cascade="all, delete-orphan")
    solution_submission = relationship("SolutionSubmission", uselist=False, back_populates="challenge", cascade="all, delete-orphan")
    progress_updates = relationship("ProgressUpdate", back_populates="challenge", cascade="all, delete-orphan", order_by="ProgressUpdate.created_at.desc()")
    industry_interests = relationship("IndustryInterest", back_populates="challenge", cascade="all, delete-orphan", order_by="IndustryInterest.created_at.desc()")

    def __repr__(self) -> str:
        return f"<Challenge short_id={self.short_id} title={self.title[:20]} status={self.status}>"


class ChallengeEvidence(Base):
    __tablename__ = "challenge_evidence"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id"), nullable=False)
    original_name = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=False)
    size_bytes = Column(Integer, nullable=False)
    storage_path = Column(String(500), nullable=False)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    uploaded_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    challenge = relationship("Challenge", back_populates="evidence_files")

    def __repr__(self) -> str:
        return f"<ChallengeEvidence file={self.stored_filename}>"


class AIPrediction(Base):
    __tablename__ = "ai_predictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id"), unique=True, nullable=False)

    primary_sector = Column(String(100), nullable=False)
    subcategory = Column(String(100), nullable=True)
    priority_score = Column(Float, nullable=False) # 0-100
    priority_label = Column(SAEnum(PriorityLabel, name="prioritylabel"), nullable=False)
    keywords = Column(JSON, nullable=False) # List of extracted keywords
    suggested_domain = Column(String(100), nullable=False)

    duplicate_flag = Column(Boolean, default=False, nullable=False)
    similarity_score = Column(Float, default=0.0, nullable=False) # 0-100
    similar_challenge_ids = Column(JSON, default=list, nullable=False)

    # JSON Array of Top 3 recommended universities with score breakdowns and derivation metadata tags
    recommended_universities = Column(JSON, nullable=False)
    overall_explanation = Column(Text, nullable=False)
    model_version = Column(String(50), default="rule-hybrid-v1", nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    challenge = relationship("Challenge", back_populates="ai_prediction")

    def __repr__(self) -> str:
        return f"<AIPrediction challenge_id={self.challenge_id} priority={self.priority_score}>"
