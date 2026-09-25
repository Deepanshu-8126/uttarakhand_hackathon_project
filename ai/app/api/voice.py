"""
Discovery Uttarakhand - Integrated Voice API Endpoints
Directly powered by voice_demo inside the AI Chatbot runtime.
"""
from __future__ import annotations

import asyncio
import base64
import json
import logging
import os
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from google import genai
from google.genai import types

import edge_tts
from ..voice_demo.devbhoomi import (
    search_destination_info,
    get_altitude_safety_advice,
    get_homestays,
)
from ..voice_demo.weather import fetch_weather

logger = logging.getLogger("ai.voice")
router = APIRouter(tags=["Voice"])

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

SYSTEM_PROMPT = """You are Devbhoomi Companion, an expert AI voice travel guide and mountain safety companion for Uttarakhand, India (Devbhoomi), powered by Discover AI Copilot.
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
    key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not key:
        raise ValueError("GOOGLE_API_KEY or GEMINI_API_KEY environment variable is not set")
    return genai.Client(api_key=key)

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
    context: Optional[dict] = None

@router.post("/voice/ask")
@router.post("/api/voice/ask")
async def ask_voice_agent(req: VoiceQueryRequest):
    """Direct HTTP voice query endpoint."""
    q = req.query.strip()
    if not q:
        return {"response": "Please speak or type a question.", "tools_used": [], "audio_base64": ""}

    tools_used = []
    enriched_facts = []

    q_lower = q.lower()
    place_info = search_destination_info(q)
    if place_info.get("found"):
        tools_used.append("search_destination_info")
        enriched_facts.append(f"Place Details: {json.dumps(place_info)}")

    if any(k in q_lower for k in ["trek", "altitude", "height", "safe", "ams", "oxygen", "sickness", "climb", "high", "breathe", "kedarnath", "tungnath", "hemkund"]):
        safety_info = get_altitude_safety_advice(q)
        tools_used.append("get_altitude_safety_advice")
        enriched_facts.append(f"Safety/Altitude Guide: {json.dumps(safety_info)}")

    if any(k in q_lower for k in ["stay", "hotel", "homestay", "resort", "room", "camp"]):
        stays_info = get_homestays(q)
        tools_used.append("get_homestays")
        enriched_facts.append(f"Stays: {json.dumps(stays_info)}")

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
            system_instruction=SYSTEM_PROMPT,
            temperature=0.7,
            max_output_tokens=250,
        ),
    )

    clean_text = response.text.replace("*", "").replace("#", "").strip()
    audio_b64 = await synthesize_neural_voice(clean_text, req.lang)

    return {
        "response": clean_text,
        "tools_used": tools_used,
        "engine": "integrated-voice-demo",
        "audio_base64": audio_b64,
    }

@router.websocket("/ws/voice")
async def websocket_voice_endpoint(websocket: WebSocket):
    """Real-time bidirectional WebSocket stream for voice overlay."""
    await websocket.accept()
    logger.info("[ws] Client connected to Integrated Voice WebSocket")
    
    greeting_text = "Namaste! I am your Devbhoomi travel companion. How can I help you explore Uttarakhand today?"
    greeting_audio = await synthesize_neural_voice(greeting_text, "en")

    await websocket.send_json({
        "type": "ready",
        "engine": "integrated-voice-demo",
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
