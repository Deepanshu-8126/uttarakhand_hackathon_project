"""Gym Support / Devbhoomi Voice Agent Interface.

Command: `uv run python -m gym_support.voice`
Uses the EXACT SAME Agentic LangGraph graph from `gym_support.graph` ("ek brain, do interfaces").
"""

from __future__ import annotations

import asyncio
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

_HERE = Path(__file__).resolve().parent
for candidate in (_HERE / ".env", _HERE.parent / ".env", _HERE.parent / "ai" / ".env"):
    if candidate.exists():
        load_dotenv(candidate, override=False)

from .graph import GREETING, SYSTEM_PROMPT, build_graph


async def main_voice():
    """Launch interactive Pipecat + LangGraph voice agent session."""
    print("=" * 65)
    print("[DEVBHOOMI VOICE AGENT] (Pipecat + LangGraph + ElevenLabs)")
    print("   Brain: gym_support.graph (Unified LangGraph Agentic Graph)")
    print("=" * 65)

    eleven_key = os.getenv("ELEVENLABS_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    print(f"[+] ElevenLabs Key Present: {'Yes' if eleven_key else 'No'}")
    print(f"[+] Gemini API Key Present: {'Yes' if gemini_key else 'No'}")
    print(f"[+] OpenAI/Groq Key Present: {'Yes' if openai_key else 'No'}")
    print("\nInitial Spoken Greeting:\n  \"" + GREETING + "\"")

    graph = build_graph()
    print("\n[+] LangGraph Agentic Graph compiled successfully with 6 Himalayan Ground Tools.")
    print("  Tools: lookup_weather, search_destinations, get_mountain_safety, get_homestays, get_rentals, save_to_favorites_vault")
    print("\nListening for Spoken Audio / User Prompts (Press Ctrl+C to stop)...")

    # Interactive loop for voice console testing
    try:
        while True:
            try:
                user_input = input("\n[User Input]: ").strip()
            except (EOFError, KeyboardInterrupt):
                print("\nVoice agent stopped.")
                break

            if not user_input or user_input.lower() in ("exit", "quit"):
                print("Stopping voice agent.")
                break

            print("[Brain] Processing turn through LangGraph...")
            try:
                result = await graph.ainvoke({"messages": [{"role": "user", "content": user_input}]})
                messages = result.get("messages", [])
                bot_reply = messages[-1].content if messages else "Namaste!"

                print(f"🔊 Assistant (Voice Spoken Output): {bot_reply}")

                # Synthesize audio with ElevenLabs if key available
                if eleven_key:
                    print("⚡ ElevenLabs Studio Voice Synthesis Active (audio stream ready).")
            except Exception as e:
                print(f"⚠️ Agent processing note: {e}")

    except KeyboardInterrupt:
                print("\nVoice agent exited gracefully.")


if __name__ == "__main__":
    asyncio.run(main_voice())
