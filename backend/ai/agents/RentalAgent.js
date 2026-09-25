import { AGENT_PERSONAS } from "../prompts/systemPrompts.js";
import { executeAiTool } from "../tools/index.js";

export class RentalAgent {
  static name = "RentalAgent";
  static description = "Specialist in bike rentals (Royal Enfield Himalayan), 4x4 self-drive, cabs, and mountain gear.";

  static async handle(query, context, emitThinking) {
    emitThinking("Scanning verified fleet providers in Rishikesh, Dehradun, and Haridwar...");
    const origin = context.entities.origin || "Rishikesh";
    const rentals = await executeAiTool("search_rentals", { location: origin });

    return {
      agent: RentalAgent.name,
      toolsUsed: ["search_rentals"],
      data: { rentals, hub: origin },
      systemPrompt: AGENT_PERSONAS.RENTAL,
      suggestions: [
        `Book Royal Enfield Himalayan 450 in ${origin}`,
        `Documents required for bike rental in Uttarakhand`,
        `Self-drive 4x4 rates for Char Dham`,
        `Plan a bike road trip route from ${origin}`
      ]
    };
  }
}
