import Stay from "../../models/Stay.js";
import { HOMESTAYS_DB } from "../retrieval/destinationStore.js";

export async function searchStays({ location = "", maxPrice = null }) {
  const loc = String(location || "").trim();

  try {
    const filter = { status: { $ne: "inactive" } };
    if (loc) {
      const rx = new RegExp(loc, "i");
      filter.$or = [
        { name: rx },
        { city: rx },
        { district: rx },
        { address: rx }
      ];
    }
    if (maxPrice) {
      const pMax = Number(maxPrice);
      filter.$or = [
        { "price.amount": { $lte: pMax } },
        { pricePerNight: { $lte: pMax } }
      ];
    }

    const docs = await Stay.find(filter).limit(20).lean();
    if (docs && docs.length > 0) {
      return {
        found: true,
        count: docs.length,
        stays: docs
      };
    }
  } catch (err) {
    // DB query fallback
  }

  const lowerLoc = loc.toLowerCase();
  let matches = HOMESTAYS_DB.filter((stay) => {
    if (!lowerLoc) return true;
    return stay.location.toLowerCase().includes(lowerLoc) ||
           stay.district.toLowerCase().includes(lowerLoc) ||
           stay.name.toLowerCase().includes(lowerLoc);
  });

  return {
    found: matches.length > 0,
    count: matches.length,
    stays: matches.length > 0 ? matches : HOMESTAYS_DB
  };
}
