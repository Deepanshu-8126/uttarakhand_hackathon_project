"""
Discovery Uttarakhand - AI API Routes
"""
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from ..agent.graph import AGENT_GRAPH
from ..config import settings

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    sessionId: Optional[str] = None
    chatId: Optional[str] = None
    history: List[Dict[str, Any]] = []
    page_context: Optional[Dict[str, Any]] = None
    pageContext: Optional[Dict[str, Any]] = None
    tripContext: Optional[Dict[str, Any]] = None

    def get_session_id(self) -> str:
        return self.session_id or self.sessionId or self.chatId or "default_session"

    def get_context(self) -> Dict[str, Any]:
        return self.page_context or self.pageContext or self.tripContext or {}

@router.post("/chat")
@router.post("/api/chat")
async def chat_endpoint(
    request: ChatRequest,
    x_internal_secret: str = Header(default="", alias="X-Internal-Secret")
):
    # Security check (optional for internal microservices)
    if settings.INTERNAL_API_SECRET and x_internal_secret and x_internal_secret != settings.INTERNAL_API_SECRET:
        raise HTTPException(status_code=401, detail="Invalid internal secret")

    try:
        resolved_session_id = request.get_session_id()
        context = request.get_context()

        # Prepare LangGraph input state
        initial_state = {
            "user_message": request.message,
            "session_id": resolved_session_id,
            "history": request.history,
            "page_context": context
        }

        # Invoke the LangGraph with thread memory
        config = {"configurable": {"thread_id": resolved_session_id}}
        final_state = await AGENT_GRAPH.ainvoke(initial_state, config=config)

        # Extract outputs
        response_text = final_state.get("final_response", "Maaf karna, main abhi process nahi kar pa raha hoon.")
        ui_actions = final_state.get("ui_actions", [])
        suggested_actions = final_state.get("suggested_actions", [])
        provider = final_state.get("provider_used", "unknown")
        confidence = final_state.get("confidence", "high")

        return {
            "success": True,
            "status": "success",
            "text": response_text,
            "response": {
                "type": "answer",
                "message": response_text,
                "uiActions": ui_actions,
                "ui_actions": ui_actions,
                "suggestedActions": suggested_actions,
                "tripContext": {
                    "destination": final_state.get("destination"),
                    "origin": final_state.get("origin"),
                    "duration": final_state.get("duration_days"),
                    "budget": final_state.get("budget"),
                },
                "confidence": confidence,
                "provider": provider
            },
            "ui_actions": ui_actions,
            "uiActions": ui_actions,
            "suggested_actions": suggested_actions,
            "provider": provider,
            "confidence": confidence,
            "data": {
                "text": response_text,
                "ui_actions": ui_actions,
                "suggested_actions": suggested_actions,
                "provider": provider,
                "confidence": confidence
            }
        }

    except Exception as e:
        print(f"[API Error] Chat endpoint failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal AI Error: {str(e)}")