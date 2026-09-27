"""Entry point: `voice-demo --backend <name>`.

Backends: openai · openai-agents · gemini · adk · livekit · livekit-with-openai-realtime ·
livekit-with-gemini-live · pipecat · pipecat-with-langgraph ·
pipecat-with-openai-realtime · pipecat-with-gemini-live. The
`*-with-openai-realtime` / `*-with-gemini-live` / `livekit-with-*` backends swap
their framework's STT→LLM→TTS cascade for a speech-to-speech realtime model
(OpenAI Realtime / Gemini Live); `pipecat` uses Pipecat's stock OpenAI LLM
service, while `pipecat-with-langgraph` runs an in-process LangGraph graph as the
LLM stage.

This module is the *frontend*. It owns everything backend-agnostic — argument
parsing, LangSmith env wiring, and (for the SDK backends) constructing the local
mic + speaker + status meter and injecting them into the agent.

The agents themselves know nothing about the console: the OpenAI and ADK
backends receive their audio I/O and status UI through small protocols
(`AudioInput` / `AudioOutput` / `StatusUI`), so swapping this terminal frontend
for a web or telephony one means reimplementing those interfaces here, not
touching the agents. LiveKit and Pipecat own their own audio path through their
frameworks, so for those we just wire the tracer and hand control over.

Each backend lazily imports its framework, so a missing optional dependency for
one backend doesn't break the others. `uv sync --extra openai` is enough to run
the OpenAI backend.
"""

from __future__ import annotations

import argparse
import asyncio
import logging
import sys
from pathlib import Path

from dotenv import load_dotenv

from . import tracing

_HERE = Path(__file__).resolve().parent
for _candidate in (_HERE / ".env", _HERE.parent / ".env", _HERE.parent.parent / ".env"):
    if _candidate.exists():
        load_dotenv(_candidate, override=False)


# All direct SDK backends run the local mic + speaker at 24 kHz (Gemini and ADK
# resample to 16 kHz internally before sending audio to Gemini Live).
_CONSOLE_SAMPLE_RATE = 24_000


def _run_console_backend(run, project: str) -> None:
    """Build the local console frontend and inject it into an SDK agent.

    `run` is the agent's async `run(project_name, *, audio_in, audio_out, ui)`.
    """
    from .audio import MicStream, SpeakerStream
    from .console import ConsoleStatus

    mic = MicStream(sample_rate=_CONSOLE_SAMPLE_RATE)
    speaker = SpeakerStream(sample_rate=_CONSOLE_SAMPLE_RATE)
    status = ConsoleStatus()
    asyncio.run(run(project, audio_in=mic, audio_out=speaker, ui=status))


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="voice-demo",
        description="Run one of the voice-agent backends with LangSmith tracing.",
    )
    parser.add_argument(
        "--backend",
        required=True,
        choices=(
            "openai",
            "openai-agents",
            "gemini",
            "adk",
            "livekit",
            "livekit-with-langgraph",
            "livekit-with-openai-realtime",
            "livekit-with-gemini-live",
            "pipecat",
            "pipecat-with-langgraph",
            "pipecat-with-openai-realtime",
            "pipecat-with-gemini-live",
        ),
        help="Which voice-agent stack to launch.",
    )
    parser.add_argument(
        "--project",
        default=None,
        help="LangSmith project name. Defaults to '<prefix>-<backend>'.",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Verbose tracing-processor logs to stderr.",
    )
    args = parser.parse_args()

    if args.debug:
        # The LangSmith voice integrations log under this package.
        logging.basicConfig(level=logging.INFO)
        logging.getLogger("langsmith.integrations").setLevel(logging.DEBUG)

    project = tracing.configure(args.backend, project=args.project)

    try:
        from .gemini.agent import run as run_gemini
        _run_console_backend(run_gemini, project)
    except Exception as e:
        print(f"[voice-demo] Error launching Gemini Live agent: {e}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(0)
