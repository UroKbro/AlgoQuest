from __future__ import annotations


def test_payload_size_limit_ok(client):
    # Small payload should work
    response = client.post(
        "/api/forge/challenges",
        params={"profile_id": "guest"},
        json={
            "targetRealm": "laboratory",
            "title": "Small Challenge",
            "parameters": {"a": 1},
        },
    )
    assert response.status_code == 200


def test_payload_size_limit_too_large(client):
    # Large payload (> 1MB) should be rejected
    large_string = "a" * (1024 * 1024 + 100)

    response = client.post(
        "/api/forge/challenges",
        params={"profile_id": "guest"},
        json={
            "targetRealm": "laboratory",
            "title": "Huge Challenge",
            "parameters": {"data": large_string},
        },
    )
    assert response.status_code == 413
    assert response.text == "Payload too large"


def test_ai_usage_logging_persistence(client, supabase_store):
    # Call an AI endpoint
    client.post(
        "/api/ai/review-logic",
        json={"code": "print('hello')", "focus": "test"},
    )

    # Check the in-memory store
    rows = supabase_store._tables["ai_usage_logs"]
    assert len(rows) >= 1
    assert rows[0]["endpoint"] == "review-logic"
    assert "print('hello')" in rows[0]["prompt_preview"]
    assert rows[0]["status"] in ("success", "error")
