# Discovery Uttarakhand — AI Provider Flow & Priority
**Generated:** 2026-09-28
**Source of Truth:** `backend/services/agentService.js:236-270`

## 1. Provider Resolution Logic
The backend determines the active AI provider strictly as follows:

```javascript
function getProvider() {
  const name = (process.env.AI_PROVIDER || "").toLowerCase();

  // 1. Explicit override if specified in env:
  if (name === "groq" && process.env.GROQ_ENABLED !== 'false' && process.env.GROQ_API_KEY) {
    return new GroqProvider();
  }
  if (name === "omniroute" && process.env.OMNIROUTE_ENABLED !== 'false' && process.env.OMNIROUTE_API_KEY) {
    return new OmniRouteProvider();
  }
  if (name === "gemini" && process.env.GEMINI_API_KEY) {
    return new GeminiProvider();
  }
  if (name === "openai" && process.env.OPENAI_API_KEY) {
    return new OpenAIProvider();
  }
  if (name === "deterministic") {
    return new DeterministicFallbackProvider();
  }

  // 2. Default priority cascade:
  if (process.env.GROQ_ENABLED !== 'false' && process.env.GROQ_API_KEY) {
    return new GroqProvider();
  }
  if (process.env.GEMINI_API_KEY) {
    return new GeminiProvider();
  }
  if (process.env.OMNIROUTE_ENABLED !== 'false' && process.env.OMNIROUTE_API_KEY) {
    return new OmniRouteProvider();
  }
  if (process.env.OPENAI_API_KEY) {
    return new OpenAIProvider();
  }
  return new DeterministicFallbackProvider();
}
```

## 2. Priority Order Table
| Rank | Provider | Class File | Condition |
| :--- | :--- | :--- | :--- |
| **1** | **Groq** (Llama 3.3 70B Versatile) | `backend/services/ai/providers/GroqProvider.js` | `GROQ_API_KEY` set & `GROQ_ENABLED !== 'false'` |
| **2** | **Google Gemini** (Gemini 2.5 Flash) | `backend/services/ai/providers/GeminiProvider.js` | `GEMINI_API_KEY` set |
| **3** | **OmniRoute** | `backend/services/ai/providers/OmniRouteProvider.js` | `OMNIROUTE_API_KEY` set & `OMNIROUTE_ENABLED !== 'false'` |
| **4** | **OpenAI** (GPT-4o) | `backend/services/ai/providers/OpenAIProvider.js` | `OPENAI_API_KEY` set |
| **5** | **Deterministic Fallback** | `backend/services/ai/providers/DeterministicFallbackProvider.js` | Zero API keys available (100% offline rule-based) |
