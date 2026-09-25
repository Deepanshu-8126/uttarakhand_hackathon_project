import { HOMESTAYS_DB } from "../retrieval/destinationStore.js";

export async function searchStays({ location = "", maxPrice = null }) {
  const loc = String(location).toLowerCase().trim();

  let matches = HOMESTAYS_DB.filter((stay) => {
    if (!loc) return true;
    return stay.location.toLowerCase().includes(loc) ||
           stay.district.toLowerCase().includes(loc) ||
           stay.name.toLowerCase().includes(loc);
  });

  return {
    found: matches.length > 0,
    count: matches.length,
    stays: matches.length > 0 ? matches : HOMESTAYS_DB
  };
}
