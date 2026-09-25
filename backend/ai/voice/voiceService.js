/**
 * Devbhoomi Conversational AI - Voice Service
 * Bridges backend chat with Python web_bridge Gemini Live Aoede voice engine
 */

const PYTHON_BRIDGE_URL = process.env.VOICE_BRIDGE_URL || "http://localhost:8765";

export class VoiceService {
  static async synthesizeSpokenAudio(text, lang = "hi") {
    try {
      const res = await fetch(`${PYTHON_BRIDGE_URL}/api/voice/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, lang }),
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json();
        return {
          audioBase64: data.audio_base64 || "",
          engine: data.engine || "gemini_live_aoede",
          text: data.response || text
        };
      }
    } catch (err) {
      // Python bridge offline or timeout
    }

    return {
      audioBase64: "",
      engine: "none",
      text
    };
  }
}
