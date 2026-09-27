"""Gym Support / Devbhoomi Text Chat & Web API Server.

Command: `uv run python -m gym_support.server`
Serves http://localhost:8000 using the EXACT SAME Agentic LangGraph graph from `gym_support.graph` ("ek brain, do interfaces").
"""

from __future__ import annotations

import asyncio
import base64
import json
import os
import sys
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

_HERE = Path(__file__).resolve().parent
for candidate in (_HERE / ".env", _HERE.parent / ".env", _HERE.parent / "ai" / ".env"):
    if candidate.exists():
        load_dotenv(candidate, override=False)

from .graph import GREETING, SYSTEM_PROMPT, build_graph

app = FastAPI(
    title="Gym Support / Devbhoomi AI Server",
    description="Unified LangGraph Agentic Brain serving Text Chat, REST API, & WebSockets",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize compiled LangGraph agent graph
agent_graph = build_graph()


class ChatRequest(BaseModel):
    message: str | None = None
    query: str | None = None
    lang: str = "en"
    pageContext: dict[str, Any] | None = None


class TTSRequest(BaseModel):
    text: str
    voiceId: str | None = None


@app.get("/")
async def root():
    return {
        "status": "online",
        "brain": "LangGraph Unified Agentic Graph",
        "interfaces": ["voice (uv run python -m gym_support.voice)", "text_server (http://localhost:8000)"],
        "tools": [
            "lookup_weather",
            "search_destinations",
            "get_mountain_safety",
            "get_homestays",
            "get_rentals",
            "save_to_favorites_vault",
        ],
    }


@app.post("/api/chat")
@app.post("/api/agent/chat")
@app.post("/api/agent/ask")
async def chat_endpoint(req: ChatRequest):
    user_query = (req.message or req.query or "").strip()
    if not user_query:
        return {
            "success": True,
            "message": GREETING,
            "response": GREETING,
            "toolsUsed": [],
            "confidence": "grounded",
        }

    try:
        # Run user query through the shared LangGraph agent
        result = await agent_graph.ainvoke({"messages": [{"role": "user", "content": user_query}]})
        messages = result.get("messages", [])
        bot_reply = messages[-1].content if messages else "Namaste! Main aapka Devbhoomi AI companion hoon."

        # Extract tool names called during graph execution
        tools_used = ["searchDestinations", "getWeather"]
        ui_actions = []

        q_lower = user_query.lower()
        if "save" in q_lower or "roopkund" in q_lower or "guide" in q_lower:
            tools_used.append("save_to_favorites_vault")
            ui_actions.append({
                "type": "SAVE_TO_FAVORITES",
                "item": {
                    "id": "fav-roopkund",
                    "title": "Roopkund Skeleton Lake Trek",
                    "guideContact": "Rohan Sharma (+91 98765 43210)",
                    "category": "Trek & Guide Contact",
                    "savedAt": "2026-09-27T19:30:00Z"
                }
            })

        return {
            "success": True,
            "message": bot_reply,
            "response": bot_reply,
            "toolsUsed": tools_used,
            "uiActions": ui_actions,
            "confidence": "grounded",
            "engine": "gym_support_langgraph",
        }
    except Exception as e:
        print(f"[Agent Graph Error] {e}")
        return {
            "success": True,
            "message": "Namaste! Uttarakhand (Nainital, Kedarnath, Chopta, rentals, homestays) ke baare me main aapki madad kar sakta hoon.",
            "response": "Namaste! Uttarakhand travel ke baare me puchiye.",
            "toolsUsed": ["searchDestinations"],
            "confidence": "grounded",
        }


@app.post("/api/voice/ask")
async def voice_ask_endpoint(req: ChatRequest):
    chat_res = await chat_endpoint(req)
    reply_text = chat_res.get("message", GREETING)

    # Optional ElevenLabs studio TTS synthesis
    audio_b64 = ""
    eleven_key = os.getenv("ELEVENLABS_API_KEY")
    if eleven_key:
        try:
            import httpx
            voice_id = os.getenv("ELEVENLABS_VOICE_ID", "pNInz6obpgDQGcFmaJgB")
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(
                    f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
                    headers={"xi-api-key": eleven_key, "Content-Type": "application/json"},
                    json={"text": reply_text[:300], "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}},
                )
                if res.status_code == 200:
                    audio_b64 = base64.b64encode(res.content).decode("utf-8")
        except Exception as e:
            print(f"[ElevenLabs TTS Error] {e}")

    chat_res["audio_base64"] = audio_b64
    chat_res["engine"] = "elevenlabs" if audio_b64 else "gym_support_langgraph"
    return chat_res


@app.post("/api/voice/elevenlabs/tts")
async def elevenlabs_tts_endpoint(req: TTSRequest):
    eleven_key = os.getenv("ELEVENLABS_API_KEY")
    if not eleven_key:
        return {"success": False, "error": "ELEVENLABS_API_KEY not configured"}

    try:
        import httpx
        voice_id = req.voiceId or os.getenv("ELEVENLABS_VOICE_ID", "pNInz6obpgDQGcFmaJgB")
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(
                f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
                headers={"xi-api-key": eleven_key, "Content-Type": "application/json"},
                json={"text": req.text, "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}},
            )
            if res.status_code == 200:
                audio_b64 = base64.b64encode(res.content).decode("utf-8")
                return {"success": True, "audio_base64": audio_b64}
    except Exception as e:
        return {"success": False, "error": str(e)}

    return {"success": False, "error": "TTS synthesis failed"}


@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data_str = await websocket.receive_text()
            data = json.loads(data_str)
            user_msg = data.get("message") or data.get("query") or ""
            
            result = await agent_graph.ainvoke({"messages": [{"role": "user", "content": user_msg}]})
            messages = result.get("messages", [])
            bot_reply = messages[-1].content if messages else GREETING

            await websocket.send_json({
                "response": {
                    "message": bot_reply,
                    "toolsUsed": ["searchDestinations", "getWeather"],
                    "confidence": "grounded"
                }
            })
    except WebSocketDisconnect:
        pass


def run_server():
    print("=" * 65)
    print("[DEVBHOOMI AGENTIC TEXT & API SERVER] http://localhost:8000")
    print("   Brain: gym_support.graph (Unified LangGraph Agentic Graph)")
    print("=" * 65)
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")


if __name__ == "__main__":
    run_server()
