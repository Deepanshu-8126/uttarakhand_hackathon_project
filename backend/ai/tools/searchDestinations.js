import Destination from "../../models/Destination.js";
import { DESTINATIONS_DB } from "../retrieval/destinationStore.js";

export async function searchDestinations({ query = "", region = "", maxAltitude = null }) {
  const q = String(query || "").trim();
  const reg = String(region || "").trim();

  try {
    const filter = {};
    if (q) {
      const rx = new RegExp(q, "i");
      filter.$or = [
        { name: rx },
        { district: rx },
        { category: rx },
        { highlights: rx },
        { experiences: rx },
        { description: rx }
      ];
    }
    if (reg) {
      filter.region = new RegExp(reg, "i");
    }

    const docs = await Destination.find(filter).limit(20).lean();
    if (docs && docs.length > 0) {
      return {
        found: true,
        count: docs.length,
        destinations: docs
      };
    }
  } catch (err) {
    // If DB query fails or uninitialized, proceed to fallback
  }

  let matches = DESTINATIONS_DB.filter((d) => {
    let match = true;
    if (q) {
      const lower = q.toLowerCase();
      match = d.name.toLowerCase().includes(lower) ||
              d.district.toLowerCase().includes(lower) ||
              d.category.toLowerCase().includes(lower) ||
              d.highlights.some(h => h.toLowerCase().includes(lower));
    }
    if (reg && match) {
      match = d.region.toLowerCase().includes(reg.toLowerCase());
    }
    if (maxAltitude && match) {
      match = d.altitudeMeters <= Number(maxAltitude);
    }
    return match;
  });

  if (matches.length === 0 && q) {
    const lower = q.toLowerCase();
    matches = DESTINATIONS_DB.filter(d => 
      lower.split(" ").some(word => word.length > 3 && d.name.toLowerCase().includes(word))
    );
  }

  return {
    found: matches.length > 0,
    count: matches.length,
    destinations: matches.length > 0 ? matches : DESTINATIONS_DB.slice(0, 3)
  };
}
