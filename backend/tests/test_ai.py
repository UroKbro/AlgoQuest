from __future__ import annotations


def test_ai_review_logic(client):
    response = client.post(
        "/api/ai/review-logic",
        json={
            "code": "def find_max(arr):\n    return max(arr)",
            "focus": "Efficiency"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "critique" in data
    assert "logicScore" in data
    assert isinstance(data["logicScore"], int)


def test_ai_socratic_anchor(client):
    response = client.post(
        "/api/ai/socratic-anchor",
        json={
            "code": "def fib(n):\n    return fib(n-1) + fib(n-2)",
            "problemContext": "Recursion Depth",
            "userQuery": "Why does it crash?"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "hint" in data
    assert len(data["hint"]) > 0


def test_ai_idea_to_syntax(client):
    response = client.post(
        "/api/ai/idea-to-syntax",
        json={
            "description": "A simple todo list logic"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "title" in data
    assert "starterCode" in data
    assert "architecture" in data
    assert "nodes" in data["architecture"]
