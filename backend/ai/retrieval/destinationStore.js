/**
 * Devbhoomi Retrieval Layer - Uttarakhand Knowledge Base
 * Pre-grounded data for Char Dham, major treks, homestays, rentals, and safety guidelines.
 */

export const DESTINATIONS_DB = [
  {
    id: "kedarnath",
    name: "Kedarnath Dham",
    region: "Garhwal",
    district: "Rudraprayag",
    altitudeMeters: 3584,
    category: "Spiritual & High Altitude",
    bestSeason: "May to June, September to October",
    trekLengthKm: 16,
    baseTown: "Gaurikund / Sonprayag",
    amsRisk: "HIGH",
    highlights: ["12th Jyotirlinga of Shiva", "Mandakini River valley", "Bhairavnath temple", "Snow peaks of Kedar Dome"],
    acclimatizationAdvice: "Halt at Guptkashi (1,319m) or Sonprayag (1,829m) before ascending to 3,584m. Carry diamox, hydration salts, warm thermals."
  },
  {
    id: "badrinath",
    name: "Badrinath Dham",
    region: "Garhwal",
    district: "Chamoli",
    altitudeMeters: 3133,
    category: "Spiritual & Scenic",
    bestSeason: "May to June, September to October",
    trekLengthKm: 0,
    baseTown: "Joshimath",
    amsRisk: "MODERATE",
    highlights: ["Lord Vishnu temple", "Tapt Kund hot spring", "Mana Village (First Indian Village)", "Vasudhara Falls"],
    acclimatizationAdvice: "Road-accessible via Joshimath. Night temperature drops near freezing even in May/June. Warm layers essential."
  },
  {
    id: "tungnath-chopta",
    name: "Tungnath & Chandrashila (Chopta)",
    region: "Garhwal",
    district: "Rudraprayag",
    altitudeMeters: 3680,
    category: "Trek & Spiritual",
    bestSeason: "April to November (Winter snow trek Dec-Feb)",
    trekLengthKm: 4.5,
    baseTown: "Chopta (Mini Switzerland of Uttarakhand)",
    amsRisk: "MODERATE_HIGH",
    highlights: ["Highest Shiva temple in the world (3,680m)", "360-degree panorama of Nanda Devi, Trishul, Chaukhamba from Chandrashila (4,000m)", "Deoria Tal lake nearby"],
    acclimatizationAdvice: "Stay in Chopta (2,680m) to acclimatize. The 4.5km steep paved trail requires steady pacing and hydration."
  },
  {
    id: "valley-of-flowers",
    name: "Valley of Flowers & Hemkund Sahib",
    region: "Garhwal",
    district: "Chamoli",
    altitudeMeters: 3658,
    category: "UNESCO World Heritage Trek",
    bestSeason: "July to early September (Peak blooms late July-August)",
    trekLengthKm: 14,
    baseTown: "Govindghat / Ghangaria",
    amsRisk: "HIGH",
    highlights: ["Over 500 species of alpine wildflowers including Blue Poppy & Brahma Kamal", "Hemkund Sahib Gurudwara at 4,329m", "Pushpawati River"],
    acclimatizationAdvice: "Mandatory night halt at Ghangaria (3,048m). High AMS risk on the steep 6km push to Hemkund Sahib (4,329m)."
  },
  {
    id: "rishikesh",
    name: "Rishikesh",
    region: "Garhwal",
    district: "Dehradun / Pauri",
    altitudeMeters: 372,
    category: "Adventure & Spiritual",
    bestSeason: "September to May",
    trekLengthKm: 0,
    baseTown: "Rishikesh",
    amsRisk: "NONE",
    highlights: ["White water rafting on Ganga", "Ganga Aarti at Triveni Ghat & Parmarth Niketan", "Bungee jumping at Mohan Chatti", "Beatles Ashram", "Gateway to Char Dham"],
    acclimatizationAdvice: "Low altitude. Excellent transit hub for Royal Enfield rentals and supplies."
  },
  {
    id: "munsyari",
    name: "Munsyari",
    region: "Kumaon",
    district: "Pithoragarh",
    altitudeMeters: 2200,
    category: "Trek & Hill Station",
    bestSeason: "March to June, September to November",
    trekLengthKm: 0,
    baseTown: "Munsyari",
    amsRisk: "LOW",
    highlights: ["Panchachuli Five Peaks view", "Birthi Falls", "Base camp for Milam and Ralam Glaciers", "Authentic Bhotiya culture and rugs"],
    acclimatizationAdvice: "Scenic 10-12 hour drive from Kathgodam/Nainital with dramatic elevation changes."
  },
  {
    id: "auli",
    name: "Auli",
    region: "Garhwal",
    district: "Chamoli",
    altitudeMeters: 2800,
    category: "Ski Resort & Panoramic Views",
    bestSeason: "December to March (Skiing), April to June (Meadows)",
    trekLengthKm: 0,
    baseTown: "Joshimath",
    amsRisk: "MODERATE",
    highlights: ["Premier ski destination of India", "Asia's longest cable car from Joshimath", "Direct views of Nanda Devi (7,816m)", "Gorson Bugyal trek"],
    acclimatizationAdvice: "Cable car ascent is rapid (from 1,890m to 2,800m in 20 minutes). Stay hydrated and dress in windproof layers."
  }
];

export const HOMESTAYS_DB = [
  {
    name: "Chopta Meadow View Pahari Homestay",
    location: "Chopta / Sari Village",
    district: "Rudraprayag",
    pricePerNight: "₹1,200 - ₹2,000",
    amenities: ["Organic pahari meals", "Bonfire", "Mountain view", "Heated blankets"],
    contact: "+91 94120 44551"
  },
  {
    name: "Guptkashi Heritage Kedar Retreat",
    location: "Guptkashi",
    district: "Rudraprayag",
    pricePerNight: "₹1,500 - ₹2,800",
    amenities: ["Hot water", "Mandakini valley view", "Helipad transfer assistance", "Pure vegetarian dining"],
    contact: "+91 98970 33412"
  },
  {
    name: "Mana Bhotia Traditional Homestay",
    location: "Mana Village",
    district: "Chamoli",
    pricePerNight: "₹1,000 - ₹1,800",
    amenities: ["Traditional stone house", "Herbal tea", "Yak wool display", "Proximity to Saraswati river"],
    contact: "+91 97580 12890"
  },
  {
    name: "Munsyari Panchachuli View Eco Home",
    location: "Munsyari",
    district: "Pithoragarh",
    pricePerNight: "₹1,400 - ₹2,200",
    amenities: ["Balcony facing 5 peaks", "Locally grown Bhatt ki Churkani meals", "Local trek guide"],
    contact: "+91 94561 77892"
  }
];

export const RENTALS_DB = [
  {
    type: "Royal Enfield Himalayan 450",
    category: "Adventure Bike",
    locations: ["Rishikesh", "Dehradun", "Haridwar"],
    pricePerDay: "₹1,400 - ₹1,800/day",
    includes: ["Helmet", "Luggage carrier", "Basic tool kit", "Valid mountain permit papers"]
  },
  {
    type: "Royal Enfield Classic 350",
    category: "Cruiser Bike",
    locations: ["Rishikesh", "Dehradun"],
    pricePerDay: "₹1,000 - ₹1,300/day",
    includes: ["Helmet", "Carrier", "Documents"]
  },
  {
    type: "Mahindra Thar 4x4 / Scorpio",
    category: "Self-Drive SUV",
    locations: ["Dehradun", "Rishikesh", "Kathgodam"],
    pricePerDay: "₹3,500 - ₹5,000/day",
    includes: ["High ground clearance", "Snow chain readiness (winter)", "Full insurance"]
  }
];
