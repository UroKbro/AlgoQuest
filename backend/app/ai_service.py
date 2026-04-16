from __future__ import annotations

import json
from typing import Any, Protocol, Optional

from .config import settings


class AIService(Protocol):
    async def review_logic(self, code: str, focus: Optional[str] = None) -> dict[str, Any]:
        ...

    async def socratic_hint(self, code: str, context: str, query: Optional[str] = None) -> str:
        ...

    async def generate_blueprint(self, description: str) -> dict[str, Any]:
        ...


class MockAIService:
    async def review_logic(self, code: str, focus: Optional[str] = None) -> dict[str, Any]:
        return {
            "critique": "### Logic Analysis\n\nThe implementation follows the core ritual. However, the state update in the main loop seems slightly delayed. Consider moving the pointer increment before the check.\n\n*   **Efficiency**: O(n)\n*   **Stability**: High",
            "logicScore": 85,
        }

    async def socratic_hint(self, code: str, context: str, query: Optional[str] = None) -> str:
        return "Think about the boundary conditions. What happens if the array has only one element?"

    async def generate_blueprint(self, description: str) -> dict[str, Any]:
        return {
            "blueprintSlug": "binary-search-iterative",
            "title": "Iterative Binary Search",
            "starterCode": "def search(arr, target):\n    # TODO: Implement binary search\n    pass",
            "architecture": {
                "nodes": [{"id": "1", "type": "process", "data": {"label": "Split"}}],
                "edges": [],
            },
        }


class GeminiAIService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        # Delay import to avoid requirement if only mocking
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    async def review_logic(self, code: str, focus: Optional[str] = None) -> dict[str, Any]:
        prompt = f"""
        Analyze the following Python code for algorithmic correctness and logic.
        Focus: {focus if focus else 'General logic and efficiency'}
        
        Code:
        ```python
        {code}
        ```
        
        Provide a critique in Markdown and a logic score between 0 and 100.
        Return ONLY a JSON object with keys: "critique" and "logicScore".
        """
        response = self.model.generate_content(prompt)
        try:
            # Simple cleanup of possible markdown backticks in response
            text = response.text.strip()
            if text.startswith("```json"):
                text = text.removeprefix("```json").removesuffix("```").strip()
            return json.loads(text)
        except Exception:
            return {
                "critique": response.text,
                "logicScore": 70,
            }

    async def socratic_hint(self, code: str, context: str, query: Optional[str] = None) -> str:
        prompt = f"""
        You are a Socratic tutor for computer science. 
        Context: {context}
        User Query: {query if query else 'I am stuck.'}
        Current Code:
        ```python
        {code}
        ```
        
        Provide a short, helpful hint that guides the user toward the solution without giving it away directly.
        """
        response = self.model.generate_content(prompt)
        return response.text

    async def generate_blueprint(self, description: str) -> dict[str, Any]:
        prompt = f"""
        Generate a starter code blueprint and a basic architecture map based on this description:
        "{description}"
        
        Return ONLY a JSON object with:
        - "title": A descriptive title.
        - "starterCode": Initial Python function signatures and comments.
        - "architecture": A minimal React Flow compatible object with "nodes" and "edges".
        """
        response = self.model.generate_content(prompt)
        try:
            text = response.text.strip()
            if text.startswith("```json"):
                text = text.removeprefix("```json").removesuffix("```").strip()
            return json.loads(text)
        except Exception:
            return {
                "title": "Generated Blueprint",
                "starterCode": "# Error generating code\n",
                "architecture": {"nodes": [], "edges": []},
            }


def get_ai_service() -> AIService:
    if settings.gemini_api_key and settings.gemini_api_key != "replace-with-your-gemini-key":
        try:
            return GeminiAIService(settings.gemini_api_key)
        except ImportError:
            # Fallback to mock if library not installed
            return MockAIService()
    return MockAIService()
