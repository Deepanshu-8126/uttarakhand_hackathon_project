"""Shared LangSmith env wiring.

Each backend traces under a project name derived from a single prefix, so they
sit next to each other in the LangSmith UI:

    voice-demo-openai
    voice-demo-openai-agents
    voice-demo-gemini
    voice-demo-adk
    voice-demo-livekit
    voice-demo-livekit-with-langgraph
    voice-demo-livekit-with-openai-realtime
    voice-demo-livekit-with-gemini-live
    voice-demo-pipecat
    voice-demo-pipecat-with-langgraph
    voice-demo-pipecat-with-openai-realtime
    voice-demo-pipecat-with-gemini-live

There are two tracing paths (see each backend's own module docstring for why):

  * OTEL — LiveKit (including the two realtime backends) and Pipecat run a
    framework in-process that emits its own OTel spans; the LangSmith
    integrations translate and export those (`langsmith.integrations.{livekit,
    pipecat}`).
  * SDK  — OpenAI Realtime, raw Gemini Live, and ADK Live consume a remote event
    stream and build the trace themselves with the LangSmith SDK (`RunTree`).

Either way the integrations read LangSmith config (API key, project, endpoint)
from the standard `LANGSMITH_*` environment, so this module only sets those.
"""

from __future__ import annotations

import os
import sys
from typing import Literal

Backend = Literal[
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
]


def is_tracing_enabled() -> bool:
    """Check if LangSmith tracing is explicitly enabled with a valid API key."""
    api_key = os.environ.get("LANGSMITH_API_KEY")
    return bool(
        api_key
        and api_key.strip() != ""
        and os.environ.get("LANGSMITH_TRACING", "").lower() in ("true", "1", "on")
        and os.environ.get("LANGCHAIN_TRACING_V2", "").lower() in ("true", "1", "on")
    )


def project_name_for(backend: Backend, override: str | None = None) -> str:
    if override:
        return override
    prefix = os.environ.get("LANGSMITH_PROJECT_PREFIX", "voice-demo")
    return f"{prefix}-{backend}"


def configure(backend: Backend, project: str | None = None) -> str:
    """Set up env vars before any backend-specific imports.

    Returns the resolved project name so callers can pass it to
    `configure_google_adk(project_name=...)` etc.
    """
    import logging
    import warnings

    # Silence any LangSmith beta warnings or background ingest noise
    warnings.filterwarnings("ignore", module="langsmith")
    logging.getLogger("langsmith").setLevel(logging.CRITICAL)
    logging.getLogger("langsmith.client").setLevel(logging.CRITICAL)

    project_name = project_name_for(backend, project)

    if not is_tracing_enabled():
        os.environ["LANGSMITH_TRACING"] = "false"
        os.environ["LANGCHAIN_TRACING_V2"] = "false"
        # Avoid setting empty or invalid API key that triggers LangSmith background worker
        if not os.environ.get("LANGSMITH_API_KEY"):
            os.environ.pop("LANGSMITH_API_KEY", None)
        print(
            f"[voice-demo] Running '{backend}' (LangSmith tracing disabled).",
            file=sys.stderr,
        )
        return project_name

    # Used by both the SDK (LANGSMITH_PROJECT) and explicit RunTree(project_name=...) callers.
    os.environ["LANGSMITH_TRACING"] = "true"
    os.environ["LANGSMITH_PROJECT"] = project_name

    if backend in ("livekit-with-langgraph", "pipecat-with-langgraph"):
        os.environ.setdefault("LANGSMITH_TRACING_MODE", "otel")

    print(f"[voice-demo] LangSmith project: {project_name}", file=sys.stderr)
    return project_name

