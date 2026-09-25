/**
 * Devbhoomi Conversational AI - Memory Layer
 * Multi-turn memory, entity tracking, and session persistence
 */
import Chat from "../../models/Chat.js";

const inMemorySessions = new Map();

export class ConversationMemory {
  static extractEntities(userText, currentEntities = {}) {
    const text = String(userText || "").toLowerCase();
    const entities = { ...currentEntities };

    // Destinations
    const destinations = [
      "kedarnath", "badrinath", "gangotri", "yamunotri", "rishikesh", "haridwar",
      "chopta", "tungnath", "auli", "munsyari", "nainital", "mussoorie", "valley of flowers",
      "hemkund sahib", "kedarkantha", "roopkund", "har ki dun", "chakrata", "kanatal", "lansdowne"
    ];
    for (const d of destinations) {
      if (text.includes(d)) {
        entities.destination = d.charAt(0).toUpperCase() + d.slice(1);
        break;
      }
    }

    // Origin
    const origins = ["delhi", "dehradun", "haridwar", "mumbai", "chandigarh", "jaipur", "bangalore", "noida", "gurgaon"];
    for (const o of origins) {
      if (text.includes(`from ${o}`) || text.includes(`${o} se`) || text.includes(`starting from ${o}`)) {
        entities.origin = o.charAt(0).toUpperCase() + o.slice(1);
        break;
      }
    }

    // Days / Duration
    const daysMatch = text.match(/(\d+)\s*(?:day|days|din)/);
    if (daysMatch) {
      entities.duration = `${daysMatch[1]} Days`;
    }

    // Travelers
    const peopleMatch = text.match(/(\d+)\s*(?:person|people|log|traveler|travelers|adults)/);
    if (peopleMatch) {
      entities.travelers = parseInt(peopleMatch[1], 10);
    } else if (text.includes("solo") || text.includes("alone") || text.includes("single")) {
      entities.travelers = 1;
    } else if (text.includes("couple") || text.includes("hum do") || text.includes("with wife") || text.includes("with friend")) {
      entities.travelers = 2;
    }

    // Budget
    const budgetMatch = text.match(/(?:budget|rupaye|rs|inr|₹)\s*[:=]?\s*([0-9,]+)/i);
    if (budgetMatch) {
      entities.budget = `₹${budgetMatch[1]}`;
    } else if (text.includes("luxury") || text.includes("premium")) {
      entities.tier = "luxury";
    } else if (text.includes("cheap") || text.includes("low budget") || text.includes("sasta")) {
      entities.tier = "budget";
    }

    return entities;
  }

  static async getSession(sessionId, userId = null) {
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    // Try MongoDB first if userId or valid ObjectID
    if (userId && Chat) {
      try {
        const chatDoc = await Chat.findOne({
          $or: [{ _id: sessionId }, { sessionId: sessionId }, { user: userId }]
        }).sort({ updatedAt: -1 });

        if (chatDoc) {
          return {
            sessionId: chatDoc._id.toString(),
            userId: chatDoc.user?.toString(),
            history: (chatDoc.messages || []).map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text,
              timestamp: m.timestamp
            })),
            entities: chatDoc.contextEntities || {}
          };
        }
      } catch (err) {
        // Fall back to in-memory store
      }
    }

    if (!inMemorySessions.has(sessionId)) {
      inMemorySessions.set(sessionId, {
        sessionId,
        userId: userId || null,
        history: [],
        entities: {}
      });
    }

    return inMemorySessions.get(sessionId);
  }

  static async saveTurn(sessionId, userMessage, assistantReply, updatedEntities = {}, userId = null) {
    let session = inMemorySessions.get(sessionId);
    if (!session) {
      session = { sessionId, userId, history: [], entities: {} };
      inMemorySessions.set(sessionId, session);
    }

    session.history.push({ role: "user", content: userMessage, timestamp: new Date().toISOString() });
    session.history.push({ role: "assistant", content: assistantReply, timestamp: new Date().toISOString() });
    session.entities = { ...session.entities, ...updatedEntities };

    // Keep history manageable
    if (session.history.length > 30) {
      session.history = session.history.slice(-30);
    }

    // Persist to MongoDB if possible
    if (userId && Chat) {
      try {
        await Chat.findOneAndUpdate(
          { $or: [{ _id: sessionId }, { sessionId }] },
          {
            $set: {
              contextEntities: session.entities,
              updatedAt: new Date()
            },
            $push: {
              messages: [
                { sender: 'user', text: userMessage, timestamp: new Date() },
                { sender: 'assistant', text: assistantReply, timestamp: new Date() }
              ]
            }
          },
          { upsert: true }
        );
      } catch (err) {
        // Gracefully ignore database error
      }
    }

    return session;
  }
}
