# Findings: Conversational AI Architecture & Legacy Inventory

## 1. System Overview
- **Frontend**: React + Vite application (`Frontend/`)
- **Backend API**: Node.js + Express (`backend/`)
- **AI Voice Bridge**: Python FastAPI + Google GenAI Live (`ai/web_bridge.py`)
- **Target Chat UI Reference**: `langchain-ai/agent-chat-ui` (Modern agent timeline, thought streams, tool results, suggested actions) & `langchain-ai/voice-demo` (Aoede 24kHz native live voice)

## 2. Legacy Chatbot Inventory (Frontend)
- `Frontend/src/components/copilot/AICopilotDrawer.jsx`
- `Frontend/src/components/copilot/ChatArea.jsx`
- `Frontend/src/components/copilot/CopilotMessage.jsx`
- `Frontend/src/components/copilot/AgenticToolCallTimeline.jsx`
- `Frontend/src/components/copilot/QuickActions.jsx`
- `Frontend/src/components/copilot/StructuredTravelCards.jsx`
- `Frontend/src/components/copilot/TripContextPanel.jsx`
- `Frontend/src/components/copilot/TripContextStrip.jsx`
- `Frontend/src/components/copilot/ChatGPTVoiceOverlay.jsx`
- `Frontend/src/components/copilot/ChatHistorySidebar.jsx`
- `Frontend/src/components/copilot/GlobalAiCopilotLauncher.jsx`

## 3. Legacy Chatbot Inventory (Backend)
- `backend/routes/chatRoutes.js`
- `backend/controllers/chatController.js`
- `backend/routes/agentRoutes.js`
- `backend/controllers/agentController.js`
- `backend/services/agentService.js`
- `backend/services/agentTools.js`
- `backend/services/agentSessionStore.js`
- `backend/models/Chat.js`

## 4. Integration Points in Frontend
- `Frontend/src/App.jsx` mounts `GlobalAiCopilotLauncher` and `AICopilotDrawer`
- Navbar and hero buttons trigger copilot drawer via custom events / state
