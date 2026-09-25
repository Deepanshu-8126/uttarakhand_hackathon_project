/**
 * Discovery Uttarakhand - Phase 7 Agent API Client
 * Frontend client — tries langchain-ai/voice-demo bridge first, falls back to Render backend.
 */

const LIVE_BACKEND_URL = "https://uttarakhand-hackathon-project.onrender.com/api";
const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.PROD ? LIVE_BACKEND_URL : "http://localhost:5000/api");
const BRIDGE_URL = "http://localhost:8765";

/**
 * Try the local voice-demo bridge first for any chat message.
 * Returns parsed response object or null if bridge is offline/fails.
 */
async function tryBridgeChat({ message, history, pageContext }) {
  try {
    const res = await fetch(`${BRIDGE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: history || [], pageContext }),
      signal: AbortSignal.timeout(7000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.success && data?.response?.message) return data;
    return null;
  } catch (_) {
    return null;
  }
}

export async function sendAgentMessage({ message, tripId, sessionId, chatId, history, pageContext }) {
  // 1. Try local voice-demo bridge first
  const bridgeData = await tryBridgeChat({ message, history, pageContext });
  if (bridgeData) return bridgeData;

  // 2. Fallback to Render backend
  try {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const body = { message };
    if (tripId) body.tripId = tripId;
    if (sessionId) body.sessionId = sessionId;
    if (chatId) body.chatId = chatId;
    if (history) body.history = history;
    if (pageContext) body.pageContext = pageContext;

    const response = await fetch(`${API_BASE}/agent/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to reach AI Copilot",
        sessionId: null
      };
    }

    return data;
  } catch (err) {
    console.error("[agentApi] Network error:", err);
    return {
      success: false,
      message: "Network error - could not reach AI Copilot. Please check your connection.",
      sessionId: null
    };
  }
}

export async function streamAgentMessage({ message, tripId, sessionId, chatId, history, pageContext, onUpdate, onEvent, signal }) {
  const emit = onUpdate || onEvent || (() => {});

  // 1. Try local voice-demo bridge first — emit as synthetic stream events
  const bridgeData = await tryBridgeChat({ message, history, pageContext });
  if (bridgeData) {
    const resp = bridgeData.response;
    emit({ type: 'status', message: 'Devbhoomi AI · Ready' });
    emit({ type: 'chunk', text: resp.message });
    emit({ type: 'done', response: { message: resp.message, toolsUsed: resp.toolsUsed || [], type: 'answer', suggestedActions: [] } });
    return;
  }

  // 2. Fallback — stream from Render backend
  try {
    const token = localStorage.getItem("token");
    const headers = { 
      "Content-Type": "application/json",
      "Accept": "text/event-stream, application/json"
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const body = { message };
    if (tripId) body.tripId = tripId;
    if (sessionId) body.sessionId = sessionId;
    if (chatId) body.chatId = chatId;
    if (history) body.history = history;
    if (pageContext) body.pageContext = pageContext;

    const response = await fetch(`${API_BASE}/agent/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal
    });

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errText = await response.text();
        const errJson = JSON.parse(errText);
        errorMsg = errJson.message || errText;
      } catch (_) {}
      emit({ type: 'error', message: errorMsg });
      return;
    }

    const contentType = response.headers.get("content-type") || "";

    // If server returned direct JSON
    if (contentType.includes("application/json")) {
      const data = await response.json();
      const respObj = data.response || data;
      const respText = respObj.message || data.message || "";
      
      emit({ type: 'status', message: 'Ready' });
      if (respText) {
        emit({ type: 'chunk', text: respText });
      }
      if (respObj.uiActions && Array.isArray(respObj.uiActions)) {
        respObj.uiActions.forEach(a => emit({ type: 'action', action: a }));
      }
      emit({ type: 'final', response: respObj, sessionId: data.sessionId, chatId: data.chatId });
      emit({ type: 'done', response: respObj, sessionId: data.sessionId, chatId: data.chatId });
      return data;
    }

    if (!response.body) {
      throw new Error("ReadableStream not available. Fetch environment may not support streaming.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; 

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.slice(6).trim();
          if (!dataStr) continue;
          try {
            const data = JSON.parse(dataStr);
            emit(data);

            // Emit aliases for compatibility between drawer and store
            if (data.type === 'done') {
              emit({ type: 'final', response: data.response || data, sessionId: data.sessionId, chatId: data.chatId });
            } else if (data.type === 'ui_action' && data.action) {
              emit({ type: 'action', action: data.action });
            }
          } catch (e) {
            console.error("[agentApi] Error parsing SSE chunk:", e.message);
          }
        }
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log("[agentApi] Streaming aborted.");
      emit({ type: 'aborted' });
      return;
    }
    console.error("[agentApi] Network error during stream:", err);
    emit({ type: 'error', message: "Network error - could not reach AI Copilot." });
  }
}