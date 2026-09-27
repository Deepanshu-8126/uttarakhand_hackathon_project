"""Gym Support Server runner for ai/ directory."""
import base64
import json
import os
import sys
from typing import Any

# Ensure ai directory is in sys.path
_AI_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _AI_DIR not in sys.path:
    sys.path.insert(0, _AI_DIR)

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

try:
    from .graph import GREETING, build_graph
except ImportError:
    from gym_support.graph import GREETING, build_graph


app = FastAPI(
    title="Gym Support / Devbhoomi AI Server (ai)",
    description="Unified LangGraph Agentic Brain serving Text Chat & Web API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent_graph = build_graph()

class ChatRequest(BaseModel):
    message: str | None = None
    query: str | None = None
    lang: str = "en"
    pageContext: dict[str, Any] | None = None

@app.get("/")
async def root():
    return {
        "status": "online",
        "brain": "LangGraph Unified Agentic Graph (ai)",
        "interfaces": ["voice (python -m gym_support.voice)", "text_server (http://localhost:8000)"],
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
        result = await agent_graph.ainvoke({"messages": [{"role": "user", "content": user_query}]})
        messages = result.get("messages", [])
        bot_reply = messages[-1].content if messages else "Namaste!"
        return {
            "success": True,
            "message": bot_reply,
            "response": bot_reply,
            "toolsUsed": ["langgraph_travel_router"],
            "confidence": "grounded",
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Devbhoomi AI error: {e}",
            "response": f"Devbhoomi AI error: {e}",
            "toolsUsed": [],
        }

@app.websocket("/ws/voice")
async def websocket_voice(ws: WebSocket):
    await ws.accept()
    await ws.send_json({"type": "greeting", "text": GREETING})
    try:
        while True:
            data = await ws.receive_text()
            try:
                payload = json.loads(data)
                user_text = payload.get("message") or payload.get("query") or ""
            except Exception:
                user_text = data

            if user_text:
                result = await agent_graph.ainvoke({"messages": [{"role": "user", "content": user_text}]})
                messages = result.get("messages", [])
                bot_reply = messages[-1].content if messages else "Namaste!"
                await ws.send_json({"type": "answer", "text": bot_reply})
    except WebSocketDisconnect:
        pass

if __name__ == "__main__":
    uvicorn.run("gym_support.server:app", host="0.0.0.0", port=8000, reload=True)
