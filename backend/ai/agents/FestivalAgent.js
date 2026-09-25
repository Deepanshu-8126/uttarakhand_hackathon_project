import { AGENT_PERSONAS } from "../prompts/systemPrompts.js";

export class FestivalAgent {
  static name = "FestivalAgent";
  static description = "Specialist in Uttarakhand cultural fairs, festivals, Pahari folk traditions, and local rituals.";

  static async handle(query, context, emitThinking) {
    emitThinking("Consulting Uttarakhand cultural calendar and festival almanac...");

    const festivals = [
      { name: "Phool Dei", season: "Spring (Mid-March)", significance: "Festival of flowers where young girls place first spring blossoms on village doorsteps.", region: "All Uttarakhand" },
      { name: "Harela", season: "Monsoon (Mid-July)", significance: "Agricultural thanksgiving marking greenery, peace, and new crop sowing.", region: "Kumaon & Garhwal" },
      { name: "Ganga Dussehra", season: "May - June (Jyeshtha)", significance: "Celebrates the descent of holy Ganga to earth. Major celebrations at Har Ki Pauri, Haridwar.", region: "Haridwar & Rishikesh" },
      { name: "Nanda Devi Mahotsav", season: "September (Bhadrapada)", significance: "Veneration of goddess Nanda Devi, patron deity of Uttarakhand.", region: "Almora & Nanda Devi Biosphere" },
      { name: "International Yoga Festival", season: "First week of March", significance: "Global convergence of spiritual masters, yogis, and seekers.", region: "Rishikesh" }
    ];

    return {
      agent: FestivalAgent.name,
      toolsUsed: [],
      data: { festivals },
      systemPrompt: AGENT_PERSONAS.FESTIVAL,
      suggestions: [
        "What is the significance of Phool Dei?",
        "When is the next Ganga Dussehra in Haridwar?",
        "Authentic Pahari dishes to try during Harela",
        "Plan a cultural trip around Uttarakhand festivals"
      ]
    };
  }
}
