"""
schemas/challenge.py — Pydantic request/response models for Stage 2.
"""
import uuid
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, field_validator
from app.models.challenge import ChallengeStatus, PriorityLabel


class ChallengeCreateRequest(BaseModel):
    title: str
    description: str
    category: str
    district_id: str
    block_locality: str
    latitude: Optional[float] = 23.3441
    longitude: Optional[float] = 85.3096
    affected_population: Optional[int] = 50
    citizen_severity: int = 3
    submitter_type: Optional[str] = "Individual Citizen"
    submitter_name: Optional[str] = None
    original_language: Optional[str] = "en"

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Challenge title cannot be empty.")
        return v.strip()

    @field_validator("description")
    @classmethod
    def description_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Challenge description cannot be empty.")
        return v.strip()

    @field_validator("citizen_severity")
    @classmethod
    def severity_range(cls, v: int) -> int:
        if v < 1 or v > 5:
            raise ValueError("Citizen severity must be between 1 and 5.")
        return v


class AIPredictionOut(BaseModel):
    id: uuid.UUID
    primary_sector: str
    subcategory: Optional[str]
    priority_score: float
    priority_label: PriorityLabel
    keywords: List[str]
    suggested_domain: str
    duplicate_flag: bool
    similarity_score: float
    similar_challenge_ids: List[str]
    recommended_universities: List[Any]
    overall_explanation: str
    model_version: str
    created_at: datetime

    model_config = {"from_attributes": True, "protected_namespaces": ()}


class EvidenceOut(BaseModel):
    id: uuid.UUID
    original_name: str
    stored_filename: str
    mime_type: str
    size_bytes: int
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class AssignmentOut(BaseModel):
    id: uuid.UUID
    university_id: uuid.UUID
    university_name: Optional[str] = None
    assigned_at: datetime
    notes: Optional[str] = None
    team_name: Optional[str] = None
    faculty_mentor: Optional[str] = None
    student_members: Optional[str] = None

    model_config = {"from_attributes": True}


from app.schemas.solution import SolutionSubmissionOut
from app.schemas.progress import ProgressUpdateOut
from app.schemas.industry import IndustryInterestOut


class ChallengeOut(BaseModel):
    id: uuid.UUID
    short_id: str
    title: str
    description: str
    category: str
    subcategory: Optional[str]
    district_id: str
    block_locality: str
    latitude: Optional[float]
    longitude: Optional[float]
    affected_population: Optional[int]
    citizen_severity: int
    submitter_type: str
    submitter_name: Optional[str]
    original_language: str
    status: ChallengeStatus
    created_at: datetime
    updated_at: datetime

    ai_prediction: Optional[AIPredictionOut] = None
    evidence_files: List[EvidenceOut] = []
    assignment: Optional[AssignmentOut] = None
    assigned_university_name: Optional[str] = None
    solution_submission: Optional[SolutionSubmissionOut] = None
    progress_updates: List[ProgressUpdateOut] = []
    industry_interests: List[IndustryInterestOut] = []

    model_config = {"from_attributes": True}

