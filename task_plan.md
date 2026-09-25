# Task Plan: Modular Conversational AI Architecture Refactoring

Inspired by `langchain-ai/agent-chat-ui` & `langchain-ai/voice-demo`.

## Critical Constraints
- **Preserve Existing Website UI/UX Design**: Colors, layouts, cards, pages, navigation, theme and branding remain strictly intact.
- **Complete Replacement**: Replace only the AI chat engine, conversation handling, memory, agent workflow, and chat APIs.
- **Zero Legacy Code**: Remove legacy/dead chatbot code and dependencies.
- **Target Architecture**:
  - `Frontend/src/chat/`: `ChatWindow`, `ChatInput`, `MessageRenderer`, `AgentThinking`, `VoiceControls`, `SuggestedActions`, `ChatState`
  - `backend/ai/`: `agents/`, `tools/`, `memory/`, `prompts/`, `workflows/`, `voice/`, `retrieval/`

---

## Phases & Tasks

### Phase 1: Audit & Discovery (STEP 1 & STEP 2)
- [ ] 1.1 Identify all old chatbot files across `Frontend/src/components/copilot/`, `backend/controllers/`, `backend/routes/`, and `ai/`
- [ ] 1.2 List all imports across the frontend and backend referencing the old chatbot
- [ ] 1.3 Map data flow, models (`Chat.js`, `SavedTrip.js`), and socket/API endpoints
- [ ] 1.4 Document all findings in `findings.md`

### Phase 2: Design & Backend AI Architecture (STEP 4 & STEP 5)
- [ ] 2.1 Scaffold target backend structure: `backend/ai/`
  - `backend/ai/prompts/` (System instructions, Persona, Uttarakhand context)
  - `backend/ai/memory/` (Multi-turn session persistence, trip context, user preferences)
  - `backend/ai/retrieval/` (Destination, trek, stay, rental, weather grounding)
  - `backend/ai/tools/` (Destination search, Stay search, Rental search, Activities, Itinerary builder, Budget calculator)
  - `backend/ai/agents/` (Planner, Destination, Budget, Safety, Rental, Festival agents)
  - `backend/ai/workflows/` (Agent Router & Orchestrator with streaming SSE/WebSocket)
  - `backend/ai/voice/` (Gemini Live native Aoede voice + ultra-low latency fallback)
- [ ] 2.2 Wire backend API routes (`/api/chat/stream`, `/api/chat/history`, `/api/chat/session`) with SSE streaming and tool events

### Phase 3: Frontend Chat Architecture (STEP 6, STEP 7, STEP 8)
- [ ] 3.1 Scaffold target frontend structure: `Frontend/src/chat/`
  - `ChatState.js` (Unified conversational state, streaming buffer, active agent, memory sync)
  - `ChatWindow.jsx` (Container preserving design drawer & launcher)
  - `ChatInput.jsx` (Auto-resizing input, quick submit, voice triggers)
  - `MessageRenderer.jsx` (Markdown, travel cards, route badges, rich media)
  - `AgentThinking.jsx` (Expandable tool call thoughts, step timeline like agent-chat-ui)
  - `VoiceControls.jsx` (Integrated Gemini Live voice orb, speech visualizer, instant barge-in)
  - `SuggestedActions.jsx` (Context-aware chips, quick prompts)
- [ ] 3.2 Connect drawer and launcher (`AICopilotDrawer.jsx`, `GlobalAiCopilotLauncher.jsx`) to `Frontend/src/chat/`

### Phase 4: Migration & Legacy Cleanup (STEP 3 & STEP 4)
- [ ] 4.1 Redirect all page/component imports to the new modular `chat/` architecture
- [ ] 4.2 Safely remove dead/deprecated legacy chatbot code
- [ ] 4.3 Ensure no broken imports across the entire repository

### Phase 5: Verification & Regression Testing (STEP 10)
- [ ] 5.1 Test text streaming with multi-turn memory
- [ ] 5.2 Test agent routing (Planner, Destination, Budget, Safety, Rental, Festival)
- [ ] 5.3 Test tool calling (destinations, homestays, weather, safety, budget)
- [ ] 5.4 Test voice interactions (real-time stream, speech-to-text, Aoede voice)
- [ ] 5.5 Verify UI aesthetics, responsive drawer, buttons, inputs, error states, and empty states
- [ ] 5.6 Compile comprehensive PASS/FAIL/WARNING regression report
