from __future__ import annotations

import json
from typing import Any, Protocol, Optional

from .config import settings
from .logger import log_warning


class AIService(Protocol):
    async def review_logic(
        self, code: str, focus: Optional[str] = None
    ) -> dict[str, Any]: ...

    async def socratic_hint(
        self, code: str, context: str, query: Optional[str] = None
    ) -> str: ...

    async def generate_blueprint(self, description: str) -> dict[str, Any]: ...


class MockAIService:
    async def review_logic(
        self, code: str, focus: Optional[str] = None
    ) -> dict[str, Any]:
        return {
            "critique": "### Logic Analysis\n\nThe implementation follows the core ritual. However, the state update in the main loop seems slightly delayed. Consider moving the pointer increment before the check.\n\n*   **Efficiency**: O(n)\n*   **Stability**: High",
            "logicScore": 85,
        }

    async def socratic_hint(
        self, code: str, context: str, query: Optional[str] = None
    ) -> str:
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
        self._fallback = MockAIService()
        # Delay import to avoid requirement if only mocking
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    def _generate_content(self, prompt: str):
        try:
            return self.model.generate_content(prompt)
        except Exception as exc:
            log_warning(
                "Gemini request failed, using mock fallback",
                error=str(exc),
                model="gemini-1.5-flash",
            )
            return None

    async def review_logic(
        self, code: str, focus: Optional[str] = None
    ) -> dict[str, Any]:
        prompt = f"""
        Analyze the following Python code for algorithmic correctness and logic.
        Focus: {focus if focus else "General logic and efficiency"}
        
        Code:
        ```python
        {code}
        ```
        
        Provide a critique in Markdown and a logic score between 0 and 100.
        Return ONLY a JSON object with keys: "critique" and "logicScore".
        """
        response = self._generate_content(prompt)
        if response is None:
            return await self._fallback.review_logic(code, focus)
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

    async def socratic_hint(
        self, code: str, context: str, query: Optional[str] = None
    ) -> str:
        prompt = f"""
        You are a Socratic tutor for computer science. 
        Context: {context}
        User Query: {query if query else "I am stuck."}
        Current Code:
        ```python
        {code}
        ```
        
        Provide a short, helpful hint that guides the user toward the solution without giving it away directly.
        """
        response = self._generate_content(prompt)
        if response is None:
            return await self._fallback.socratic_hint(code, context, query)
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
        response = self._generate_content(prompt)
        if response is None:
            return await self._fallback.generate_blueprint(description)
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


def get_ai_provider_status() -> dict[str, object]:
    api_key = settings.gemini_api_key

    if not api_key or api_key == "replace-with-your-gemini-key":
        return {
            "provider": "mock",
            "configured": False,
            "reason": "missing_api_key",
        }

    try:
        GeminiAIService(api_key)
    except ImportError:
        return {
            "provider": "mock",
            "configured": False,
            "reason": "missing_google_generativeai_package",
        }
    except Exception as exc:
        return {
            "provider": "mock",
            "configured": False,
            "reason": f"gemini_unavailable:{exc}",
        }

    return {
        "provider": "gemini",
        "configured": True,
        "model": "gemini-1.5-flash",
    }


def get_ai_service() -> AIService:
    status = get_ai_provider_status()
    if status["provider"] == "gemini":
        return GeminiAIService(settings.gemini_api_key)
    return MockAIService()
