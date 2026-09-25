import { searchDestinations } from "./searchDestinations.js";
import { searchStays } from "./searchStays.js";
import { searchRentals } from "./searchRentals.js";
import { searchActivities } from "./searchActivities.js";
import { buildItinerary } from "./buildItinerary.js";
import { calculateBudget } from "./calculateBudget.js";
import { weatherTool } from "./weatherTool.js";

export const TOOL_REGISTRY = {
  search_destinations: searchDestinations,
  search_stays: searchStays,
  search_rentals: searchRentals,
  search_activities: searchActivities,
  build_itinerary: buildItinerary,
  calculate_budget: calculateBudget,
  get_weather: weatherTool
};

export async function executeAiTool(toolName, args = {}) {
  const handler = TOOL_REGISTRY[toolName];
  if (!handler) {
    return { error: `Tool ${toolName} not found in registry` };
  }
  try {
    return await handler(args);
  } catch (err) {
    return { error: `Tool execution failed: ${err.message}` };
  }
}
