"""
test_stage2.py — Stage 2 Automated Test Suite.
Tests District/University seed data, challenge creation, image evidence upload,
security checks, deterministic AI engine, priority scoring, duplicate detection,
and status scoping in PostgreSQL.
"""
import os
import sys
import io
from fastapi.testclient import TestClient
from app.main import app
from app.config import get_settings
from app.database import SessionLocal
from app.models.district import District
from app.models.university import University
from app.models.challenge import Challenge, AIPrediction, ChallengeStatus

client = TestClient(app)
settings = get_settings()

def run_tests():
    print("==================================================")
    print("  SAMADHAN SETU - STAGE 2 VERIFICATION SUITE")
    print("==================================================")
    
    passed = 0
    total = 0

    def assert_test(name, condition, details=""):
        nonlocal passed, total
        total += 1
        if condition:
            passed += 1
            print(f"[PASS] {name}")
        else:
            print(f"[FAIL] {name} - {details}")

    # 1. District & University Reference Data in DB
    db = SessionLocal()
    dist_count = db.query(District).count()
    univ_count = db.query(University).count()
    db.close()

    assert_test("Database District Reference Data (24 Jharkhand Districts)", dist_count >= 24, f"Found {dist_count} districts")
    assert_test("Database Authentic Jharkhand Institutions Seeded", univ_count >= 5, f"Found {univ_count} universities")

    # 2. Authenticate Test Citizen
    res = client.post("/api/auth/login", json={
        "email": "test.citizen@example.com",
        "password": "Password123!"
    })
    auth_ok = res.status_code == 200 and "access_token" in res.json()
    assert_test("Citizen Authentication for Challenge Submission", auth_ok, res.text)
    token = res.json().get("access_token") if auth_ok else None
    headers = {"Authorization": f"Bearer {token}"} if token else {}

    # 3. Real Challenge Creation (POST /api/challenges/)
    ch_payload = {
        "title": "Severe Fluoride Contamination in Handpumps",
        "description": "Drinking water from rural handpumps has high fluoride levels causing skeletal fluorosis in children. Urgent filtration needed.",
        "category": "Water",
        "district_id": "gumla",
        "block_locality": "Dumri Block, Ward 4",
        "citizen_severity": 5,
        "affected_population": 180,
        "submitter_type": "Gram Panchayat"
    }
    res = client.post("/api/challenges/", json=ch_payload, headers=headers)
    ch_created = res.status_code == 201 and "short_id" in res.json()
    assert_test("Real Challenge Submission (POST /api/challenges/)", ch_created, res.text)
    ch_data = res.json() if ch_created else {}
    ch_id = ch_data.get("id")

    # 4. Status Check: Must be UNDER_REVIEW
    status_ok = ch_data.get("status") == "UNDER_REVIEW"
    assert_test("Initial Challenge Status is UNDER_REVIEW", status_ok, f"Status was {ch_data.get('status')}")

    # 5. AI Prediction Output Verification
    ai = ch_data.get("ai_prediction", {})
    sector_ok = ai.get("primary_sector") == "Water & Sanitation"
    prio_ok = ai.get("priority_score", 0) >= 75.0 and ai.get("priority_label") in ["HIGH", "CRITICAL"]
    univ_recs = ai.get("recommended_universities", [])
    univ_ok = len(univ_recs) == 3 and "BIT Mesra" in univ_recs[0].get("university_name", "")

    assert_test("AI Sector Classification ('Water & Sanitation')", sector_ok, f"Got sector: {ai.get('primary_sector')}")
    assert_test("AI Priority Score Calculation (>75, HIGH/CRITICAL)", prio_ok, f"Score: {ai.get('priority_score')}")
    assert_test("AI University Matching (Top 3 Recommended Institutions)", univ_ok, f"Recommended: {[u.get('university_name') for u in univ_recs]}")

    # 6. File Evidence Upload Validation (Valid JPEG)
    if ch_id:
        img_bytes = b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xFF\xDB\x00C\x00" + b"\x00" * 100
        files = {"file": ("test_evidence.jpg", io.BytesIO(img_bytes), "image/jpeg")}
        res = client.post(f"/api/uploads/evidence/{ch_id}", files=files, headers=headers)
        upload_ok = res.status_code == 201 and "stored_filename" in res.json()
        assert_test("Image Evidence File Upload (JPEG accepted)", upload_ok, res.text)
    else:
        assert_test("Image Evidence File Upload (JPEG accepted)", False, "Challenge ID not available")

    # 7. File Security Check: Reject Executable File (.exe)
    if ch_id:
        files = {"file": ("malware.exe", io.BytesIO(b"MZ12345"), "application/x-msdownload")}
        res = client.post(f"/api/uploads/evidence/{ch_id}", files=files, headers=headers)
        exe_rejected = res.status_code == 400 and "Security Violation" in res.json().get("detail", "")
        assert_test("File Security Validation (Reject .exe malware)", exe_rejected, res.text)

    # 8. Duplicate Detection Engine Check (Excluding Self, Detecting Other Similar Submissions)
    # 8a. Verify self-exclusion on first challenge
    self_id = ch_data.get("short_id")
    similar_ids_first = ai.get("similar_challenge_ids", [])
    self_excluded = self_id not in similar_ids_first
    assert_test("Duplicate Detection Self-Exclusion (Current Challenge Excluded from Self-Match)", self_excluded, f"Self ID {self_id} in {similar_ids_first}")

    # 8b. Submit second challenge with identical text in same district
    res2 = client.post("/api/challenges/", json=ch_payload, headers=headers)
    ch2_data = res2.json() if res2.status_code == 201 else {}
    ai2 = ch2_data.get("ai_prediction", {})
    similar_ids_second = ai2.get("similar_challenge_ids", [])
    ch2_self_id = ch2_data.get("short_id")

    # Must contain first challenge ID or demo challenge ID, but NOT ch2_self_id
    dup_ok = (
        ai2.get("duplicate_flag") is True and
        ai2.get("similarity_score", 0) >= 65.0 and
        ch2_self_id not in similar_ids_second and
        (self_id in similar_ids_second or "JH-2026-DEMO-001" in similar_ids_second)
    )
    assert_test("AI Duplicate Detection Engine (Detects Prior Similar Submissions, Excludes Self)", dup_ok, f"Self {ch2_self_id} excluded? {ch2_self_id not in similar_ids_second}, Similar: {similar_ids_second}, score: {ai2.get('similarity_score')}")

    # 9. Fetch My Submissions (GET /api/challenges/my)
    res = client.get("/api/challenges/my", headers=headers)
    my_ok = res.status_code == 200 and len(res.json()) >= 2
    assert_test("Fetch User Submissions (GET /api/challenges/my)", my_ok, f"Count: {len(res.json()) if res.status_code == 200 else 0}")

    # 9b. Fetch Challenge Detail by short_id (GET /api/challenges/{short_id})
    res_short = client.get(f"/api/challenges/{self_id}")
    fetch_short_ok = res_short.status_code == 200 and res_short.json().get("short_id") == self_id
    assert_test(f"Fetch Challenge Detail by short_id (GET /api/challenges/{self_id})", fetch_short_ok, res_short.text)

    # 9c. Fetch Challenge Detail by UUID (GET /api/challenges/{uuid})
    res_uuid = client.get(f"/api/challenges/{ch_id}")
    fetch_uuid_ok = res_uuid.status_code == 200 and res_uuid.json().get("id") == ch_id
    assert_test(f"Fetch Challenge Detail by UUID (GET /api/challenges/{ch_id})", fetch_uuid_ok, res_uuid.text)

    # 10. AI Determinism Verification
    # Re-running AI analysis on the exact same challenge should return identical scores
    res_det1 = client.post("/api/challenges/", json={
        "title": "Drought Impact on Kharif Paddy Crops",
        "description": "Farmers in Gumla face severe water scarcity affecting paddy crops.",
        "category": "Agriculture",
        "district_id": "gumla",
        "block_locality": "Bishunpur Block",
        "citizen_severity": 4
    }, headers=headers)
    
    ai_det1 = res_det1.json().get("ai_prediction", {}) if res_det1.status_code == 201 else {}

    res_det2 = client.post("/api/challenges/", json={
        "title": "Drought Impact on Kharif Paddy Crops",
        "description": "Farmers in Gumla face severe water scarcity affecting paddy crops.",
        "category": "Agriculture",
        "district_id": "gumla",
        "block_locality": "Bishunpur Block",
        "citizen_severity": 4
    }, headers=headers)
    ai_det2 = res_det2.json().get("ai_prediction", {}) if res_det2.status_code == 201 else {}

    det_ok = (ai_det1.get("priority_score") == ai_det2.get("priority_score")) and (ai_det1.get("primary_sector") == ai_det2.get("primary_sector"))
    assert_test("AI Engine Determinism Check (100% Identical Output for Identical Inputs)", det_ok, f"Scores: {ai_det1.get('priority_score')} vs {ai_det2.get('priority_score')}")

    print("==================================================")
    print(f"  RESULTS: {passed}/{total} TESTS PASSED")
    print("==================================================")
    if passed == total:
        print("[SUCCESS] All Stage 2 backend tests passed clean!")
        return 0
    else:
        print("[ERROR] Some tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())
