import { AGENT_PERSONAS } from "../prompts/systemPrompts.js";
import { executeAiTool } from "../tools/index.js";

export class SafetyAgent {
  static name = "SafetyAgent";
  static description = "Specialist in Himalayan altitude safety, AMS medical precautions, emergency SOS, and weather.";

  static async handle(query, context, emitThinking) {
    emitThinking("Checking altitude elevation, AMS thresholds, and SDRF mountain protocols...");
    const dest = context.entities.destination || "Kedarnath";

    const destinations = await executeAiTool("search_destinations", { query: dest });
    const weather = await executeAiTool("get_weather", { destination: dest });

    const matchedDest = destinations.destinations?.[0] || {};
    const altitude = matchedDest.altitudeMeters || 3584;

    const safetyProtocol = {
      altitudeMeters: altitude,
      amsRisk: altitude > 3200 ? "HIGH RISK" : (altitude > 2500 ? "MODERATE RISK" : "LOW RISK"),
      emergencyNumbers: {
        police: "112",
        sdrfUttarakhand: "+91 94565 96190",
        disasterManagement: "1070 / 1077",
        ambulance: "108"
      },
      criticalPrecautions: [
        "Drink 4-5 liters of water daily to prevent altitude hypoxia.",
        "Ascend gradually: do not gain more than 500m of sleeping altitude per day above 3,000m.",
        "Carry Diamox (Acetazolamide 250mg) after consulting a medical professional.",
        "Immediately descend if suffering from persistent headache, vomiting, or loss of balance."
      ]
    };

    return {
      agent: SafetyAgent.name,
      toolsUsed: ["search_destinations", "get_weather"],
      data: { safetyProtocol, destination: matchedDest, weather },
      systemPrompt: AGENT_PERSONAS.SAFETY,
      suggestions: [
        `What are the first signs of AMS in ${dest}?`,
        `Where is the nearest hospital/clinic to ${dest}?`,
        `Check current live weather in ${dest}`,
        `Find verified homestays with heating in ${dest}`
      ]
    };
  }
}
