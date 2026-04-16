from __future__ import annotations

from uuid import uuid4


def build_profile_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex}"


def test_forge_challenge_detail(client):
    profile_id = build_profile_id("forge-detail")

    # 1. Create a challenge
    created = client.post(
        "/api/forge/challenges",
        params={"profile_id": profile_id},
        json={
            "targetRealm": "laboratory",
            "title": "Quick Sort Challenge",
            "parameters": {"algorithm": "quick-sort", "dataSize": 50},
        },
    )
    assert created.status_code == 200
    challenge_id = created.json()["id"]

    # 2. Fetch it by ID
    fetched = client.get(
        f"/api/forge/challenges/{challenge_id}",
        params={"profile_id": profile_id}
    )
    assert fetched.status_code == 200
    data = fetched.json()
    assert data["id"] == challenge_id
    assert data["title"] == "Quick Sort Challenge"
    assert data["targetRealm"] == "laboratory"
    assert data["parameters"]["algorithm"] == "quick-sort"


def test_forge_challenge_not_found(client):
    response = client.get("/api/forge/challenges/99999", params={"profile_id": "guest"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Challenge not found"
