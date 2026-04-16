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
    # Create a string of ~1.1MB
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


def test_ai_usage_logging_persistence(client, db_connection):
    # Call an AI endpoint
    client.post(
        "/api/ai/review-logic",
        json={"code": "print('hello')", "focus": "test"}
    )
    
    # Check the database
    row = db_connection.execute("SELECT * FROM ai_usage_logs").fetchone()
    assert row is not None
    assert row["endpoint"] == "review-logic"
    assert "print('hello')" in row["prompt_preview"]
    assert row["status"] in ("success", "error")
