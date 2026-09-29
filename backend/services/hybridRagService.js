/**
 * DevBhoomi AI - Hybrid RAG Service
 * Implements:
 * 1. Verified DB lookup (106 catalog destinations, stays, routes)
 * 2. World Knowledge fallback (Gemini / AI for unknown spots, secret temples, hidden waterfalls)
 * 3. Never says "Data not found" - answers like Google AI with disclaimer:
 *    "This is AI suggested, not verified by us yet. Want to add it?"
 * 4. Friendly Pahari local guide tone in Hindi + English (Hinglish).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Destination from '../models/Destination.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory cache & inverted index of 106 seed destinations for instant sub-millisecond search
let seedDestinations = [];
const seedTokenMap = new Map();

try {
  const seedPath = path.resolve(__dirname, '../seed/destinations.json');
  if (fs.existsSync(seedPath)) {
    seedDestinations = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    seedDestinations.forEach(d => {
      const combined = `${d.name || ''} ${d.district || ''} ${d.region || ''}`.toLowerCase();
      const words = combined.split(/[^a-z0-9]+/).filter(w => w.length >= 3);
      words.forEach(w => {
        if (!seedTokenMap.has(w)) seedTokenMap.set(w, new Set());
        seedTokenMap.get(w).add(d);
      });
    });
  }
} catch (e) {
  console.warn('[HybridRAG] Could not load seed destinations:', e.message);
}

/**
 * Step 1: Search verified database
 */
export async function searchInDB(query) {
  if (!query || typeof query !== 'string') return null;
  const clean = query.trim().toLowerCase();

  // 1. Try Mongo DB search using fast Text Index with regex fallback
  try {
    let mongoMatches = [];
    try {
      mongoMatches = await Destination.find(
        { $text: { $search: clean } },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(3)
      .select('name district region description highlights bestTimeToVisit altitudeMeters startingPrice');
    } catch (_) {
      const escClean = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      mongoMatches = await Destination.find({
        $or: [
          { name: { $regex: escClean, $options: 'i' } },
          { district: { $regex: escClean, $options: 'i' } }
        ]
      }).limit(3).select('name district region description highlights bestTimeToVisit altitudeMeters startingPrice');
    }

    if (mongoMatches && mongoMatches.length > 0) {
      return mongoMatches.map(m => ({
        name: m.name,
        district: m.district,
        region: m.region,
        highlights: m.highlights?.slice(0, 4),
        description: m.description?.slice(0, 200),
        bestTimeToVisit: m.bestTimeToVisit,
        verified: true
      }));
    }
  } catch (err) {
    // Non-blocking fallback to seed index
  }

  // 2. Pre-indexed sub-millisecond in-memory seed lookup
  if (seedDestinations.length > 0) {
    const rawTokens = clean.split(/\s+/).filter(t => t.length >= 3 && !['hai', 'kya', 'aur', 'par', 'koi', 'mein', 'kahan'].includes(t));
    const matchedSet = new Set();
    
    for (const tok of rawTokens) {
      const cleanTok = tok.replace(/[^a-z0-9]/g, '');
      if (cleanTok && seedTokenMap.has(cleanTok)) {
        seedTokenMap.get(cleanTok).forEach(d => matchedSet.add(d));
      }
    }

    const matches = Array.from(matchedSet).slice(0, 3);
    if (matches.length > 0) {
      return matches.map(m => ({
        name: m.name,
        district: m.district,
        region: m.region,
        highlights: m.highlights?.slice(0, 4),
        description: m.description?.slice(0, 200),
        bestTimeToVisit: m.bestTimeToVisit,
        verified: true
      }));
    }
  }

  return null;
}

/**
 * Step 2: System Prompt strictly adhering to User Requirement
 */
export function buildDevBhoomiSystemPrompt() {
  return `You are DevBhoomi AI — Official Himalayan Travel Expert and Native Pahari Guide for Uttarakhand, India.
You have two knowledge sources:
1. Our verified database: { destinations: [...] } (Use this first for all official 106 destinations, stays, routes)
2. Deep world knowledge of Uttarakhand (Use for hidden trails, peaks, viewpoints, routes, local lore, and uncataloged spots)

CRITICAL GUIDELINES:
1. ZERO GENERIC QUESTIONNAIRES: Never respond with a dry intake form (e.g. "Kitne din ka? Kitna budget? Kitne log?"). 
2. IMMEDIATE FACTUAL ROUTE & TRAVEL INTELLIGENCE FIRST: Whenever a user asks about a route, road, destination, trek, or weather (e.g. "Haldwani se Nainital jana hai, pura road batao", "Kedarnath trek", "Auli"), ALWAYS provide immediate, accurate, exciting, and concrete travel intelligence first:
   - For Routes: Give total distance (km), travel time, exact highway/waypoints (e.g., Haldwani → Kathgodam → Ranibagh → Jeolikote → Mallital / Tallital Nainital via NH 109, 35 km, 1 to 1.5 hrs), transport availability (taxis from Kathgodam, UTC buses), and road advice.
   - For Destinations: Specific altitude, key highlights, and how to reach.
3. LANDMARK & ROUTE RESOLUTION: Correctly resolve all phonetic names, mountain passes, and Himalayan corridors.
4. NATURAL LOCAL TONE: Speak warmly in fluent, crisp Hindi, English, or Hinglish like a seasoned local Pahadi guide.
5. NO EMOJIS OR BROKEN MARKDOWN: Use clean typography and bold highlights.
6. UNKNOWN SPOTS: If a spot is outside our verified DB, answer with your world knowledge and append:
   *This is AI suggested, not verified by us yet. Want to add it?*`;
}

/**
 * Step 3: Call AI Provider with fallback cascade
 * Primary: Google Gemini -> Secondary: Groq -> Fallback: Curated Local Guide Intelligence
 */
async function callAiWithCascade(systemPrompt, userPrompt) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  // 1. Try Gemini
  if (geminiKey) {
    const models = [process.env.GEMINI_MODEL || 'gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
    for (const m of models) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${geminiKey}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 600 }
          }),
          signal: AbortSignal.timeout(10000)
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return { text, provider: 'gemini', model: m };
        }
      } catch (err) {
        console.warn(`[HybridRAG] Gemini model ${m} error:`, err.message);
      }
    }
  }

  // 2. Cascade to Groq (Fast & 100% reliable)
  if (groqKey) {
    const groqModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 600
        }),
        signal: AbortSignal.timeout(8000)
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return { text, provider: 'groq', model: groqModel };
      }
    } catch (err) {
      console.warn('[HybridRAG] Groq error:', err.message);
    }
  }

  // 3. Fallback Smart Synthesis
  return {
    text: `Namaste! Uttarakhand ke baare mein aapka sawal mila. Humare DevBhoomi network ke mutabiq is route aur spot par travel karte waqt daylight transit, local shared cabs, aur weather clearance ka dhyan rakhein.\n\n*Note: This is AI suggested, not verified by us yet. Want to add it?*`,
    provider: 'local_synthesizer',
    model: 'pahadi_guide'
  };
}

/**
 * Step 4: Unified Hybrid RAG Execution
 */
export async function executeHybridRag({ query, userLocation = null }) {
  const cleanQuery = (query || '').trim();
  if (!cleanQuery) {
    return {
      success: false,
      message: 'Query is required'
    };
  }

  // 1. Search in DB
  const dbResult = await searchInDB(cleanQuery);
  const isDbFound = Boolean(dbResult && dbResult.length > 0);

  // 2. Build Hybrid Prompt
  const systemPrompt = buildDevBhoomiSystemPrompt();
  const dbContextString = isDbFound 
    ? JSON.stringify({ destinations: dbResult }, null, 2)
    : 'No DB data found in local 106 catalog. Use your world knowledge.';

  const userPrompt = `DB Context:
${dbContextString}

User Query: ${cleanQuery}
${userLocation ? `User Current Location: ${JSON.stringify(userLocation)}` : ''}

Answer now:`;

  // 3. Call AI
  const aiResult = await callAiWithCascade(systemPrompt, userPrompt);
  let answer = aiResult.text.trim();

  // 4. Unconditionally append disclaimer whenever destination is not verified in DB
  const disclaimer = 'This is AI suggested, not verified by us yet. Want to add it?';
  if (!isDbFound) {
    answer += `\n\n*${disclaimer}*`;
  }

  return {
    success: true,
    answer,
    source: isDbFound ? 'verified_db' : 'world_knowledge_ai',
    isVerified: isDbFound,
    dbMatches: dbResult || [],
    meta: {
      provider: aiResult.provider,
      model: aiResult.model,
      hasDbMatch: isDbFound
    }
  };
}

export default {
  searchInDB,
  buildDevBhoomiSystemPrompt,
  executeHybridRag
};
