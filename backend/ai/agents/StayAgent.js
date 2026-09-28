import { AGENT_PERSONAS } from "../prompts/systemPrompts.js";
import { executeAiTool } from "../tools/index.js";

export class StayAgent {
  static name = "StayAgent";
  static description = "Specialist in verified Pahadi homestays, riverside camps, GMVN retreats, and local host connections.";

  static async handle(query, context, emitThinking) {
    emitThinking("Scanning verified Pahadi homestays in database and local host networks...");
    const dest = context.entities.destination || "";
    const staysResult = await executeAiTool("search_stays", { location: dest, query });

    return {
      agent: StayAgent.name,
      toolsUsed: ["search_stays"],
      data: { stays: staysResult.stays, query },
      systemPrompt: AGENT_PERSONAS.STAY || AGENT_PERSONAS.DESTINATION,
      suggestions: [
        "Homestay contact & booking",
        "Pahadi local organic meals info",
        "Rent bike nearby",
        "Trek route & weather"
      ]
    };
  }
}
