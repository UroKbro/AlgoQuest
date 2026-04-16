from __future__ import annotations

from uuid import uuid4


def build_profile_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex}"


def test_settings_round_trip(client):
    profile_id = build_profile_id("settings")

    response = client.get("/api/settings", params={"profile_id": profile_id})
    assert response.status_code == 200
    assert response.json()["profileId"] == profile_id

    update = client.put(
        "/api/settings",
        params={"profile_id": profile_id},
        json={
            "neonIntensity": 84,
            "soundVolume": 52,
            "motionBlur": 21,
            "reducedMotion": True,
        },
    )
    assert update.status_code == 200
    assert update.json()["reducedMotion"] is True

    refreshed = client.get("/api/settings", params={"profile_id": profile_id})
    assert refreshed.status_code == 200
    assert refreshed.json()["neonIntensity"] == 84


def test_progress_and_summary_flow(client):
    profile_id = build_profile_id("progress")

    update = client.put(
        "/api/progress/lessons/loop-mastery",
        params={"profile_id": profile_id},
        json={
            "status": "in_progress",
            "attempts": 2,
            "lastCodeSnapshot": "total = 0\nfor step in range(5):\n    total += step",
        },
    )
    assert update.status_code == 200
    assert update.json()["lessonSlug"] == "loop-mastery"

    lessons = client.get("/api/progress/lessons", params={"profile_id": profile_id})
    assert lessons.status_code == 200
    data = lessons.json()
    loop_mastery = next(
        item for item in data["items"] if item["lessonSlug"] == "loop-mastery"
    )
    assert loop_mastery["status"] == "in_progress"

    summary = client.get("/api/progress/summary", params={"profile_id": profile_id})
    assert summary.status_code == 200
    assert summary.json()["continuity"]["realm"] == "dojo"
    assert summary.json()["continuity"]["title"] == "Loop Mastery"


def test_weekly_gate_and_path_analytics(client):
    profile_id = build_profile_id("weekly-gate")

    current = client.get(
        "/api/progress/weekly-gate/current", params={"profile_id": profile_id}
    )
    assert current.status_code == 200
    assert current.json()["status"] == "available"

    submit = client.post(
        "/api/progress/weekly-gate/2026-04-13/submit",
        params={"profile_id": profile_id},
        json={"score": 82},
    )
    assert submit.status_code == 200
    assert submit.json()["score"] == 82

    analytics = client.get("/api/path/analytics", params={"profile_id": profile_id})
    assert analytics.status_code == 200
    payload = analytics.json()
    assert payload["weeklyFocus"]
    assert payload["weeklyGate"]["score"] == 82


def test_projects_endpoints(client):
    profile_id = build_profile_id("projects")

    created = client.post(
        "/api/projects",
        params={"profile_id": profile_id},
        json={
            "title": "Search Engine",
            "blueprintSlug": "mini-search-engine",
            "files": {"main.py": "print(1)"},
            "architecture": {"nodes": []},
        },
    )
    assert created.status_code == 200
    project = created.json()
    project_id = project["id"]

    listed = client.get("/api/projects", params={"profile_id": profile_id})
    assert listed.status_code == 200
    assert len(listed.json()["items"]) == 1

    fetched = client.get(
        f"/api/projects/{project_id}", params={"profile_id": profile_id}
    )
    assert fetched.status_code == 200
    assert fetched.json()["title"] == "Search Engine"

    updated = client.put(
        f"/api/projects/{project_id}",
        params={"profile_id": profile_id},
        json={
            "title": "Search Engine v2",
            "blueprintSlug": "mini-search-engine",
            "files": {"main.py": "print(2)"},
            "architecture": {"nodes": ["index"]},
        },
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Search Engine v2"

    exported = client.post(
        f"/api/projects/{project_id}/export", params={"profile_id": profile_id}
    )
    assert exported.status_code == 200
    assert exported.json()["projectId"] == project_id


def test_forge_endpoints(client):
    profile_id = build_profile_id("forge")

    poster = client.post(
        "/api/forge/posters",
        params={"profile_id": profile_id},
        json={
            "sourceType": "laboratory",
            "sourceRef": "binary-search",
            "title": "Binary Search Poster",
            "payload": {"step": 3},
            "visibility": "public",
        },
    )
    assert poster.status_code == 200
    assert poster.json()["title"] == "Binary Search Poster"

    posters = client.get("/api/forge/posters", params={"profile_id": profile_id})
    assert posters.status_code == 200
    assert len(posters.json()["items"]) == 1

    challenge = client.post(
        "/api/forge/challenges",
        params={"profile_id": profile_id},
        json={
            "targetRealm": "laboratory",
            "title": "Merge Sort Sprint",
            "parameters": {"algorithm": "merge-sort"},
        },
    )
    assert challenge.status_code == 200
    assert challenge.json()["targetRealm"] == "laboratory"

    challenges = client.get("/api/forge/challenges", params={"profile_id": profile_id})
    assert challenges.status_code == 200
    assert len(challenges.json()["items"]) == 1
