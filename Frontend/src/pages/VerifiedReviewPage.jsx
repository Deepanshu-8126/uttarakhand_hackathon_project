import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Award,
  Coins,
  MapPin,
  ExternalLink,
  Camera,
  Star,
  Lock,
  ArrowRight,
  ThumbsUp,
  FileCheck,
  AlertTriangle,
  RefreshCw,
  Flame,
  Check,
  Share2,
  Filter
} from 'lucide-react';

// Sample Trek Proof Data for the 3-step verification flow
const VERIFIED_TRIP_MOCK = {
  id: 'kedarnath-yatra-a',
  title: 'Kedarnath Yatra A (Gaurikund to Temple)',
  date: '20 - 22 Sept 2026',
  trailDistance: '8.4 km tracked',
  elevationGain: '+1,420m',
  gpsPointsCount: 428,
  isGpsCompleted: true,
  guideName: 'Sundar Singh Negi (SDRF Level 2)',
  photosCount: 4,
  photosMax: 4,
  photos: [
    {
      url: '/assets/kedarnath.jpg',
      caption: 'Base Camp Approach',
      coords: '30.7352° N, 79.0669° E',
      time: '21 Sept, 08:30 AM',
      hash: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'
    },
    {
      url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
      caption: 'Bhairavnath High Ridge',
      coords: '30.7391° N, 79.0712° E',
      time: '21 Sept, 11:15 AM',
      hash: 'bafybeihkovi2u3g5d2lq76t6o77m5t32n57j6f7r3s7y55fbzdi99a'
    },
    {
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      caption: 'Mandakini River Crossing',
      coords: '30.7410° N, 79.0740° E',
      time: '21 Sept, 02:00 PM',
      hash: 'bafybeicvu4d47u4b75j3g4k3l5m6n7o8p9q0r1s2t3u4v5w6x7y8z'
    },
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      caption: 'Temple Quadrangle At Dawn',
      coords: '30.7346° N, 79.0671° E',
      time: '22 Sept, 06:45 AM',
      hash: 'bafybeid5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a'
    }
  ]
};

// Initial public reviews with on-chain metadata
const INITIAL_PUBLIC_REVIEWS = [
  {
    id: 'rev-1',
    user: {
      name: 'Rohan Sharma',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      wallet: '0x3F8a...92bC',
      role: 'Alpine Trekker'
    },
    isVerified: true,
    tripName: 'Kedarnath High Trail',
    trailDist: '8.4 km',
    date: '23 Sept 2026',
    rating: 5,
    ratingLabel: 'Divine 🙏',
    text: 'Trek was genuinely verified on GPS. Early morning weather was clear near Bhairavnath. Our guide Sundar had emergency medical kit and oxygen canister. The trail is clean if you stick to the mule-free bypass path.',
    tags: ['Clean Trail', 'Helpful Guide', 'Sacred Aura'],
    photos: [
      {
        url: '/assets/kedarnath.jpg',
        coords: '30.7352° N, 79.0669° E'
      },
      {
        url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=600&q=80',
        coords: '30.7391° N, 79.0712° E'
      }
    ],
    helpfulCount: 24,
    hasUpvoted: false,
    coinsEarned: 50,
    txHash: '0x8f2a99182d37c9f80b2a75d81239c018a7b3e512903847a98bcdef1289178234',
    nftTokenId: 'UK-REV-8492'
  },
  {
    id: 'rev-2',
    user: {
      name: 'Dr. Ananya Joshi',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      wallet: '0x71Ce...B490',
      role: 'Family Pilgrim'
    },
    isVerified: true,
    tripName: 'Tungnath - Chandrashila Peak',
    trailDist: '5.2 km',
    date: '19 Sept 2026',
    rating: 5,
    ratingLabel: 'Divine 🙏',
    text: 'The offline trail tracking is a life saver because mobile network drops before Chopta meadow. AI route predicted cloud cover with 90% accuracy. The paved stone pathway is steep but well managed by local panchayat.',
    tags: ['Family Friendly', 'Clean Trail', 'Sacred Aura'],
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
        coords: '30.4889° N, 79.2173° E'
      },
      {
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
        coords: '30.4912° N, 79.2201° E'
      }
    ],
    helpfulCount: 38,
    hasUpvoted: false,
    coinsEarned: 50,
    txHash: '0x3c71a9e8802914dbca713982e018fb37a916723489100234acbdef7189234120',
    nftTokenId: 'UK-REV-8493'
  },
  {
    id: 'rev-3',
    user: {
      name: 'Vikramaditya Rawat',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      wallet: '0x9E21...4Fa8',
      role: 'Expedition Lead'
    },
    isVerified: true,
    tripName: 'Munsiyari - Milam Base',
    trailDist: '14.6 km',
    date: '15 Sept 2026',
    rating: 4,
    ratingLabel: 'Great',
    text: 'Rough alpine conditions past Johar valley. Homestay hosts provided warm thukpa and buckwheat rotis. Escrow payment was released only after we verified arrival at KMVN rest point. Transparent system!',
    tags: ['Hard Trek', 'Helpful Guide'],
    photos: [],
    helpfulCount: 17,
    hasUpvoted: false,
    coinsEarned: 50,
    txHash: '0x6e911f43a90812bca0129487c9182bc871239014abdef7812903847192340128',
    nftTokenId: 'UK-REV-8494'
  }
];

export default function VerifiedReviewPage({ defaultView = 'write' }) {
  const { tripId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Active view: 'write' (3-step flow) or 'feed' (public on-chain feed)
  const isFeedRoute = location.pathname === '/reviews' || defaultView === 'feed';
  const [activeTab, setActiveTab] = useState(isFeedRoute ? 'feed' : 'write');

  // Step 1: Verification State
  const [isTrekVerified, setIsTrekVerified] = useState(true); // Toggleable for hackathon demo

  // Step 2: Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState(
    'Trek complete kiya! Chopta se Tungnath trail bohot sundar tha. Subah 6 baje rasta bilkul shaant tha aur local guide ne pure raste safety ka dhyan rakha.'
  );
  const [isAiRewriting, setIsAiRewriting] = useState(false);
  const [selectedTags, setSelectedTags] = useState(['Clean Trail', 'Helpful Guide']);

  // Step 3: Web3 Minting Simulation State
  const [mintStatus, setMintStatus] = useState('idle'); // 'idle' | 'checking' | 'minting' | 'rewarded' | 'success'
  const [mintTxHash, setMintTxHash] = useState('');
  const [earnedCoins, setEarnedCoins] = useState(0);

  // Feed State
  const [publicReviews, setPublicReviews] = useState(INITIAL_PUBLIC_REVIEWS);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'verified' | 'photos'

  const ratingLabels = {
    1: '1 - Poor',
    2: '2 - Average',
    3: '3 - Good',
    4: '4 - Great',
    5: '5 - Divine 🙏'
  };

  const availableTags = [
    'Clean Trail',
    'Helpful Guide',
    'Hard Trek',
    'Family Friendly',
    'Challenging Weather',
    'Sacred Aura'
  ];

  // AI Assist Rewriter Actions
  const handleAiAction = (actionType) => {
    setIsAiRewriting(true);
    setTimeout(() => {
      if (actionType === 'helpful') {
        setReviewText(
          `${reviewText.trim()} \n\n💡 Trekker Practical Tips:\n• Best start time: 05:30 AM before pony traffic begins.\n• Water: Fresh stream point available at 4.2 km mark.\n• Gear: Sturdy grip boots essential; temperatures dip to 4°C at night.`
        );
      } else if (actionType === 'hindi') {
        setReviewText(
          'ट्रेक बहुत ही अद्भुत और दिव्य रहा! सुबह 6 बजे का मौसम बेहद साफ़ था। रास्ते में गाइड ने निरंतर सुरक्षा और ऑक्सीजन सपोर्ट बनाए रखा। सभी श्रद्धालुओं को सुबह जल्दी निकलने की सलाह दूंगा।'
        );
      } else if (actionType === 'summarize') {
        setReviewText(
          '⚡ Summary:\n1. Trail condition: Well paved, zero plastic litter.\n2. Guide quality: SDRF certified, emergency kit ready.\n3. Recommendation: Must carry waterproof layers & start early.'
        );
      }
      setIsAiRewriting(false);
    }, 700);
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length < 3) {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  };

  // Step 3: Execute Web3 Minting Simulation Flow
  const handleStartMint = () => {
    if (!isTrekVerified) return;
    setMintStatus('checking');

    // Phase 1: AI Anti-Spam Check (1.2s)
    setTimeout(() => {
      setMintStatus('minting');

      // Phase 2: Polygon Minting (1.8s)
      setTimeout(() => {
        const randomHash =
          '0x' +
          Array.from({ length: 64 }, () =>
            Math.floor(Math.random() * 16).toString(16)
          ).join('');
        setMintTxHash(randomHash);
        setMintStatus('rewarded');
        setEarnedCoins(50);

        // Phase 3: Final Card Display (1.2s)
        setTimeout(() => {
          setMintStatus('success');

          // Prepend new verified review to public list
          const newEntry = {
            id: `rev-${Date.now()}`,
            user: {
              name: 'You (Verified Trekker)',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
              wallet: `${randomHash.slice(0, 6)}...${randomHash.slice(-4)}`,
              role: 'GPS Verified'
            },
            isVerified: true,
            tripName: VERIFIED_TRIP_MOCK.title,
            trailDist: VERIFIED_TRIP_MOCK.trailDistance,
            date: 'Today (Just Now)',
            rating,
            ratingLabel: ratingLabels[rating],
            text: reviewText,
            tags: selectedTags,
            photos: VERIFIED_TRIP_MOCK.photos.slice(0, 2),
            helpfulCount: 1,
            hasUpvoted: false,
            coinsEarned: 50,
            txHash: randomHash,
            nftTokenId: `UK-REV-${Math.floor(1000 + Math.random() * 9000)}`
          };

          setPublicReviews((prev) => [newEntry, ...prev]);
        }, 1200);
      }, 1800);
    }, 1200);
  };

  const handleUpvote = (id) => {
    setPublicReviews((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            helpfulCount: r.hasUpvoted ? r.helpfulCount - 1 : r.helpfulCount + 1,
            hasUpvoted: !r.hasUpvoted
          };
        }
        return r;
      })
    );
  };

  const filteredReviews = publicReviews.filter((r) => {
    if (filterType === 'verified') return r.isVerified;
    if (filterType === 'photos') return r.photos && r.photos.length > 0;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-slate-900 font-sans selection:bg-[#E8F5E9] selection:text-[#0f3d2e]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-28">
        
        {/* Page Top Header with Web3 Verified Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-stone-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-[#E8F5E9] text-[#0f3d2e] border border-emerald-300 shadow-xs">
                VISITOR FEEDBACK • WEB3 VERIFIED
              </span>
              <span className="text-xs text-stone-500 font-semibold flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-700" />
                Zero Fake Reviews · GPS &amp; On-Chain Proven
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              On-Chain Himalayan Feedback
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
              Reviews on Discovery Uttarakhand are minted on-chain only after physical GPS trail completion. Every voice is immutable, genuine, and rewarded.
            </p>
          </div>

          {/* Tab Switcher: Write Review vs Public Feed */}
          <div className="flex items-center bg-stone-100 p-1.5 rounded-2xl border border-stone-200/90 w-full sm:w-auto shrink-0 shadow-xs">
            <button
              onClick={() => setActiveTab('write')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'write'
                  ? 'bg-[#0f3d2e] text-white shadow-sm'
                  : 'text-stone-600 hover:text-slate-900'
              }`}
            >
              <Sparkles size={14} className={activeTab === 'write' ? 'text-emerald-300' : ''} />
              <span>Write Review</span>
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'feed'
                  ? 'bg-[#0f3d2e] text-white shadow-sm'
                  : 'text-stone-600 hover:text-slate-900'
              }`}
            >
              <FileCheck size={14} />
              <span>Public Feed ({publicReviews.length})</span>
            </button>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* VIEW 1: 3-STEP VERIFIED REVIEW FLOW                         */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === 'write' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* ── STEP 1: VERIFY YOUR JOURNEY (AUTO) ── */}
            <div className="bg-white border border-stone-200/90 rounded-[28px] p-5 sm:p-7 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between gap-3 mb-5 border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#0f3d2e] flex items-center justify-center font-black text-xs border border-emerald-300">
                    1
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Step 1 · Trip Verification (Auto)
                  </span>
                </div>

                {/* Hackathon Demo Verification Toggle */}
                <button
                  type="button"
                  onClick={() => setIsTrekVerified(!isTrekVerified)}
                  className={`text-[10px] font-bold px-3 py-1 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isTrekVerified
                      ? 'bg-emerald-50 border-emerald-300 text-[#0f3d2e]'
                      : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}
                  title="Demo switch to test verified vs unverified behavior"
                >
                  <RefreshCw size={11} />
                  <span>Demo Mode: {isTrekVerified ? 'Trek Completed' : 'Trek Incomplete'}</span>
                </button>
              </div>

              {isTrekVerified ? (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
                    <div className="bg-[#f8faf9] border border-emerald-100/80 p-4 rounded-2xl shadow-xs">
                      <span className="text-[10px] font-bold uppercase text-stone-500 block mb-1">
                        Tracked Expedition
                      </span>
                      <p className="text-sm font-black text-slate-900 leading-snug">
                        {VERIFIED_TRIP_MOCK.title}
                      </p>
                      <span className="text-[11px] text-stone-500 mt-1 block">
                        🗓️ {VERIFIED_TRIP_MOCK.date}
                      </span>
                    </div>

                    <div className="bg-[#f8faf9] border border-emerald-100/80 p-4 rounded-2xl shadow-xs">
                      <span className="text-[10px] font-bold uppercase text-stone-500 block mb-1">
                        GPS Route Status
                      </span>
                      <p className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                        <span>GPS Trail Completed</span>
                      </p>
                      <span className="text-[11px] text-stone-600 font-semibold mt-1 block">
                        📍 {VERIFIED_TRIP_MOCK.trailDistance} ({VERIFIED_TRIP_MOCK.elevationGain})
                      </span>
                    </div>

                    <div className="bg-[#f8faf9] border border-emerald-100/80 p-4 rounded-2xl shadow-xs">
                      <span className="text-[10px] font-bold uppercase text-stone-500 block mb-1">
                        Waypoint Photos
                      </span>
                      <p className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                        <span>Photos Uploaded: {VERIFIED_TRIP_MOCK.photosCount}/{VERIFIED_TRIP_MOCK.photosMax}</span>
                      </p>
                      <span className="text-[11px] text-stone-500 mt-1 block">
                        Geo-tagged &amp; Timestamps intact
                      </span>
                    </div>

                    <div className="bg-[#f8faf9] border border-emerald-100/80 p-4 rounded-2xl shadow-xs">
                      <span className="text-[10px] font-bold uppercase text-stone-500 block mb-1">
                        Escrow Guide Attestation
                      </span>
                      <p className="text-xs font-bold text-slate-900">
                        {VERIFIED_TRIP_MOCK.guideName}
                      </p>
                      <span className="text-[10px] text-emerald-800 bg-[#E8F5E9] border border-emerald-300 font-bold px-2 py-0.5 rounded-md inline-block mt-1">
                        Signed On-Chain
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-[#E8F5E9] border border-emerald-300/80">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="text-xs font-bold text-[#0f3d2e]">
                      ✅ Verified Status: Eligible for Web3 Verified Review &amp; 50 DevBhoomi Coins
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-rose-50/70 border border-rose-200 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3 border border-rose-300">
                    <Lock size={22} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-1">
                    Complete your trek to unlock review
                  </h3>
                  <p className="text-xs text-rose-900/80 max-w-md mx-auto mb-4">
                    Our truth verification engine requires 100% GPS trail completion and guide sign-off to prevent paid or unverified promotional reviews.
                  </p>
                  <button
                    onClick={() => setIsTrekVerified(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#0f3d2e] hover:bg-[#154e3b] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Simulate Trek Completion (Demo)
                  </button>
                </div>
              )}
            </div>

            {/* ── STEP 2: AUTHENTIC REVIEW & RATING (MAIN FORM) ── */}
            <div className={`bg-white border border-stone-200/90 rounded-[28px] p-5 sm:p-7 shadow-sm space-y-6 ${!isTrekVerified ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center gap-2.5 border-b border-stone-100 pb-4">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#0f3d2e] flex items-center justify-center font-black text-xs border border-emerald-300">
                  2
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Step 2 · Your Authentic Review &amp; Rating
                </span>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  How was your Uttarakhand experience?
                </h2>
                <p className="text-xs text-stone-600 mt-1">
                  Share candid insights and actionable tips for fellow pilgrims and mountain trekkers.
                </p>
              </div>

              {/* Rate Journey */}
              <div className="bg-[#f8faf9] border border-emerald-100/80 p-4 sm:p-5 rounded-2xl">
                <label className="block text-[11px] font-black uppercase tracking-wider text-stone-500 mb-2.5">
                  Rate Your Journey
                </label>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-115 cursor-pointer focus:outline-none"
                      >
                        <Star
                          size={28}
                          className={`transition-colors ${
                            star <= (hoverRating || rating)
                              ? 'text-amber-500 fill-amber-500 drop-shadow-xs'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm font-black text-[#0f3d2e] bg-[#E8F5E9] border border-emerald-300 px-3 py-1 rounded-full">
                    {ratingLabels[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* Your Experience Textarea with Clean Polish Buttons */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-stone-600">
                    Your Experience (Review &amp; Feedback)
                  </label>
                  <span className="text-[11px] text-stone-500 font-medium">
                    {reviewText.length} characters
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    rows={5}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Describe trail conditions, safety, homestay quality, or tips for future travelers..."
                    className="w-full bg-white border border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-2xl p-4 text-sm text-slate-900 placeholder:text-stone-400 outline-none transition-all leading-relaxed shadow-2xs"
                  />
                  {isAiRewriting && (
                    <div className="absolute inset-0 bg-white/85 backdrop-blur-xs rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-[#0f3d2e] animate-in fade-in">
                      <Sparkles size={16} className="text-emerald-700 animate-spin" />
                      <span>Polishing &amp; Formatting Review...</span>
                    </div>
                  )}
                </div>

                {/* Quick Polish Buttons */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1 mr-1">
                    <Sparkles size={12} className="text-emerald-700" /> Quick Polish:
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAiAction('helpful')}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-xs font-bold text-stone-700 hover:text-emerald-900 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Enhance Clarity</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAiAction('hindi')}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-xs font-bold text-stone-700 hover:text-emerald-900 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🌐 Add Hindi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAiAction('summarize')}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-xs font-bold text-stone-700 hover:text-emerald-900 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>⚡ Summarize</span>
                  </button>
                </div>
              </div>

              {/* Upload Proof (Web3 2x2 Grid) */}
              <div className="bg-[#f8faf9] border border-emerald-100/80 p-4 sm:p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950 block">
                      Uploaded Proof (Web3 On-Chain Evidence)
                    </span>
                    <p className="text-xs text-stone-500 mt-0.5">
                      These photos will be recorded as cryptographic proof on-chain with GPS metadata.
                    </p>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#E8F5E9] border border-emerald-300 text-[#0f3d2e]">
                    IPFS Ready
                  </span>
                </div>

                {/* 2x2 Photo Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {VERIFIED_TRIP_MOCK.photos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-xl overflow-hidden border border-stone-200/90 bg-stone-100 aspect-square shadow-2xs"
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-2 flex flex-col justify-end">
                        <span className="text-[10px] font-black text-white line-clamp-1">
                          {photo.caption}
                        </span>
                        <span className="text-[9px] font-mono text-emerald-300 flex items-center gap-0.5 mt-0.5">
                          <MapPin size={9} />
                          {photo.coords}
                        </span>
                        <span className="text-[8px] text-stone-300 font-mono mt-0.5">
                          CID: {photo.hash.slice(0, 10)}...
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags Selector (Max 3) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-stone-600">
                    Experience Highlights (Pick up to 3)
                  </label>
                  <span className="text-[11px] text-stone-500 font-semibold">
                    {selectedTags.length}/3 selected
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#E8F5E9] border-emerald-400 text-[#0f3d2e] shadow-2xs'
                            : 'bg-white border-stone-200 text-stone-600 hover:text-slate-900 hover:border-emerald-300'
                        }`}
                      >
                        {isSelected && <Check size={12} className="inline mr-1 text-emerald-700" />}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* ── STEP 3: SUBMIT & MINT (ON-CHAIN TRUST) ── */}
            <div className="bg-white border border-stone-200/90 rounded-[28px] p-5 sm:p-7 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 border-b border-stone-100 pb-4">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#0f3d2e] flex items-center justify-center font-black text-xs border border-emerald-300">
                  3
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Step 3 · Submit &amp; Mint On Polygon
                </span>
              </div>

              {mintStatus === 'idle' && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Ready to record your verified feedback?
                    </h3>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Earn +50 DevBhoomi Coins and receive a Soulbound Review NFT proof.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartMint}
                    disabled={!isTrekVerified}
                    className="px-6 py-4 rounded-2xl bg-[#0f3d2e] hover:bg-[#154e3b] text-white font-black text-sm transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-98 flex items-center justify-center gap-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Sparkles size={18} className="text-emerald-300" />
                    <span>Submit &amp; Mint Verified Badge →</span>
                  </button>
                </div>
              )}

              {/* Minting Step-by-Step Animation */}
              {(mintStatus === 'checking' || mintStatus === 'minting' || mintStatus === 'rewarded') && (
                <div className="p-6 rounded-2xl bg-[#f8faf9] border border-emerald-200 space-y-4 shadow-xs">
                  <div className="text-center mb-4">
                    <span className="text-xs font-black uppercase tracking-wider text-[#0f3d2e] block">
                      Cryptographic Review Validation in Progress
                    </span>
                    <p className="text-xs text-stone-500 mt-1">
                      Generating zero-knowledge proof of trail completion...
                    </p>
                  </div>

                  {/* Stage 1: Authenticity & Truth Check */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-stone-200/80">
                    <div className="flex items-center gap-3">
                      {mintStatus === 'checking' ? (
                        <RefreshCw size={18} className="text-amber-600 animate-spin" />
                      ) : (
                        <CheckCircle2 size={18} className="text-emerald-600" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Step 1: Authenticity &amp; Trail Verification...
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {mintStatus === 'checking'
                            ? 'Evaluating trail waypoint telemetry and GPS timestamps...'
                            : '✅ Authentic Trekker Voice (Verified Trail Presence)'}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                      mintStatus === 'checking' ? 'bg-amber-100 text-amber-800' : 'bg-[#E8F5E9] text-[#0f3d2e]'
                    }`}>
                      {mintStatus === 'checking' ? 'Analyzing' : 'Passed'}
                    </span>
                  </div>

                  {/* Stage 2: Minting Review NFT */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-stone-200/80">
                    <div className="flex items-center gap-3">
                      {mintStatus === 'minting' ? (
                        <RefreshCw size={18} className="text-emerald-600 animate-spin" />
                      ) : mintStatus === 'rewarded' ? (
                        <CheckCircle2 size={18} className="text-emerald-600" />
                      ) : (
                        <Lock size={18} className="text-stone-400" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Step 2: Minting Review NFT on Polygon POS...
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {mintStatus === 'minting'
                            ? 'Broadcasting transaction to contract 0x712a...982b'
                            : mintStatus === 'rewarded'
                            ? `✅ Minted on block #4829104`
                            : 'Queued for confirmation'}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                      mintStatus === 'minting'
                        ? 'bg-emerald-100 text-[#0f3d2e] animate-pulse'
                        : mintStatus === 'rewarded'
                        ? 'bg-[#E8F5E9] text-[#0f3d2e]'
                        : 'bg-stone-100 text-stone-500'
                    }`}>
                      {mintStatus === 'minting' ? 'Minting ⏳' : mintStatus === 'rewarded' ? 'Minted' : 'Waiting'}
                    </span>
                  </div>

                  {/* Stage 3: Reward Coins */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-stone-200/80">
                    <div className="flex items-center gap-3">
                      {mintStatus === 'rewarded' ? (
                        <Coins size={18} className="text-amber-500 animate-bounce" />
                      ) : (
                        <Coins size={18} className="text-stone-400" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Step 3: Rewarding DevBhoomi Coins
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {mintStatus === 'rewarded'
                            ? '🪙 +50 DevBhoomi Coins credited to your Web3 wallet!'
                            : 'Pending transaction finality'}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                      mintStatus === 'rewarded' ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {mintStatus === 'rewarded' ? '+50 COINS' : '0 COINS'}
                    </span>
                  </div>
                </div>
              )}

              {/* Stage 4: Final Success Card */}
              {mintStatus === 'success' && (
                <div className="p-6 rounded-2xl bg-[#E8F5E9] border-2 border-emerald-400 shadow-sm animate-in fade-in zoom-in-95 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white text-[#0f3d2e] flex items-center justify-center shrink-0 border border-emerald-300 shadow-xs">
                        <Award size={26} className="text-emerald-700" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#0f3d2e] bg-white px-2.5 py-0.5 rounded-full border border-emerald-300">
                          On-Chain Review Verified
                        </span>
                        <h3 className="text-xl font-black text-slate-900 mt-1">
                          Your review is now VERIFIED &amp; on-chain.
                        </h3>
                        <p className="text-xs text-stone-600 mt-0.5">
                          It cannot be faked or altered. You earned <strong>50 DevBhoomi Coins</strong> 🪙!
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-2xl font-black text-amber-700 flex items-center gap-1 justify-end">
                        <Coins size={22} className="text-amber-600" /> +50
                      </span>
                      <span className="text-[10px] font-bold text-stone-500">DevBhoomi Balance</span>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-500 block font-mono">Polygon POS Tx Hash:</span>
                      <span className="font-mono text-emerald-800 font-bold break-all">
                        {mintTxHash}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(`Polygonscan Explorer:\nTx: ${mintTxHash}\nContract: 0x9320...4821\nStatus: Success`)}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[11px] font-bold text-slate-800 border border-stone-200 flex items-center gap-1 shrink-0 self-start sm:self-auto cursor-pointer"
                    >
                      <span>View on-chain</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('feed')}
                      className="px-5 py-2.5 rounded-xl bg-[#0f3d2e] hover:bg-[#164e3c] text-white font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <span>View in Public Feed</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* VIEW 2: PUBLIC FEED (/reviews)                              */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === 'feed' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Filter Bar */}
            <div className="flex items-center justify-between gap-4 flex-wrap bg-stone-100 p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter size={15} className="text-emerald-700" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Filters:
                </span>
                {[
                  { id: 'all', label: `All (${publicReviews.length})` },
                  { id: 'verified', label: 'Verified Only ✅' },
                  { id: 'photos', label: 'With Photos 📸' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFilterType(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      filterType === item.id
                        ? 'bg-[#0f3d2e] border-[#0f3d2e] text-white shadow-xs'
                        : 'bg-white border-stone-200 text-stone-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setActiveTab('write')}
                className="px-4 py-2 rounded-xl bg-[#0f3d2e] hover:bg-[#164e3c] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>Write Review</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Reviews Cards List */}
            <div className="space-y-4">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white border border-stone-200/90 hover:border-emerald-300 rounded-[26px] p-5 sm:p-7 shadow-xs hover:shadow-md transition-all"
                >
                  {/* Top: User Avatar + Name + Verified Badge + Trek Tag */}
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.user.avatar}
                        alt={rev.user.name}
                        className="w-11 h-11 rounded-2xl object-cover border-2 border-emerald-300 shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-sm sm:text-base text-slate-900">
                            {rev.user.name}
                          </h4>
                          {rev.isVerified && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E8F5E9] text-[#0f3d2e] border border-emerald-300">
                              <CheckCircle2 size={11} className="text-emerald-700" />
                              <span>VERIFIED REVIEW</span>
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md">
                            Trek Completed ({rev.trailDist || 'Tracked'})
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-500 font-mono">
                          Wallet: {rev.user.wallet} • {rev.tripName}
                        </span>
                      </div>
                    </div>

                    {/* Stars + Date */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            className={
                              s <= rev.rating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-stone-300'
                            }
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-stone-500 block mt-0.5">
                        {rev.date}
                      </span>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mb-4 whitespace-pre-line">
                    {rev.text}
                  </p>

                  {/* Tags */}
                  {rev.tags && rev.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mb-4">
                      {rev.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Trail Photos (2 small photos) */}
                  {rev.photos && rev.photos.length > 0 && (
                    <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-1">
                      {rev.photos.map((p, idx) => (
                        <div
                          key={idx}
                          className="relative w-36 h-24 rounded-xl overflow-hidden border border-stone-200/90 shrink-0 bg-stone-100 group shadow-2xs"
                        >
                          <img
                            src={p.url}
                            alt="Trail Proof"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-1.5 flex items-end">
                            <span className="text-[9px] font-mono text-emerald-300 flex items-center gap-0.5">
                              <MapPin size={9} />
                              {p.coords}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bottom: Helpful • Coins Earned • View on-chain link */}
                  <div className="flex items-center justify-between border-t border-stone-100 pt-3.5 text-xs text-stone-500 flex-wrap gap-2">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleUpvote(rev.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all cursor-pointer border ${
                          rev.hasUpvoted
                            ? 'bg-[#E8F5E9] text-[#0f3d2e] border-emerald-300 font-bold'
                            : 'bg-white border-stone-200 text-stone-600 hover:text-slate-900 hover:bg-stone-50'
                        }`}
                      >
                        <ThumbsUp size={13} className={rev.hasUpvoted ? 'text-emerald-700' : ''} />
                        <span>Helpful ({rev.helpfulCount})</span>
                      </button>

                      <span className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        <Coins size={14} className="text-amber-600" />
                        <span>Coins Earned: {rev.coinsEarned}</span>
                      </span>

                      <span className="hidden sm:inline font-mono text-[11px] text-stone-400">
                        NFT #{rev.nftTokenId}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert(`Polygonscan Explorer:\nTx: ${rev.txHash}\nToken: ${rev.nftTokenId}\nStatus: Confirmed`)}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer font-semibold"
                    >
                      <span>View on Polygonscan</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
