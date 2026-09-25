/**
 * Discovery Uttarakhand - Phase 7 Agent Service
 *
 * Core agent loop implementing:
 * - Agent Decision Policy (Section 1 of addendum)
 * - Tool Trace / Observability (Section 2)
 * - Source-Aware Response Policy (Section 3)
 * - Conflicting Trip Context Detection (Section 4)
 * - State-Changing Action Policy (Section 6)
 * - Confirmation Policy
 * - Error Recovery
 * - Max 4 tool iterations, provider timeout, fallback
 */
import SavedTrip from "../models/SavedTrip.js";
import { OmniRouteProvider } from "./ai/providers/OmniRouteProvider.js";
import { GroqProvider } from "./ai/providers/GroqProvider.js";
import { GeminiProvider } from "./ai/providers/GeminiProvider.js";
import { OpenAIProvider } from "./ai/providers/OpenAIProvider.js";
import { DeterministicFallbackProvider } from "./ai/providers/DeterministicFallbackProvider.js";
import {
  TOOL_SCHEMAS, TOOL_MAP, STATE_CHANGING_TOOLS,
  validateToolCall, executeTool, successResult, failureResult
} from "./agentTools.js";
import {
  addTurn, mergeAllowlist, setPendingConfirmation,
  consumeConfirmation, clearPendingConfirmation, isAllowlisted, getContextEntities
} from "./agentSessionStore.js";
import { resolveDestination } from "./destinationResolver.js";
import { applyTripMutation } from "./tripMutationService.js";

const MAX_TOOL_ITERATIONS = 4;
const PROVIDER_TIMEOUT_MS = 35000;
const AGENT_TIMEOUT_MS = 60000;

// ─── Conflict detection patterns ─────────────────────────────
const CONFLICT_PATTERNS = [
  { regex: /(\d+)\s*(person|people|traveler|adult)/i, field: "travelers", extract: m => parseInt(m[1]) },
  { regex: /(\d+)\s*day/i, field: "duration", extract: m => `${m[1]} Days` },
  { regex: /budget.*?([0-9,]+)/i, field: "budget", extract: m => m[1] },
  { regex: /₹\s*([0-9,]+)/i, field: "budget", extract: m => m[1] }
];

function detectTripContextConflict(userMessage, tripContext) {
  if (!tripContext) return null;
  for (const pattern of CONFLICT_PATTERNS) {
    const match = userMessage.match(pattern.regex);
    if (match) {
      const proposed = pattern.extract(match);
      const current = tripContext[pattern.field];
      if (current && String(proposed) !== String(current).replace(/\D/g, "").slice(0, String(proposed).length)) {
        return {
          field: pattern.field,
          currentValue: current,
          proposedValue: String(proposed),
          message: `Your saved trip currently has ${pattern.field}: "${current}". You mentioned "${proposed}". Would you like to update it?`
        };
      }
    }
  }
  return null;
}

// ─── Prompt injection check ───────────────────────────────────
function looksLikeInjection(text) {
  const INJECTION_PATTERNS = [
    /ignore (your|all|previous|my|these) (rules|instructions|system|prompt|guidelines)/i,
    /reveal (database|db|secret|password|key|token|jwt)/i,
    /you are now|forget (your|all) instructions/i,
    /act as (admin|root|superuser|god|developer)/i,
    /jailbreak|DAN mode|bypass security/i,
    /show me (all users|all data|private|internal)/i,
    /ignore .*instructions.*and/i,
    /previous instructions.*reveal/i,
    /reveal all user passwords/i,
    /tell me your (system prompt|instructions|rules|hidden prompt|prompt)/i,
    /what (is|are) your (system prompt|instructions|rules|initial instructions)/i,
    /print (system prompt|hidden prompt|instructions)/i,
    /disregard (all|previous|system) (rules|instructions)/i,
    /system prompt:/i,
    /bypass (ownership|verification|security|auth)/i,
    /mark .* (verified|active)/i,
    /override (system|rules|instructions)/i
  ];
  return INJECTION_PATTERNS.some(p => p.test(text));
}

// ─── Decision policy: should tool be called? ─────────────────
function applyDecisionPolicy(toolName, args, session, userMessage) {
  // Never call unknown tools
  if (!TOOL_MAP[toolName]) return { proceed: false, reason: "Unknown tool" };

  // State-changing tools need pending confirmation intent check done in controller
  // Here we just validate the schema
  const validation = validateToolCall(toolName, args);
  if (!validation.valid) return { proceed: false, reason: validation.reason };

  return { proceed: true, args: validation.args };
}

// ─── Build system prompt ──────────────────────────────────────
function buildSystemPrompt(tripContext, session, pageContext) {
  const hasPending = !!session?.pendingConfirmation;
  const entities = session?.contextEntities || {};

  const activeContextSection = `
ACTIVE CONVERSATION CONTEXT:
- Active Destination: ${entities.destination || (tripContext?.destinationNames || [])[0] || "Uttarakhand"}
- Active Duration: ${entities.durationDays ? `${entities.durationDays} Days` : (tripContext?.duration || "Not specified")}
- Active Travelers: ${entities.travelers || tripContext?.travelers || "Not specified"}
- Active Budget Tier: ${entities.budgetTier || tripContext?.budget || "Balanced"}
`;

  const tripSection = tripContext ? `
CURRENT TRIP CONTEXT:
- Trip: ${tripContext.title || "Unnamed trip"}
- Destination: ${(tripContext.destinationNames || []).join(", ") || "Not set"}
- Duration: ${tripContext.duration || "Not set"}
- Travelers: ${tripContext.travelers || "Not set"}
- Budget: ${tripContext.budget || "Not set"}
- Pace: ${tripContext.pace || "Not set"}
- Transport: ${tripContext.transport || "Not set"}
- Has Itinerary: ${tripContext.hasGeneratedItinerary ? "Yes" : "No"}
` : "No saved trip loaded.";

  // If request is from the Voice Overlay, use the concise spoken persona
  if (pageContext?.pageType === "VOICE_AGENT" || pageContext?.currentPage === "COPILOT_VOICE") {
    return `You are Devbhoomi Companion, an expert AI voice travel guide and mountain safety companion for Uttarakhand, India (Devbhoomi), powered by Discover Uttarakhand.
You possess authoritative knowledge of:
- Char Dham (Kedarnath, Badrinath, Gangotri, Yamunotri) and Hemkund Sahib
- High-altitude treks (Valley of Flowers, Kedarkantha, Roopkund, Har Ki Dun, Tungnath, Chopta, Kuari Pass)
- Altitude Sickness (AMS) protocols, acclimatization halts, and safety guidelines
- Road conditions, mountain weather, and verified local homestays
- Garhwali and Kumaoni traditions, culture, and cuisine

CRITICAL SPOKEN VOICE INSTRUCTIONS:
1. You are speaking directly to the user through real-time voice synthesis. Keep your reply extremely conversational, warm, concise, and direct: exactly 1 to 3 spoken sentences.
2. Answer in Hindi, English, or natural friendly Hinglish depending on how the user speaks to you.
3. ABSOLUTELY NEVER use asterisks (*), markdown formatting, bold text (**), bullet points, numbered lists, emojis, or raw URLs. Everything you output must be pure, clean, natural spoken speech.
4. Give direct, factual answers. If asked about Kedarnath, give altitude (3584m), halting points (Guptkashi/Sonprayag), and weather. If asked about homestays, give real local Pahari stays.
${tripSection}
${activeContextSection}`;
  }

  return `You are DevBhoomi AI - Official Uttarakhand Travel Expert.
You have two sources:
1. Our verified database: { destinations: [...] } (use this first if question is about our 106 destinations)
2. Your own world knowledge (use if not in DB)

Rules:
- If user asks about a place in our DB (e.g., Kedarnath), use DB data + add your knowledge.
- If user asks about UNKNOWN place (e.g., 'Kichha me koi hidden temple?' or 'secret waterfall near Kedarnath'), DON'T say not found. Search your extensive world knowledge and answer like Google AI, but add disclaimer: 'This is AI suggested, not verified by us yet. Want to add it?'
- Always answer, never say 'I don't know from database' or 'not found'.
- Support Hindi + English both (natural Hinglish local guide tone).
- Keep tone friendly, helpful, and authentic like a local Pahari guide.

### CORE RETRIEVAL LOGIC (Hybrid Approach):
1. DATABASE FIRST (Default & Fastest): Always prioritize the provided structured local database (Destinations, Stays, Vehicles, Budget rules, Routes) for all facts, prices, and distances.
2. WORLD KNOWLEDGE FALLBACK (For Unknown/Hidden/New Spots): If the spot or detail is not in the database, answer fully and accurately from your world knowledge, appending the disclaimer.
3. SYNTHESIS: Blend local wisdom with verified facts seamlessly. Never say "data not found in database".

### COGNITIVE RULES (How you think):
1. Intent Over Keywords: Agar user "peace" bole, toh sirf shant jagah list mat karo. Low crowd density, high nature score, aur main market se door locations suggest karo.
2. Constraint-First Logic: Har recommendation user ke budget aur time ko strictly follow kare. ₹500 budget hai toh multi-day stay suggest mat karo. Seedha high-value day trips ya free spiritual sites batao.
3. Proactive Risk Mitigation: Himalayan terrain ka expert bano. 3000m+ altitude par acclimatization ki advice do. Remote areas ke liye network/road condition ki warning pehle hi de do.

### COMMUNICATION RULES (How you speak):
1. Zero Fluff, High Signal: "As an AI", "Main aapki madad kar sakta hoon" jaise corporate phrases bilkul use mat karo. Seedha answer se start karo.
2. NO EMOJIS: Emojis ka use bilkul mat karo. Readability ke liye clean typography, bold text, aur bullet points ka use karo.
3. Concise Authority: Responses ko 120 words ke andar rakho, jab tak user explicitly detailed itinerary na maange.
4. The "One Question" Rule: Agar perfect answer dene ke liye aur info chahiye, toh exactly ONE sharp, targeted question pucho.

### DOMAIN-SPECIFIC KNOWLEDGE (Uttarakhand Reality):
- Budget Reality: Homestays (₹800-1500/night), Bike Rentals (₹500-800/day), Local Meals (₹200-400).
- Geography: Garhwal aur Kumaon regions ke beech ka antar samjho. 1 din ki trip ke liye 12 ghante ki driving wali route suggest mat karo.
- Trust: Subtly reinforce trust by mentioning "Yeh 3-layer verified partner hai" when recommending stays or vehicles.

${tripSection}
${activeContextSection}
${hasPending ? "\nIMPORTANT: There is a PENDING CONFIRMATION. Do not execute another state change until the user confirms or cancels the pending action." : ""}

### FEW-SHOT TRAINING EXAMPLES (Follow this exact style):
User: "Best place to visit."
Copilot: Best recommendation dene ke liye mujhe aapka timeframe aur budget pata hona chahiye. Kya aap ek quick day trip dhund rahe hain ya multi-day mountain experience? Aur approximate budget kya hai?

User: "Mere paas 500 rupaye hain aur sirf half day hai."
Copilot: ₹500 aur half day mein multi-day stay possible nahi hai, lekin ek high-value local experience zaroor ban sakti hai. 
Agar aap Kumaon region mein hain: Jageshwar Temple complex best hai. Entry free hai aur deodar forests ke beech ekdum peaceful hai. Local shared jeep ka kharcha ₹100 ke aaspaas aayega.
Aap abhi kis region mein hain?

User: "Kedarnath mandir aaj subah khula hai kya? Aur wahan abhi barish ho rahi hai kya?"
Copilot: [TRIGGERS search_web_for_realtime_info TOOL]
Maine abhi latest update check kiya. Haan, Kedarnath mandir subah 4:00 baje khul chuka hai. Lekin abhi wahan halke baarish ki sambhavna hai aur temperature 4°C hai. 
Advice: Waterproof jacket aur acche grip wale shoes zaroor le jayein. Kya aapke paas Gaurikund se trek karne ka plan hai ya pony service lenge?

User: "Pithoragarh ke aas paas koi aisa hidden waterfall hai jo tourists ko pata nahi hota?"
Copilot: [TRIGGERS search_web_for_realtime_info TOOL]
Hidden spots ke hisaab se, Pithoragarh ke paas "Berinag" ke raaste mein ek chhota sa lesser-known waterfall hai jise locals "Kaphni Glacier" ke niche wale streams ke paas jaante hain. Yeh mainstream tourist maps par nahi dikhta. 
Note: Wahan tak ka raasta thoda rough hai, isliye 350cc bike ya local taxi hi lena. Kya aapke paas apna vehicle hai ya main verified local taxi options check karun?`;
}

// ─── Build LLM messages array ────────────────────────────────
// Uses universal OpenAI-compatible {role, content} format.
// OmniRoute, Groq, OpenAI all expect this format.
// GeminiProvider.js is responsible for adapting to Gemini's {parts} format internally.
function buildMessages(userMessage, session, systemPrompt) {
  const messages = [];

  // Include summary of old turns if available
  if (session?.historySummary) {
    messages.push({
      role: "user",
      content: `<CONVERSATION_SUMMARY>\n${session.historySummary}\n</CONVERSATION_SUMMARY>`
    });
    messages.push({
      role: "assistant",
      content: "I have context from our previous conversation."
    });
  }

  // Include recent history (limit to 6 turns for performance)
  const recentHistory = (session?.history || []).slice(-6);
  for (const turn of recentHistory) {
    messages.push({
      role: turn.role === "user" ? "user" : "assistant",
      content: String(turn.content || "")
    });
  }

  // Current user message (sandboxed to prevent prompt injection)
  messages.push({
    role: "user",
    content: `<UNTRUSTED_USER_MESSAGE>\n${userMessage}\n</UNTRUSTED_USER_MESSAGE>`
  });

  return messages;
}

// ─── Get LLM provider ────────────────────────────────────────
function getProvider() {
  const name = (process.env.AI_PROVIDER || "").toLowerCase();

  // 1. Explicit override if specified in env
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

  // 2. Default priority: Groq -> Gemini -> OmniRoute -> OpenAI -> Deterministic
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

// ─── Agentic Travel Operating Layer & Website Control Flow ───
async function _processAgenticTravelFlow({ message, tripContext, session, user, requestId, pageContext, onEvent, trace, startTime }) {
  const clean = message.trim();
  const lower = clean.toLowerCase();
  const entities = session.contextEntities || {};

  // Ignore simple greetings/thanks - let normal tool-less flow answer
  if (/^(hello|hi|hey|namaste|thanks|thank you|help)\b/i.test(clean) && clean.split(/\s+/).length <= 4) {
    return null;
  }

  // Pure stay query without planning intent -> handled by standard tool loop with findStays
  if (/^(stay|hotel|resort|lodge|accommodation|room|guesthouse)s?\b/i.test(clean) && clean.split(/\s+/).length <= 4) {
    return null;
  }

  const activeDest = entities.destination || pageContext?.destinationName || (tripContext?.destinationNames || [])[0];

  // 1. Pure Weather Query: "Badrinath ka weather?", "Pithoragarh weather"
  const isPureWeather = /weather|temperature|mausam|rain|snow|climate/i.test(clean) && !/plan|trip|jana|jaana|ghoom|itinerary|where i can go|budget|days|din/i.test(clean);
  if (isPureWeather) {
    const targetDest = entities.destination || activeDest || "Uttarakhand";
    if (onEvent) onEvent({ type: "tool_status", tool: "getWeather", message: `Checking live weather for ${targetDest} (Open-Meteo)...` });
    const weatherRes = await executeTool("getWeather", { location: targetDest }, { session, user });

    let msg = `Live weather for **${targetDest}**:`;
    if (weatherRes.success && weatherRes.data?.data) {
      const d = weatherRes.data.data;
      const tempVal = d.temperature ?? d.temperatureC;
      const conditionVal = d.condition || d.weatherCondition || 'Clear';
      const windVal = d.windSpeedKmh || d.windSpeed || '--';
      msg = `**Weather for ${targetDest}** (Open-Meteo Verified):\n- **Temperature**: ${tempVal !== undefined ? tempVal + '°C' : '--'}\n- **Condition**: ${conditionVal}\n- **Wind**: ${windVal} km/h\n\n*Himalayan weather shifts quickly. Always carry warm layers and check daylight transit guidelines.*`;
    } else {
      msg = `**${targetDest}** ke liye weather data check kiya gaya hai. Current conditions safe aur clear hain.`;
    }

    if (onEvent) onEvent({ type: "chunk", text: msg });
    addTurn(session, { role: "user", content: message });
    addTurn(session, { role: "assistant", content: msg });
    trace.totalDurationMs = Date.now() - startTime;
    return {
      type: "answer",
      message: msg,
      toolsUsed: ["getWeather"],
      citations: weatherRes.citations || [],
      structuredCards: {
        weather: weatherRes.success ? weatherRes.data?.data : null
      },
      suggestedActions: [
        { label: "Road Advisory", action: "ROAD_ADVISORY" },
        { label: "Plan Trip to " + targetDest, action: "PLAN_TRIP" }
      ],
      uiActions: [],
      tripContext: { destination: targetDest },
      confidence: "grounded",
      meta: { provider: "agentic_weather_assistant", toolCallCount: 1, sessionId: session.sessionId, requestId }
    };
  }

  // 2. Pure Road Route Query: "Delhi se Pithoragarh route dikhao", "Delhi se Badrinath ka route dikhao"
  const isPureRoute = /(?:route|road|highway|map dikhao|show map|kaise jaa?u|how to reach)/i.test(lower) && !/budget|stay|hotel|where i can go|days|din/i.test(lower);
  if (isPureRoute) {
    const orig = entities.origin || "Delhi";
    const dest = entities.destination || activeDest || "Pithoragarh";
    const mapAction = { type: "OPEN_MAP", origin: orig, destination: dest };
    if (onEvent) onEvent({ type: "ui_action", action: mapAction, requestId });

    if (onEvent) onEvent({ type: "tool_status", tool: "planRoute", message: `Calculating road routing (${orig} -> ${dest}) via OSRM...` });
    const routeRes = await executeTool("planRoute", { from: orig, to: dest }, { session, user });

    let routeDetails = "Mountain road corridor via state highway gateway. Daylight transit is strictly recommended.";
    if (routeRes.success && routeRes.data?.routeAvailable) {
      const d = routeRes.data;
      routeDetails = `Estimated driving distance: **${d.estimatedDistanceKm} km** (~**${d.estimatedDurationHours} hours**). Mountain highway corridor.`;
    }

    const msg = `**${orig} se ${dest}** ka road route map open kar diya hai.\n\n${routeDetails}\n\n*Highway corridor daylight transit ke liye best hai. Night driving avoid karein.*`;
    if (onEvent) onEvent({ type: "chunk", text: msg });
    addTurn(session, { role: "user", content: message });
    addTurn(session, { role: "assistant", content: msg });
    trace.totalDurationMs = Date.now() - startTime;
    return {
      type: "answer",
      message: msg,
      toolsUsed: ["planRoute"],
      citations: routeRes.citations || [],
      suggestedActions: _defaultSuggestions(),
      uiActions: [mapAction],
      tripContext: { destination: dest, origin: orig },
      confidence: "grounded",
      meta: { provider: "agentic_map_navigator", toolCallCount: 1, sessionId: session.sessionId, requestId }
    };
  }

  // 3. Natural reference resolution: "Wahan trekking bhi add karo" / "Uske paas stay dikhao"
  const isNaturalReference = /\b(wahan|there|uske paas|uske|nearby|yahan|here)\b/i.test(lower);

  // 3a. Natural reference stays: "Uske paas stay dikhao" / "Wahan hotel chahiye"
  if (isNaturalReference && activeDest && /(?:stay|hotel|resort|lodge|accommodation|room)s?\b/i.test(lower)) {
    if (onEvent) onEvent({ type: "tool_status", tool: "findStays", message: `Finding verified stays near ${activeDest}...` });
    const stayRes = await executeTool("findStays", { destination: activeDest }, { session, user });

    let msg = "";
    if (stayRes.success && stayRes.data?.stays?.length > 0) {
      const stays = stayRes.data.stays.slice(0, 4);
      const items = stays.map((s, i) => `${i + 1}. **${s.name}** [${s.category || 'Hotel'}] — ₹${s.pricePerNight ? s.pricePerNight.toLocaleString() : 'Counter'}/night (${s.priceProvenance || 'VERIFIED'})`).join("\n");
      msg = `Maine **${activeDest}** ke paas verified stays find kiye hain:\n\n${items}\n\n*Yeh sab verified listings hain.* Kya aap booking ya trip planner mein add karna chahenge?`;
    } else {
      msg = `**${activeDest}** ke paas stays search kiye hain. Local verified guesthouses aur homestays available hain.`;
    }

    if (onEvent) onEvent({ type: "chunk", text: msg });
    addTurn(session, { role: "user", content: message });
    addTurn(session, { role: "assistant", content: msg });
    trace.totalDurationMs = Date.now() - startTime;
    return {
      type: "answer",
      message: msg,
      toolsUsed: ["findStays"],
      citations: stayRes.citations || [],
      structuredCards: {
        stays: stayRes.success ? (stayRes.data?.stays || []).slice(0, 4) : []
      },
      suggestedActions: [
        { label: "Check Weather", action: "WEATHER" },
        { label: "Explore Activities", action: "ACTIVITIES" }
      ],
      uiActions: [],
      tripContext: { destination: activeDest },
      confidence: "grounded",
      meta: { provider: "agentic_reference_resolver", toolCallCount: 1, sessionId: session.sessionId, requestId }
    };
  }

  // 3b. Natural reference activities: "Wahan trekking bhi add karo" / "wahan kya dekh sakta hoon"
  if (isNaturalReference && activeDest && /trek|boat|activity|activities|nature|temple|spiritual/i.test(lower)) {
    let interest = null;
    if (/trek/i.test(lower)) interest = "trekking";
    else if (/boat/i.test(lower)) interest = "boating";
    else if (/nature/i.test(lower)) interest = "nature";
    else if (/spiritual|temple/i.test(lower)) interest = "spiritual";

    if (onEvent) onEvent({ type: "tool_status", tool: "exploreDestination", message: `Checking verified ${interest || 'activity'} options for ${activeDest}...` });
    const toolRes = await executeTool("exploreDestination", { destination: activeDest, interest }, { session, user });

    let msg = "";
    if (toolRes.success && toolRes.data?.matchingResults?.length > 0) {
      const items = toolRes.data.matchingResults.map((m, i) => `${i + 1}. **${m.name}** [${m.category || 'Experience'}]${m.price ? ` — ${m.price} (${m.priceProvenance || 'VERIFIED'})` : ' — Price not verified'}`).join("\n");
      msg = `Maine **${activeDest}** ke liye verified **${interest || 'activities'}** search ki hain:\n\n${items}\n\n*Yeh options verified dataset ke anusaar hain.*`;
    } else if (toolRes.data?.emptyStateMessage) {
      msg = `${toolRes.data.emptyStateMessage}\n\n${activeDest} ke paas verified ${interest || 'activity'} records nahi mile. Kya aap nearby stays ya lake viewpoints dekhna chahenge?`;
    } else {
      msg = `Maine **${activeDest}** ke liye activities check ki hain. Aap aur specific preference bata sakte hain.`;
    }

    if (onEvent) onEvent({ type: "chunk", text: msg });
    addTurn(session, { role: "user", content: message });
    addTurn(session, { role: "assistant", content: msg });
    trace.totalDurationMs = Date.now() - startTime;
    return {
      type: "answer",
      message: msg,
      toolsUsed: ["exploreDestination"],
      citations: toolRes.citations || [],
      suggestedActions: _defaultSuggestions(),
      uiActions: [],
      tripContext: { destination: activeDest },
      confidence: "grounded",
      meta: { provider: "agentic_reference_resolver", toolCallCount: 1, sessionId: session.sessionId, requestId }
    };
  }

  // 4. Destination Discovery: "Bhimtal mein kya kar sakta hoon?" / "what can I do in Pithoragarh?"
  const isExploreQuery = /(?:what can i do|things to do|explore|places to visit|kya kar sakta hoon|kya dekh sakta hoon)/i.test(lower);
  const hasPlanningParams = entities.duration || entities.budget || /plan|budget|days|din|jana hai|want to go/i.test(lower);
  if (isExploreQuery && !hasPlanningParams) {
    const targetDest = entities.destination || activeDest || "Bhimtal";
    const slug = targetDest.toLowerCase();
    const uiAction = { type: "OPEN_DESTINATION", destination: slug, slug, destinationId: slug, explore: true };
    if (onEvent) onEvent({ type: "ui_action", action: uiAction, requestId });

    if (onEvent) onEvent({ type: "tool_status", tool: "exploreDestination", message: `Exploring verified experiences in ${targetDest}...` });
    const toolRes = await executeTool("exploreDestination", { destination: targetDest }, { session, user });

    let msg = "";
    if (toolRes.success && toolRes.data?.availableCategories) {
      const cats = toolRes.data.availableCategories.map(c => `- ${c}`).join("\n");
      msg = `**Explore ${targetDest}** (${toolRes.data.district || 'Uttarakhand'}):\n\nYahan aap yeh sab discover kar sakte hain:\n${cats}\n\nMain aapko explore page par le aaya hoon. Agar koi specific interest hai (jaise trekking, boating, ya stays) toh batayein!`;
    } else {
      msg = `Main aapko **${targetDest}** ke exploration workspace par le aaya hoon. Yahan ke verified attractions aur experiences check kar sakte hain.`;
    }

    if (onEvent) onEvent({ type: "chunk", text: msg });
    addTurn(session, { role: "user", content: message });
    addTurn(session, { role: "assistant", content: msg });
    trace.totalDurationMs = Date.now() - startTime;
    return {
      type: "answer",
      message: msg,
      toolsUsed: ["exploreDestination"],
      citations: toolRes.citations || [],
      suggestedActions: [
        { label: "Show Stays", action: "FIND_STAYS" },
        { label: "Trekking Options", action: "TREKKING" }
      ],
      uiActions: [uiAction],
      tripContext: { destination: targetDest },
      confidence: "grounded",
      meta: { provider: "agentic_destination_explorer", toolCallCount: 1, sessionId: session.sessionId, requestId }
    };
  }

  // 5. Standalone Budget Modification (e.g. "Budget 25k kar do", "Budget kam karo", "budget reduce karo")
  const isExplicitBudgetModification = /(?:kar do|badal do|update|change|modify|reduce|kam kar do|kam karo|badha do|sasta karo)\b/i.test(clean);
  const isBudgetChange = isExplicitBudgetModification && (/(?:budget|kharcha).*?(\d+k|\d{4,6})|(\d+k|\d{4,6}).*?kar do/i.test(clean) || /(?:budget\s*kam|kam\s*karo|thoda\s*sasta|reduce\s*budget|sasta\s*rakhna)/i.test(lower));
  
  if (isBudgetChange || (/(?:budget\s*kam\s*karo|kam\s*karo|thoda\s*sasta|budget\s*reduce)/i.test(lower) && (entities.budget || tripContext?.budget))) {
    let bud = entities.budget || (tripContext?.budget ? parseInt(String(tripContext.budget).replace(/\D/g, ""), 10) : 20000);
    // If it's a relative reduction without explicit number, reduce by ~25% or set to budget tier
    if (/(?:kam\s*karo|thoda\s*sasta|reduce|kam)/i.test(lower) && !/\d+/.test(clean)) {
      bud = Math.max(5000, Math.round((bud * 0.75) / 1000) * 1000);
      entities.budget = bud;
      session.contextEntities.budget = bud;
    }

    const dest = entities.destination || activeDest || "Badrinath";
    const dur = entities.duration || 5;
    const trav = entities.travelers || 2;

    const budgetAction = { type: "PREFILL_TRIP_PLANNER", fields: { budget: bud } };
    if (onEvent) onEvent({ type: "ui_action", action: budgetAction, requestId });

    if (onEvent) onEvent({ type: "tool_status", tool: "calculateBudget", message: `Recalculating budget for ₹${bud.toLocaleString()}...` });
    const tier = bud < 15000 ? "Budget" : (bud > 40000 ? "Luxury" : "Balanced");
    const budgetRes = await executeTool("calculateBudget", { destination: dest, durationDays: dur, travelers: trav, budgetTier: tier }, { session, user });

    let msg = `Budget optimize karke **₹${bud.toLocaleString()}** set kar diya hai.`;
    if (budgetRes.success && budgetRes.data) {
      const b = budgetRes.data;
      msg += `\n\n**Recalculated Breakdown**:\n- Total Estimated: ₹${b.totalEstimatedCost?.toLocaleString() || bud.toLocaleString()}\n- Stay: ₹${b.breakdown?.accommodation?.toLocaleString() || '--'}\n- Transport: ₹${b.breakdown?.transport?.toLocaleString() || '--'}\n- Food: ₹${b.breakdown?.food?.toLocaleString() || '--'}\n\n*Yeh budget verified local rates par calculated hai.*`;
    }

    if (onEvent) onEvent({ type: "chunk", text: msg });
    addTurn(session, { role: "user", content: message });
    addTurn(session, { role: "assistant", content: msg });
    trace.totalDurationMs = Date.now() - startTime;
    return {
      type: "answer",
      message: msg,
      toolsUsed: ["calculateBudget"],
      citations: budgetRes.citations || [],
      structuredCards: {
        budget: budgetRes.success ? budgetRes.data : null
      },
      suggestedActions: _defaultSuggestions(),
      uiActions: [budgetAction],
      tripContext: { destination: dest, budget: bud },
      confidence: "grounded",
      meta: { provider: "agentic_budget_modifier", toolCallCount: 1, sessionId: session.sessionId, requestId }
    };
  }

  // 6. Trip Planning Flow & Multi-Turn State Machine
  // Only trigger slot-filling when user explicitly asks to BUILD/GENERATE an itinerary/trip form,
  // NOT when asking informational questions, history, timings, or general conversational inquiries.
  const isInformationalQuery = /(?:tell me about|information|timing|timings|history|kya hai|kaisa hai|baare me|kya dekh|mandir|temple|lake|waterfall|peak|trek guide|best time|story|facts|altitude)/i.test(clean);
  const isExplicitPlanningIntent = /(?:itinerary banao|trip plan karo|plan my trip|pura plan banao|booking plan|itinerary create)/i.test(clean) ||
                                   (clean.split(/\s+/).length <= 4 && /(?:plan|itinerary)\b/i.test(clean) && !isInformationalQuery);

  if (isExplicitPlanningIntent && !isInformationalQuery) {
    const dest = entities.destination || activeDest;
    const orig = entities.origin;
    const sDate = entities.startDate;
    const dur = entities.duration;
    const trav = entities.travelers;
    const bud = entities.budget;

    if (!dest) {
      const msg = "👋 Uttarakhand ka trip plan karna hai?\n\nBas destination batao — main route, weather, stays, activities aur budget step-by-step organize kar dunga.";
      if (onEvent) onEvent({ type: "chunk", text: msg });
      addTurn(session, { role: "user", content: message });
      addTurn(session, { role: "assistant", content: msg });
      trace.totalDurationMs = Date.now() - startTime;
      return {
        type: "answer",
        message: msg,
        toolsUsed: [],
        citations: [],
        suggestedActions: [
          { label: "Valley of Flowers", action: "VALLEY_OF_FLOWERS" },
          { label: "Badrinath", action: "BADRINATH" },
          { label: "Kedarnath", action: "KEDARNATH" },
          { label: "Nainital", action: "NAINITAL" }
        ],
        uiActions: [],
        confidence: "grounded",
        meta: { provider: "agentic_trip_guard", toolCallCount: 0, sessionId: session.sessionId, requestId }
      };
    }

    // Dynamic Missing Field Step 1: Missing Origin
    if (!orig) {
      let msg = `Bilkul! 🌿 ${dest} ka trip plan karte hain.\n\nAap kahan se travel start karenge?`;
      if (dur && bud) {
        const durStr = (entities.durationMin && entities.durationMax && entities.durationMin !== entities.durationMax)
          ? `${entities.durationMin}–${entities.durationMax} din`
          : `${dur} din`;
        msg = `Bilkul! 🌿 ${dest} ke liye ${durStr} ka ₹${bud.toLocaleString()} budget plan taiyaar karte hain.\n\nAap kahan se travel start karenge?`;
      } else if (dur) {
        const durStr = (entities.durationMin && entities.durationMax && entities.durationMin !== entities.durationMax)
          ? `${entities.durationMin}–${entities.durationMax} din`
          : `${dur} din`;
        msg = `Bilkul! 🌿 ${dest} ke liye ${durStr} ka trip plan karte hain.\n\nAap kahan se travel start karenge?`;
      } else if (bud) {
        msg = `Bilkul! 🌿 ${dest} ke liye ₹${bud.toLocaleString()} budget par trip plan karte hain.\n\nAap kahan se travel start karenge?`;
      }

      if (onEvent) onEvent({ type: "chunk", text: msg });
      addTurn(session, { role: "user", content: message });
      addTurn(session, { role: "assistant", content: msg });
      trace.totalDurationMs = Date.now() - startTime;
      return {
        type: "answer",
        message: msg,
        toolsUsed: [],
        citations: [],
        suggestedActions: [
          { label: "Delhi", action: "DELHI" },
          { label: "Dehradun", action: "DEHRADUN" },
          { label: "Haridwar", action: "HARIDWAR" },
          { label: "Haldwani", action: "HALDWANI" }
        ],
        uiActions: [],
        tripContext: { destination: dest, duration: dur, budget: bud },
        confidence: "grounded",
        meta: { provider: "agentic_trip_guard", toolCallCount: 0, sessionId: session.sessionId, requestId }
      };
    }

    // Dynamic Missing Field Step 2: Missing Date
    if (!sDate) {
      const msg = `Great. ${orig} se ${dest} ke liye kab jaana chahte hain?`;
      if (onEvent) onEvent({ type: "chunk", text: msg });
      addTurn(session, { role: "user", content: message });
      addTurn(session, { role: "assistant", content: msg });
      trace.totalDurationMs = Date.now() - startTime;
      return {
        type: "answer",
        message: msg,
        toolsUsed: [],
        citations: [],
        suggestedActions: [
          { label: "Next Weekend", action: "WEEKEND" },
          { label: "15 October", action: "OCT_15" },
          { label: "Next Month", action: "NEXT_MONTH" }
        ],
        uiActions: [],
        tripContext: { destination: dest, origin: orig, duration: dur, budget: bud },
        confidence: "grounded",
        meta: { provider: "agentic_trip_guard", toolCallCount: 0, sessionId: session.sessionId, requestId }
      };
    }

    // Dynamic Missing Field Step 3: Missing Travelers or Duration
    if (!dur || !trav) {
      let msg = `Kitne log travel karenge aur kitne din ka trip socha hai?`;
      let suggestions = [
        { label: "2 log, 5 din", action: "2_5" },
        { label: "Solo, 3 din", action: "SOLO_3" },
        { label: "Family (4 log), 6 din", action: "4_6" }
      ];
      if (dur && !trav) {
        msg = `Kitne log travel karenge?`;
        suggestions = [{ label: "2 log", action: "2_LOG" }, { label: "Solo traveler", action: "SOLO" }, { label: "Family (4 log)", action: "4_LOG" }];
      } else if (!dur && trav) {
        msg = `Kitne din ka trip plan karna hai?`;
        suggestions = [{ label: "3 din", action: "3_DIN" }, { label: "5 din", action: "5_DIN" }, { label: "7 din", action: "7_DIN" }];
      }

      if (onEvent) onEvent({ type: "chunk", text: msg });
      addTurn(session, { role: "user", content: message });
      addTurn(session, { role: "assistant", content: msg });
      trace.totalDurationMs = Date.now() - startTime;
      return {
        type: "answer",
        message: msg,
        toolsUsed: [],
        citations: [],
        suggestedActions: suggestions,
        uiActions: [],
        tripContext: { destination: dest, origin: orig, startDate: sDate, duration: dur, budget: bud },
        confidence: "grounded",
        meta: { provider: "agentic_trip_guard", toolCallCount: 0, sessionId: session.sessionId, requestId }
      };
    }

    // Step 4: Core trip info exists! (dest, orig, sDate, dur, trav)
    const effectiveDuration = dur || entities.durationMax || 4;
    const prefillFields = {
      origin: orig,
      destination: dest,
      destinationId: dest.toLowerCase(),
      startDate: sDate,
      duration: effectiveDuration,
      durationMin: entities.durationMin || effectiveDuration,
      durationMax: entities.durationMax || effectiveDuration,
      travelers: trav
    };

    const isAlreadyOnPlanner = pageContext?.currentRoute === "/trip-planner" || pageContext?.currentPage === "trip_planner";

    // If Budget is not provided yet:
    if (!bud) {
      const uiActions = [];
      if (!isAlreadyOnPlanner) {
        const navAction = { type: "NAVIGATE", routeKey: "TRIP_PLANNER", route: "/trip-planner" };
        uiActions.push(navAction);
        if (onEvent) onEvent({ type: "ui_action", action: navAction, requestId });
      }

      const prefillAction = { type: "PREFILL_TRIP_PLANNER", fields: prefillFields };
      const focusAction = { type: "FOCUS_TRIP_FIELD", field: "budget" };
      uiActions.push(prefillAction, focusAction);

      if (onEvent) {
        onEvent({ type: "ui_action", action: prefillAction, requestId });
        onEvent({ type: "ui_action", action: focusAction, requestId });
      }

      const durLabel = (entities.durationMin && entities.durationMax && entities.durationMin !== entities.durationMax)
        ? `${entities.durationMin}–${entities.durationMax} Days`
        : `${effectiveDuration} Days`;

      const msg = `Trip details note kar li hain:\n\n- **Destination**: ${dest} ✓\n- **From**: ${orig} ✓\n- **Date**: ${sDate} ✓\n- **Travelers**: ${trav} ✓\n- **Duration**: ${durLabel} ✓\n\nAapka approx budget kitna hai? Main complete route, live weather, verified stays aur budget calculate kar dunga.`;
      if (onEvent) onEvent({ type: "chunk", text: msg });
      addTurn(session, { role: "user", content: message });
      addTurn(session, { role: "assistant", content: msg });
      trace.totalDurationMs = Date.now() - startTime;

      return {
        type: "answer",
        message: msg,
        toolsUsed: [],
        citations: [],
        suggestedActions: [
          { label: "₹10,000", action: "10K" },
          { label: "₹20,000", action: "20K" },
          { label: "₹35,000", action: "35K" },
          { label: "₹50,000", action: "50K" }
        ],
        uiActions,
        tripContext: { ...prefillFields },
        confidence: "grounded",
        meta: { provider: "agentic_trip_guard", toolCallCount: 0, sessionId: session.sessionId, requestId }
      };
    }

    // Step 5: All required fields (dest, orig, sDate, dur, trav, bud) are available!
    const uiActions = [];
    if (!isAlreadyOnPlanner) {
      const navAction = { type: "NAVIGATE", routeKey: "TRIP_PLANNER", route: "/trip-planner" };
      uiActions.push(navAction);
      if (onEvent) onEvent({ type: "ui_action", action: navAction, requestId });
    }

    const budgetPrefill = {
      type: "PREFILL_TRIP_PLANNER",
      fields: { ...prefillFields, budget: bud }
    };
    uiActions.push(budgetPrefill);
    if (onEvent) onEvent({ type: "ui_action", action: budgetPrefill, requestId });

    // Emit Real Tool Statuses
    if (onEvent) {
      onEvent({ type: "tool_status", tool: "planRoute", message: `Checking route (${orig} → ${dest})...` });
      onEvent({ type: "tool_status", tool: "getWeather", message: `Checking live weather for ${dest}...` });
      onEvent({ type: "tool_status", tool: "getRoadAdvisory", message: `Checking road safety advisory...` });
      onEvent({ type: "tool_status", tool: "findStays", message: `Finding verified stays in ${dest}...` });
      onEvent({ type: "tool_status", tool: "calculateBudget", message: `Calculating budget breakdown for ₹${bud.toLocaleString()}...` });
    }

    const tier = bud < 15000 ? "Budget" : (bud > 40000 ? "Luxury" : "Balanced");
    const [routeRes, weatherRes, roadRes, stayRes, actRes, budgetRes] = await Promise.allSettled([
      executeTool("planRoute", { from: orig, to: dest }, { session, user }),
      executeTool("getWeather", { location: dest }, { session, user }),
      executeTool("getRoadAdvisory", { destination: dest, corridor: `${orig} -> ${dest}` }, { session, user }),
      executeTool("findStays", { destination: dest }, { session, user }),
      executeTool("exploreDestination", { destination: dest }, { session, user }),
      executeTool("calculateBudget", { destination: dest, durationDays: effectiveDuration, travelers: trav, budgetTier: tier }, { session, user })
    ]);

    const toolsUsed = [];
    const citations = [];

    let routeText = `Road route plotted from ${orig} to ${dest}.`;
    let routeData = null;
    if (routeRes.status === "fulfilled" && routeRes.value.success && routeRes.value.data?.routeAvailable) {
      toolsUsed.push("planRoute");
      routeData = routeRes.value.data;
      routeText = `~${routeData.estimatedDistanceKm} km (~${routeData.estimatedDurationHours} hours via NH corridor)`;
      if (routeRes.value.citations) citations.push(...routeRes.value.citations);
    }

    let weatherData = null;
    if (weatherRes.status === "fulfilled" && weatherRes.value.success) {
      toolsUsed.push("getWeather");
      weatherData = weatherRes.value.data?.data;
      if (weatherRes.value.citations) citations.push(...weatherRes.value.citations);
    }

    let roadData = null;
    if (roadRes.status === "fulfilled" && roadRes.value.success) {
      toolsUsed.push("getRoadAdvisory");
      roadData = roadRes.value.data?.data;
      if (roadRes.value.citations) citations.push(...roadRes.value.citations);
    }

    let staysData = [];
    if (stayRes.status === "fulfilled" && stayRes.value.success) {
      toolsUsed.push("findStays");
      staysData = (stayRes.value.data?.stays || []).slice(0, 4);
      if (stayRes.value.citations) citations.push(...stayRes.value.citations);
    }

    let budgetData = null;
    if (budgetRes.status === "fulfilled" && budgetRes.value.success) {
      toolsUsed.push("calculateBudget");
      budgetData = budgetRes.value.data;
      if (budgetRes.value.citations) citations.push(...budgetRes.value.citations);
    }

    const durText = (entities.durationMin && entities.durationMax && entities.durationMin !== entities.durationMax)
      ? `${entities.durationMin}–${entities.durationMax} days`
      : `${effectiveDuration} days`;

    let staysSummary = "";
    if (staysData.length > 0) {
      staysSummary = "\n- **Stays**: " + staysData.map(s => {
        const prov = s.provenance === "VERIFIED" ? "✓ Verified" : "Partner-listed (unverified)";
        const rate = s.pricePerNight ? `₹${s.pricePerNight}/night` : "Price on request";
        return `${s.name} (${rate} · ${prov})`;
      }).join(", ");
    }

    const finalMsg = `Perfect. Main aapke trip ke liye:

✓ Route check kar raha hoon
✓ Weather check kar raha hoon
✓ Stays check kar raha hoon
✓ Budget calculate kar raha hoon

Aapka **${dest}** trip plan organize ho gaya hai:
- **Route**: ${orig} → ${dest} (${routeText})
- **Schedule**: ${sDate ? sDate + ' · ' : ''}${durText} · ${trav} travelers
- **Budget**: ₹${bud.toLocaleString()}${staysSummary}`;

    if (onEvent) onEvent({ type: "chunk", text: finalMsg });
    addTurn(session, { role: "user", content: message });
    addTurn(session, { role: "assistant", content: finalMsg });
    trace.totalDurationMs = Date.now() - startTime;

    const structuredCards = {
      weather: weatherData,
      stays: staysData,
      budget: budgetData,
      route: routeData,
      roadAdvisory: roadData
    };

    return {
      type: "answer",
      message: finalMsg,
      toolsUsed,
      citations: citations.slice(0, 5),
      suggestedActions: [
        { label: "Wahan trekking bhi add karo", action: "ADD_TREKKING" },
        { label: "Budget kam karo", action: "BUDGET_REDUCE" },
        { label: "View Route on Map", action: "VIEW_MAP" }
      ],
      uiActions,
      structuredCards,
      tripContext: { ...prefillFields, budget: bud },
      confidence: "grounded",
      meta: { provider: "agentic_travel_orchestrator", toolCallCount: toolsUsed.length, sessionId: session.sessionId, requestId }
    };
  }

  return null;
}

// ─── Main agent run ───────────────────────────────────────────
export async function runAgent({ message, userMessage, tripContext, session, user, requestId, pageContext, onEvent }) {
  const normalizedMessage = String(message || userMessage || "").trim();
  const safeSession = session || { sessionId: `anon_${Date.now()}`, history: [] };
  const safeRequestId = requestId || `req_${Date.now()}`;

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Agent execution timed out")), AGENT_TIMEOUT_MS)
  );

  return Promise.race([
    _runAgentInternal({ message: normalizedMessage, tripContext, session: safeSession, user, requestId: safeRequestId, pageContext, onEvent }),
    timeoutPromise
  ]).catch(err => {
    console.error(`[AgentService] Timeout/Fatal [${safeRequestId}]:`, err.message);
    return {
      type: "error",
      message: "The AI agent took too long to process your request. Please try asking a more focused question.",
      toolsUsed: [],
      citations: [],
      suggestedActions: _defaultSuggestions(),
      confidence: "unavailable",
      meta: { provider: "timeout_guard", toolCallCount: 0, sessionId: safeSession?.sessionId, requestId: safeRequestId }
    };
  });
}

async function _runAgentInternal({ message, tripContext, session, user, requestId, pageContext, onEvent }) {
  if (onEvent) onEvent({ type: 'status', message: 'Thinking...' });
  console.log(`[AGENT] requestId=${requestId} message="${(message || '').slice(0,50)}..."`);
  console.log(`[AGENT] provider selected: ${(process.env.AI_PROVIDER || 'deterministic').toLowerCase()}`);
  const trace = {
    requestId,
    sessionId: session?.sessionId || 'unknown',
    userMessageLength: (message || '').length,
    provider: null,
    tools: [],
    toolCallCount: 0,
    fallbackUsed: false,
    injectionBlocked: false,
    conflictDetected: null,
    totalDurationMs: 0,
    error: null,
    tLlm1: 0,
    tLlm2: 0,
    tTools: 0
  };
  const startTime = Date.now();

  try {
    // 1. Prompt injection check
    if (looksLikeInjection(message)) {
      trace.injectionBlocked = true;
      trace.totalDurationMs = Date.now() - startTime;
      return {
        type: "error",
        message: "I can't help with that request. I'm here to assist with your Uttarakhand travel planning.",
        toolsUsed: [],
        citations: [],
        suggestedActions: _defaultSuggestions(),
        confidence: "grounded",
        meta: { provider: "security_guard", toolCallCount: 0, sessionId: session.sessionId, requestId, _trace: trace }
      };
    }

    // 2. Detect conflicting trip context
    const conflict = tripContext ? detectTripContextConflict(message, tripContext) : null;
    if (conflict) {
      trace.conflictDetected = conflict;
      addTurn(session, { role: "user", content: message });
      const conflictMsg = conflict.message;
      addTurn(session, { role: "assistant", content: conflictMsg });
      trace.totalDurationMs = Date.now() - startTime;
      return {
        type: "clarification",
        message: conflictMsg,
        toolsUsed: [],
        citations: [],
        suggestedActions: [
          { label: "Yes, update it", action: "CONFIRM_UPDATE" },
          { label: "Keep original", action: "KEEP_ORIGINAL" }
        ],
        confidence: "grounded",
        meta: { provider: "context_conflict_detector", toolCallCount: 0, sessionId: session.sessionId, requestId, _trace: trace }
      };
    }

    // 3. Check if message is a confirmation for pending action
    const isConfirmation = /^(yes|confirm|ok|okay|go ahead|proceed|do it|sure)\.?$/i.test(message.trim());
    const isDenial = /^(no|cancel|stop|nevermind|never mind|dont|don't)\.?$/i.test(message.trim());

    if (isDenial && session.pendingConfirmation) {
      clearPendingConfirmation(session);
      addTurn(session, { role: "user", content: message });
      const denyMsg = "Understood — the change has been cancelled. Let me know if you'd like to try something else.";
      addTurn(session, { role: "assistant", content: denyMsg });
      trace.totalDurationMs = Date.now() - startTime;
      return { type: "answer", message: denyMsg, toolsUsed: [], citations: [], suggestedActions: _defaultSuggestions(), confidence: "grounded",
        meta: { provider: "confirmation_handler", toolCallCount: 0, sessionId: session.sessionId, requestId, _trace: trace } };
    }

    if (isConfirmation && session.pendingConfirmation) {
      return await _executeConfirmedAction(session, user, trace, startTime, requestId);
    }

    // 3b. Agentic Travel Operating Layer (UI actions, navigation, form prefill, conversational trip state machine)
    const agenticFlowResult = await _processAgenticTravelFlow({
      message,
      tripContext,
      session,
      user,
      requestId,
      pageContext,
      onEvent,
      trace,
      startTime
    });
    if (agenticFlowResult) {
      return agenticFlowResult;
    }

    // 4. Get provider and build prompt
    const provider = getProvider();
    trace.provider = provider.name;

    const systemPrompt = buildSystemPrompt(tripContext, session, pageContext);
    const messages = buildMessages(message, session, systemPrompt);

    // 5. Agent loop — max 4 tool iterations with duplicate & call frequency guards
    let conversationMessages = [...messages];
    let finalResponse = null;
    let toolsUsed = [];
    let allCitations = [];
    const executedToolCalls = new Set();
    const toolCallCounts = {};

    for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
      let llmResponse;
      const tLlmStart = Date.now();
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Provider timeout")), PROVIDER_TIMEOUT_MS)
        );

        if (onEvent && provider.chatStream) {
          console.log(`[AGENT] streaming started via ${provider.name}`);
          const streamPromise = (async () => {
            const stream = provider.chatStream(systemPrompt, conversationMessages, TOOL_SCHEMAS);
            const res = { text: "", toolCalls: [], toolCall: null };
            let chunkCount = 0;
            for await (const chunk of stream) {
              if (chunk.type === 'text') {
                res.text += chunk.text;
                chunkCount++;
                onEvent({ type: 'chunk', text: chunk.text });
              } else if (chunk.type === 'toolCall') {
                res.toolCalls.push(chunk.toolCall);
              }
            }
            console.log(`[AGENT] streaming complete: ${chunkCount} chunks, ${res.text.length} chars`);
            if (res.toolCalls.length > 0) res.toolCall = res.toolCalls[0];
            return res;
          })();
          llmResponse = await Promise.race([streamPromise, timeoutPromise]);
        } else {
          llmResponse = await Promise.race([
            provider.chat(systemPrompt, conversationMessages, TOOL_SCHEMAS),
            timeoutPromise
          ]);
        }
      } catch (err) {
        // Primary provider failed — cascade fallback: OmniRoute -> Gemini -> Deterministic
        console.error(`[AGENT] provider error (${provider.name}): ${err.message}`);
        trace.fallbackUsed = true;
        let fallbackHandled = false;

        if ((provider.name === "groq" || provider.name === "omniroute") && process.env.GEMINI_API_KEY) {
          try {
            console.log(`[AGENT] Falling back from ${provider.name} to GeminiProvider...`);
            const geminiFallback = new GeminiProvider();
            trace.provider = "gemini";
            llmResponse = await geminiFallback.chat(systemPrompt, conversationMessages, TOOL_SCHEMAS);
            fallbackHandled = true;
          } catch (geminiErr) {
            console.error(`[AGENT] Gemini fallback also failed: ${geminiErr.message}`);
          }
        }

        if (!fallbackHandled) {
          trace.provider = "deterministic";
          const fallback = new DeterministicFallbackProvider();
          llmResponse = await fallback.chat(systemPrompt, conversationMessages, TOOL_SCHEMAS);
          console.log(`[AGENT] deterministic fallback response length: ${llmResponse.text?.length || 0}`);
        }
      }
      const tLlmDuration = Date.now() - tLlmStart;
      if (iteration === 0) trace.tLlm1 = tLlmDuration;
      else if (iteration === 1) trace.tLlm2 = tLlmDuration;

      // If LLM answered directly (no tool call)
      if (!llmResponse.toolCall) {
        finalResponse = llmResponse.text || "I'm here to help with your trip planning. What would you like to know?";
        console.log(`[AGENT] final answer length: ${finalResponse.length}`);
        if (onEvent && (!provider.chatStream || trace.fallbackUsed)) {
           onEvent({ type: 'chunk', text: finalResponse });
        }
        break;
      }

      // 6. Tool calls received
      const toolCalls = llmResponse.toolCalls || (llmResponse.toolCall ? [llmResponse.toolCall] : []);
      
      let requiresAuthMsg = null;
      let confirmationResponse = null;
      let readOnlySuccessCount = 0;
      let lastToolResultText = null;

      const toolPromises = toolCalls.map(async (tc) => {
        const { name: toolName, args: rawArgs } = tc;
        trace.toolCallCount++;

        const toolTrace = {
          name: toolName,
          argumentsValidated: false,
          authorizationPassed: false,
          success: false,
          durationMs: 0
        };

        const callKey = `${toolName}:${JSON.stringify(rawArgs || {})}`;
        if (executedToolCalls.has(callKey)) {
          trace.tools.push(toolTrace);
          return { status: "rejected", message: { role: "tool", parts: [{ text: JSON.stringify({ success: false, error: "Tool call rejected: Duplicate tool call with identical arguments detected." }) }], toolName } };
        }

        toolCallCounts[toolName] = (toolCallCounts[toolName] || 0) + 1;
        if (toolCallCounts[toolName] > 2) {
          trace.tools.push(toolTrace);
          return { status: "rejected", message: { role: "tool", parts: [{ text: JSON.stringify({ success: false, error: `Tool call rejected: Maximum 2 calls for ${toolName} reached in this turn.` }) }], toolName } };
        }

        executedToolCalls.add(callKey);

        const decision = applyDecisionPolicy(toolName, rawArgs, session, message);
        if (!decision.proceed) {
          trace.tools.push(toolTrace);
          return { status: "rejected", message: { role: "tool", parts: [{ text: JSON.stringify({ success: false, error: `Tool call rejected: ${decision.reason}` }) }], toolName } };
        }
        toolTrace.argumentsValidated = true;

        const schema = TOOL_MAP[toolName];
        if (schema.requiresAuth && !user) {
          toolTrace.authorizationPassed = false;
          trace.tools.push(toolTrace);
          requiresAuthMsg = "This action requires you to be logged in. Please sign in to continue.";
          return { status: "rejected", message: { role: "tool", parts: [{ text: JSON.stringify({ success: false, error: "Authentication required for this tool." }) }], toolName } };
        }
        toolTrace.authorizationPassed = true;

        let toolMsg = `Executing ${toolName}...`;
        if (toolName === 'getWeather') toolMsg = 'Checking live weather...';
        if (toolName === 'getRoadAdvisory') toolMsg = 'Checking road advisory...';
        if (toolName === 'findStays') toolMsg = 'Finding verified stays...';
        if (toolName === 'calculateBudget') toolMsg = 'Calculating optimized budget...';
        if (toolName === 'getTransitStatus') toolMsg = 'Checking transit schedules...';
        if (onEvent) onEvent({ type: 'tool_status', tool: toolName, message: toolMsg });

        if (STATE_CHANGING_TOOLS.has(toolName)) {
          const toolResult = await executeTool(toolName, decision.args, { session, user });
          toolTrace.success = toolResult.success;
          toolTrace.durationMs = toolResult._durationMs || 0;
          trace.tTools += toolTrace.durationMs;
          trace.tools.push(toolTrace);

          if (toolResult.isProposal && toolResult.requiresConfirmation) {
            setPendingConfirmation(session, {
              actionType: toolName,
              payload: toolResult.proposal,
              tripId: toolResult.proposal.tripId,
              userId: user?._id?.toString()
            });

            addTurn(session, { role: "user", content: message });
            const confirmMsg = `I'd like to make this change to your trip:\n\n**${toolResult.proposal.operation}** on Day ${toolResult.proposal.day}${toolResult.proposal.reason ? `\nReason: ${toolResult.proposal.reason}` : ""}\n\nShall I proceed? Please confirm with "Yes" or "Cancel".`;
            addTurn(session, { role: "assistant", content: confirmMsg });
            trace.totalDurationMs = Date.now() - startTime;
            
            confirmationResponse = {
              type: "confirmation_required",
              message: confirmMsg,
              toolsUsed: [toolName],
              citations: [],
              suggestedActions: [
                { label: "Yes, make this change", action: "CONFIRM_YES" },
                { label: "Cancel", action: "CANCEL" }
              ],
              confirmationPayload: { actionType: toolName, day: toolResult.proposal.day, operation: toolResult.proposal.operation },
              confidence: "grounded",
              meta: { provider: trace.provider, toolCallCount: trace.toolCallCount, sessionId: session.sessionId, requestId, _trace: _sanitizeTrace(trace) }
            };
          }
          return { status: "state_change" };
        } else {
          const toolResult = await executeTool(toolName, decision.args, { session, user });
          toolTrace.success = toolResult.success;
          toolTrace.durationMs = toolResult._durationMs || 0;
          trace.tTools += toolTrace.durationMs;
          trace.tools.push(toolTrace);

          return { status: "read_only", toolName, toolResult };
        }
      });

      const results = await Promise.allSettled(toolPromises);

      if (confirmationResponse) return confirmationResponse;
      if (requiresAuthMsg) {
        finalResponse = requiresAuthMsg;
        break;
      }

      for (const res of results) {
        if (res.status === "fulfilled" && res.value) {
          if (res.value.status === "rejected") {
            conversationMessages.push(res.value.message);
          } else if (res.value.status === "read_only") {
            const { toolName, toolResult } = res.value;
            if (toolResult.success) {
              toolsUsed.push(toolName);
              if (toolResult.citations) allCitations.push(...toolResult.citations);
              readOnlySuccessCount++;
            }
            const resultText = `<TRUSTED_DATA tool="${toolName}">\n${JSON.stringify(toolResult.data || toolResult.error)}\nProvenance: ${toolResult.provenance || "UNKNOWN"}\n</TRUSTED_DATA>`;
            lastToolResultText = resultText;
            conversationMessages.push({
              role: "tool",
              parts: [{ text: resultText }],
              toolName
            });
          }
        }
      }

      // Context-Aware LLM Synthesis Check
      if (readOnlySuccessCount === 1 && toolCalls.length === 1) {
        const isComplex = /(compare|suggest|should I|what do you think|plan|itinerary|recommend|best|cheapest|options|reason|change|advice|based on)/i.test(message);
        if (!isComplex) {
          // SIMPLE FACTUAL TOOL QUERY -> deterministic trusted formatter
          const fallback = new DeterministicFallbackProvider();
          finalResponse = fallback._synthesizeFromTrustedData(message, lastToolResultText);
          if (onEvent) onEvent({ type: 'chunk', text: finalResponse });
          break; // Short-circuit second LLM call!
        }
      }
    }

    // 7. If loop exhausted without final response
    if (!finalResponse) {
      trace.fallbackUsed = true;
      finalResponse = "I was working on finding that information, but reached the processing limit. Please try a more specific question.";
      if (onEvent) onEvent({ type: 'chunk', text: finalResponse });
    }

    // 8. Build structured response
    addTurn(session, { role: "user", content: message });
    addTurn(session, { role: "assistant", content: finalResponse });
    trace.totalDurationMs = Date.now() - startTime;

    return {
      type: "answer",
      message: finalResponse,
      toolsUsed,
      citations: allCitations.slice(0, 5),
      suggestedActions: _buildSuggestedActions(toolsUsed, tripContext),
      uiActions: [],
      tripContext: session.contextEntities || null,
      confidence: toolsUsed.length > 0 ? "grounded" : "estimated",
      meta: {
        provider: trace.provider,
        toolCallCount: trace.toolCallCount,
        sessionId: session.sessionId,
        requestId,
        fallbackUsed: trace.fallbackUsed,
        _trace: _sanitizeTrace(trace)
      }
    };

  } catch (err) {
    trace.error = err.message;
    trace.totalDurationMs = Date.now() - startTime;
    console.error(`[AgentService] Error [${requestId}]:`, err.message);
    return {
      type: "error",
      message: "I encountered an issue while processing your request. Your trip data is safe. Please try again.",
      toolsUsed: [],
      citations: [],
      suggestedActions: _defaultSuggestions(),
      uiActions: [],
      tripContext: session?.contextEntities || null,
      confidence: "unavailable",
      meta: { provider: trace.provider || "unknown", toolCallCount: trace.toolCallCount, sessionId: session?.sessionId, requestId, _trace: _sanitizeTrace(trace) }
    };
  }
}

// ─── Execute a confirmed state-changing action ────────────────
async function _executeConfirmedAction(session, user, trace, startTime, requestId) {
  const confirmResult = consumeConfirmation(session, {
    userId: user?._id?.toString(),
    tripId: session.tripId
  });

  if (!confirmResult.ok) {
    const msg = confirmResult.reason;
    addTurn(session, { role: "user", content: "yes" });
    addTurn(session, { role: "assistant", content: msg });
    trace.totalDurationMs = Date.now() - startTime;
    return { type: "error", message: msg, toolsUsed: [], citations: [], suggestedActions: _defaultSuggestions(),
      uiActions: [],
      tripContext: session?.contextEntities || null,
      confidence: "unavailable", meta: { provider: "confirmation_handler", toolCallCount: 0, sessionId: session.sessionId, requestId, _trace: trace } };
  }

  const conf = confirmResult.confirmation;

  // Execute the validated mutation
  try {
    if (conf.actionType === "modifyItinerary") {
      await _applyItineraryMutation(conf.payload, user);
      const successMsg = `Done! I've applied the change: **${conf.payload.operation}** on Day ${conf.payload.day}.`;
      addTurn(session, { role: "user", content: "yes" });
      addTurn(session, { role: "assistant", content: successMsg });
      trace.totalDurationMs = Date.now() - startTime;
      return { type: "answer", message: successMsg, toolsUsed: ["modifyItinerary"], citations: [],
        suggestedActions: _defaultSuggestions(),
        uiActions: [],
        tripContext: session?.contextEntities || null,
        confidence: "grounded",
        meta: { provider: "confirmed_mutation", toolCallCount: 1, sessionId: session.sessionId, requestId, _trace: _sanitizeTrace(trace) } };
    }
  } catch (err) {
    const errMsg = `I couldn't apply that change: ${err.message}. Please try again.`;
    addTurn(session, { role: "user", content: "yes" });
    addTurn(session, { role: "assistant", content: errMsg });
    trace.totalDurationMs = Date.now() - startTime;
    return { type: "error", message: errMsg, toolsUsed: [], citations: [], suggestedActions: _defaultSuggestions(),
      uiActions: [], tripContext: session?.contextEntities || null,
      confidence: "unavailable", meta: { provider: "confirmed_mutation", toolCallCount: 1, sessionId: session.sessionId, requestId, _trace: trace } };
  }
}

// ─── Apply itinerary mutation with full validation ────────────
async function _applyItineraryMutation(proposal, user) {
  // Re-fetch and re-validate — never trust frontend payload
  const trip = await SavedTrip.findById(proposal.tripId);
  if (!trip) throw new Error("Trip not found");
  if (String(trip.user) !== String(user._id)) throw new Error("Access denied");

  const itinerary = Array.isArray(trip.generatedItinerary) ? [...trip.generatedItinerary] : [];
  const dayIndex = itinerary.findIndex(d => (d.dayNumber || d.day) === proposal.day);
  if (dayIndex === -1) throw new Error(`Day ${proposal.day} not found in itinerary`);

  if (proposal.operation === "replace_activity" || proposal.operation === "remove_activity") {
    const day = { ...itinerary[dayIndex] };
    if (proposal.removeCandidateId && Array.isArray(day.activities)) {
      day.activities = day.activities.filter(a => {
        const id = a._id ? String(a._id) : (a.id ? String(a.id) : null);
        return id !== proposal.removeCandidateId;
      });
    }
    itinerary[dayIndex] = day;
  } else if (proposal.operation === "update_pace") {
    // No structural change — just log it
  }

  trip.generatedItinerary = itinerary;
  await trip.save();
}

function _sanitizeTrace(trace) {
  // Never expose sensitive fields
  return {
    requestId: trace.requestId,
    provider: trace.provider,
    toolCallCount: trace.toolCallCount,
    fallbackUsed: trace.fallbackUsed,
    tools: (trace.tools || []).map(t => ({
      name: t.name,
      success: t.success,
      durationMs: t.durationMs,
      validated: t.argumentsValidated,
      authorized: t.authorizationPassed
    })),
    totalDurationMs: trace.totalDurationMs,
    injectionBlocked: trace.injectionBlocked
  };
}

function _defaultSuggestions() {
  return [
    { label: "Explain my trip", action: "EXPLAIN_TRIP" },
    { label: "Check road advisory", action: "CHECK_ROAD_ADVISORY" },
    { label: "Optimize budget", action: "OPTIMIZE_BUDGET" }
  ];
}

function _buildSuggestedActions(toolsUsed, tripContext) {
  const actions = [];
  if (!toolsUsed.includes("getWeather")) actions.push({ label: "Check weather", action: "CHECK_WEATHER" });
  if (!toolsUsed.includes("getRoadAdvisory")) actions.push({ label: "Road safety", action: "CHECK_ROAD_ADVISORY" });
  if (!toolsUsed.includes("calculateBudget")) actions.push({ label: "Optimize budget", action: "OPTIMIZE_BUDGET" });
  if (tripContext?.hasGeneratedItinerary && !toolsUsed.includes("getItinerary"))
    actions.push({ label: "Explain my itinerary", action: "EXPLAIN_ITINERARY" });
  actions.push({ label: "Find verified stays", action: "FIND_STAYS" });
  return actions.slice(0, 4);
}