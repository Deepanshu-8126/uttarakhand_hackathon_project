import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useMapStore } from '../store/mapStore';
import { getDestinations } from '../api/destinationApi';
import { getSpiritualPlaces } from '../api/spiritualApi';
import { getStays } from '../api/stayApi';
import { getActivities } from '../api/activityApi';
import { detectBrowserLocation, POPULAR_START_HUBS } from '../utils/geoHelpers';
import { generatePersonalizedTripPlan } from '../utils/itineraryGenerator';
import { fetchOSRMRoute } from '../utils/routeHelpers';
import { extractEntitiesFromText } from '../utils/entityExtractor';
import {
  MapPin, Calendar, Clock, Car, Users, Sparkles, Check,
  AlertCircle, RotateCcw, Navigation, Loader2, ArrowRight,
  Mountain, Landmark, Trees, Coffee, Flame, Wallet, ShieldCheck, Lock,
  Bike, Sun, Moon, Sunset, Send, Bot, Map, FileText, PenLine
} from 'lucide-react';

// ─── Config ──────────────────────────────────────────────────────────────────
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://uttarakhand-hackathon-project.onrender.com/api';

// ─── Normalise ────────────────────────────────────────────────────────────────
const normaliseEntity = (raw, type) => {
  const c = raw.location?.coordinates;
  const coords =
    Array.isArray(c) && c.length === 2
      ? [c[1], c[0]]
      : Array.isArray(raw.coordinates) && raw.coordinates.length === 2
      ? raw.coordinates
      : null;
  const image =
    raw.coverImage?.url ||
    (typeof raw.coverImage === 'string' ? raw.coverImage : null) ||
    raw.image?.url ||
    (typeof raw.image === 'string' ? raw.image : null) ||
    (Array.isArray(raw.images) && raw.images[0]?.url) ||
    '/assets/fallback.svg';
  return {
    ...raw, id: raw._id || raw.slug, type, coordinates: coords, image,
    district: raw.district || 'Uttarakhand',
    region: raw.region || raw.area || '',
    shortDesc: raw.shortDescription || raw.shortDesc || raw.description || '',
    category: raw.category || type,
  };
};

// ─── Quick suggestions ────────────────────────────────────────────────────────
const QUICK_SUGGESTIONS = [
  { label: 'Kedarnath 5-day trip', query: 'Mujhe Kedarnath ke liye 5-day trip plan karo Rs 15000 budget mein' },
  { label: 'Rishikesh adventure', query: 'Rishikesh mein rafting aur camping ke saath 3-din ka trip' },
  { label: 'Snow trek Kedarkantha', query: 'Kedarkantha snow trek 4 din ke liye 2 logo ke saath' },
  { label: 'Budget Nainital trip', query: 'Nainital family trip 4 log 3 din budget mein' },
  { label: 'Auli skiing weekend', query: 'Auli skiing 2-day weekend trip for couple' },
  { label: 'Char Dham Yatra', query: 'Char Dham Yatra 12 din ka plan karo complete itinerary ke saath' },
];



// ─── Markdown Renderer ────────────────────────────────────────────────────────

// ─── Markdown Renderer ────────────────────────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="mb-1 leading-relaxed text-sm text-stone-800">
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={j} className="font-bold text-stone-900">{part.replace(/\*\*/g, '')}</strong>
          ) : (
            part
          )
        )}
      </p>
    );
  });
}

// ─── Fallback offline response ────────────────────────────────────────────────
function buildFallbackResponse(userText, brief) {
  const q = userText.toLowerCase();
  const dest = brief.destination || 'Uttarakhand';
  const days = brief.numDays || 5;

  if (/kedarnath/i.test(q)) {
    return {
      content: `**Kedarnath Pilgrimage — Trip Brief:**\n\n**Route:** Dehradun -> Rishikesh -> Rudraprayag -> Gaurikund -> Kedarnath\n**Best Base:** Guptkashi or Gaurikund\n**Best Season:** May-Jun, Sep-Oct\n\n**5-Day Plan:**\n- Day 1: Dehradun -> Rishikesh -> Rudraprayag\n- Day 2: Rudraprayag -> Gaurikund Trek start (22 km)\n- Day 3: Kedarnath darshan + acclimatization\n- Day 4: Return to Guptkashi\n- Day 5: Drive back via Devprayag\n\n**Estimated budget:** Rs 12,000-18,000 per person\n\nReady to generate? Click **Generate My Itinerary** below!`,
      suggestions: ['Add helicopter option', 'Show stays near Gaurikund', 'Safety tips for Kedarnath'],
    };
  }
  if (/rishikesh/i.test(q)) {
    return {
      content: `**Rishikesh Adventure — Trip Brief:**\n\n**Best Activities:** White-water rafting (Grade 3-4), Bungee jumping at Mohan Chatti, Laxman Jhula walk, Neelkanth Mahadev trek\n**Best Stay Areas:** Tapovan, Laxman Jhula, Beatles Ashram area\n\n**3-Day Plan:**\n- Day 1: Arrive, river rafting (16 km stretch)\n- Day 2: Neelkanth trek + Rajaji buffer zone\n- Day 3: Beatles Ashram + yoga class + departure\n\n**Budget:** Rs 5,000-10,000 per person\n\nClick **Generate My Itinerary** for a personalized plan!`,
      suggestions: ['Camping options in Rishikesh', 'Best rafting operators', 'Shivpuri night camping'],
    };
  }

  const missingParts = [];
  if (!brief.numDays) missingParts.push('**How many days?** (e.g. 5 din)');
  if (!brief.budget) missingParts.push('**What is your per-person budget?** (e.g. Rs 15,000)');
  if (!brief.travelers) missingParts.push('**How many travelers?** (e.g. 2 log)');

  if (missingParts.length === 0 && brief.destination) {
    return {
      content: `Great! Planning your **${days}-day trip to ${dest}**. All details captured!\n\nClick **Generate My Itinerary** below for your complete day-by-day plan! `,
      suggestions: ['Add more destinations', 'Check safety conditions', 'See verified stays'],
    };
  }

  return {
    content: `Got it! Planning your **${days}-day trip to ${dest}**.\n\nA few more details will help me craft the perfect plan:\n\n${missingParts.join('\n')}\n\nShare these and I will build your complete Himalayan itinerary!`,
    suggestions: ['3 din ka trip', '5 din ka trip', 'Rs 15,000 budget mein'],
  };
}

// ─── Infer suggestions ────────────────────────────────────────────────────────
function inferSuggestions(brief) {
  if (!brief.destination) return ['Kedarnath trip plan karo', 'Rishikesh adventure', 'Auli snow trek'];
  if (!brief.numDays) return ['3 din ka trip', '5 din ka trip', '7 din ka trip'];
  if (!brief.budget) return ['Rs 10,000 budget mein', 'Rs 15,000 budget mein', 'Rs 25,000 budget mein'];
  return ['Detailed itinerary chahiye', 'Stay options dikhao', 'Budget breakdown batao'];
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function TripPlanner() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const stateOrigin = location?.state?.origin;
  const stateDest = location?.state?.destination;
  const destinationParam = searchParams.get('destination') || searchParams.get('dest') || stateDest || '';
  const originParam = searchParams.get('origin') || searchParams.get('start') || stateOrigin || '';
  const queryParam = searchParams.get('query') || destinationParam || '';
  const rentalNameParam = searchParams.get('rental_name') || searchParams.get('rentalName');
  const rentalLocationParam = searchParams.get('location') || searchParams.get('city');
  const rentalPriceParam = searchParams.get('price');
  const rentalTypeParam = searchParams.get('type') || 'Bike';

  // ── Data store ────────────────────────────────────────────────────────────
  const {
    allDestinations, allSpiritual, allActivities, allStays,
    setDestinations, setSpiritual, setStays, setActivities, setActiveTripSession,
  } = useMapStore();

  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      try {
        const [destRes, spirRes, stayRes, actRes] = await Promise.allSettled([
          getDestinations(), getSpiritualPlaces(), getStays(), getActivities(),
        ]);
        if (destRes.status === 'fulfilled') {
          const arr = destRes.value?.data || destRes.value || [];
          if (Array.isArray(arr)) setDestinations(arr.map(d => normaliseEntity(d, 'destination')));
        }
        if (spirRes.status === 'fulfilled') {
          const arr = spirRes.value?.data || spirRes.value || [];
          if (Array.isArray(arr)) setSpiritual(arr.map(s => normaliseEntity(s, 'spiritual')));
        }
        if (stayRes.status === 'fulfilled') {
          const arr = stayRes.value?.data || stayRes.value || [];
          if (Array.isArray(arr)) setStays(arr.map(st => normaliseEntity(st, 'stay')));
        }
        if (actRes.status === 'fulfilled') {
          const arr = actRes.value?.data || actRes.value || [];
          if (Array.isArray(arr)) setActivities(arr.map(a => normaliseEntity(a, 'activity')));
        }
      } catch (err) {
        console.error('Dataset load failed:', err);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [setDestinations, setSpiritual, setStays, setActivities]);

  const searchableDestinations = useMemo(
    () => [...allDestinations, ...allSpiritual],
    [allDestinations, allSpiritual]
  );

  // ── Trip Brief state (right-panel workspace) ──────────────────────────────
  const [tripBrief, setTripBrief] = useState({
    destination: destinationParam || null,
    _destinationObj: null,
    durationDays: null,
    numDays: null,
    budget: null,
    travelers: null,
    transport: rentalNameParam
      ? rentalTypeParam?.toLowerCase().includes('car') ? 'Car' : 'Bike'
      : null,
    vibes: [],
    startingLocation: {
      name: rentalLocationParam ? `${rentalLocationParam}, Uttarakhand` : 'Dehradun, Uttarakhand',
      coordinates: [30.3165, 78.0322],
    },
    pace: 'Balanced',
  });

  // Sync destination from URL params once data loads
  useEffect(() => {
    if (!destinationParam || searchableDestinations.length === 0) return;
    const matched = searchableDestinations.find(d =>
      (d.name && d.name.toLowerCase().includes(destinationParam.toLowerCase())) ||
      (d.title && d.title.toLowerCase().includes(destinationParam.toLowerCase())) ||
      (d.slug && d.slug.toLowerCase().includes(destinationParam.toLowerCase()))
    );
    setTripBrief(prev => ({
      ...prev,
      destination: matched ? (matched.name || matched.title) : destinationParam,
      _destinationObj: matched || null,
    }));
  }, [destinationParam, searchableDestinations]);

  // ── Chat state ────────────────────────────────────────────────────────────
  const welcomeContent = rentalNameParam
    ? `**Namaste! Trip Concierge here.**\n\nI see you have selected **${rentalNameParam}** from **${rentalLocationParam || 'Uttarakhand'}** as your ride! Let us build the perfect trip around it.\n\nTell me: **Where do you want to ride to?** And how many days are you planning?`
    : `**Namaste! Welcome to AI Trip Concierge.**\n\nMain aapka personal Himalayan travel assistant hoon. Bas ek line mein batao:\n\n**"Mujhe Kedarnath jana hai, 5 din, 2 log, Rs 15,000 budget"**\n\nAur main complete day-by-day itinerary, stays, budget breakdown sab plan kar dunga!`;

  const welcomeSuggestions = rentalNameParam
    ? [`${rentalNameParam} ke saath Rishikesh trip`, 'Destination suggest karo Uttarakhand mein']
    : ['Kedarnath 5-day trip Rs 15,000 mein', 'Rishikesh adventure + rafting 3 din', 'Auli snow trek couple ke liye', 'Nainital family trip budget mein'];

  const [messages, setMessages] = useState([{
    id: 'welcome', role: 'assistant', content: welcomeContent, suggestions: welcomeSuggestions,
  }]);
  const [chatInput, setChatInput] = useState(queryParam || '');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId] = useState(() => `planner_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  const abortRef = useRef(null);
  const messagesEndRef = useRef(null);
  const budgetRequestIdRef = useRef(0);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [showItinerary, setShowItinerary] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [planningError, setPlanningError] = useState('');
  const [showMobileWorkspace, setShowMobileWorkspace] = useState(false);
  const [highlightWorkspace, setHighlightWorkspace] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Auto-fire initial query from URL
  useEffect(() => {
    if (queryParam && messages.length === 1) {
      const t = setTimeout(() => sendChatMessage(queryParam), 800);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Server Budget Calculation (Powered by BudgetEngine.js) ────────────────
  const [serverBudget, setServerBudget] = useState(null);

  useEffect(() => {
    const days = tripBrief.durationDays || tripBrief.numDays;
    const travelers = tripBrief.travelers;

    // Trigger ONLY when required calculation parameters exist
    if (!days || !travelers) {
      setServerBudget(null);
      return;
    }

    const currentReqId = ++budgetRequestIdRef.current;

    const fetchBudget = async () => {
      try {
        const res = await fetch(`${API_BASE}/budget/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            durationDays: Number(days),
            travelersCount: Number(travelers),
            targetBudgetAmount: tripBrief.budget ? Number(tripBrief.budget) : undefined,
            budgetPreference: tripBrief.budget ? (tripBrief.budget < 8000 ? 'Budget' : tripBrief.budget > 25000 ? 'Luxury' : 'Balanced') : 'Balanced'
          })
        });
        if (res.ok) {
          const data = await res.json();
          // Latest-request-wins protection against out-of-order async race conditions
          if (currentReqId === budgetRequestIdRef.current && data.success && data.data) {
            setServerBudget(data.data);
          }
        }
      } catch (err) {
        console.warn('[TripPlanner] Budget API warning:', err);
      }
    };

    fetchBudget();
  }, [tripBrief.durationDays, tripBrief.numDays, tripBrief.travelers, tripBrief.budget, tripBrief.transport]);

  // ── Merge entities into tripBrief ─────────────────────────────────────────
  const mergeEntities = useCallback((input) => {
    let extracted = typeof input === 'string' ? extractEntitiesFromText(input) : (input || {});
    if (!extracted || Object.keys(extracted).length === 0) return;
    setTripBrief(prev => {
      const next = { ...prev };
      const d = extracted.destination;
      const days = extracted.durationDays || extracted.duration || extracted.numDays;
      const b = extracted.budget || extracted.budgetAmount;
      const t = extracted.travelers;
      const tr = extracted.transport;
      const o = extracted.origin;

      if (d) next.destination = d;
      if (days) {
        next.durationDays = Number(days);
        next.numDays = Number(days);
      }
      if (b) next.budget = Number(b);
      if (t) next.travelers = Number(t);
      if (tr) next.transport = tr;
      if (o) {
        next.startingLocation = {
          name: o.includes(',') ? o : `${o}, India`,
          coordinates: prev.startingLocation?.coordinates || [30.3165, 78.0322]
        };
      }
      if (extracted.vibes?.length > 0) next.vibes = extracted.vibes;
      return next;
    });
    setHighlightWorkspace(true);
    setTimeout(() => setHighlightWorkspace(false), 1400);
  }, []);

  // ── Send chat message ─────────────────────────────────────────────────────
  const sendChatMessage = useCallback(async (textOverride) => {
    const clean = (textOverride !== undefined ? textOverride : chatInput).trim();
    if (!clean || isChatLoading) return;

    setChatInput('');
    setIsChatLoading(true);
    setIsStreaming(true);
    mergeEntities(clean);

    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: clean };
    const streamId = `a-${Date.now()}`;
    const streamMsg = { id: streamId, role: 'assistant', content: '', isStreaming: true };
    setMessages(prev => [...prev, userMsg, streamMsg]);

    try {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const response = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({ message: clean, sessionId, context: 'trip_planner', tripBrief }),
        signal: abortRef.current.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';
      let agentName = 'Trip Concierge';
      let suggestions = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.trim() || line.startsWith('event: ')) continue;
          if (line.startsWith('data: ')) {
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') break;
            try {
              const parsed = JSON.parse(raw);
              if (parsed.token) {
                fullContent += parsed.token;
                setMessages(prev => prev.map(m => m.id === streamId ? { ...m, content: fullContent } : m));
              }
              if (parsed.agent) agentName = parsed.agent;
              if (parsed.suggestions) suggestions = parsed.suggestions;
              if (parsed.entities) mergeEntities(parsed.entities);
              if (parsed.prefill) mergeEntities(parsed.prefill);
              if (parsed.data?.entities) mergeEntities(parsed.data.entities);
              if (parsed.data?.prefill) mergeEntities(parsed.data.prefill);
              if (parsed.response?.entities) mergeEntities(parsed.response.entities);
              if (parsed.response?.prefill) mergeEntities(parsed.response.prefill);
              if (parsed.action === 'PREFILL_TRIP_PLANNER' && parsed.data) mergeEntities(parsed.data);
            } catch {
              fullContent += raw;
              setMessages(prev => prev.map(m => m.id === streamId ? { ...m, content: fullContent } : m));
            }
          }
        }
      }

      mergeEntities(fullContent);
      const finalSuggestions = suggestions.length > 0 ? suggestions : inferSuggestions(tripBrief);
      setMessages(prev => prev.map(m =>
        m.id === streamId ? { ...m, content: fullContent, isStreaming: false, agent: agentName, suggestions: finalSuggestions } : m
      ));
    } catch (err) {
      if (err.name === 'AbortError') {
        setMessages(prev => prev.filter(m => m.id !== streamId));
      } else {
        const fallback = buildFallbackResponse(clean, tripBrief);
        setMessages(prev => prev.map(m =>
          m.id === streamId ? { ...m, content: fallback.content, isStreaming: false, suggestions: fallback.suggestions } : m
        ));
        mergeEntities(clean);
      }
    } finally {
      setIsChatLoading(false);
      setIsStreaming(false);
    }
  }, [chatInput, isChatLoading, sessionId, tripBrief, mergeEntities]);

  // ── Trip Brief computed fields ─────────────────────────────────────────────
  const briefFields = [
    { key: 'destination', label: 'Destination', value: tripBrief.destination },
    { key: 'durationDays', label: 'Duration', value: (tripBrief.durationDays || tripBrief.numDays) ? `${tripBrief.durationDays || tripBrief.numDays} Days` : null },
    { key: 'budget', label: 'Budget', value: tripBrief.budget ? `Rs ${tripBrief.budget.toLocaleString('en-IN')}` : null },
    { key: 'travelers', label: 'Travelers', value: tripBrief.travelers ? `${tripBrief.travelers} People` : null },
    { key: 'transport', label: 'Transport', value: tripBrief.transport },
  ];
  const filledCount = briefFields.filter(f => !!f.value).length;
  const canGenerate = filledCount >= 2;

  const budgetBreakdown = useMemo(() => {
    const days = tripBrief.durationDays || tripBrief.numDays;
    if (!days || !tripBrief.travelers) return null;
    if (serverBudget) {
      const summary = serverBudget.summary || {};
      const bd = serverBudget.breakdown || {};
      const total = summary.totalEstimatedCost || summary.maxCost || 0;
      const stayTotal = bd.stay ? (bd.stay.knownCost + bd.stay.estimatedCost) : 0;
      const transTotal = bd.transport ? (bd.transport.knownCost + bd.transport.estimatedCost) : 0;
      const foodTotal = bd.food ? bd.food.estimatedCost : 0;
      const actTotal = bd.guide ? bd.guide.estimatedCost : 0;
      const travelers = Math.max(1, tripBrief.travelers);
      return {
        total,
        stayTotal,
        transTotal,
        foodTotal,
        actTotal,
        perPerson: Math.round(total / travelers),
        summary,
        breakdown: bd,
        assumptions: serverBudget.assumptions || []
      };
    }
    return null;
  }, [tripBrief.durationDays, tripBrief.numDays, tripBrief.travelers, tripBrief.budget, serverBudget]);

  // ── Generate itinerary ────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setPlanningError('');
    setIsPlanning(true);
    try {
      const destName = tripBrief.destination || 'Chopta';
      const primaryDest = tripBrief._destinationObj ||
        searchableDestinations.find(d =>
          d.name?.toLowerCase().includes(destName.toLowerCase()) ||
          d.title?.toLowerCase().includes(destName.toLowerCase())
        ) ||
        { name: destName, district: 'Uttarakhand', coordinates: [30.4854, 79.1869] };

      let routeData = { totalDistanceKm: 240, estimatedTime: '6h 30m', geometry: null, legs: [] };
      if (tripBrief.startingLocation.coordinates && primaryDest.coordinates) {
        try {
          routeData = await fetchOSRMRoute([
            { coordinates: tripBrief.startingLocation.coordinates, name: tripBrief.startingLocation.name },
            { coordinates: primaryDest.coordinates, name: primaryDest.name || primaryDest.title },
          ]);
        } catch (e) {
          console.warn('OSRM fallback:', e);
        }
      }

      const numDays = tripBrief.numDays || 5;
      const budget = tripBrief.budget || 15000;
      const travelers = tripBrief.travelers || 2;
      const transport = tripBrief.transport || 'Car';
      const vibes = tripBrief.vibes.length > 0 ? tripBrief.vibes : ['Adventure', 'Peaceful'];

      const preferences = {
        duration: `${numDays} Days`,
        pace: tripBrief.pace,
        travelMode: `By ${transport}`,
        transport: `By ${transport}`,
        travelers: `${travelers} Travelers`,
        tripType: vibes,
        budget: budget < 10000 ? 'Budget' : budget > 25000 ? 'Premium' : 'Comfort',
      };

      const dayPlans = generatePersonalizedTripPlan({
        startingLocation: tripBrief.startingLocation,
        destination: primaryDest,
        preferences,
        routeData,
        allActivities,
        allSpiritual,
        allStays,
      });

      const tripId = `trip_${Date.now()}`;
      const tripSession = {
        tripId,
        title: `My ${primaryDest.name || primaryDest.title} Journey`,
        startingLocation: tripBrief.startingLocation,
        destination: primaryDest,
        duration: `${numDays} Days`,
        travelers: `${travelers} Travelers`,
        transport: `By ${transport}`,
        tripType: vibes,
        pace: tripBrief.pace,
        budget: preferences.budget,
        routeData,
        dayPlans,
        budgetBreakdown: budgetBreakdown || (serverBudget ? {
          total: serverBudget.summary?.totalEstimatedCost || 0,
          perPerson: Math.round((serverBudget.summary?.totalEstimatedCost || 0) / Math.max(1, travelers)),
          summary: serverBudget.summary || {},
          breakdown: serverBudget.breakdown || {}
        } : null),
        status: 'Planning',
      };

      setActiveTripSession(tripSession);
      try { localStorage.setItem('discovery_active_trip', JSON.stringify(tripSession)); } catch {}
      setGeneratedItinerary(tripSession);
      setShowItinerary(true);
    } catch (err) {
      console.error('Generate error:', err);
      setPlanningError('Could not generate itinerary. Please try again.');
    } finally {
      setIsPlanning(false);
    }
  };

  // ── Inline field editor ───────────────────────────────────────────────────
  const saveEditField = (key) => {
    const v = editValue.trim();
    if (!v) { setEditingField(null); return; }
    setTripBrief(prev => {
      const next = { ...prev };
      if (key === 'numDays') next.numDays = parseInt(v) || prev.numDays;
      else if (key === 'budget') {
        let parsed = v.replace(/[^0-9k]/gi, '');
        if (parsed.toLowerCase().endsWith('k')) parsed = parsed.slice(0, -1) + '000';
        next.budget = parseInt(parsed) || prev.budget;
      }
      else if (key === 'travelers') next.travelers = parseInt(v) || prev.travelers;
      else next[key] = v;
      return next;
    });
    setEditingField(null);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      {/* ── ITINERARY RESULT VIEW ── */}
      {showItinerary && generatedItinerary ? (
        <ItineraryResult
          itinerary={generatedItinerary}
          onBack={() => setShowItinerary(false)}
          onNavigate={navigate}
        />
      ) : (
        /* ── CONCIERGE WORKSPACE ── */
        <div className="flex-grow flex flex-col overflow-hidden">

          {/* Top bar */}
          <div className="border-b border-stone-200 bg-white px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0f3d2e] flex items-center justify-center shrink-0">
                <Bot size={17} className="text-emerald-300" />
              </div>
              <div>
                <h1 className="text-sm font-black text-stone-900 leading-tight">AI Trip Concierge</h1>
                <p className="text-[10px] text-stone-500 font-medium hidden sm:block">
                  Powered by Devbhoomi Intelligence · Uttarakhand
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMobileWorkspace(v => !v)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-bold whitespace-nowrap"
              >
                <FileText size={13} />
                Trip Brief
                {filledCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#0f3d2e] text-white text-[9px] font-black flex items-center justify-center">
                    {filledCount}
                  </span>
                )}
              </button>

              {canGenerate && (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isPlanning}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f3d2e] hover:bg-[#144c3a] text-white text-xs font-bold shadow-md transition-all disabled:opacity-70 whitespace-nowrap"
                >
                  {isPlanning
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Sparkles size={13} className="text-emerald-300" />}
                  <span className="hidden sm:inline">{isPlanning ? 'Generating...' : 'Generate Itinerary'}</span>
                  <span className="sm:hidden">{isPlanning ? '...' : 'Generate'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile workspace drawer */}
          {showMobileWorkspace && (
            <div className="lg:hidden border-b border-stone-200 bg-white shadow-sm animate-in slide-in-from-top-2 duration-200 max-h-[60vh] overflow-y-auto">
              <WorkspacePanel
                tripBrief={tripBrief}
                setTripBrief={setTripBrief}
                briefFields={briefFields}
                filledCount={filledCount}
                budgetBreakdown={budgetBreakdown}
                canGenerate={canGenerate}
                isPlanning={isPlanning}
                onGenerate={handleGenerate}
                planningError={planningError}
                editingField={editingField}
                setEditingField={setEditingField}
                editValue={editValue}
                setEditValue={setEditValue}
                saveEditField={saveEditField}
                highlight={highlightWorkspace}
                rentalNameParam={rentalNameParam}
                rentalLocationParam={rentalLocationParam}
                rentalPriceParam={rentalPriceParam}
                compact
              />
            </div>
          )}

          {/* 2-panel layout */}
          <div className="flex-grow flex overflow-hidden" style={{ height: 'calc(100dvh - 120px)' }}>

            {/* ── LEFT: Chat panel ── */}
            <div className="flex flex-col flex-1 lg:w-[60%] lg:max-w-[60%] border-r border-stone-200 overflow-hidden">

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5">
                {messages.map(msg => (
                  <ChatMessage key={msg.id} msg={msg} onSuggestion={sendChatMessage} />
                ))}
                {isStreaming && messages[messages.length - 1]?.isStreaming && (
                  <div className="flex items-center gap-2 pl-11 text-stone-400 text-xs">
                    <span className="flex gap-1">
                      {[0, 150, 300].map(delay => (
                        <span
                          key={delay}
                          className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </span>
                    <span>Thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick suggestion chips (only on first view) */}
              {messages.length <= 2 && (
                <div className="px-4 sm:px-5 pb-2 flex flex-wrap gap-2 overflow-x-auto">
                  {QUICK_SUGGESTIONS.slice(0, 4).map(s => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => sendChatMessage(s.query)}
                      className="px-3 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 transition-all whitespace-nowrap shrink-0"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Input bar */}
              <div className="border-t border-stone-200 bg-white px-4 py-3">
                {planningError && (
                  <div className="mb-2 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
                    <AlertCircle size={13} className="shrink-0" />
                    {planningError}
                  </div>
                )}
                <form
                  onSubmit={e => { e.preventDefault(); sendChatMessage(); }}
                  className="flex items-end gap-2"
                >
                  <textarea
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
                    }}
                    rows={1}
                    placeholder="Bolo... 'Kedarnath 5 din, 2 log, Rs 15,000 mein plan karo'"
                    className="flex-1 resize-none rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0f3d2e]/30 focus:border-[#0f3d2e] leading-relaxed max-h-32 overflow-y-auto transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isChatLoading}
                    className="w-11 h-11 rounded-2xl bg-[#0f3d2e] hover:bg-[#144c3a] text-white flex items-center justify-center shrink-0 shadow-md transition-all disabled:opacity-50"
                  >
                    {isChatLoading
                      ? <Loader2 size={16} className="animate-spin" />
                      : <Send size={16} />}
                  </button>
                </form>
                <p className="text-[10px] text-stone-400 mt-1.5 text-center">
                  Hindi, Hinglish, ya English — sab samajhta hoon! 
                </p>
              </div>
            </div>

            {/* ── RIGHT: Workspace panel (desktop only) ── */}
            <div className="hidden lg:flex lg:flex-col lg:w-[40%] overflow-y-auto bg-white">
              <WorkspacePanel
                tripBrief={tripBrief}
                setTripBrief={setTripBrief}
                briefFields={briefFields}
                filledCount={filledCount}
                budgetBreakdown={budgetBreakdown}
                canGenerate={canGenerate}
                isPlanning={isPlanning}
                onGenerate={handleGenerate}
                planningError={planningError}
                editingField={editingField}
                setEditingField={setEditingField}
                editValue={editValue}
                setEditValue={setEditValue}
                saveEditField={saveEditField}
                highlight={highlightWorkspace}
                rentalNameParam={rentalNameParam}
                rentalLocationParam={rentalLocationParam}
                rentalPriceParam={rentalPriceParam}
                compact={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT MESSAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
function ChatMessage({ msg, onSuggestion }) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-[#0f3d2e] text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-sm">
          <p className="text-sm leading-relaxed">{msg.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 max-w-full">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0f3d2e] to-emerald-700 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
        <Bot size={15} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        {msg.agent && (
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1 block">
            {msg.agent}
          </span>
        )}
        <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          <div>{renderMarkdown(msg.content)}</div>
          {msg.isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-emerald-500 animate-pulse ml-0.5 rounded-sm" />
          )}
        </div>
        {msg.suggestions?.length > 0 && !msg.isStreaming && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {msg.suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSuggestion(s)}
                className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-all whitespace-nowrap"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORKSPACE PANEL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
function WorkspacePanel({
  tripBrief, setTripBrief, briefFields, filledCount, budgetBreakdown,
  canGenerate, isPlanning, onGenerate, planningError,
  editingField, setEditingField, editValue, setEditValue, saveEditField,
  highlight, rentalNameParam, rentalLocationParam, rentalPriceParam, compact,
}) {
  const progressPct = Math.round((filledCount / 5) * 100);

  return (
    <div
      className={`flex flex-col h-full ${compact ? 'p-4' : 'p-6'} gap-4 transition-colors duration-500 ${highlight ? 'bg-emerald-50/50' : 'bg-white'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#0f3d2e] flex items-center justify-center shrink-0">
            <Map size={13} className="text-emerald-300" />
          </div>
          <div>
            <h2 className="text-xs font-black text-stone-900 uppercase tracking-wider">Trip Brief</h2>
            <p className="text-[10px] text-stone-400">AI-extracted from your chat</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-black text-[#0f3d2e]">{filledCount}/5 filled</div>
          <div className="w-20 h-1.5 bg-stone-100 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0f3d2e] to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Rental anchor */}
      {rentalNameParam && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="w-8 h-8 rounded-xl bg-[#0f3d2e] text-white flex items-center justify-center shrink-0">
            <Bike size={15} className="text-emerald-300" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Trip Anchor</div>
            <div className="text-xs font-bold text-stone-900 truncate">{rentalNameParam}</div>
            <div className="text-[10px] text-stone-500">
              {rentalLocationParam || 'Uttarakhand'} pickup{rentalPriceParam ? ` · Rs ${rentalPriceParam}/day` : ''}
            </div>
          </div>
        </div>
      )}

      {/* Brief fields */}
      <div className={`space-y-2 ${compact ? '' : 'flex-1'}`}>
        {briefFields.map(field => (
          <div
            key={field.key}
            className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all ${field.value ? 'bg-white border-emerald-200 shadow-sm' : 'bg-stone-50 border-stone-100'}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {field.value
                ? <Check size={12} strokeWidth={3} className="text-emerald-600 shrink-0" />
                : <span className="w-3 h-3 rounded-full border-2 border-stone-300 shrink-0" />}
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">{field.label}</div>
                {editingField === field.key ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <input
                      type="text"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveEditField(field.key);
                        if (e.key === 'Escape') setEditingField(null);
                      }}
                      autoFocus
                      className="text-xs font-bold border border-emerald-300 rounded-lg px-2 py-0.5 w-28 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => saveEditField(field.key)}
                      className="text-[10px] text-emerald-700 font-bold"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-stone-900 truncate">
                    {field.value || (
                      <span className="text-stone-300 font-normal">Not set — just ask me!</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            {field.value && editingField !== field.key && (
              <button
                type="button"
                onClick={() => {
                  setEditingField(field.key);
                  setEditValue(field.value.replace(/[^0-9a-zA-Z\s]/g, '').trim());
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-stone-100"
              >
                <PenLine size={11} className="text-stone-400" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Vibes */}
      {tripBrief.vibes.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wide mb-1.5">Travel Vibes</div>
          <div className="flex flex-wrap gap-1.5">
            {tripBrief.vibes.map(v => (
              <span key={v} className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                {v}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Live budget estimate (Powered by BudgetEngine.js) */}
      {budgetBreakdown && (
        <div className="bg-gradient-to-br from-[#0f3d2e] via-[#144c3a] to-stone-900 rounded-2xl p-4 text-white shadow-md border border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <Wallet size={13} className="text-emerald-400" />
              <span>Budget Engine Analysis</span>
            </div>
            {budgetBreakdown.summary?.budgetStatus && (
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                budgetBreakdown.summary.budgetStatus === 'OVER_BUDGET'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                  : budgetBreakdown.summary.budgetStatus === 'UNDER_BUDGET'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  : 'bg-teal-500/20 text-teal-300 border-teal-400/40'
              }`}>
                {budgetBreakdown.summary.budgetStatus.replace('_', ' ')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 my-2 py-2 px-3 rounded-xl bg-black/20 border border-white/5 text-xs">
            <div>
              <span className="text-[10px] text-emerald-200/70 block">Target Budget</span>
              <strong className="text-sm font-black text-white">
                {tripBrief.budget ? `Rs ${tripBrief.budget.toLocaleString('en-IN')}` : 'Not specified'}
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-emerald-200/70 block">Estimated Cost</span>
              <strong className="text-sm font-black text-emerald-300">
                Rs {budgetBreakdown.total.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

          <div className="space-y-1.5 text-xs mt-3">
            {[
              { label: 'Stays', val: budgetBreakdown.stayTotal, prov: budgetBreakdown.breakdown?.stay?.provenance || 'ESTIMATED' },
              { label: 'Transport', val: budgetBreakdown.transTotal, prov: budgetBreakdown.breakdown?.transport?.provenance || 'ESTIMATED' },
              { label: 'Food & Meals', val: budgetBreakdown.foodTotal, prov: budgetBreakdown.breakdown?.food?.provenance || 'ESTIMATED' },
              { label: 'Activities & Guide', val: budgetBreakdown.actTotal, prov: budgetBreakdown.breakdown?.guide?.provenance || 'ESTIMATED' },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between text-emerald-100/90 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span>{r.label}</span>
                  <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                    r.prov === 'VERIFIED'
                      ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                      : r.prov === 'UNKNOWN'
                      ? 'bg-stone-500/20 text-stone-300 border border-stone-400/30'
                      : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                  }`}>
                    {r.prov}
                  </span>
                </div>
                <span className="font-bold">Rs {r.val.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          {budgetBreakdown.summary?.explanation && (
            <p className="mt-2.5 pt-2 border-t border-white/10 text-[10px] text-emerald-200/80 leading-relaxed italic">
              "{budgetBreakdown.summary.explanation}"
            </p>
          )}

          <div className="mt-2 text-[10px] text-emerald-300/60 text-right">
            ~Rs {budgetBreakdown.perPerson.toLocaleString('en-IN')} / traveler
          </div>
        </div>
      )}

      {/* Pace selector (desktop only) */}
      {!compact && (
        <div>
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wide mb-1.5">Trip Pace</div>
          <div className="grid grid-cols-3 gap-2">
            {['Relaxed', 'Balanced', 'Fast-Paced'].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setTripBrief(prev => ({ ...prev, pace: p }))}
                className={`py-2 rounded-xl border text-[10px] font-bold transition-all ${tripBrief.pace === p ? 'bg-[#0f3d2e] text-white border-[#0f3d2e]' : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className={`${compact ? '' : 'mt-auto'} pt-2`}>
        {canGenerate ? (
          <button
            type="button"
            onClick={onGenerate}
            disabled={isPlanning}
            className="w-full py-3.5 rounded-2xl bg-[#0f3d2e] hover:bg-[#144c3a] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 transition-all disabled:opacity-70"
          >
            {isPlanning ? (
              <><Loader2 size={16} className="animate-spin" /><span>Crafting Your Plan...</span></>
            ) : (
              <><Sparkles size={15} className="text-emerald-300" /><span>Generate My Itinerary</span><ArrowRight size={14} /></>
            )}
          </button>
        ) : (
          <div className="w-full py-3 rounded-2xl border-2 border-dashed border-stone-200 text-center">
            <p className="text-xs text-stone-400 font-medium">Tell me destination + trip details to generate</p>
            <p className="text-[10px] text-stone-300 mt-0.5">({5 - filledCount} more detail{5 - filledCount !== 1 ? 's' : ''} helpful)</p>
          </div>
        )}
        {planningError && (
          <p className="text-xs text-red-600 mt-2 text-center font-medium">{planningError}</p>
        )}
        {canGenerate && (
          <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-stone-400">
            <ShieldCheck size={11} className="text-emerald-600" />
            <span>Database-grounded plan</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ITINERARY RESULT VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function ItineraryResult({ itinerary, onBack, onNavigate }) {
  const bd = itinerary.budgetBreakdown;
  return (
    <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 pb-24">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0f3d2e] border border-emerald-200">
              Itinerary Ready
            </span>
            <span className="text-xs font-semibold text-stone-500">
              {itinerary.duration} · {itinerary.travelers} · {itinerary.transport}
            </span>
          </div>
          <h2 className="text-2xl font-black text-stone-900">{itinerary.title}</h2>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <RotateCcw size={13} />
            <span className="whitespace-nowrap">Edit Trip</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate(`/checkout/trip/${itinerary.tripId}`)}
            className="px-5 py-2.5 rounded-xl bg-[#0f3d2e] hover:bg-[#144c3a] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
          >
            <Lock size={13} className="text-emerald-300" />
            <span>Book via Escrow</span>
          </button>
        </div>
      </div>

      {/* 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
            <Calendar size={18} className="text-[#0f3d2e]" />
            Daily Schedule &amp; Mountain Route
          </h3>

          <div className="space-y-4">
            {itinerary.dayPlans?.map((day, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:border-stone-300 transition-all">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-[#0f3d2e] text-white flex items-center justify-center font-black text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 leading-tight">
                        Day {idx + 1}: {day.title || day.theme || `Explore ${day.where || 'Devbhoomi'}`}
                      </h4>
                      <span className="text-[11px] font-semibold text-stone-500">
                        {day.where || 'Mountain Valley'} · {day.activities?.length || 2} Activities
                      </span>
                    </div>
                  </div>
                  {day.driveInfo && (
                    <span className="text-[11px] font-semibold bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md whitespace-nowrap hidden sm:block">
                      {day.driveInfo}
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  {[
                    { Icon: Sun, color: 'text-amber-500', title: 'Morning Exploration', text: day.morningActivity || 'Scenic sunrise drive and temple darshan with mountain vista.' },
                    { Icon: Sunset, color: 'text-amber-600', title: 'Afternoon Adventure', text: day.afternoonActivity || 'Local valley trek or riverside cafe with organic Pahadi food.' },
                    { Icon: Moon, color: 'text-indigo-500', title: 'Overnight Stay', text: day.stay?.name || 'Verified Mountain Homestay / Eco Retreat' },
                  ].map(({ Icon, color, title, text }) => (
                    <div key={title} className="flex items-start gap-3 bg-[#fdfbf7] p-3 rounded-xl border border-stone-100">
                      <Icon size={15} className={`${color} shrink-0 mt-0.5`} />
                      <div>
                        <strong className="text-stone-800 block font-bold">{title}</strong>
                        <p className="text-stone-600 text-[11px] mt-0.5">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget sidebar */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-1.5">
                <Wallet size={16} className="text-[#0f3d2e]" />
                Budget Breakdown
              </h3>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Transparent
              </span>
            </div>

            <div className="space-y-3 text-xs text-stone-600">
              {[
                { label: 'Stays', val: bd?.stayTotal, pct: '45%', color: 'bg-[#0f3d2e]' },
                { label: 'Transport', val: bd?.transTotal, pct: '30%', color: 'bg-emerald-600' },
                { label: 'Food & Meals', val: bd?.foodTotal, pct: '15%', color: 'bg-amber-500' },
                { label: 'Activities', val: bd?.actTotal, pct: '10%', color: 'bg-indigo-500' },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex justify-between mb-1">
                    <span>{row.label}</span>
                    <strong className="text-stone-900">Rs {(row.val || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div className={`${row.color} h-full rounded-full`} style={{ width: row.pct }} />
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between font-bold text-stone-900">
                <span>Total Estimated</span>
                <span className="text-xl font-black text-[#0f3d2e]">
                  Rs {(bd?.total || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-[11px] text-stone-400 text-right">
                ~Rs {(bd?.perPerson || 0).toLocaleString('en-IN')} per traveler
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate(`/checkout/trip/${itinerary.tripId}`)}
              className="w-full mt-6 bg-[#0f3d2e] hover:bg-[#144c3a] active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              <Lock size={15} className="text-emerald-300" />
              Lock Itinerary in Escrow
            </button>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>4-Digit Handshake OTP Escrow Protection</span>
            </div>
          </div>

          <div className="bg-[#fdfbf7] p-4 rounded-2xl border border-stone-200 text-center">
            <Link
              to={`/my-trip/${itinerary.tripId}`}
              className="text-xs font-bold text-[#0f3d2e] hover:underline inline-flex items-center gap-1"
            >
              <span>Open in Full On-Trip Workspace Map</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
