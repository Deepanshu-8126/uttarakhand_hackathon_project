export async function calculateBudget({ destination = "Kedarnath", days = 3, travelers = 2, tier = "moderate" }) {
  const d = Math.max(1, Number(days) || 3);
  const t = Math.max(1, Number(travelers) || 2);
  const selectedTier = ["budget", "moderate", "luxury"].includes(tier.toLowerCase()) ? tier.toLowerCase() : "moderate";

  const rateCards = {
    budget: { stayPerNightPerPerson: 700, foodPerDayPerPerson: 500, transportPerPersonDaily: 800, permitsActivities: 400 },
    moderate: { stayPerNightPerPerson: 1600, foodPerDayPerPerson: 900, transportPerPersonDaily: 1400, permitsActivities: 1000 },
    luxury: { stayPerNightPerPerson: 4500, foodPerDayPerPerson: 1800, transportPerPersonDaily: 2800, permitsActivities: 2500 }
  };

  const rates = rateCards[selectedTier];
  const stayCost = rates.stayPerNightPerPerson * (d - 1) * t;
  const foodCost = rates.foodPerDayPerPerson * d * t;
  const transportCost = rates.transportPerPersonDaily * d * t;
  const miscCost = rates.permitsActivities * t;
  const emergencyBuffer = Math.round((stayCost + foodCost + transportCost + miscCost) * 0.1);
  const totalCost = stayCost + foodCost + transportCost + miscCost + emergencyBuffer;

  return {
    destination,
    durationDays: d,
    travelers: t,
    tier: selectedTier,
    breakdown: {
      stays: `₹${stayCost.toLocaleString('en-IN')}`,
      food: `₹${foodCost.toLocaleString('en-IN')}`,
      transport: `₹${transportCost.toLocaleString('en-IN')}`,
      permitsAndActivities: `₹${miscCost.toLocaleString('en-IN')}`,
      emergencyMountainBuffer: `₹${emergencyBuffer.toLocaleString('en-IN')}`,
    },
    totalEstimatedINR: `₹${totalCost.toLocaleString('en-IN')}`,
    perPersonINR: `₹${Math.round(totalCost / t).toLocaleString('en-IN')}`,
    currency: "INR"
  };
}
