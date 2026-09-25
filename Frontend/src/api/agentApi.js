/**
 * Discovery Uttarakhand - Agent API Client
 * Powered directly by langchain-ai/voice-demo bridge (Port 8765).
 * Completely replaced old backend flow with new Gemini Devbhoomi Agent.
 */

const BRIDGE_URL = import.meta.env.VITE_VOICE_BRIDGE_URL || "http://localhost:8765";

/**
 * Send message to the voice-demo AI Agent.
 */
export async function sendAgentMessage({ message, history, pageContext }) {
  try {
    const res = await fetch(`${BRIDGE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: history || [], pageContext }),
      signal: AbortSignal.timeout(15000)
    });

    if (!res.ok) {
      throw new Error(`Agent error: HTTP ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("[agentApi] Bridge error:", err);
    return {
      success: false,
      message: "Devbhoomi AI agent is connecting. Please ensure voice-demo bridge is active on port 8765.",
      response: {
        message: "Devbhoomi Voice & Chat Agent is starting up. Please check if voice-demo bridge is running on port 8765.",
        toolsUsed: [],
        type: "error"
      }
    };
  }
}

/**
 * Stream message to the voice-demo AI Agent for chat UI.
 * Emits status, chunk, and final events so Zustand chatStore updates seamlessly.
 */
export async function streamAgentMessage({ message, history, pageContext, onUpdate, onEvent, signal }) {
  const emit = onUpdate || onEvent || (() => {});

  emit({ type: 'status', message: 'Devbhoomi AI · Consulting Devbhoomi Guide...' });

  try {
    const res = await fetch(`${BRIDGE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: history || [], pageContext }),
      signal: signal || AbortSignal.timeout(20000)
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    const resp = data?.response || {};
    const text = resp.message || "I am your Devbhoomi travel guide.";

    emit({ type: 'status', message: 'Devbhoomi AI · Ready' });

    // Stream text in small realistic chunks for smooth UI typing effect
    const words = text.split(" ");
    for (let i = 0; i < words.length; i += 4) {
      const chunk = words.slice(i, i + 4).join(" ") + (i + 4 < words.length ? " " : "");
      emit({ type: 'chunk', text: chunk });
      await new Promise(r => setTimeout(r, 20));
    }

    // Emit final event with full grounded response payload
    emit({
      type: 'final',
      response: {
        message: text,
        confidence: resp.confidence || 'grounded',
        toolsUsed: resp.toolsUsed || [],
        type: resp.type || 'answer',
        suggestedActions: resp.suggestedActions || ['Explore Homestays', 'Check Mountain Safety', 'Live Weather'],
        citations: resp.citations || [],
        tripContext: resp.tripContext || null
      }
    });

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      emit({ type: 'aborted' });
      return;
    }
    console.error("[agentApi] Stream error:", err);
    emit({
      type: 'error',
      message: 'Could not connect to Devbhoomi Voice-Demo agent. Ensure port 8765 bridge is running.'
    });
  }
}