import { DESTINATIONS_DB } from "../retrieval/destinationStore.js";

export async function searchDestinations({ query = "", region = "", maxAltitude = null }) {
  const q = String(query).toLowerCase().trim();
  const reg = String(region).toLowerCase().trim();

  let matches = DESTINATIONS_DB.filter((d) => {
    let match = true;
    if (q) {
      match = d.name.toLowerCase().includes(q) ||
              d.district.toLowerCase().includes(q) ||
              d.category.toLowerCase().includes(q) ||
              d.highlights.some(h => h.toLowerCase().includes(q));
    }
    if (reg && match) {
      match = d.region.toLowerCase().includes(reg);
    }
    if (maxAltitude && match) {
      match = d.altitudeMeters <= Number(maxAltitude);
    }
    return match;
  });

  if (matches.length === 0 && q) {
    // Partial fuzzy search
    matches = DESTINATIONS_DB.filter(d => 
      q.split(" ").some(word => word.length > 3 && d.name.toLowerCase().includes(word))
    );
  }

  return {
    found: matches.length > 0,
    count: matches.length,
    destinations: matches.length > 0 ? matches : DESTINATIONS_DB.slice(0, 3)
  };
}
