import { AGENT_PERSONAS } from "../prompts/systemPrompts.js";
import { executeAiTool } from "../tools/index.js";

export class PlannerAgent {
  static name = "PlannerAgent";
  static description = "Specialist in building day-by-day itineraries, mountain transit pacing, and scenic stops.";

  static async handle(query, context, emitThinking) {
    emitThinking("Analyzing mountain terrain, driving hours, and daylight safety...");
    const dest = context.entities.destination || "Kedarnath";
    const days = parseInt(context.entities.duration) || 3;
    const origin = context.entities.origin || "Delhi";

    emitThinking(`Generating ${days}-day optimized route for ${dest} from ${origin}...`);
    const itinerary = await executeAiTool("build_itinerary", { destination: dest, days, origin });
    const weather = await executeAiTool("get_weather", { destination: dest });

    return {
      agent: PlannerAgent.name,
      toolsUsed: ["build_itinerary", "get_weather"],
      data: { itinerary, weather },
      systemPrompt: AGENT_PERSONAS.PLANNER,
      suggestions: [
        `Calculate budget for this ${dest} trip`,
        `Check homestays in ${dest}`,
        `Altitude safety precautions for ${dest}`,
        `Find bike or taxi rentals from ${origin}`
      ]
    };
  }
}
