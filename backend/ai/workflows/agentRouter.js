/**
 * Devbhoomi Conversational AI - Agent Router & Workflow Orchestrator
 * Inspired by langchain-ai/agent-chat-ui & voice-demo
 */

import { ConversationMemory } from "../memory/conversationMemory.js";
import { PlannerAgent } from "../agents/PlannerAgent.js";
import { DestinationAgent } from "../agents/DestinationAgent.js";
import { BudgetAgent } from "../agents/BudgetAgent.js";
import { SafetyAgent } from "../agents/SafetyAgent.js";
import { RentalAgent } from "../agents/RentalAgent.js";
import { FestivalAgent } from "../agents/FestivalAgent.js";
import { StayAgent } from "../agents/StayAgent.js";
import { GroqProvider } from "../../services/ai/providers/GroqProvider.js";
import { GeminiProvider } from "../../services/ai/providers/GeminiProvider.js";

const AGENT_MAP = {
  PlannerAgent,
  DestinationAgent,
  BudgetAgent,
  SafetyAgent,
  RentalAgent,
  FestivalAgent,
  StayAgent
};

export class AgentRouter {
  /**
   * Classify user query intent into the best specialized agent
   */
  static routeIntent(queryText) {
    const q = String(queryText || "").toLowerCase();

    // 1. Homestays & Stays
    if (/stay|homestay|hotel|resort|dharamshala|ashram|room|lodge|tent|camp|hostel|cottage|night/i.test(q)) {
      return StayAgent;
    }
    // 2. Safety & Altitude
    if (/ams|altitude|oxygen|height|safe|danger|doctor|hospital|headache|breathe|sickness|emergency|sos|police|sdrf/i.test(q)) {
      return SafetyAgent;
    }
    // 3. Budget & Costs
    if (/budget|cost|price|kharcha|rupaye|rate|how much|inexpensive|cheap|luxury|tariff|expense/i.test(q)) {
      return BudgetAgent;
    }
    // 4. Rentals & Vehicles
    if (/bike|rental|rent|car|scooty|enfield|himalayan|thar|taxi|cab|driver|jeep|gear/i.test(q)) {
      return RentalAgent;
    }
    // 5. Festivals & Culture
    if (/festival|phool dei|harela|ganga dussehra|mela|tradition|ritual|culture|food|cuisine|pahari/i.test(q)) {
      return FestivalAgent;
    }
    // 6. Itinerary & Trip Planning
    if (/plan|itinerary|days|schedule|trip|route|tour|guide|day 1|day 2|acclimatiz/i.test(q)) {
      return PlannerAgent;
    }
    // 7. Default to Destination Exploration
    return DestinationAgent;
  }

  /**
   * Run the multi-agent conversational pipeline with SSE streaming support
   */
  static async processChatStream({ message, sessionId, userId = null, res = null }) {
    const session = await ConversationMemory.getSession(sessionId, userId);
    const newEntities = ConversationMemory.extractEntities(message, session.entities);
    session.entities = newEntities;

    const thinkingSteps = [];
    const emitEvent = (eventType, payload) => {
      if (res && !res.writableEnded) {
        res.write(`event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`);
      }
    };

    const emitThinking = (thought) => {
      thinkingSteps.push({ step: thinkingSteps.length + 1, thought, timestamp: Date.now() });
      emitEvent("thinking", { thought, steps: thinkingSteps });
    };

    // Step 1: Route to specialized agent
    emitThinking("Analyzing user intent and consulting Devbhoomi multi-agent router...");
    const SelectedAgent = this.routeIntent(message);
    emitThinking(`Delegating task to ${SelectedAgent.name}: ${SelectedAgent.description}`);

    emitEvent("agent_assigned", { agent: SelectedAgent.name });

    // Step 2: Agent handles query and tool executions
    const agentResult = await SelectedAgent.handle(
      message,
      { entities: session.entities, history: session.history },
      emitThinking
    );

    emitEvent("tools_executed", { tools: agentResult.toolsUsed, data: agentResult.data });

    // Step 3: Synthesize conversational reply
    emitThinking("Synthesizing authoritative, grounded Himalayan response...");

    let synthesizedText = "";
    try {
      const systemPrompt = `${agentResult.systemPrompt}\n\nGrounding Data:\n${JSON.stringify(agentResult.data, null, 2)}\n\nContext Entities:\n${JSON.stringify(session.entities)}`;
      const messagesForLlm = [
        ...session.history.slice(-4).map(h => ({
          role: h.role === "assistant" ? "assistant" : "user",
          content: h.content || ""
        })),
        { role: "user", content: message }
      ];

      if (process.env.GROQ_API_KEY && process.env.GROQ_ENABLED !== 'false') {
        const groq = new GroqProvider();
        const res = await groq.chat(systemPrompt, messagesForLlm, []);
        synthesizedText = res.text || "";
      } else if (process.env.GEMINI_API_KEY) {
        const gemini = new GeminiProvider();
        const res = await gemini.chat(systemPrompt, messagesForLlm, []);
        synthesizedText = res.text || "";
      }
    } catch (llmErr) {
      console.warn('[AgentRouter] LLM synthesis warning:', llmErr.message);
      synthesizedText = "";
    }

    if (!synthesizedText) {
      // Deterministic authoritative synthesis if LLM fails
      synthesizedText = this.buildDeterministicSynthesis(SelectedAgent.name, agentResult, message);
    }

    // Stream out words if SSE is active
    if (res && !res.writableEnded) {
      const tokens = synthesizedText.split(/(?<=\s)/);
      for (const token of tokens) {
        emitEvent("token", { delta: token, token: token, text: token });
      }
    }

    // Step 4: Save turn to memory
    await ConversationMemory.saveTurn(session.sessionId, message, synthesizedText, session.entities, userId);

    const finalPayload = {
      message: synthesizedText,
      agent: SelectedAgent.name,
      toolsUsed: agentResult.toolsUsed,
      data: agentResult.data,
      suggestions: agentResult.suggestions,
      thinkingSteps,
      entities: session.entities,
      sessionId: session.sessionId
    };

    emitEvent("message", finalPayload);
    emitEvent("done", { status: "completed" });

    if (res && !res.writableEnded) {
      res.end();
    }

    return finalPayload;
  }

  static buildDeterministicSynthesis(agentName, agentResult, query) {
    if (agentName === "SafetyAgent") {
      const sp = agentResult.data.safetyProtocol;
      return `### 🏔️ Mountain Altitude & Safety Advisory
**Altitude**: ${sp.altitudeMeters}m | **AMS Risk**: **${sp.amsRisk}**

**Critical Guidelines:**
${sp.criticalPrecautions.map(p => `- ${p}`).join("\n")}

**Emergency Contacts:**
- Police / Disaster SOS: **112**
- SDRF Uttarakhand: **+91 94565 96190**
- Medical Ambulance: **108**`;
    }

    if (agentName === "PlannerAgent") {
      const itin = agentResult.data.itinerary;
      return `### 🗓️ Recommended ${itin.durationDays}-Day Itinerary for ${itin.destination}
**Origin:** ${itin.origin} | **Safety:** ${itin.safetyRule}

${itin.dailyPlan.map(d => `**Day ${d.day}: ${d.title}** (${d.altitude})\n- *Travel Time*: ${d.travelTime}\n- *Highlights*: ${d.activity}`).join("\n\n")}`;
    }

    if (agentName === "BudgetAgent") {
      const b = agentResult.data.budget;
      return `### 💰 Estimated Trip Budget (${b.destination})
**Total for ${b.travelers} Traveler(s) for ${b.durationDays} Days:** **${b.totalEstimatedINR}** (~${b.perPersonINR}/person)

- **Stays**: ${b.breakdown.stays}
- **Transport**: ${b.breakdown.transport}
- **Food**: ${b.breakdown.food}
- **Activities & Permits**: ${b.breakdown.permitsAndActivities}
- **Emergency Mountain Buffer**: ${b.breakdown.emergencyMountainBuffer}`;
    }

    if (agentName === "StayAgent") {
      const stays = agentResult.data?.stays || [];
      if (stays.length > 0) {
        return `### 🏡 Verified Pahadi Homestays & Mountain Stays
Here are top-rated, host-verified mountain homestays matching your request:

${stays.slice(0, 4).map(s => `**${s.name}** (${s.location}, ${s.district})
- **Tariff**: **${s.pricePerNight}/night**
- **Amenities**: ${s.amenities.join(", ")}
- **Host Contact**: \`${s.contact}\``).join("\n\n")}

**Pahadi Hospitality Note**: All homestays serve fresh organic Kumaoni / Garhwali food (Mandua roti, Pahadi dal) and are verified by Devbhoomi ground coordinators.`;
      }
    }

    return `### 🌲 Devbhoomi Guide
Here is the verified information for your journey in Uttarakhand. Please let me know if you would like me to build a detailed itinerary, estimate your budget, or check mountain safety!`;
  }
}
