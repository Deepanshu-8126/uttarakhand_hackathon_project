import { AGENT_PERSONAS } from "../prompts/systemPrompts.js";
import { executeAiTool } from "../tools/index.js";

export class DestinationAgent {
  static name = "DestinationAgent";
  static description = "Specialist in Uttarakhand destinations, treks, heritage, temples, and altitude exploration.";

  static async handle(query, context, emitThinking) {
    emitThinking("Searching destination knowledge base and regional maps...");
    const dest = context.entities.destination || query;

    const destinations = await executeAiTool("search_destinations", { query: dest });
    emitThinking("Fetching live mountain weather and current conditions...");
    const weather = await executeAiTool("get_weather", { destination: dest });

    return {
      agent: DestinationAgent.name,
      toolsUsed: ["search_destinations", "get_weather"],
      data: { destinations, weather },
      systemPrompt: AGENT_PERSONAS.DESTINATION,
      suggestions: [
        `Plan a 3-day itinerary for ${dest}`,
        `Find verified homestays in ${dest}`,
        `What are the safety guidelines for ${dest}?`,
        `Estimated travel cost for ${dest}`
      ]
    };
  }
}
