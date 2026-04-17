from __future__ import annotations


def test_health_reports_ai_status(client):
    response = client.get("/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["service"] == "algoquest-backend"
    assert payload["ai"]["provider"] in ("gemini", "mock")
    assert isinstance(payload["ai"]["configured"], bool)
    assert payload["auth"]["provider"] in ("local", "supabase")


def test_auth_signup_and_login_flow(client):
    signup = client.post(
        "/api/auth/signup",
        json={"username": "learner", "password": "password123"},
    )

    assert signup.status_code == 200
    signup_payload = signup.json()
    assert signup_payload["user"]["username"] == "learner"
    assert signup_payload["accessToken"]

    login = client.post(
        "/api/auth/login",
        json={"username": "learner", "password": "password123"},
    )

    assert login.status_code == 200
    login_payload = login.json()
    assert login_payload["user"]["username"] == "learner"
    assert login_payload["accessToken"]


def test_default_admin_login_works(client):
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin123456"},
    )

    assert response.status_code == 200
    assert response.json()["user"]["username"] == "admin"
