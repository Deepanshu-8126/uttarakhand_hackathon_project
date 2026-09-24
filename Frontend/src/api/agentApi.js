/**
 * Discovery Uttarakhand - Phase 7 Agent API Client
 * Frontend client for POST /api/agent/chat
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function sendAgentMessage({ message, tripId, sessionId, chatId, history, pageContext }) {
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