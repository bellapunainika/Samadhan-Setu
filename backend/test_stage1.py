"""
test_stage1.py — Comprehensive Stage 1 Verification Suite
Tests database connection, migration, registration, login, role restrictions,
me endpoint, and authorization dependencies using FastAPI TestClient.
"""
import sys
from fastapi.testclient import TestClient
from app.main import app
from app.config import get_settings

client = TestClient(app)
settings = get_settings()

def run_tests():
    print("==================================================")
    print("  SAMADHAN SETU - STAGE 1 VERIFICATION SUITE")
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

    # 1. Health Endpoint
    res = client.get("/api/health")
    assert_test("Health Endpoint (/api/health)", res.status_code == 200 and res.json().get("status") == "ok", res.text)

    # 2. Admin Authentication
    res = client.post("/api/auth/login", json={
        "email": settings.ADMIN_EMAIL,
        "password": settings.ADMIN_PASSWORD
    })
    admin_login_ok = res.status_code == 200 and "access_token" in res.json()
    assert_test("Admin Login with Seeded Credentials", admin_login_ok, res.text)
    admin_token = res.json().get("access_token") if admin_login_ok else None

    # 3. Public Registration - Citizen
    citizen_email = "test.citizen@example.com"
    citizen_pass = "Password123!"
    res = client.post("/api/auth/register", json={
        "email": citizen_email,
        "password": citizen_pass,
        "full_name": "Ranchi Citizen Test",
        "role": "citizen",
        "phone": "9876543210"
    })
    # Accept 201 created or 409 if already registered from previous run
    reg_ok = res.status_code in (201, 409)
    assert_test("Public Registration (Citizen)", reg_ok, res.text)

    # 4. Duplicate Registration Rejection
    res = client.post("/api/auth/register", json={
        "email": citizen_email,
        "password": citizen_pass,
        "full_name": "Ranchi Citizen Duplicate",
        "role": "citizen"
    })
    assert_test("Duplicate Email Rejection (409 Conflict)", res.status_code == 409, res.text)

    # 5. Public Registration Blocked for Admin Role
    res = client.post("/api/auth/register", json={
        "email": "hacker.admin@example.com",
        "password": "HackerPass123!",
        "full_name": "Fake Admin",
        "role": "admin"
    })
    assert_test("Admin Public Registration Blocked (422 Unprocessable Entity)", res.status_code == 422, res.text)

    # 6. Valid Citizen Login
    res = client.post("/api/auth/login", json={
        "email": citizen_email,
        "password": citizen_pass
    })
    cit_login_ok = res.status_code == 200 and "access_token" in res.json()
    assert_test("Valid Citizen Login (JWT Issued)", cit_login_ok, res.text)
    citizen_token = res.json().get("access_token") if cit_login_ok else None

    # 7. Invalid Login Credentials
    res = client.post("/api/auth/login", json={
        "email": citizen_email,
        "password": "WrongPassword123!"
    })
    assert_test("Invalid Password Rejection (401 Unauthorized)", res.status_code == 401, res.text)

    # 8. Profile Fetch (/api/auth/me) with Valid Token
    if citizen_token:
        res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {citizen_token}"})
        me_ok = res.status_code == 200 and res.json().get("email") == citizen_email
        assert_test("Fetch Profile /api/auth/me with Bearer Token", me_ok, res.text)
    else:
        assert_test("Fetch Profile /api/auth/me with Bearer Token", False, "Citizen token not available")

    # 9. Profile Fetch without Token
    res = client.get("/api/auth/me")
    assert_test("Profile Fetch without Token Rejection (401 Unauthorized)", res.status_code == 401, res.text)

    # 10. Role Verification in JWT Payload
    if admin_token:
        res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
        admin_me_ok = res.status_code == 200 and res.json().get("role") == "admin"
        assert_test("Admin Token Role Verification (role='admin')", admin_me_ok, res.text)
    else:
        assert_test("Admin Token Role Verification (role='admin')", False, "Admin token not available")

    print("==================================================")
    print(f"  RESULTS: {passed}/{total} TESTS PASSED")
    print("==================================================")
    if passed == total:
        print("[SUCCESS] All Stage 1 backend tests passed clean!")
        return 0
    else:
        print("[ERROR] Some tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())
