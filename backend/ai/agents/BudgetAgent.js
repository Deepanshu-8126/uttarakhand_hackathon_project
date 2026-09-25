import { AGENT_PERSONAS } from "../prompts/systemPrompts.js";
import { executeAiTool } from "../tools/index.js";

export class BudgetAgent {
  static name = "BudgetAgent";
  static description = "Specialist in Uttarakhand trip budgeting, cost breakdowns, and economic planning.";

  static async handle(query, context, emitThinking) {
    emitThinking("Analyzing mountain rate cards, stay tariffs, and transit costs...");
    const dest = context.entities.destination || "Kedarnath";
    const days = parseInt(context.entities.duration) || 3;
    const travelers = context.entities.travelers || 2;
    const tier = context.entities.tier || "moderate";

    const budget = await executeAiTool("calculate_budget", { destination: dest, days, travelers, tier });
    const stays = await executeAiTool("search_stays", { location: dest });

    return {
      agent: BudgetAgent.name,
      toolsUsed: ["calculate_budget", "search_stays"],
      data: { budget, stays },
      systemPrompt: AGENT_PERSONAS.BUDGET,
      suggestions: [
        `How can I reduce budget for ${dest}?`,
        `Show budget homestays in ${dest}`,
        `Build a ${days}-day itinerary within this budget`,
        `Compare bike rental vs shared taxi costs`
      ]
    };
  }
}
