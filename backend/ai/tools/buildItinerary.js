export async function buildItinerary({ destination = "Kedarnath", days = 3, origin = "Delhi" }) {
  const numDays = Math.max(1, Math.min(10, Number(days) || 3));
  const destClean = String(destination).trim();

  const dayTemplates = {
    Kedarnath: [
      { day: 1, title: `Journey from ${origin} to Guptkashi / Sonprayag`, travelTime: "7-9 hrs", altitude: "1,829m", activity: "Scenic mountain drive via Devprayag confluence and Rudraprayag. Mandatory acclimatization rest." },
      { day: 2, title: "Sonprayag to Kedarnath Dham Ascent", travelTime: "6-8 hrs trek (16km)", altitude: "3,584m", activity: "Early morning start from Gaurikund. Ascend along Mandakini river. Evening Darshan and Aarti at the holy shrine." },
      { day: 3, title: `Descent to Gaurikund and Return to ${origin} / Rishikesh`, travelTime: "5 hrs descent + road transit", altitude: "372m", activity: "Morning Bhairavnath darshan, descend back to base, travel back via Rishikesh." }
    ],
    Chopta: [
      { day: 1, title: `${origin} to Sari Village & Deoria Tal`, travelTime: "6-7 hrs", altitude: "2,438m", activity: "Drive to Sari, short 2.5km hike to Deoria Tal emerald lake reflecting Chaukhamba peaks. Stay in local homestay." },
      { day: 2, title: "Tungnath & Chandrashila Summit (4,000m)", travelTime: "5-6 hrs total trek", altitude: "4,000m", activity: "Ascend to Tungnath (world's highest Shiva temple) and summit Chandrashila for 360-degree Himalayan views." },
      { day: 3, title: `Chopta to Rishikesh / ${origin}`, travelTime: "6 hrs drive", altitude: "372m", activity: "Sunrise view, descend down the valley via Rudraprayag." }
    ]
  };

  const key = Object.keys(dayTemplates).find(k => destClean.toLowerCase().includes(k.toLowerCase())) || "Kedarnath";
  const itinerary = dayTemplates[key].slice(0, numDays);

  return {
    destination: destClean,
    origin,
    durationDays: numDays,
    dailyPlan: itinerary,
    safetyRule: "Never drive on mountain roads after 6:00 PM due to fog and landslide risk."
  };
}
