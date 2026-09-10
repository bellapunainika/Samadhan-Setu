"""
test_stage3.py — Stage 3 Final Cross-Role Workflow & State Sync Verification Test Suite.
Tests the complete lifecycle across 4 roles:
Citizen -> State Admin -> University -> Industry.
"""
import os
import sys
import uuid
import requests

BASE_URL = "http://localhost:8000/api"

CITIZEN_EMAIL = "citizen1@example.com"
CITIZEN_PASS = "citizen123"

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@samadhan.gov.in")
ADMIN_PASS = os.getenv("ADMIN_PASSWORD", "Nainika@00")

UNIV_EMAIL = "solver@bitmesra.ac.in"
UNIV_PASS = "univ123"

UNIV_B_EMAIL = "solver@nitsri.ac.in" # Secondary university user if exists, or alternative
UNIV_B_PASS = "univ123"

INDUSTRY_EMAIL = "csr@tatasteel.com"
INDUSTRY_PASS = "industry123"


def login(email, password, role="citizen", full_name="Test User"):
    resp = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if resp.status_code == 401 and role != "admin":
        # Register user if not exists
        requests.post(f"{BASE_URL}/auth/register", json={
            "email": email,
            "password": password,
            "full_name": full_name,
            "role": role,
            "organization": "BIT Mesra" if role == "university" else "Tata Steel" if role == "industry" else None
        })
        resp = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})

    if resp.status_code != 200:
        print(f"FAILED to login as {email}: {resp.status_code} - {resp.text}")
        sys.exit(1)
    return resp.json()["access_token"]


def main():
    print("=" * 70)
    print("STAGE 3 FINAL CROSS-ROLE WORKFLOW INTEGRATION SUITE")
    print("=" * 70)

    # 1. Login all roles
    print("\n[Step 1] Logging in platform roles...")
    citizen_token = login(CITIZEN_EMAIL, CITIZEN_PASS, role="citizen", full_name="Citizen Tester")
    admin_token = login(ADMIN_EMAIL, ADMIN_PASS, role="admin", full_name="State Governance Admin")
    univ_token = login(UNIV_EMAIL, UNIV_PASS, role="university", full_name="BIT Mesra R&D Lead")
    industry_token = login(INDUSTRY_EMAIL, INDUSTRY_PASS, role="industry", full_name="Tata Steel CSR Lead")
    print("SUCCESS: Logged in Citizen, Admin, University, and Industry accounts.")

    headers_citizen = {"Authorization": f"Bearer {citizen_token}"}
    headers_admin = {"Authorization": f"Bearer {admin_token}"}
    headers_univ = {"Authorization": f"Bearer {univ_token}"}
    headers_industry = {"Authorization": f"Bearer {industry_token}"}

    # 2. Citizen Submits Challenge
    print("\n[Step 2] Citizen submitting fresh challenge...")
    unique_suffix = str(uuid.uuid4())[:8]
    challenge_payload = {
        "title": f"Stage3 Automated Test Challenge {unique_suffix}",
        "description": "Critical water supply and contamination crisis requiring immediate R&D filtration solution.",
        "category": "Water",
        "district_id": "ranchi",
        "block_locality": "Kanke Road Panchayati Ward 4",
        "citizen_severity": 5,
        "affected_population": 450
    }
    resp = requests.post(f"{BASE_URL}/challenges/", json=challenge_payload, headers=headers_citizen)
    assert resp.status_code == 201, f"Failed challenge creation: {resp.text}"
    ch = resp.json()
    ch_id = ch["id"]
    short_id = ch["short_id"]
    assert ch["status"] == "UNDER_REVIEW", f"Expected UNDER_REVIEW, got {ch['status']}"
    print(f"SUCCESS: Challenge created. ID: {short_id} ({ch_id}), Status: {ch['status']}")

    # 3. Check Citizen My Submissions & Admin Pending Queue
    print("\n[Step 3] Verifying submission visibility...")
    resp_my = requests.get(f"{BASE_URL}/challenges/my", headers=headers_citizen)
    assert any(c["id"] == ch_id for c in resp_my.json()), "Challenge missing from Citizen My Submissions."
    
    resp_pending = requests.get(f"{BASE_URL}/admin/challenges/pending", headers=headers_admin)
    assert any(c["id"] == ch_id for c in resp_pending.json()), "Challenge missing from Admin Pending Review queue."

    resp_avail = requests.get(f"{BASE_URL}/universities/available-challenges", headers=headers_univ)
    assert not any(c["id"] == ch_id for c in resp_avail.json()), "UNDER_REVIEW challenge MUST NOT be visible in University Discovery."
    print("SUCCESS: Challenge correctly scoped to Citizen & Admin Pending queue. Hidden from University Discovery.")

    # 4. Admin Approves Challenge
    print("\n[Step 4] State Admin approving challenge...")
    resp_app = requests.post(f"{BASE_URL}/admin/challenges/{short_id}/approve", json={"reason": "State governance approval verified."}, headers=headers_admin)
    assert resp_app.status_code == 200, f"Approve failed: {resp_app.text}"
    ch_app = resp_app.json()
    assert ch_app["status"] == "APPROVED", f"Expected APPROVED status, got {ch_app['status']}"
    print(f"SUCCESS: Challenge approved. Status: {ch_app['status']}")

    # 5. Verify Discovery Availability
    print("\n[Step 5] Verifying University Discovery availability...")
    resp_avail2 = requests.get(f"{BASE_URL}/universities/available-challenges", headers=headers_univ)
    assert any(c["id"] == ch_id for c in resp_avail2.json()), "APPROVED challenge MUST appear in University Discovery."
    print("SUCCESS: Challenge now visible in Available for Discovery.")

    # 6. Admin Assigns University
    print("\n[Step 6] State Admin assigning challenge to University...")
    # Fetch active universities
    univs_resp = requests.get(f"{BASE_URL}/admin/universities", headers=headers_admin)
    assert univs_resp.status_code == 200
    target_univ = univs_resp.json()[0]
    univ_id = target_univ["id"]

    resp_assign = requests.post(f"{BASE_URL}/admin/challenges/{short_id}/assign", json={"university_id": univ_id, "notes": "Assigned to lead R&D team."}, headers=headers_admin)
    assert resp_assign.status_code == 200, f"Assign failed: {resp_assign.text}"
    ch_assigned = resp_assign.json()
    assert ch_assigned["status"] == "ASSIGNED", f"Expected ASSIGNED, got {ch_assigned['status']}"
    print(f"SUCCESS: Assigned to {target_univ['name']}. Status: {ch_assigned['status']}")

    # 7. Verify Assignment Scoping
    print("\n[Step 7] Verifying assignment isolation...")
    resp_avail3 = requests.get(f"{BASE_URL}/universities/available-challenges", headers=headers_univ)
    assert not any(c["id"] == ch_id for c in resp_avail3.json()), "ASSIGNED challenge MUST disappear from Available for Discovery."

    resp_my_assign = requests.get(f"{BASE_URL}/universities/my-assignments", headers=headers_univ)
    assert any(c["id"] == ch_id for c in resp_my_assign.json()), "ASSIGNED challenge MUST appear in assigned university's assignments."
    print("SUCCESS: Removed from Discovery; present in My Assigned R&D Challenges.")

    # 8. University Starts Project
    print("\n[Step 8] University starting R&D project (ASSIGNED -> IN_PROGRESS)...")
    resp_start = requests.post(f"{BASE_URL}/universities/challenges/{short_id}/start", headers=headers_univ)
    assert resp_start.status_code == 200, f"Start failed: {resp_start.text}"
    ch_start = resp_start.json()
    assert ch_start["status"] == "IN_PROGRESS", f"Expected IN_PROGRESS, got {ch_start['status']}"
    print(f"SUCCESS: Project started. Status: {ch_start['status']}")

    # 9. University Submits Solution
    print("\n[Step 9] University submitting solution (IN_PROGRESS -> SOLUTION_SUBMITTED)...")
    sol_payload = {
        "title": "Bio-Membrane Multi-Stage Water Filtration Unit",
        "description": "Low-cost local bio-membrane filtration prototype engineered using activated coconut charcoal and gravel.",
        "prototype_url": "https://github.com/jh-innovation/water-filter-proto",
        "technology_stack": "IoT Sensing + Bio-Filter"
    }
    resp_sol = requests.post(f"{BASE_URL}/universities/challenges/{short_id}/submit-solution", json=sol_payload, headers=headers_univ)
    assert resp_sol.status_code == 200, f"Submit solution failed: {resp_sol.text}"
    ch_sol = resp_sol.json()
    assert ch_sol["status"] == "SOLUTION_SUBMITTED", f"Expected SOLUTION_SUBMITTED, got {ch_sol['status']}"
    print(f"SUCCESS: Solution submitted. Status: {ch_sol['status']}")

    # 10. Admin Reviews & Accepts Solution
    print("\n[Step 10] Admin reviewing solution queue & accepting solution (SOLUTION_SUBMITTED -> COMPLETED)...")
    resp_pend_sol = requests.get(f"{BASE_URL}/admin/solutions/pending", headers=headers_admin)
    assert any(c["id"] == ch_id for c in resp_pend_sol.json()), "Submitted solution missing from Admin Solution Review Queue."

    resp_accept = requests.post(f"{BASE_URL}/admin/solutions/{short_id}/review", json={"action": "ACCEPT", "feedback": "Solution validated by state technical panel."}, headers=headers_admin)
    assert resp_accept.status_code == 200, f"Accept solution failed: {resp_accept.text}"
    ch_done = resp_accept.json()
    assert ch_done["status"] == "COMPLETED", f"Expected COMPLETED, got {ch_done['status']}"
    print(f"SUCCESS: Solution accepted. Final Status: {ch_done['status']}")

    # 11. Industry Expresses Interest
    print("\n[Step 11] Industry user expressing CSR partnership interest...")
    resp_opps = requests.get(f"{BASE_URL}/industry/opportunities", headers=headers_industry)
    assert any(c["id"] == ch_id for c in resp_opps.json()), "Completed project missing from Industry Opportunities."

    ind_payload = {
        "company_name": "Tata Steel CSR Foundation",
        "contact_email": "csr@tatasteel.com",
        "support_type": "CSR Grant & Direct Funding",
        "message": "We propose a ₹25,00,000 grant for pilot deployment across 10 rural villages."
    }
    resp_interest = requests.post(f"{BASE_URL}/industry/opportunities/{short_id}/express-interest", json=ind_payload, headers=headers_industry)
    assert resp_interest.status_code == 200, f"Express interest failed: {resp_interest.text}"
    req_data = resp_interest.json()
    assert req_data["status"] == "PENDING_ADMIN_REVIEW", f"Expected PENDING_ADMIN_REVIEW, got {req_data['status']}"
    print(f"SUCCESS: Industry interest request submitted. Request ID: {req_data['id']}")

    # 12. Admin Reviews Industry Interest Request
    print("\n[Step 12] Admin accepting Industry Interest request...")
    resp_ind_reqs = requests.get(f"{BASE_URL}/admin/industry-requests", headers=headers_admin)
    assert any(r["id"] == req_data["id"] for r in resp_ind_reqs.json()), "Industry request missing from Admin queue."

    resp_ind_accept = requests.post(f"{BASE_URL}/admin/industry-requests/{req_data['id']}/review", json={"action": "ACCEPT", "response": "Tripartite MoU connection facilitated."}, headers=headers_admin)
    assert resp_ind_accept.status_code == 200, f"Review industry request failed: {resp_ind_accept.text}"
    assert resp_ind_accept.json()["status"] == "ACCEPTED"
    print("SUCCESS: Industry interest request accepted by Admin.")

    # 13. Verify Dashboard Stats
    print("\n[Step 13] Verifying real database metrics for all roles...")
    stats_citizen = requests.get(f"{BASE_URL}/challenges/stats/citizen", headers=headers_citizen).json()
    stats_admin = requests.get(f"{BASE_URL}/admin/stats", headers=headers_admin).json()
    stats_univ = requests.get(f"{BASE_URL}/universities/stats", headers=headers_univ).json()
    stats_ind = requests.get(f"{BASE_URL}/industry/stats", headers=headers_industry).json()

    print(f"  - Citizen Stats: {stats_citizen}")
    print(f"  - Admin Stats: {stats_admin}")
    print(f"  - University Stats: {stats_univ}")
    print(f"  - Industry Stats: {stats_ind}")

    # 14. Negative Access Control Tests
    print("\n[Step 14] Running negative access control tests...")
    # University tries to approve challenge
    resp_neg_approve = requests.post(f"{BASE_URL}/admin/challenges/{short_id}/approve", headers=headers_univ)
    assert resp_neg_approve.status_code == 403, f"University MUST NOT be able to call Admin Approve. Got: {resp_neg_approve.status_code}"

    # Citizen tries to assign university
    resp_neg_assign = requests.post(f"{BASE_URL}/admin/challenges/{short_id}/assign", json={"university_id": univ_id}, headers=headers_citizen)
    assert resp_neg_assign.status_code == 403, f"Citizen MUST NOT be able to call Admin Assign. Got: {resp_neg_assign.status_code}"

    print("SUCCESS: Negative authorization guards passed.")

    print("\n" + "=" * 70)
    print("ALL 14 INTEGRATION SUITE STEPS PASSED SUCCESSFULLY (100% COMPLIANT)")
    print("=" * 70)


if __name__ == "__main__":
    main()
