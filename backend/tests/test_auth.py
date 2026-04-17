from __future__ import annotations

from uuid import uuid4

from app.config import settings


def build_username(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex[:10]}"


def test_signup_persists_user_and_returns_token(client, db_connection):
    username = build_username("signup")
    password = "securepass123"

    response = client.post(
        "/api/auth/signup",
        json={"username": username, "password": password},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["accessToken"]
    assert payload["user"]["username"] == username

    stored_user = db_connection.execute(
        "SELECT username, hashed_password FROM users WHERE username = ?",
        (username,),
    ).fetchone()
    assert stored_user is not None
    assert stored_user["username"] == username
    assert stored_user["hashed_password"] != password


def test_login_reads_existing_user_from_database(client):
    username = build_username("login")
    password = "securepass123"

    signup_response = client.post(
        "/api/auth/signup",
        json={"username": username, "password": password},
    )
    assert signup_response.status_code == 200

    login_response = client.post(
        "/api/auth/login",
        json={"username": username, "password": password},
    )

    assert login_response.status_code == 200
    payload = login_response.json()
    assert payload["accessToken"]
    assert payload["user"]["username"] == username


def test_login_rejects_invalid_password(client):
    username = build_username("invalid")

    signup_response = client.post(
        "/api/auth/signup",
        json={"username": username, "password": "securepass123"},
    )
    assert signup_response.status_code == 200

    login_response = client.post(
        "/api/auth/login",
        json={"username": username, "password": "wrongpass123"},
    )

    assert login_response.status_code == 401
    assert login_response.json()["detail"] == "Incorrect username or password"


def test_seeded_admin_account_can_log_in(client):
    response = client.post(
        "/api/auth/login",
        json={
            "username": settings.admin_username,
            "password": settings.admin_password,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["user"]["username"] == settings.admin_username
    assert payload["accessToken"]
