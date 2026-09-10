# backend/app/models/__init__.py
# Import all models here so Alembic autogenerate picks them up.
from app.models.user import User, UserRole  # noqa: F401
from app.models.district import District  # noqa: F401
from app.models.university import University, UniversityExpertise  # noqa: F401
from app.models.challenge import Challenge, ChallengeEvidence, AIPrediction, ChallengeStatus, PriorityLabel  # noqa: F401
from app.models.assignment import ChallengeAssignment  # noqa: F401
from app.models.audit import AdminAction  # noqa: F401
from app.models.solution import SolutionSubmission, SolutionStatus  # noqa: F401
from app.models.progress import ProgressUpdate  # noqa: F401
from app.models.industry import IndustryInterest, IndustryInterestStatus  # noqa: F401
