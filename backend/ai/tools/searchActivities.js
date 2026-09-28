import Activity from "../../models/Activity.js";

export async function searchActivities({ location = "", category = "" }) {
  const loc = String(location || "").trim();
  const cat = String(category || "").trim();

  try {
    const filter = {};
    if (loc) {
      const rx = new RegExp(loc, "i");
      filter.$or = [
        { name: rx },
        { district: rx },
        { region: rx },
        { highlights: rx },
        { experiences: rx },
        { description: rx }
      ];
    }
    if (cat) {
      filter.category = new RegExp(cat, "i");
    }

    const docs = await Activity.find(filter).limit(20).lean();
    if (docs && docs.length > 0) {
      return {
        found: true,
        activities: docs
      };
    }
  } catch (err) {
    // DB query fallback
  }

  const ACTIVITIES_DB = [
    { name: "White Water River Rafting (16km/24km)", location: "Rishikesh", cost: "₹800 - ₹1,500/person", season: "Sept - June" },
    { name: "Bungee Jumping (83m)", location: "Mohan Chatti, Rishikesh", cost: "₹3,500/person", season: "All year (except monsoon)" },
    { name: "Ganga Evening Aarti Ceremony", location: "Triveni Ghat / Parmarth Niketan", cost: "Free", season: "Daily at sunset" },
    { name: "Skiing Course & Cable Car", location: "Auli", cost: "₹1,000/cable car, ₹5,000 ski package", season: "Jan - March" },
    { name: "Valley of Flowers Botanical Trek", location: "Govindghat", cost: "₹150 permit (Indian) / ₹600 (Foreign)", season: "July - Sept" },
    { name: "Kedarkantha Winter Snow Summit", location: "Sankri", cost: "₹6,000 - ₹9,000 complete trek package", season: "Dec - April" }
  ];

  const matches = ACTIVITIES_DB.filter(a => !loc || a.location.toLowerCase().includes(loc.toLowerCase()));

  return {
    found: matches.length > 0,
    activities: matches.length > 0 ? matches : ACTIVITIES_DB
  };
}
