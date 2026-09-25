export async function searchActivities({ location = "", category = "" }) {
  const ACTIVITIES_DB = [
    { name: "White Water River Rafting (16km/24km)", location: "Rishikesh", cost: "₹800 - ₹1,500/person", season: "Sept - June" },
    { name: "Bungee Jumping (83m)", location: "Mohan Chatti, Rishikesh", cost: "₹3,500/person", season: "All year (except monsoon)" },
    { name: "Ganga Evening Aarti Ceremony", location: "Triveni Ghat / Parmarth Niketan", cost: "Free", season: "Daily at sunset" },
    { name: "Skiing Course & Cable Car", location: "Auli", cost: "₹1,000/cable car, ₹5,000 ski package", season: "Jan - March" },
    { name: "Valley of Flowers Botanical Trek", location: "Govindghat", cost: "₹150 permit (Indian) / ₹600 (Foreign)", season: "July - Sept" },
    { name: "Kedarkantha Winter Snow Summit", location: "Sankri", cost: "₹6,000 - ₹9,000 complete trek package", season: "Dec - April" }
  ];

  const loc = String(location).toLowerCase().trim();
  const matches = ACTIVITIES_DB.filter(a => !loc || a.location.toLowerCase().includes(loc));

  return {
    found: matches.length > 0,
    activities: matches.length > 0 ? matches : ACTIVITIES_DB
  };
}
