import { RENTALS_DB } from "../retrieval/destinationStore.js";

export async function searchRentals({ location = "Rishikesh", vehicleType = "" }) {
  const loc = String(location).toLowerCase().trim();
  const vType = String(vehicleType).toLowerCase().trim();

  let matches = RENTALS_DB.filter((r) => {
    let match = true;
    if (loc) {
      match = r.locations.some(l => l.toLowerCase().includes(loc));
    }
    if (vType && match) {
      match = r.type.toLowerCase().includes(vType) || r.category.toLowerCase().includes(vType);
    }
    return match;
  });

  return {
    found: matches.length > 0,
    location: location || "Rishikesh/Dehradun",
    rentals: matches.length > 0 ? matches : RENTALS_DB
  };
}
