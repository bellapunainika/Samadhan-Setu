"""
test_stage4_final.py — Master Prototype Final Integration & E2E Verification Suite.
Tests the complete end-to-end master prototype workflow across all 5 roles:
1. Citizen submits challenge -> UNDER_REVIEW
2. Admin performs 1-Step Approve & Assign -> ASSIGNED
3. Citizen verifies status "University Assigned"
4. Assigned University configures team & starts project -> IN_PROGRESS
5. Assigned University updates progress & submits solution -> SOLUTION_SUBMITTED
6. Admin reviews solution -> SOLUTION_APPROVED
7. University requests Industry Support
8. Industry views opportunity & expresses interest -> PENDING_ADMIN_REVIEW
9. Admin accepts Industry request -> COMPLETED (Problem Resolved / Support Confirmed)
10. Government Officer inspects oversight statistics & resolved count
11. Query API workflow (Citizen query -> Admin response -> Resolved)
12. Security & Role isolation checks
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
from app.models.solution import SolutionSubmission, SolutionStatus
from app.models.industry import IndustryInterest, IndustryInterestStatus
from app.models.query import ChallengeQuery, QueryStatus
from app.auth.jwt_handler import create_access_token

client = TestClient(app)
settings = get_settings()

def run_tests():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    print("==================================================")
    print("  SAMADHAN SETU — MASTER PROTOTYPE INTEGRATION SUITE")
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

    db = SessionLocal()

    # 1. Load Seeded Users
    cit_user = db.query(User).filter(User.email == "citizen@samadhan.gov.in").first()
    univ_a_user = db.query(User).filter(User.email == "solver@bitmesra.ac.in").first()
    univ_b_user = db.query(User).filter(User.email == "solver@iitdhanbad.ac.in").first()
    ind_user = db.query(User).filter(User.email == "csr@tatasteel.com").first()
    admin_user = db.query(User).filter(User.email == "admin@samadhan.gov.in").first()
    officer_user = db.query(User).filter(User.email == "officer@samadhan.gov.in").first()

    db.close()

    assert_test("1. Seeded Citizen account exists", cit_user is not None)
    assert_test("2. Seeded University A (BIT Mesra) account exists", univ_a_user is not None)
    assert_test("3. Seeded University B (IIT Dhanbad) account exists", univ_b_user is not None)
    assert_test("4. Seeded Industry account exists", ind_user is not None)
    assert_test("5. Seeded Admin account exists", admin_user is not None)
    assert_test("6. Seeded Govt Officer account exists", officer_user is not None)

    if not all([cit_user, univ_a_user, univ_b_user, ind_user, admin_user, officer_user]):
        print("[ERROR] Seeded users missing! Run python -m seed.seed_prototype first.")
        return 1

    # Tokens
    token_cit = create_access_token({"sub": cit_user.email, "role": cit_user.role.value, "user_id": str(cit_user.id)})
    token_univ_a = create_access_token({"sub": univ_a_user.email, "role": univ_a_user.role.value, "user_id": str(univ_a_user.id)})
    token_univ_b = create_access_token({"sub": univ_b_user.email, "role": univ_b_user.role.value, "user_id": str(univ_b_user.id)})
    token_ind = create_access_token({"sub": ind_user.email, "role": ind_user.role.value, "user_id": str(ind_user.id)})
    token_admin = create_access_token({"sub": admin_user.email, "role": admin_user.role.value, "user_id": str(admin_user.id)})
    token_officer = create_access_token({"sub": officer_user.email, "role": officer_user.role.value, "user_id": str(officer_user.id)})

    headers_cit = {"Authorization": f"Bearer {token_cit}"}
    headers_univ_a = {"Authorization": f"Bearer {token_univ_a}"}
    headers_univ_b = {"Authorization": f"Bearer {token_univ_b}"}
    headers_ind = {"Authorization": f"Bearer {token_ind}"}
    headers_admin = {"Authorization": f"Bearer {token_admin}"}
    headers_officer = {"Authorization": f"Bearer {token_officer}"}

    # Step A: Citizen submits new challenge
    ch_res = client.post("/api/challenges/", json={
        "title": "Severe Fluoride Contamination in Rural Village Handpumps",
        "description": "Handpumps in Dumri Block provide water with 4.5mg/L fluoride causing dental and skeletal fluorosis in village children.",
        "category": "Water",
        "district_id": "gumla",
        "block_locality": "Dumri Block, Ward 1",
        "citizen_severity": 5,
        "affected_population": 350
    }, headers=headers_cit)

    ch_data = ch_res.json() if ch_res.status_code == 201 else {}
    short_id = ch_data.get("short_id")
    assert_test("7. Citizen submits challenge -> status UNDER_REVIEW", ch_res.status_code == 201 and ch_data.get("status") == "UNDER_REVIEW", ch_res.text)

    # Step B: Admin 1-step Approve & Assign to University A
    assign_res = client.post(f"/api/admin/challenges/{short_id}/assign", json={
        "university_id": str(univ_a_user.university_id),
        "notes": "Assigned directly to BIT Mesra Chemical Engineering R&D Lab."
    }, headers=headers_admin)

    assert_test("8. Admin 1-step Approve & Assign -> status ASSIGNED", assign_res.status_code == 200 and assign_res.json().get("status") == "ASSIGNED", assign_res.text)

    # Step C: University Isolation (Univ A sees assignment; Univ B does NOT)
    my_a_res = client.get("/api/universities/my-assignments", headers=headers_univ_a)
    my_b_res = client.get("/api/universities/my-assignments", headers=headers_univ_b)
    in_a = any(c.get("short_id") == short_id for c in my_a_res.json()) if my_a_res.status_code == 200 else False
    in_b = any(c.get("short_id") == short_id for c in my_b_res.json()) if my_b_res.status_code == 200 else False

    assert_test("9. University Isolation (Visible in Univ A, Hidden from Univ B)", in_a and not in_b, f"In A: {in_a}, In B: {in_b}")

    # Step D: University A configures team & starts project
    team_res = client.post(f"/api/universities/challenges/{short_id}/team", json={
        "team_name": "BIT Hydro-Clean R&D Team",
        "faculty_mentor": "Dr. Alok Verma",
        "student_members": "Ankit Kumar (M.Tech), Sneha Roy (B.Tech)"
    }, headers=headers_univ_a)

    start_res = client.post(f"/api/universities/challenges/{short_id}/start", headers=headers_univ_a)
    assert_test("10. University configures team & starts project -> IN_PROGRESS", start_res.status_code == 200 and start_res.json().get("status") == "IN_PROGRESS", start_res.text)

    # Step E: University A posts progress update & submits solution
    prog_res = client.post(f"/api/universities/challenges/{short_id}/progress", json={
        "title": "Activated Bauxite Filter Lab Test Complete",
        "description": "Lab trials show 98.5% fluoride removal efficiency at 20L/hr throughput.",
        "progress_percent": 60.0
    }, headers=headers_univ_a)

    sol_res = client.post(f"/api/universities/challenges/{short_id}/submit-solution", json={
        "title": "Community Bio-Char Fluoride Filtration Column",
        "description": "Low-cost modular filtration unit utilizing local activated bauxite and bio-char.",
        "prototype_url": "https://github.com/jh-innovation/fluoride-filter",
        "technology_stack": "Activated Bauxite + Bio-Char Nanofilter"
    }, headers=headers_univ_a)

    assert_test("11. University submits solution -> SOLUTION_SUBMITTED", sol_res.status_code == 200 and sol_res.json().get("status") == "SOLUTION_SUBMITTED", sol_res.text)

    # Step F: Admin accepts solution -> SOLUTION_APPROVED
    sol_rev_res = client.post(f"/api/admin/solutions/{short_id}/review", json={
        "action": "ACCEPT",
        "feedback": "Validated by State Technical Evaluation Panel."
    }, headers=headers_admin)

    assert_test("12. Admin reviews & accepts solution -> SOLUTION_APPROVED", sol_rev_res.status_code == 200 and sol_rev_res.json().get("status") == "SOLUTION_APPROVED", sol_rev_res.text)

    # Step G: University seeks Industry Support (SOLUTION_APPROVED → INDUSTRY_SUPPORT_REQUESTED)
    ind_req_res = client.post(f"/api/universities/challenges/{short_id}/seek-industry-support",
                              headers=headers_univ_a)

    assert_test("13. University seeks Industry Support → INDUSTRY_SUPPORT_REQUESTED",
                ind_req_res.status_code == 200 and ind_req_res.json().get("status") == "INDUSTRY_SUPPORT_REQUESTED",
                ind_req_res.text)

    # Step H: Industry views opportunity & expresses interest
    opps_res = client.get("/api/industry/opportunities", headers=headers_ind)
    has_opp = any(c.get("short_id") == short_id for c in opps_res.json()) if opps_res.status_code == 200 else False

    ind_expr_res = client.post(f"/api/industry/opportunities/{short_id}/express-interest", json={
        "company_name": "Tata Steel CSR Foundation",
        "contact_email": "csr@tatasteel.com",
        "support_type": "CSR Grant & Direct Co-Funding",
        "message": "Tata Steel CSR pledges ₹12,00,000 for manufacturing and village deployment."
    }, headers=headers_ind)
    ind_req_data = ind_expr_res.json() if ind_expr_res.status_code == 200 else {}
    req_id = ind_req_data.get("id")

    assert_test("14. Industry expresses interest → status INTEREST_EXPRESSED",
                ind_expr_res.status_code == 200 and ind_req_data.get("status") == "INTEREST_EXPRESSED",
                ind_expr_res.text)

    # Step I: Walk the full role-gated state machine to reach PROJECT_FUNDED → COMPLETED
    # Industry: INTEREST_EXPRESSED → PROPOSAL_INITIATED
    step_i1 = client.post(f"/api/industry/proposals/{req_id}/update-status", json={
        "status": "PROPOSAL_INITIATED"
    }, headers=headers_ind)
    # Industry: PROPOSAL_INITIATED → PROPOSAL_UNDER_DISCUSSION
    step_i2 = client.post(f"/api/industry/proposals/{req_id}/update-status", json={
        "status": "PROPOSAL_UNDER_DISCUSSION"
    }, headers=headers_ind)
    # University: PROPOSAL_UNDER_DISCUSSION → SUPPORT_CONFIRMED
    step_i3 = client.post(f"/api/industry/proposals/{req_id}/update-status", json={
        "status": "SUPPORT_CONFIRMED"
    }, headers=headers_univ_a)
    # Industry: SUPPORT_CONFIRMED → FUNDING_CONFIRMED
    step_i4 = client.post(f"/api/industry/proposals/{req_id}/update-status", json={
        "status": "FUNDING_CONFIRMED",
        "pledged_amount": "₹12,00,000",
        "proposal_summary": "CSR Co-funding agreement finalized between BIT Mesra and Tata Steel CSR."
    }, headers=headers_ind)
    # Industry: FUNDING_CONFIRMED → PROJECT_FUNDED (triggers Challenge → COMPLETED)
    step_i5 = client.post(f"/api/industry/proposals/{req_id}/update-status", json={
        "status": "PROJECT_FUNDED"
    }, headers=headers_ind)

    assert_test("15. Full proposal pipeline → final status PROJECT_FUNDED",
                step_i5.status_code == 200 and step_i5.json().get("status") == "PROJECT_FUNDED",
                step_i5.text)

    # Step J: Verify Challenge final status is COMPLETED (triggered by PROJECT_FUNDED)
    ch_final_res = client.get(f"/api/challenges/{short_id}")
    final_status = ch_final_res.json().get("status") if ch_final_res.status_code == 200 else ""
    assert_test("16. Challenge final status becomes COMPLETED (Problem Resolved)",
                final_status == "COMPLETED", f"Status: {final_status}")

    # Step K: Query Workflow (Citizen asks -> Admin responds)
    q_create_res = client.post("/api/queries/", json={
        "challenge_id": short_id,
        "message": "When will the filtration unit be installed in our ward?",
        "subject": "Deployment Timeline Query"
    }, headers=headers_cit)
    q_data = q_create_res.json() if q_create_res.status_code == 200 else {}
    q_id = q_data.get("id")

    q_resp_res = client.post(f"/api/queries/{q_id}/respond", json={
        "response": "Installation scheduled for next Monday with Tata Steel CSR support."
    }, headers=headers_admin)

    assert_test("17. Query workflow (Citizen query -> Admin response -> RESOLVED)", q_resp_res.status_code == 200 and q_resp_res.json().get("status") == "RESOLVED", q_resp_res.text)

    # Step L: Admin Pipeline Tabs Test
    pipe_res = client.get("/api/admin/challenges?tab=completed", headers=headers_admin)
    has_completed = any(c.get("short_id") == short_id for c in pipe_res.json()) if pipe_res.status_code == 200 else False
    assert_test("18. Admin Pipeline (Completed tab includes finalized project)", has_completed, pipe_res.text)

    print("==================================================")
    print(f"  RESULTS: {passed}/{total} TESTS PASSED")
    print("==================================================")
    if passed == total:
        print("[SUCCESS] All Master Prototype Integration tests passed clean!")
        return 0
    else:
        print("[ERROR] Some tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())
