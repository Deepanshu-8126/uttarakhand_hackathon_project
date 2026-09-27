"""Gym Support Voice runner for ai/ directory."""
import asyncio
import os
import sys

# Ensure ai directory is in sys.path
_AI_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _AI_DIR not in sys.path:
    sys.path.insert(0, _AI_DIR)

try:
    from gym_support.graph import build_graph, GREETING, SYSTEM_PROMPT
    from gym_support.graph import save_to_favorites_vault, lookup_weather, search_destinations
except ImportError:
    from graph import build_graph, GREETING, SYSTEM_PROMPT
    from graph import save_to_favorites_vault, lookup_weather, search_destinations

async def main_voice():
    """Launch interactive voice agent session."""
    print("=" * 65)
    print("[DEVBHOOMI VOICE AGENT] (Pipecat + LangGraph + ElevenLabs)")
    print("   Brain: gym_support.graph (Unified LangGraph Agentic Graph)")
    print("=" * 65)
    print("\nInitial Spoken Greeting:\n  \"" + GREETING + "\"")

    graph = build_graph()
    print("\n[+] LangGraph Agentic Graph compiled successfully with 6 Himalayan Ground Tools.")
    print("  Tools: lookup_weather, search_destinations, get_mountain_safety, get_homestays, get_rentals, save_to_favorites_vault")
    print("\nListening for Spoken Audio / User Prompts (Press Ctrl+C to stop)...")

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
                print(f"[Assistant Reply]: {bot_reply}")
            except Exception as e:
                print(f"[Agent Note] {e}")

    except KeyboardInterrupt:
        print("\nSession ended.")

if __name__ == "__main__":
    asyncio.run(main_voice())
