"""Gym Support Server runner for ai/ directory."""
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from gym_support.server import run_server

if __name__ == "__main__":
    run_server()
