"""
schemas/progress.py — University progress update Pydantic models.
"""
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


class ProgressUpdateRequest(BaseModel):
    title: str
    description: str
    progress_percent: int = 10

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Update title cannot be empty.")
        return v.strip()


class ProgressUpdateOut(BaseModel):
    id: uuid.UUID
    challenge_id: uuid.UUID
    university_id: uuid.UUID
    posted_by: uuid.UUID
    progress_percent: int
    title: str
    description: str
    created_at: datetime

    model_config = {"from_attributes": True}
