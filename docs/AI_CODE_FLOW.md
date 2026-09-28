# Discovery Uttarakhand — AI Copilot Code Flow
**Generated:** 2026-09-28

## 1. Complete Turn Lifecycle
```text
User Types or Speaks in Chat: Frontend/src/pages/CopilotPage.jsx or AICopilotDrawer.jsx
 ↓
Chat State: Frontend/src/store/chatStore.js (addMessage, setStreaming)
 ↓
API Client: Frontend/src/api/agentApi.js (sendAgentChatStream with fetch EventSource)
 ↓
Express Route: POST /api/agent/chat (backend/routes/agentRoutes.js:14)
 ↓
Controller: backend/controllers/agentController.js:68 (streamChat)
 ↓
Orchestrator: backend/services/agentService.js:273 (_processAgenticTravelFlow / processTurn)
   ├── Session Context: backend/services/agentSessionStore.js (History & Allowlist)
   ├── System Prompt Builder: agentService.js:100 (Devbhoomi Companion Spoken / Grounded Guide)
   ├── Tool Execution Loop: backend/services/agentTools.js (14 Grounded Tools)
   └── Provider Call: Groq -> Gemini -> OmniRoute -> OpenAI -> DeterministicFallback
 ↓
SSE Token Stream (Server-Sent Events) -> res.write('data: {...}\n\n')
 ↓
Frontend Stream Consumer: agentApi.js onChunk() -> chatStore.js updateLastMessage()
 ↓
Action Dispatch: if ui_action emitted -> Frontend/src/utils/agentActionExecutor.js:123 (executeAgentAction)
 ↓
UI State Updated / Page Navigated / Filter Applied
```
