"""Web & Mobile WebSocket Bridge for Devbhoomi AI Voice Companion.

Exposes a real-time WebSocket and HTTP API on port 8765 so that the Discover
Frontend website and Flutter Mobile App can talk directly to the Devbhoomi
Gemini Live voice companion.
"""

from __future__ import annotations

import asyncio
import base64
import json
import logging
import os
import sys
from pathlib import Path

import edge_tts
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Load environment
_HERE = Path(__file__).resolve().parent
for _candidate in (_HERE / ".env", _HERE.parent / ".env"):
    if _candidate.exists():
        load_dotenv(_candidate, override=False)
        break

from google import genai
from google.genai import types

from voice_demo.devbhoomi import (
    search_destination_info,
    get_altitude_safety_advice,
    get_homestays,
)
from voice_demo.weather import fetch_weather

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice-demo-bridge")

app = FastAPI(title="Devbhoomi Voice-Demo Bridge")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

_SYSTEM_PROMPT = """You are Devbhoomi Companion, an expert AI voice travel guide and mountain safety companion for Uttarakhand, India (Devbhoomi), powered by Discover Uttarakhand.
You possess authoritative knowledge of:
- Char Dham (Kedarnath, Badrinath, Gangotri, Yamunotri) and Hemkund Sahib
- High-altitude treks (Valley of Flowers, Kedarkantha, Roopkund, Har Ki Dun, Tungnath, Chopta, Kuari Pass)
- Altitude Sickness (AMS) protocols, acclimatization halts, and safety guidelines
- Road conditions, mountain weather, and verified local homestays
- Garhwali and Kumaoni traditions, culture, and cuisine

Instructions:
1. Speak warmly, respectfully, and concisely (1 to 3 spoken sentences).
2. Answer in Hindi, English, or friendly Hinglish depending on how the user speaks to you.
3. Keep spoken replies natural and direct — do not use asterisks, markdown, emojis, or bullet points in voice responses.
"""

def _get_genai_client():
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY environment variable is not set")
    return genai.Client(api_key=GOOGLE_API_KEY)


async def synthesize_neural_voice(text: str, lang: str = "hi") -> str:
    """Generate crystal-clear neural voice audio as base64-encoded MP3 using edge-tts."""
    voice = "hi-IN-SwaraNeural" if (lang and lang.startswith("hi")) else "en-IN-NeerjaNeural"
    clean = text.replace("*", "").replace("#", "").replace("_", "").strip()
    if not clean:
        return ""
    try:
        communicate = edge_tts.Communicate(clean, voice)
        audio_bytes = bytearray()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_bytes.extend(chunk["data"])
        return base64.b64encode(audio_bytes).decode("utf-8")
    except Exception as e:
        logger.warning(f"Neural TTS generation failed: {e}")
        return ""


class VoiceQueryRequest(BaseModel):
    query: str
    lang: str = "en"
    context: dict | None = None


class ChatRequest(BaseModel):
    message: str
    history: list[dict] | None = None
    lang: str = "en"
    pageContext: dict | None = None


_CHAT_SYSTEM_PROMPT = """You are Devbhoomi Companion, a premium AI travel & mountain guide for Uttarakhand, India, powered by Discover Uttarakhand.

You have deep, verified knowledge of:
- Char Dham (Kedarnath, Badrinath, Gangotri, Yamunotri), Hemkund Sahib
- High-altitude treks: Valley of Flowers, Kedarkantha, Roopkund, Har Ki Dun, Tungnath, Kuari Pass
- Altitude Sickness (AMS) protocols, acclimatization, and safety
- Live weather, road conditions, and seasonal advisories
- Verified local homestays, camps, and eco-resorts
- Local transport, permits, and budgeting

Instructions:
- Be warm, precise, and genuinely helpful.
- Use markdown formatting (bold, bullets, headers) for structured responses.
- Support Hindi, English, and Hinglish naturally.
- Always prioritize traveler safety for high-altitude destinations.
- When relevant, suggest bookings, weather checks, or route planning.
"""


@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "service": "devbhoomi_voice_companion",
        "agent": "devbhoomi_voice_companion",
        "model": MODEL_NAME,
        "has_api_key": bool(GOOGLE_API_KEY),
    }


@app.post("/api/chat")
async def chat_agent(req: ChatRequest):
    """Text chat endpoint for the main AI Copilot Drawer (web & mobile)."""
    msg = req.message.strip()
    if not msg:
        return {"success": True, "response": {"message": "Please ask me anything about Uttarakhand!", "toolsUsed": [], "type": "answer"}}

    tools_used = []
    enriched_facts = []
    q_lower = msg.lower()

    # Grounding tools — same as voice
    place_info = search_destination_info(msg)
    if place_info.get("found"):
        tools_used.append("search_destination_info")
        enriched_facts.append(f"Place Details: {json.dumps(place_info)}")

    if any(k in q_lower for k in ["trek", "altitude", "height", "safe", "ams", "oxygen", "sickness", "climb", "kedarnath", "tungnath", "hemkund", "roopkund"]):
        safety_info = get_altitude_safety_advice(msg)
        tools_used.append("get_altitude_safety_advice")
        enriched_facts.append(f"Safety/Altitude Guide: {json.dumps(safety_info)}")

    if any(k in q_lower for k in ["stay", "hotel", "homestay", "resort", "room", "camp", "accommodation"]):
        stays_info = get_homestays(msg)
        tools_used.append("get_homestays")
        enriched_facts.append(f"Stays: {json.dumps(stays_info)}")

    if any(k in q_lower for k in ["weather", "temperature", "rain", "snow", "mausam", "climate"]):
        try:
            w = await fetch_weather(msg)
            tools_used.append("fetch_weather")
            enriched_facts.append(f"Live Weather: {json.dumps(w)}")
        except Exception:
            pass

    # Build history context
    history_ctx = ""
    if req.history:
        recent = req.history[-6:]  # last 3 turns
        history_ctx = "\n".join(
            f"{'User' if h.get('role') == 'user' else 'Assistant'}: {h.get('content', '')}"
            for h in recent
        )

    prompt = f"""Conversation so far:
{history_ctx if history_ctx else "(new conversation)"}

User: {msg}

Verified Devbhoomi Database Context:
{chr(10).join(enriched_facts) if enriched_facts else "No specific database match; use your expert Uttarakhand knowledge."}

Respond as Devbhoomi Companion — helpful, detailed, markdown-formatted."""

    client = _get_genai_client()
    response = await asyncio.to_thread(
        client.models.generate_content,
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=_CHAT_SYSTEM_PROMPT,
            temperature=0.7,
            max_output_tokens=800,
        ),
    )

    return {
        "success": True,
        "response": {
            "message": response.text.strip(),
            "toolsUsed": tools_used,
            "type": "answer",
            "confidence": "grounded",
            "suggestedActions": ["Explore Homestays", "Check Mountain Safety", "Live Weather"],
            "engine": "devbhoomi_ai",
        }
    }


@app.post("/api/voice/ask")
async def ask_voice_agent(req: VoiceQueryRequest):
    """Direct HTTP voice query endpoint for Web & Mobile clients."""
    q = req.query.strip()
    if not q:
        return {"response": "Please speak or type a question.", "tools_used": []}

    tools_used = []
    enriched_facts = []

    # Check Uttarakhand place knowledge
    q_lower = q.lower()
    place_info = search_destination_info(q)
    if place_info.get("found"):
        tools_used.append("search_destination_info")
        enriched_facts.append(f"Place Details: {json.dumps(place_info)}")

    # Check high-altitude / AMS safety
    if any(k in q_lower for k in ["trek", "altitude", "height", "safe", "ams", "oxygen", "sickness", "climb", "high", "breathe", "kedarnath", "tungnath", "hemkund"]):
        safety_info = get_altitude_safety_advice(q)
        tools_used.append("get_altitude_safety_advice")
        enriched_facts.append(f"Safety/Altitude Guide: {json.dumps(safety_info)}")

    # Check stays
    if any(k in q_lower for k in ["stay", "hotel", "homestay", "resort", "room", "camp"]):
        stays_info = get_homestays(q)
        tools_used.append("get_homestays")
        enriched_facts.append(f"Stays: {json.dumps(stays_info)}")

    # Check weather
    if any(k in q_lower for k in ["weather", "temperature", "rain", "snow", "mausam"]):
        try:
            w = await fetch_weather(q)
            tools_used.append("fetch_weather")
            enriched_facts.append(f"Live Weather: {json.dumps(w)}")
        except Exception:
            pass

    client = _get_genai_client()

    prompt = f"""User asked via live voice: "{q}"
Language preference: {req.lang}
Verified Devbhoomi Database Context:
{chr(10).join(enriched_facts) if enriched_facts else "No specific database match found; use your expert Uttarakhand knowledge."}

Respond as the Devbhoomi Voice Companion in 1-3 spoken, clear, natural sentences."""

    response = await asyncio.to_thread(
        client.models.generate_content,
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=_SYSTEM_PROMPT,
            temperature=0.7,
            max_output_tokens=250,
        ),
    )

    clean_text = response.text.replace("*", "").replace("#", "").strip()

    # Generate neural human speech audio (MP3 base64)
    audio_b64 = await synthesize_neural_voice(clean_text, req.lang)

    return {
        "response": clean_text,
        "tools_used": tools_used,
        "engine": "devbhoomi_ai",
        "audio_base64": audio_b64,
    }


@app.websocket("/ws/voice")
async def websocket_voice_endpoint(websocket: WebSocket):
    """Real-time bidirectional WebSocket stream for Web & Mobile voice clients."""
    await websocket.accept()
    logger.info("[ws] Client connected to Devbhoomi Voice-Demo WebSocket")
    
    # Pre-generate greeting audio in natural Hindi/English voice
    greeting_text = "Namaste! I am your Devbhoomi travel companion. How can I help you explore Uttarakhand today?"
    greeting_audio = await synthesize_neural_voice(greeting_text, "en")

    # Send welcome handshake
    await websocket.send_json({
        "type": "ready",
        "engine": "devbhoomi_ai",
        "greeting": greeting_text,
        "audio_base64": greeting_audio,
    })

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            msg_type = msg.get("type", "query")

            if msg_type in ("query", "text"):
                query_text = msg.get("query") or msg.get("text", "")
                lang = msg.get("lang", "en")
                
                await websocket.send_json({"type": "status", "status": "processing"})
                
                # Process query using Devbhoomi tools + Gemini
                req = VoiceQueryRequest(query=query_text, lang=lang)
                result = await ask_voice_agent(req)
                
                await websocket.send_json({
                    "type": "response",
                    "text": result["response"],
                    "audio_base64": result.get("audio_base64", ""),
                    "tools_used": result.get("tools_used", []),
                })
                await websocket.send_json({"type": "status", "status": "idle"})

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        logger.info("[ws] Client disconnected")
    except Exception as e:
        logger.error(f"[ws] Error: {e}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass


if __name__ == "__main__":
    port = int(os.getenv("VOICE_BRIDGE_PORT", "8765"))
    print(f"\n=======================================================")
    print(f"  Devbhoomi Voice-Demo Bridge Starting on port {port}")
    print(f"  Web & App Voice Endpoint: http://localhost:{port}")
    print(f"  WebSocket: ws://localhost:{port}/ws/voice")
    print(f"=======================================================\n")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
