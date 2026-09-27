"""Gym Support module proxy for ai/ directory."""
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from gym_support.graph import build_graph, GREETING, SYSTEM_PROMPT

__all__ = ["build_graph", "GREETING", "SYSTEM_PROMPT"]
