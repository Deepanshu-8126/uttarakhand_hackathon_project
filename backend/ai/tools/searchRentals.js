import Rental from "../../models/Rental.js";
import { RENTALS_DB } from "../retrieval/destinationStore.js";

export async function searchRentals({ location = "Rishikesh", vehicleType = "" }) {
  const loc = String(location || "").trim();
  const vType = String(vehicleType || "").trim();

  try {
    const filter = {};
    if (loc) {
      const rx = new RegExp(loc, "i");
      filter.$or = [
        { name: rx },
        { city: rx },
        { district: rx },
        { address: rx }
      ];
    }
    if (vType) {
      const rxV = new RegExp(vType, "i");
      const vOr = [
        { "vehicles.type": rxV },
        { "vehicles.name": rxV },
        { category: rxV },
        { type: rxV }
      ];
      filter.$and = filter.$or ? [{ $or: filter.$or }, { $or: vOr }] : [{ $or: vOr }];
      delete filter.$or;
    }

    const docs = await Rental.find(filter).limit(20).lean();
    if (docs && docs.length > 0) {
      return {
        found: true,
        location: location || "Uttarakhand",
        rentals: docs
      };
    }
  } catch (err) {
    // DB query fallback
  }

  const lowerLoc = loc.toLowerCase();
  const lowerVType = vType.toLowerCase();

  let matches = RENTALS_DB.filter((r) => {
    let match = true;
    if (lowerLoc) {
      match = r.locations.some(l => l.toLowerCase().includes(lowerLoc));
    }
    if (lowerVType && match) {
      match = r.type.toLowerCase().includes(lowerVType) || r.category.toLowerCase().includes(lowerVType);
    }
    return match;
  });

  return {
    found: matches.length > 0,
    location: location || "Rishikesh/Dehradun",
    rentals: matches.length > 0 ? matches : RENTALS_DB
  };
}
