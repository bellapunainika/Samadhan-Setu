"""
main.py — FastAPI application entry point.

Registers:
    - CORS middleware (origins from .env)
    - /api/health endpoint
    - /api/auth router
    - /api/challenges router (Stage 2)
    - /api/uploads router (Stage 2)
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth as auth_router
from app.routers import challenges as challenges_router
from app.routers import uploads as uploads_router
from app.routers import admin as admin_router
from app.routers import universities as universities_router
from app.routers import industry as industry_router
from app.routers import queries as queries_router

settings = get_settings()

app = FastAPI(
    title="Samadhan Setu API",
    description=(
        "Backend for Samadhan Setu — Jharkhand Societal Innovation Platform. "
        "SIH 2026, Problem Statement PS-26043."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router.router)
app.include_router(challenges_router.router)
app.include_router(uploads_router.router)
app.include_router(admin_router.router)
app.include_router(universities_router.router)
app.include_router(industry_router.router)
app.include_router(queries_router.router)


# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "ok",
        "service": "Samadhan Setu API",
        "version": "1.0.0",
        "stage": "3 — Admin Governance & University Assignment",
    }
