/**
 * Discovery Uttarakhand - Unified Entity Extractor & Canonical Normalizer
 * Extracts and normalizes destination, duration, travelers, budget, origin, and transport
 * from natural language (Hindi, Hinglish, English).
 */

const KNOWN_DESTINATIONS = [
  "Kedarnath", "Badrinath", "Rishikesh", "Auli", "Chopta", "Kedarkantha", "Nainital",
  "Mussoorie", "Haridwar", "Munsiyari", "Munsyari", "Dhanaulti", "Kanatal", "Chakrata",
  "Pithoragarh", "Lansdowne", "Gangotri", "Yamunotri", "Hemkund Sahib", "Hemkund",
  "Jim Corbett", "Valley of Flowers", "Tungnath", "Deoria Tal", "Har Ki Dun",
  "Dayara Bugyal", "Roopkund", "Binsar", "Ranikhet", "Guptkashi", "Rudraprayag",
  "Devprayag", "Joshimath", "Bhimtal", "Naukuchiatal", "Sattal", "Kausani", "Tehri",
  "Uttarkashi", "Chamoli", "Almora", "Adi Kailash", "Om Parvat"
];

const ORIGIN_HUBS = [
  "Delhi", "New Delhi", "Noida", "Gurgaon", "Agra", "Chandigarh", "Jaipur", "Mumbai",
  "Lucknow", "Dehradun", "Haridwar", "Rishikesh", "Meerut", "Haldwani", "Bangalore",
  "Kolkata", "Pune", "Ahmedabad", "Hyderabad", "Chennai"
];

export function extractEntitiesFromText(text, currentContext = {}) {
  if (!text || typeof text !== "string") return {};
  const clean = text.trim();
  const lower = clean.toLowerCase();
  const entities = {};

  // 1. Destination Extraction
  for (const dest of KNOWN_DESTINATIONS) {
    const regex = new RegExp(`\\b${dest.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(clean)) {
      entities.destination = dest;
      break;
    }
  }

  // Common aliases if not matched directly
  if (!entities.destination) {
    if (/\bkedar\b/i.test(lower)) entities.destination = "Kedarnath";
    else if (/\bbadri\b/i.test(lower)) entities.destination = "Badrinath";
    else if (/\bvof\b|phoolon ki ghati/i.test(lower)) entities.destination = "Valley of Flowers";
    else if (/\bcorbett\b/i.test(lower)) entities.destination = "Jim Corbett";
  }

  // 2. Origin Extraction
  for (const hub of ORIGIN_HUBS) {
    const isExplicitOrigin = new RegExp(`(?:from|start from|starting from)\\s+${hub}|${hub}\\s+se\\b`, 'i').test(clean);
    if (isExplicitOrigin || lower === hub.toLowerCase()) {
      entities.origin = hub;
      break;
    }
  }

  if (!entities.origin) {
    const fromMatch = clean.match(/(?:from|start from|starting from)\s+([A-Za-z]+)/i);
    const seMatch = clean.match(/([A-Za-z]+)\s+se\b/i);
    const candidate = fromMatch ? fromMatch[1].trim() : (seMatch ? seMatch[1].trim() : null);
    if (candidate && !/^(main|hum|aap|wahan|yahan|kal|aaj|kahan|travel|please|budget|din|log)$/i.test(candidate)) {
      entities.origin = candidate.charAt(0).toUpperCase() + candidate.slice(1).toLowerCase();
    }
  }

  // 3. Duration Extraction (e.g. "5 din", "5 days", "5-day", "3-4 days", "5 din 4 raat")
  const rangeMatch = clean.match(/(\d+)\s*(?:-|–|to|se)\s*(\d+)\s*(?:days?|din|nights?|raat)/i);
  if (rangeMatch) {
    const maxDays = Math.max(parseInt(rangeMatch[1], 10), parseInt(rangeMatch[2], 10));
    entities.duration = maxDays;
    entities.numDays = maxDays;
    entities.durationDays = maxDays;
  } else {
    const singleMatch = clean.match(/(\d+)\s*[-\s]?(?:days?|din|nights?|raat)/i);
    if (singleMatch) {
      const d = parseInt(singleMatch[1], 10);
      if (d >= 1 && d <= 30) {
        entities.duration = d;
        entities.numDays = d;
        entities.durationDays = d;
      }
    }
  }

  // 4. Travelers Extraction (e.g. "2 log", "2 logon", "2 people", "2 travelers", "hum dono", "solo")
  const travelersMatch = clean.match(/(\d+)\s*(?:person|people|traveler|travelers|adults?|log(?:on)?|member)\b/i);
  if (travelersMatch) {
    const count = parseInt(travelersMatch[1], 10);
    if (count >= 1 && count <= 50) entities.travelers = count;
  } else if (/hum dono|me and my friend|two of us|couple/i.test(clean)) {
    entities.travelers = 2;
  } else if (/\bsolo\b|alone|single traveler/i.test(clean)) {
    entities.travelers = 1;
  }

  // 5. Budget Extraction & Normalization
  // Constraint classification
  let constraint = 'EXACT';
  if (/ke\s+andar|under|within|maximum|max|zyada\s+nahi|kam\s*karo/i.test(lower)) {
    constraint = 'MAXIMUM';
  } else if (/around|approx|approximately|karib|kareeb|lagbhag/i.test(lower)) {
    constraint = 'APPROXIMATE';
  }

  let rawBudgetNum = null;

  // Pattern A: K or hazar / thousand (e.g. "15k", "15 hazar", "15.5k", "15 thousand", "budget 15k")
  const kMatch = clean.match(/(?:budget\s*)?(\d+(?:\.\d+)?)\s*(?:k|hazar|hazaar|thousand)\b/i);
  if (kMatch) {
    rawBudgetNum = Math.round(parseFloat(kMatch[1]) * 1000);
  }

  // Pattern B: Currency symbol or RS/INR prefix/suffix (e.g. "Rs 15,000", "₹15000", "15000 rupaye", "15000 rs")
  if (!rawBudgetNum) {
    const symbolMatch = clean.match(/(?:budget|cost|kharcha|₹|rs\.?|inr)\s*[:=]?\s*([0-9,]+)/i) ||
                        clean.match(/([0-9,]+)\s*(?:rupees?|rupaye?|rs\.?|inr|budget)\b/i);
    if (symbolMatch) {
      const parsed = parseInt(symbolMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(parsed) && parsed >= 500) {
        rawBudgetNum = parsed;
      }
    }
  }

  // Pattern C: Numeric phrase ("5000 ke andar", "mere paas 15000 hain")
  if (!rawBudgetNum) {
    const phraseMatch = clean.match(/(?:paas|ke\s+andar|mein|tak)\s*([0-9,]{4,7})\b/i) ||
                        clean.match(/\b([0-9,]{4,7})\s*(?:ke\s+andar|mein\s+trip|tak|karo)\b/i);
    if (phraseMatch) {
      const parsed = parseInt(phraseMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(parsed) && parsed >= 500) {
        rawBudgetNum = parsed;
      }
    }
  }

  // Pattern D: Standalone 4-6 digit number (e.g. "15000", "20000")
  if (!rawBudgetNum) {
    const standaloneMatch = clean.match(/\b([1-9]\d{3,5})\b/);
    if (standaloneMatch) {
      const parsed = parseInt(standaloneMatch[1], 10);
      const currentYear = new Date().getFullYear();
      if (!isNaN(parsed) && parsed >= 1000 && parsed !== currentYear && parsed !== currentYear + 1) {
        rawBudgetNum = parsed;
      }
    }
  }

  if (rawBudgetNum) {
    entities.budget = rawBudgetNum;
    entities.budgetFormatted = `₹${rawBudgetNum.toLocaleString('en-IN')}`;
    entities.budgetConstraint = constraint;
  }

  // 6. Transport Extraction
  if (/bike|motorbike|royal enfield|himalayan/i.test(clean)) entities.transport = 'Bike';
  else if (/car|suv|self[- ]?drive/i.test(clean)) entities.transport = 'Car';
  else if (/bus|tempo traveller/i.test(clean)) entities.transport = 'Bus';
  else if (/taxi|cab|driver/i.test(clean)) entities.transport = 'Taxi';

  // 7. Vibes / Interests
  const vibes = [];
  if (/trek|trekking|hiking/i.test(clean)) vibes.push('Trekking');
  if (/adventure|rafting|camping|rock climbing/i.test(clean)) vibes.push('Adventure');
  if (/spiritual|yatra|mandir|temple|dham/i.test(clean)) vibes.push('Spiritual');
  if (/peaceful|relax|nature|calm|retreat/i.test(clean)) vibes.push('Peaceful');
  if (/culture|heritage|food|local/i.test(clean)) vibes.push('Culture');
  if (vibes.length > 0) entities.vibes = vibes;

  return entities;
}

export default extractEntitiesFromText;
