import React, { useState, useEffect } from 'react';
import { Star, Quote, Send, Sparkles, CheckCircle2, User } from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const DEFAULT_REVIEWS = [
  {
    _id: 'default-1',
    user: { name: 'Rohan Sharma' },
    rating: 5,
    comment: 'We use the Devbhoomi platform for all our mountain expeditions. Total travel transparency and reliable local connections!'
  },
  {
    _id: 'default-2',
    user: { name: 'Priya Verma' },
    rating: 5,
    comment: 'The verified guides and live weather tracking gave us immense peace of mind during our Kedarnath trek.'
  }
];

export default function ReviewSection({ targetId = 'general', targetType = 'site' }) {
  const { isAuthenticated, requireAuth, currentUser } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(`/reviews/${targetType}/${targetId}`);
        if (res.data.success && res.data.data?.length > 0) {
          setReviews([...res.data.data, ...DEFAULT_REVIEWS]);
        }
      } catch (err) {
        console.warn('Reviews loaded in offline fallback mode');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [targetId, targetType]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a brief comment before submitting.');
      return;
    }

    requireAuth(async () => {
      setIsSubmitting(true);
      setError('');
      try {
        const res = await api.post('/reviews', {
          targetId: targetId === 'general' ? 'general' : targetId,
          targetType,
          rating,
          comment: comment.trim()
        });
        
        setIsSubmitted(true);
        const newReview = res.data?.data || {
          _id: Date.now().toString(),
          user: { name: currentUser?.name || 'Fellow Traveler' },
          rating,
          comment: comment.trim()
        };
        setReviews(prev => [newReview, ...prev]);
        setComment('');
      } catch (err) {
        setError(err.response?.data?.message || 'Could not submit review right now. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans" id="reviews">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        
        {/* Left: Feedback Submission Form */}
        <div className="bg-white p-7 sm:p-9 rounded-3xl border border-stone-200/80 shadow-sm space-y-6">
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block">
              Visitor Feedback
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How was your Uttarakhand experience?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Your experience can help other travelers discover the beauty of Devbhoomi. Leave your thoughts below.
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Review Received!</h4>
              <p className="text-xs text-slate-600">Thank you for helping fellow mountain explorers travel safely.</p>
              <button 
                type="button" 
                onClick={() => setIsSubmitted(false)}
                className="text-xs font-bold text-emerald-800 hover:underline pt-2 inline-block cursor-pointer"
              >
                Submit another review
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-5">
              {/* Interactive Star Rating */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Rate your journey:
                </label>
                <div className="flex items-center gap-1.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="cursor-pointer transition-transform hover:scale-110 p-0.5 focus:outline-hidden"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star 
                        size={24} 
                        className={`transition-colors ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-stone-300'
                        }`} 
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {rating} of 5 Stars
                  </span>
                </div>
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Your Experience
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="The mountains were absolutely breathtaking..."
                  rows={4}
                  className="w-full rounded-2xl border border-stone-200 bg-[#fdfbf7] focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm p-4 text-slate-800 placeholder:text-slate-400 transition-all outline-hidden resize-none"
                />
              </div>

              {error && (
                <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#0f2a22] hover:bg-[#184236] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Send size={15} />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right: What Others Say & Poetry Banner */}
        <div className="space-y-6">
          <div className="bg-white p-7 sm:p-9 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">What Others Say</h3>
            
            <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1">
              {reviews.slice(0, 3).map((item) => (
                <div key={item._id} className="p-4 rounded-2xl bg-[#fdfbf7] border border-stone-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <User size={13} className="text-slate-400" />
                      {item.user?.name || 'Verified Explorer'}
                    </span>
                    <div className="text-amber-400 flex items-center gap-0.5">
                      {Array.from({ length: item.rating || 5 }).map((_, i) => (
                        <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    "{item.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Poetic Quote Banner */}
          <div className="bg-[#0f2a22] text-white p-7 sm:p-9 rounded-3xl relative overflow-hidden shadow-xl text-center space-y-3 border border-emerald-900/50">
            <Quote size={36} className="text-emerald-400/30 mx-auto block" />
            <p className="text-base sm:text-lg font-serif italic text-emerald-50 leading-relaxed">
              "Uttarakhand is not just a destination, it is a feeling you carry long after the mountains disappear from view."
            </p>
            <span className="text-xs font-bold tracking-widest text-emerald-300 uppercase block">
              #DiscoverUttarakhand • Devbhoomi
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
