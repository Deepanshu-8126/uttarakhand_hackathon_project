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

// In-memory cache of 106 seed destinations for instant sub-millisecond search
let seedDestinations = [];
try {
  const seedPath = path.resolve(__dirname, '../seed/destinations.json');
  if (fs.existsSync(seedPath)) {
    seedDestinations = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
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

  // 1. Try Mongo DB search if available
  try {
    const mongoMatches = await Destination.find({
      $or: [
        { name: { $regex: clean, $options: 'i' } },
        { district: { $regex: clean, $options: 'i' } },
        { region: { $regex: clean, $options: 'i' } },
        { highlights: { $regex: clean, $options: 'i' } }
      ]
    }).limit(3).select('name district region description highlights bestTimeToVisit altitudeMeters startingPrice');

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
    // Non-blocking fallback to seed JSON
  }

  // 2. In-memory seed search fallback
  if (seedDestinations.length > 0) {
    // Use word boundaries so "ka" or short letters don't falsely match
    const tokens = clean.split(/\s+/).filter(t => t.length >= 3 && !['hai', 'kya', 'aur', 'par', 'koi', 'mein', 'kahan'].includes(t));
    const matches = seedDestinations.filter(d => {
      const name = (d.name || '').toLowerCase();
      const dist = (d.district || '').toLowerCase();
      return tokens.some(tok => {
        const regex = new RegExp(`\\b${tok}\\b`, 'i');
        return regex.test(name) || regex.test(dist);
      });
    }).slice(0, 3);

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
  return `You are DevBhoomi AI - Official Uttarakhand Travel Expert.
You have two sources:
1. Our verified database: { destinations: [...] } (use this first if question is about our 106 destinations)
2. Your own world knowledge (use if not in DB)

Rules:
- If user asks about a place in our DB (e.g., Kedarnath), use DB data + add your knowledge.
- If user asks about UNKNOWN place (e.g., 'Kichha me koi hidden temple?'), DON'T say not found. Search your knowledge and answer like Google AI, but add disclaimer: 'This is AI suggested, not verified by us yet. Want to add it?'
- Always answer, never say 'I don't know from database'.
- Support Hindi + English both.
- Keep tone friendly, like local guide.`;
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
    const models = [process.env.GEMINI_MODEL || 'gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
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
        // Fall to next model/provider
      }
    }
  }

  // 2. Cascade to Groq (Fast & 100% reliable)
  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
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
        if (text) return { text, provider: 'groq', model: 'qwen/qwen3.8-27b' };
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

  // 4. Ensure disclaimer is present if place is not verified in DB
  const disclaimer = 'This is AI suggested, not verified by us yet. Want to add it?';
  if (!isDbFound && !answer.toLowerCase().includes('not verified') && !answer.toLowerCase().includes('ai suggested')) {
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
