"""Gym Support Voice runner for ai/ directory."""
import asyncio
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from gym_support.voice import main_voice

if __name__ == "__main__":
    asyncio.run(main_voice())
