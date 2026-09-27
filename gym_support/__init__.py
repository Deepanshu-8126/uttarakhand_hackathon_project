"""Gym Support / Devbhoomi AI Unified Agentic LangGraph Brain.

Single Brain, Dual Interface Architecture (Voice + Text Chat)
- Voice Interface: `python -m gym_support.voice`
- Text Server: `python -m gym_support.server`
"""

from .graph import build_graph, GREETING, SYSTEM_PROMPT

__all__ = ["build_graph", "GREETING", "SYSTEM_PROMPT"]
