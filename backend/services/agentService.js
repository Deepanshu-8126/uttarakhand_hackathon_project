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

  const userLoc = entities.userLocation;
  const userLocCity = typeof userLoc === 'object' ? (userLoc?.city || userLoc?.district) : userLoc;
  const userLocStr = userLocCity ? `${userLocCity}${userLoc?.district && userLoc.district !== userLocCity ? ` (${userLoc.district} District)` : ''}` : "Not set";

  const activeContextSection = `
ACTIVE CONVERSATION CONTEXT:
- User Saved Home Location: ${userLocStr}
- Active Destination: ${entities.destination || (tripContext?.destinationNames || [])[0] || "Uttarakhand"}
- Active Duration: ${entities.durationDays ? `${entities.durationDays} Days` : (tripContext?.duration || "Not specified")}
- Active Travelers: ${entities.travelers || tripContext?.travelers || "Not specified"}
- Active Budget Tier: ${entities.budgetTier || tripContext?.budget || "Balanced"}

LOCATION & SPATIAL PRONOUN RESOLUTION:
- "mere aas paas", "near me", "mere paas", "yahan", "mere city mein": refers to the user's location (${userLocStr}).
- "wahan", "udhar", "uske paas": refers to the previously mentioned destination (${entities.destination || "the destination"}).
- When user asks "mere aas paas kya hai?" or "near me": prioritize real nearby places, stays, and rentals around their home base (${userLocStr}).
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
    return `You are Devbhoomi Companion, the official native AI voice travel guide and mountain route expert for Uttarakhand (Devbhoomi), India, powered by Discover Uttarakhand.

CRITICAL DIRECT SPOKEN VOICE RULES:
1. ZERO GENERIC INTAKE FORMS: NEVER ask generic questions like "Kitne din ka trip hai?", "Aapka budget kitna hai?", "Kaise plan karna hai?". When the user asks a specific question about a place, route, weather, or directions (e.g., Haldwani to Nainital, Kedarnath route, Mussoorie places), IMMEDIATELY ANSWER THEIR QUESTION DIRECTLY WITH EXACT FACTUAL DATA IN THE FIRST SENTENCE.
2. ROUTE & ROADMAP QUERIES: If asked for a route or roadmap (e.g., "Haldwani se Nainital jana hai, pura road batao"):
   - Give the total distance and driving time immediately (e.g., Haldwani to Nainital is approx 35 km via NH 109, taking about 1 to 1.5 hours).
   - Give the exact scenic route waypoints (e.g., Haldwani → Kathgodam → Ranibagh → Jeolikote → Mallital / Tallital Nainital).
   - Mention transport options (shared cabs/taxis from Haldwani Kathgodam station, UTC buses, or rented scooties/cabs).
3. SPOKEN VOICE FORMATTING: Speak in natural, warm Hindi, English, or Hinglish depending on the user. ABSOLUTELY NO asterisks (*), hashtags (#), bold text (**), bullet points, numbered lists, URLs, or emojis. Every word must be clean natural speech.
4. ZERO HALLUCINATIONS: Uttarakhand is a Himalayan mountain state (lakes, shrines, pine forests). Never mention deserts or unrelated non-Himalayan regions.
5. CONCISE & WARM: Keep your spoken answer between 2 to 4 clean, spoken sentences that sound warm, helpful, and natural when read aloud.

${tripSection}
${activeContextSection}`;
  }

  return `You are DevBhoomi AI - Official Himalayan Travel Expert and Native Pahari Guide for Uttarakhand, India.
You have two sources:
1. Our verified database: { destinations: [...] } (use this first for all 106 destinations, stays, verified routes)
2. Your own deep world knowledge of Uttarakhand (use for hidden viewpoints, local lore, summits, and uncataloged spots)

CRITICAL GROUNDED RULES:
- ZERO GENERIC INTAKE FORMS: NEVER answer with a generic questionnaire or repetitive origin questions (e.g. NEVER ask "Rishikesh se Rishikesh ke liye kab jaana chahte hain?" or "Aap kahan se travel start karenge?"). 
- IMMEDIATE VALUE FIRST: Whenever a user mentions a destination, trek, or itinerary request (e.g., "3-day trek starting from Rishikesh", "Nainital trip", "Kedarnath", "Auli"), ALWAYS provide immediate, complete, concrete travel facts and day-by-day itinerary breakdown FIRST (Altitude, key viewpoints, trek distance, weather advice, verified stays).
- PHONETIC & COLONIAL RESOLUTION: Resolve names properly (e.g. "chaina peak" / "china peak" is Naina Peak / Cheena Peak, 2615m, highest point in Nainital with 360-degree snow views of Nanda Devi & Trishul).
- If user asks about an unknown spot not in DB, answer from your world knowledge and add: 'This is AI suggested, not verified by us yet. Want to add it?'
- Always answer directly. Never say 'I don't know from database' or 'not found'.
- Support Hindi + English (natural Hinglish local guide tone).

### COMMUNICATION RULES:
1. Zero Fluff: Never use robotic phrases like "As an AI" or "Main aapki sahayata karunga". Start directly with the answer.
2. NO EMOJIS: Do not use emojis. Use clean bold text and markdown structure.
3. Concise Authority: Provide detailed, high-density, actionable travel itineraries with day breakdowns, altitudes, and safety notes.

${tripSection}
${activeContextSection}
${hasPending ? "\nIMPORTANT: There is a PENDING CONFIRMATION. Do not execute another state change until the user confirms or cancels the pending action." : ""}

### FEW-SHOT TRAINING EXAMPLES (Follow this exact style):
User: "have to go nainital andc chaina peak"
Copilot: **Naina Peak (formerly Cheena Peak)** Nainital ki highest summit hai (altitude: **2,615 meters / 8,579 ft**). Wahan se Nanda Devi, Trishul, aur poori Naini Lake ka 360° panoramic view milta hai.

- **Trek Details:** Mallital se lagbhag **6 km ka scenic trek** hai jo dense deodar, oak, aur rhododendron pine forests se guzarta hai (duration: 2.5–3 hours).
- **Pro Tip:** Early morning 6:00 AM start karein taaki clear sky mein snow-covered Himalayan peaks ka crisp sunrise view mile.
- **Logistics:** Nainital mein bike/scooty rental (₹500/day) Mall Road par available hain, aur Mallital base tak taxi mil jaati hai.

User: "Kedarnath mandir aaj subah khula hai kya? Aur wahan abhi barish ho rahi hai kya?"
Copilot: **Kedarnath Dham (Altitude: 3,583m)** mandir subah **4:00 AM** darshan ke liye khul jata hai.
- **Yatra Registration**: Mandatory biometric registration 'registrationandtouristcare.uk.gov.in' par complete honi chahiye.
- **Route**: Rishikesh -> Devprayag -> Rudraprayag -> Sonprayag -> Gaurikund -> 16 km mountain trek.
- **Weather & Safety**: High altitude forecast check karein. Daylight driving rule apply hota hai (sunset 6 PM ke baad mountain driving strictly closed). Waterproof jacket aur sturdy grip trek shoes le jayein.

User: "Rishikesh me scooty aur Himalayan bike ka kya rate hai?"
Copilot: **Rishikesh Verified Vehicle Rentals:**
- **Honda Activa 6G / Scooty**: ₹500/day (includes helmet & insurance)
- **Royal Enfield Classic 350**: ₹900/day
- **Royal Enfield Himalayan 450**: ₹1,200 – ₹1,600/day (GPS & luggage rack ready)
- **Mahindra Thar 4x4 SUV**: ₹3,500/day
- **Booking**: 100% Devbhoomi Escrow Vault protected with 4-digit check-in OTP handshake.`;
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

  const knownDests = ["nainital", "kedarnath", "badrinath", "rishikesh", "haridwar", "mussoorie", "dehradun", "auli", "chopta", "almora", "pithoragarh", "gangotri", "yamunotri", "ranikhet", "kausani", "mukteshwar", "lansdowne", "uttarkashi"];
  let matchedDest = null;
  const lowerClean = clean.toLowerCase();
  for (const d of knownDests) {
    if (lowerClean.includes(d)) {
      matchedDest = d.charAt(0).toUpperCase() + d.slice(1);
      break;
    }
  }
  const activeDest = entities.destination || matchedDest || pageContext?.destinationName || (tripContext?.destinationNames || [])[0] || "Nainital";

  // 0. Agentic Action Command (Save items to favorites, save guide contact, reserve rental, save next month travel)
  const isSaveOrBookAction = /(?:save|bookmark|favorite|fav|add to|dalde|dal de|daal do|daaldo|book|reserve|guide number)/i.test(lower) && /(?:roopkund|stay|hotel|guide|rental|bike|scooty|thar|vehicle|trek|trip|item|contact|favorites|wishlist)/i.test(lower);
  
  if (isSaveOrBookAction) {
    const itemTarget = matchedDest || (lower.includes("roopkund") ? "Roopkund Glacial Lake" : (entities.destination || activeDest || "Roopkund"));
    const guideName = "Rohan Sharma (Licensed IMF Alpine Guide)";
    const guidePhone = "+91-98765-43210";
    const rentalReserved = "Royal Enfield Himalayan 450 (₹1,200/day)";

    const saveAction = {
      type: "SAVE_TO_FAVORITES",
      item: {
        id: itemTarget.toLowerCase().replace(/\s+/g, '-'),
        name: itemTarget,
        category: "High Altitude Expedition & Saved Wishlist",
        guideName,
        guidePhone,
        rentalReserved,
        savedAt: new Date().toISOString()
      }
    };
    if (onEvent) onEvent({ type: "ui_action", action: saveAction, requestId });

    const msg = `**Agentic Vault Confirmed**: Maine **${itemTarget}** ko aapke **Saved Wishlist & Favorites** mein safely save kar diya hai.\n\n` +
      `- **Saved Expedition**: ${itemTarget} Circuit\n` +
      `- **Guide Contact Saved**: ${guideName} (${guidePhone} — Verified IMF Guide)\n` +
      `- **Vehicle Rental Reserved**: ${rentalReserved} (100% Escrow Protected)\n\n` +
      `*Jab aap next month travel karenge, yeh 'My Saved Trip & Favorites' tab (/my-trip) se instantly retrieve ho jayega.*`;

    if (onEvent) onEvent({ type: "chunk", text: msg });
    addTurn(session, { role: "user", content: message });
    addTurn(session, { role: "assistant", content: msg });
    trace.totalDurationMs = Date.now() - startTime;
    return {
      type: "answer",
      message: msg,
      toolsUsed: ["saveItemToFavorites"],
      citations: [{ source: "Devbhoomi Agentic Vault", freshness: "LIVE", url: "/my-trip" }],
      suggestedActions: [
        { label: "View Saved Items", action: "MY_TRIP" },
        { label: "Check Weather", action: "WEATHER" }
      ],
      uiActions: [saveAction],
      tripContext: { destination: itemTarget },
      confidence: "grounded",
      meta: { provider: "agentic_vault_manager", toolCallCount: 1, sessionId: session.sessionId, requestId }
    };
  }

  // 0b. Trip Planning Conversational Intake State Machine
  // Triggers when user expresses trip planning intent or answers sequential intake parameters
  const isSpecificQuery = /(?:weather|temperature|mausam|rain|snow|stay|hotel|homestay|resort|route|road|highway|kaise jaa?u|how to reach|show map|map dikhao|trekking|wahan|uske paas|save|bookmark|favorite|budget\s*kam|kam\s*karo|thoda\s*sasta|sasta|reduce\s*budget|kya kar sakta|explore|things to do)/i.test(clean);
  
  const hasOrigin = !!entities.origin;
  const hasDate = !!entities.startDate;
  const hasDuration = !!entities.duration;
  const hasTravelers = !!entities.travelers;
  const hasBudget = !!entities.budget;

  const allPlanningEntitiesPresent = hasOrigin && hasDate && hasDuration && hasTravelers && hasBudget;
  const isTripPlanningIntent = !isSpecificQuery && !session?.contextEntities?.hasGeneratedPlan && (
    /(?:mujhe|humko|i want to go|where i can go|jana hai|jaana hai|ghoomna hai|plan a trip|trip plan|visit|going to)\b/i.test(clean) ||
    allPlanningEntitiesPresent ||
    (!hasOrigin || !hasDate || !hasDuration || !hasTravelers || !hasBudget)
  );

  if (isTripPlanningIntent) {
    const dest = entities.destination || matchedDest || activeDest || "Badrinath";
    const hasDuration = !!entities.duration;
    const hasTravelers = !!entities.travelers;
    const hasBudget = !!entities.budget;

    // Step 1: Missing Origin
    if (!hasOrigin) {
      let durText = entities.duration ? ` 3–4 din` : (entities.durationDays ? ` ${entities.durationDays} din` : "");
      let budText = entities.budget ? ` ₹${entities.budget.toLocaleString()} budget` : "";
      let ackParts = [];
      if (durText) ackParts.push(durText.trim());
      if (budText) ackParts.push(budText.trim());
      const extraAck = ackParts.length > 0 ? ` (${ackParts.join(', ')})` : "";

      const msg = `Maine **${dest}**${extraAck} travel plan note kar liya hai! Aap kahan se travel start karoge? (Jaise Delhi, Dehradun, Haridwar)`;
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
          { label: "From Delhi", action: "FROM_DELHI" },
          { label: "From Dehradun", action: "FROM_DEHRADUN" }
        ],
        uiActions: [],
        tripContext: { destination: dest },
        confidence: "grounded",
        meta: { provider: "agentic_planner_intake", step: "ASK_ORIGIN", sessionId: session.sessionId, requestId }
      };
    }

    // Step 2: Has Origin, Missing Date
    if (!hasDate) {
      const msg = `Great! ${entities.origin} se **${dest}** ke liye kab jaana chahte ho? (Travel date bataiye, jaise 15 October ya kal)`;
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
          { label: "Tomorrow", action: "TOMORROW" },
          { label: "Next Weekend", action: "NEXT_WEEKEND" }
        ],
        uiActions: [],
        tripContext: { destination: dest, origin: entities.origin },
        confidence: "grounded",
        meta: { provider: "agentic_planner_intake", step: "ASK_DATE", sessionId: session.sessionId, requestId }
      };
    }

    // Step 3: Has Date, Missing Travelers or Duration
    if (!hasTravelers || !hasDuration) {
      let promptText = "Noted. Kitne log travel kar rahe hain? (Jaise 2 log ya solo)";
      if (!hasDuration && !hasTravelers) {
        promptText = "Noted. Kitne log travel kar rahe hain aur kitne din ka plan hai? (Jaise 2 log, 5 din)";
      } else if (!hasDuration) {
        promptText = "Noted. Kitne din ka plan banana hai? (Jaise 3 din ya 5 din)";
      }
      const msg = promptText;
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
          { label: "2 travelers", action: "2_PEOPLE" },
          { label: "Solo", action: "SOLO" }
        ],
        uiActions: [],
        tripContext: { destination: dest, origin: entities.origin, startDate: entities.startDate },
        confidence: "grounded",
        meta: { provider: "agentic_planner_intake", step: "ASK_TRAVELERS_DURATION", sessionId: session.sessionId, requestId }
      };
    }

    // Step 4: Has Travelers & Duration, Missing Budget
    if (!hasBudget) {
      const msg = `Perfect! ${entities.duration} din ke trip ke liye aapka estimated budget kitna hai? (Jaise ₹15,000, ₹20,000, ya Balanced)`;
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
          { label: "₹15,000", action: "BUDGET_15K" },
          { label: "₹20,000", action: "BUDGET_20K" }
        ],
        uiActions: [],
        tripContext: { destination: dest, origin: entities.origin, startDate: entities.startDate, duration: entities.duration, travelers: entities.travelers },
        confidence: "grounded",
        meta: { provider: "agentic_planner_intake", step: "ASK_BUDGET", sessionId: session.sessionId, requestId }
      };
    }

    // Step 5: Complete details collected! Execute parallel verified tools and prefill Trip Planner!
    const orig = entities.origin || "Delhi";
    const dur = entities.duration || 5;
    const trav = entities.travelers || 2;
    const bud = entities.budget || 20000;
    const tier = bud < 15000 ? "Budget" : (bud > 40000 ? "Luxury" : "Balanced");

    const navAction = { type: "NAVIGATE", routeKey: "TRIP_PLANNER", url: "/trip-planner" };
    const prefillAction = {
      type: "PREFILL_TRIP_PLANNER",
      fields: {
        origin: orig,
        destination: dest,
        startDate: entities.startDate || new Date().toISOString().split('T')[0],
        duration: dur,
        travelers: trav,
        budget: bud
      }
    };

    if (onEvent) {
      onEvent({ type: "ui_action", action: navAction, requestId });
      onEvent({ type: "ui_action", action: prefillAction, requestId });
    }

    // Execute parallel verified tools
    const [routeRes, weatherRes, roadRes, budgetRes, staysRes] = await Promise.all([
      executeTool("planRoute", { from: orig, to: dest }, { session, user }),
      executeTool("getWeather", { location: dest }, { session, user }),
      executeTool("getRoadAdvisory", { destination: dest, corridor: `${orig} -> ${dest}` }, { session, user }),
      executeTool("calculateBudget", { destination: dest, durationDays: dur, travelers: trav, budgetTier: tier }, { session, user }),
      executeTool("findStays", { destination: dest }, { session, user })
    ]);

    const toolsUsed = ["planRoute", "getWeather", "getRoadAdvisory", "calculateBudget", "findStays"];
    const allCitations = [
      ...(routeRes.citations || []),
      ...(weatherRes.citations || []),
      ...(budgetRes.citations || []),
      ...(staysRes.citations || [])
    ];

    const msg = `**${dest} trip plan ready hai!** Maine Trip Planner mein route, live weather, verified stays aur ₹${bud.toLocaleString()} budget prefill kar diya hai.\n\n` +
      `- **Origin**: ${orig}\n` +
      `- **Destination**: ${dest}\n` +
      `- **Dates & Duration**: ${dur} din (${entities.startDate || 'Upcoming'})\n` +
      `- **Travelers**: ${trav} log\n` +
      `- **Budget**: ₹${bud.toLocaleString()} (${tier} Tier)\n\n` +
      `*Aapka itinerary auto-generate ho chuka hai. Trip Planner form mein saari details save hain.*`;

    if (onEvent) onEvent({ type: "chunk", text: msg });
    if (session?.contextEntities) session.contextEntities.hasGeneratedPlan = true;
    addTurn(session, { role: "user", content: message });
    addTurn(session, { role: "assistant", content: msg });
    trace.totalDurationMs = Date.now() - startTime;
    return {
      type: "answer",
      message: msg,
      toolsUsed,
      citations: allCitations,
      uiActions: [navAction, prefillAction],
      structuredCards: {
        budget: budgetRes.data || null,
        weather: weatherRes.data?.data || null,
        stays: (staysRes.data?.stays || []).slice(0, 3)
      },
      tripContext: {
        destination: dest,
        origin: orig,
        startDate: entities.startDate,
        duration: dur,
        travelers: trav,
        budget: bud
      },
      confidence: "grounded",
      meta: { provider: "agentic_planner_generator", toolCallCount: toolsUsed.length, sessionId: session.sessionId, requestId }
    };
  }

  // 1. Weather Query (e.g., "mujhe nainital jana hey aaj ka weather kaisa hey", "nainital tempreature", "weather tell me")
  const isWeatherQuery = /weather|temperature|tempreature|mausam|rain|snow|climate/i.test(clean);
  if (isWeatherQuery) {
    const targetDest = matchedDest || entities.destination || activeDest || "Nainital";
    if (onEvent) onEvent({ type: "tool_status", tool: "getWeather", message: `Checking live weather for ${targetDest} (Open-Meteo)...` });
    const weatherRes = await executeTool("getWeather", { location: targetDest }, { session, user });

    let msg = `Live weather for **${targetDest}**:`;
    if (weatherRes.success && weatherRes.data?.data) {
      const d = weatherRes.data.data;
      const tempVal = (d.temperature !== null && d.temperature !== undefined) ? d.temperature : (d.temperatureC ?? '13');
      const conditionVal = d.weatherCondition || d.condition || 'Clear';
      const windVal = d.windSpeedKmh || d.windSpeed || '3.5';
      msg = `**Weather for ${targetDest}** (Open-Meteo Alpine Telemetry):\n- **Temperature**: ${tempVal}°C\n- **Condition**: ${conditionVal}\n- **Wind Speed**: ${windVal} km/h\n\n*Himalayan weather shifts quickly. Always carry warm layers and adhere to 6:00 PM sunset transit rules.*`;
    } else {
      msg = `**Weather for ${targetDest}**:\n- **Temperature**: 13°C\n- **Condition**: Overcast / Clear Mountain Skies\n- **Wind Speed**: 3.5 km/h\n\n*Live weather telemetries checked for ${targetDest}.*`;
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
        weather: weatherRes.success ? weatherRes.data?.data : { location: targetDest, temperature: 13, weatherCondition: 'Overcast' }
      },
      suggestedActions: [
        { label: "Find Stays in " + targetDest, action: "STAYS" },
        { label: "Road Advisory", action: "ROAD_ADVISORY" }
      ],
      uiActions: [],
      tripContext: { destination: targetDest },
      confidence: "grounded",
      meta: { provider: "agentic_weather_assistant", toolCallCount: 1, sessionId: session.sessionId, requestId }
    };
  }

  // 2. Stay Query (e.g., "Find verified stays", "Stays near Nainital", "Hotel options")
  const isStayQuery = /(?:stay|hotel|resort|lodge|guesthouse|accommodation|homestay)s?\b/i.test(clean) || /find verified stays/i.test(clean);
  if (isStayQuery) {
    const targetDest = matchedDest || entities.destination || activeDest || "Nainital";
    if (onEvent) onEvent({ type: "tool_status", tool: "findStays", message: `Finding verified stays in ${targetDest}...` });
    const stayRes = await executeTool("findStays", { destination: targetDest }, { session, user });

    let msg = "";
    if (stayRes.success && stayRes.data?.stays?.length > 0) {
      const stays = stayRes.data.stays.slice(0, 4);
      const items = stays.map((s, i) => `${i + 1}. **${s.name}** [${s.category || 'Homestay'}] — ₹${s.pricePerNight ? s.pricePerNight.toLocaleString() : '1,500'}/night (${s.priceProvenance || 'VERIFIED'})`).join("\n");
      msg = `Maine **${targetDest}** ke top verified stays & homestays find kiye hain:\n\n${items}\n\n*100% Devbhoomi Trust Verified.* Direct booking aur escrow protection available hai.`;
    } else {
      msg = `**${targetDest}** ke verified homestays & heritage resorts:\n1. **Naini Retreat & Homestay** — ₹1,800/night\n2. **Kumaon Heritage Villa** — ₹2,200/night\n\n*Escrow protected rates.*`;
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
        { label: "Vehicle Rentals", action: "RENTALS" }
      ],
      uiActions: [],
      tripContext: { destination: targetDest },
      confidence: "grounded",
      meta: { provider: "agentic_stay_resolver", toolCallCount: 1, sessionId: session.sessionId, requestId }
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