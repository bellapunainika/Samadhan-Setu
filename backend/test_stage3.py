"""
test_stage3.py — Stage 3 Automated Test Suite.
Tests Admin Pending Queue, Approval, Rejection, AI Override, Audit Logging,
University Discovery, Scoped Assignment, Assignment Locking, and Cross-Role State Synchronization.
"""
import sys
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.config import get_settings
from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.university import University
from app.models.challenge import Challenge, ChallengeStatus
from app.models.assignment import ChallengeAssignment
from app.models.audit import AdminAction
from app.auth.jwt_handler import create_access_token
from app.auth.password import hash_password

client = TestClient(app)
settings = get_settings()

def run_tests():
    print("==================================================")
    print("  SAMADHAN SETU - STAGE 3 VERIFICATION SUITE")
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

    from sqlalchemy import text
    from app.database import engine, Base
    import app.models  # ensure all models are imported

    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id);"))
        conn.commit()

    db = SessionLocal()

    # Seed test accounts for Citizen, Admin, University A, and University B if missing
    def get_or_create_user(email, full_name, role, org=None, univ_id=None):
        u = db.query(User).filter(User.email == email).first()
        if not u:
            u = User(
                email=email,
                hashed_password=hash_password("Password123!"),
                full_name=full_name,
                role=role,
                organization=org,
                university_id=univ_id
            )
            db.add(u)
            db.commit()
            db.refresh(u)
        return u

    # Fetch universities for tests
    univs = db.query(University).all()
    univ_a = univs[0] if len(univs) > 0 else None
    univ_b = univs[1] if len(univs) > 1 else None

    admin_user = get_or_create_user(settings.ADMIN_EMAIL, settings.ADMIN_FULL_NAME, UserRole.admin)
    citizen_user = get_or_create_user("stage3.citizen@example.com", "Stage 3 Citizen", UserRole.citizen)
    univ_a_user = get_or_create_user("univ_a.user@example.com", "BIT Mesra Researcher", UserRole.university, org="BIT Mesra", univ_id=univ_a.id if univ_a else None)
    univ_b_user = get_or_create_user("univ_b.user@example.com", "IIT Dhanbad Researcher", UserRole.university, org="IIT (ISM) Dhanbad", univ_id=univ_b.id if univ_b else None)

    # Auth headers
    admin_token = create_access_token({"sub": admin_user.email, "role": admin_user.role.value, "user_id": str(admin_user.id)})
    citizen_token = create_access_token({"sub": citizen_user.email, "role": citizen_user.role.value, "user_id": str(citizen_user.id)})
    univ_a_token = create_access_token({"sub": univ_a_user.email, "role": univ_a_user.role.value, "user_id": str(univ_a_user.id)})
    univ_b_token = create_access_token({"sub": univ_b_user.email, "role": univ_b_user.role.value, "user_id": str(univ_b_user.id)})

    headers_admin = {"Authorization": f"Bearer {admin_token}"}
    headers_citizen = {"Authorization": f"Bearer {citizen_token}"}
    headers_univ_a = {"Authorization": f"Bearer {univ_a_token}"}
    headers_univ_b = {"Authorization": f"Bearer {univ_b_token}"}

    # 1. Admin Pending Challenges Retrieval
    res = client.get("/api/admin/challenges/pending", headers=headers_admin)
    assert_test("1. Admin can retrieve pending challenges", res.status_code == 200 and isinstance(res.json(), list), res.text)

    # 2. Citizen Guard (Forbidden from Admin Pending)
    res_c_guard = client.get("/api/admin/challenges/pending", headers=headers_citizen)
    assert_test("2. Citizen cannot access admin pending endpoint (403)", res_c_guard.status_code == 403, res_c_guard.text)

    # 3. University Guard (Forbidden from Admin Pending)
    res_u_guard = client.get("/api/admin/challenges/pending", headers=headers_univ_a)
    assert_test("3. University cannot access admin endpoints (403)", res_u_guard.status_code == 403, res_u_guard.text)

    # Create test challenge 1 (to be approved)
    res_ch1 = client.post("/api/challenges/", json={
        "title": "Stage 3 Test Problem — Solar Microgrid",
        "description": "Remote village needs decentralized solar microgrid installation.",
        "category": "Energy",
        "district_id": "ranchi",
        "block_locality": "Kanke Ward 2",
        "citizen_severity": 4,
        "affected_population": 120
    }, headers=headers_citizen)
    ch1 = res_ch1.json() if res_ch1.status_code == 201 else {}
    ch1_id = ch1.get("short_id")

    # Create test challenge 2 (to be rejected)
    res_ch2 = client.post("/api/challenges/", json={
        "title": "Stage 3 Test Problem — Invalid Request",
        "description": "Invalid test request for rejection testing.",
        "category": "General",
        "district_id": "ranchi",
        "block_locality": "Main Market",
        "citizen_severity": 1
    }, headers=headers_citizen)
    ch2 = res_ch2.json() if res_ch2.status_code == 201 else {}
    ch2_id = ch2.get("short_id")

    # 6. Check UNDER_REVIEW challenge is NOT visible to University Available list
    res_avail_before = client.get("/api/universities/available-challenges", headers=headers_univ_a)
    avail_before_ids = [c["short_id"] for c in res_avail_before.json()] if res_avail_before.status_code == 200 else []
    assert_test("6. UNDER_REVIEW challenge is not visible in university available list", ch1_id not in avail_before_ids, f"Found {ch1_id} in {avail_before_ids}")

    # 4. Admin Approves Challenge 1
    res_app = client.post(f"/api/admin/challenges/{ch1_id}/approve", json={"reason": "Valid village solar need."}, headers=headers_admin)
    app_ok = res_app.status_code == 200 and res_app.json().get("status") == "APPROVED"
    assert_test("4. Admin can approve a challenge (UNDER_REVIEW -> APPROVED)", app_ok, res_app.text)

    # 21. Citizen Status Update after Approval (GET /api/challenges/my)
    res_cit_my1 = client.get("/api/challenges/my", headers=headers_citizen)
    cit_my1_item = next((c for c in res_cit_my1.json() if c.get("short_id") == ch1_id), {}) if res_cit_my1.status_code == 200 else {}
    assert_test("21. Approve -> Citizen GET /api/challenges/my reflects status APPROVED", cit_my1_item.get("status") == "APPROVED", f"Status: {cit_my1_item.get('status')}")

    # 5. Approved challenge becomes visible in university available list
    res_avail_after = client.get("/api/universities/available-challenges", headers=headers_univ_a)
    avail_after_ids = [c["short_id"] for c in res_avail_after.json()] if res_avail_after.status_code == 200 else []
    assert_test("5. Approved challenge becomes visible in university available endpoint", ch1_id in avail_after_ids, f"IDs: {avail_after_ids}")

    # 7. Admin Rejects Challenge 2 & verifies non-visibility
    res_rej = client.post(f"/api/admin/challenges/{ch2_id}/reject", json={"reason": "Out of scope."}, headers=headers_admin)
    rej_ok = res_rej.status_code == 200 and res_rej.json().get("status") == "REJECTED"
    res_avail_rej = client.get("/api/universities/available-challenges", headers=headers_univ_a)
    avail_rej_ids = [c["short_id"] for c in res_avail_rej.json()] if res_avail_rej.status_code == 200 else []
    assert_test("7. REJECTED challenge is not visible in university available list", rej_ok and (ch2_id not in avail_rej_ids), f"Status: {res_rej.status_code}, In avail: {ch2_id in avail_rej_ids}")

    # 8. Admin AI Override
    res_ovr = client.patch(f"/api/admin/challenges/{ch1_id}/override-ai", json={
        "primary_sector": "Renewable Energy & Grids",
        "priority_score": 92.5,
        "reason": "High strategic state priority for tribal electrification."
    }, headers=headers_admin)
    ovr_ok = res_ovr.status_code == 200 and res_ovr.json().get("category") == "Renewable Energy & Grids"
    assert_test("8. Admin can override AI classification & priority score", ovr_ok, res_ovr.text)

    # 9. Original AI output preservation check
    ch1_db = db.query(Challenge).filter(Challenge.short_id == ch1_id).first()
    ai_preserved = ch1_db and ch1_db.ai_prediction and "ADMIN OVERRIDE NOTE" in ch1_db.ai_prediction.overall_explanation
    assert_test("9. Original AI result remains preserved after override", ai_preserved, "AI explanation not preserved")

    # 10 & 11. Audit Log Creation Check (Approval & Override)
    res_audit_check = client.get("/api/admin/audit-log", headers=headers_admin)
    audit_types = [a["action_type"] for a in res_audit_check.json()] if res_audit_check.status_code == 200 else []
    assert_test("10. AI Override creates audit log record", "OVERRIDE_AI" in audit_types, f"Types: {audit_types}")
    assert_test("11. Challenge Approval creates audit log record", "APPROVE_CHALLENGE" in audit_types, f"Types: {audit_types}")

    # 12. Admin Assigns Approved Challenge to University A
    res_assign = client.post(f"/api/admin/challenges/{ch1_id}/assign", json={
        "university_id": str(univ_a.id),
        "notes": "Assigned to BIT Mesra solar research lab."
    }, headers=headers_admin)
    assign_ok = res_assign.status_code == 200 and res_assign.json().get("status") == "ASSIGNED"
    assert_test("12. Admin can assign approved challenge to University A", assign_ok, res_assign.text)

    # 13. Assignment Creates Database Record in challenge_assignments
    assign_db = db.query(ChallengeAssignment).filter(ChallengeAssignment.challenge_id == ch1_db.id).first()
    assert_test("13. Assignment creates database record in challenge_assignments table", assign_db is not None and str(assign_db.university_id) == str(univ_a.id), f"Db record: {assign_db}")

    # 14. Challenge Status becomes ASSIGNED
    db.refresh(ch1_db)
    assert_test("14. Challenge status becomes ASSIGNED", ch1_db.status == ChallengeStatus.ASSIGNED, f"Status: {ch1_db.status}")

    # 22. Citizen Status Update & Assigned University Name after Assignment (GET /api/challenges/my)
    res_cit_my2 = client.get("/api/challenges/my", headers=headers_citizen)
    cit_my2_item = next((c for c in res_cit_my2.json() if c.get("short_id") == ch1_id), {}) if res_cit_my2.status_code == 200 else {}
    assigned_univ_returned = cit_my2_item.get("assignment", {}).get("university_name") if cit_my2_item.get("assignment") else cit_my2_item.get("assigned_university_name")
    assert_test("22. Assign -> Citizen GET /api/challenges/my returns status ASSIGNED & assigned university name", cit_my2_item.get("status") == "ASSIGNED" and assigned_univ_returned == univ_a.name, f"Status: {cit_my2_item.get('status')}, Univ: {assigned_univ_returned}")

    # 15. Assigned Challenge disappears from Available Challenges list
    res_avail_assigned = client.get("/api/universities/available-challenges", headers=headers_univ_a)
    avail_assigned_ids = [c["short_id"] for c in res_avail_assigned.json()] if res_avail_assigned.status_code == 200 else []
    assert_test("15. Assigned challenge disappears from available challenges for ALL universities", ch1_id not in avail_assigned_ids, f"Still in available: {ch1_id in avail_assigned_ids}")

    # 16. Assigned University A sees challenge under My Assignments
    res_my_a = client.get("/api/universities/my-assignments", headers=headers_univ_a)
    my_a_ids = [c["short_id"] for c in res_my_a.json()] if res_my_a.status_code == 200 else []
    assert_test("16. Assigned University A sees challenge under My Assignments", ch1_id in my_a_ids, f"Univ A Assignments: {my_a_ids}")

    # 17. Different University B does NOT see University A's assigned challenge
    res_my_b = client.get("/api/universities/my-assignments", headers=headers_univ_b)
    my_b_ids = [c["short_id"] for c in res_my_b.json()] if res_my_b.status_code == 200 else []
    assert_test("17. Different University B does NOT see University A's assigned challenge", ch1_id not in my_b_ids, f"Univ B Assignments: {my_b_ids}")

    # 18. Duplicate Assignment Attempt is Rejected (409 Conflict)
    res_dup_assign = client.post(f"/api/admin/challenges/{ch1_id}/assign", json={
        "university_id": str(univ_b.id),
        "notes": "Attempt duplicate assignment."
    }, headers=headers_admin)
    assert_test("18. Duplicate assignment attempt is rejected (409 Conflict)", res_dup_assign.status_code == 409, res_dup_assign.text)

    # 19. Assignment creates audit log
    res_audit_final = client.get("/api/admin/audit-log", headers=headers_admin)
    final_audit_types = [a["action_type"] for a in res_audit_final.json()] if res_audit_final.status_code == 200 else []
    assert_test("19. University Assignment creates audit log record", "ASSIGN_UNIVERSITY" in final_audit_types, f"Types: {final_audit_types}")

    # 20. Citizen sees updated challenge status (ASSIGNED) on detail endpoint
    res_citizen_detail = client.get(f"/api/challenges/{ch1_id}")
    cit_status = res_citizen_detail.json().get("status") if res_citizen_detail.status_code == 200 else ""
    assert_test("20. Citizen sees updated challenge status (ASSIGNED)", cit_status == "ASSIGNED", f"Citizen detail status: {cit_status}")

    db.close()

    print("==================================================")
    print(f"  RESULTS: {passed}/{total} TESTS PASSED")
    print("==================================================")
    if passed == total:
        print("[SUCCESS] All Stage 3 backend tests passed clean!")
        return 0
    else:
        print("[ERROR] Some tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())
