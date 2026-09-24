import React, { useState, useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Mountain, ShieldCheck, Sparkles, Lock, ArrowRight, 
  Compass, Building2, AlertTriangle, ShieldAlert, CheckCircle2,
  Mail, KeyRound, User, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function InlineAuthGate({ isCopilot }) {
  const { login, register, authError, setAuthError } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleGoogleAuth = () => {
    // Instant Google auth helper / simulation
    setSubmitting(true);
    setTimeout(async () => {
      await login({
        email: 'traveler.google@gmail.com',
        password: 'GoogleOAuth2User@2026',
        name: 'Verified Himalayan Traveler'
      });
      setSubmitting(false);
    }, 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!identifier || !password) {
      setLocalError('Please enter both your email/username and password.');
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await register({
          name: name || identifier.split('@')[0],
          email: identifier.includes('@') ? identifier : `${identifier}@traveler.in`,
          password
        });
      } else {
        await login({
          email: identifier,
          password
        });
      }
    } catch (err) {
      setLocalError(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden font-sans"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(10, 25, 20, 0.88) 0%, rgba(18, 42, 31, 0.94) 100%), url('/assets/kedarnath.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-xl h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-7 sm:p-9 shadow-2xl border border-white/20 dark:border-slate-800 text-center animate-fadeIn">
        {/* Emblem */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-forest-green to-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-900/30">
          {isCopilot ? <Sparkles size={26} className="text-amber-300" /> : <Lock size={24} />}
        </div>

        {/* Title */}
        <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">
          Devbhoomi AI Travel Network
        </div>
        <h1 className="text-2xl font-bold font-display text-text-dark dark:text-white tracking-tight mb-1">
          {isCopilot ? 'Discovery Uttarakhand Copilot' : isRegister ? 'Join Discovery Uttarakhand' : 'Welcome to Discovery Uttarakhand'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          {isCopilot 
            ? 'Sign in to unlock conversational itineraries, weather corridors, and instant stay reservations.' 
            : 'Access your trip history, vouchers, and verified itineraries.'}
        </p>

        {/* Google One-Click Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={submitting}
          className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-xs transition-all flex items-center justify-center cursor-pointer mb-4"
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
            or continue with email
          </span>
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
        </div>

        {/* Error alert */}
        {(localError || authError) && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs font-semibold text-left">
            {localError || authError}
          </div>
        )}

        {/* Direct Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-left text-xs">
          {isRegister && (
            <div>
              <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Amit Rawat"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-forest-green outline-none font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300">
              Username or Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="name@example.com or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-forest-green outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
            </div>
            <div className="relative">
              <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-forest-green outline-none font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-forest-green hover:bg-dark-green text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>{isRegister ? 'Create Account & Continue' : 'Sign In to Continue'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Switch mode */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(false); setLocalError(''); }}
                className="font-bold text-forest-green hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New to Discover Uttarakhand?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(true); setLocalError(''); }}
                className="font-bold text-forest-green hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </span>
          )}
        </div>

        {/* Guest link */}
        <div className="mt-2">
          <Link
            to="/"
            className="inline-block text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            ← Explore Uttarakhand as Guest
          </Link>
        </div>
      </div>
    </div>
  );
}

const ProtectedRoute = ({ children, adminOnly = false, partnerOnly = false }) => {
  const { 
    isAuthenticated, 
    isLoading, 
    currentUser, 
    setAuthModalOpen, 
    openPartnerAuth 
  } = useAuth();
  const location = useLocation();

  const isCopilot = location.pathname.startsWith('/copilot');

  // Only open modal when explicitly triggered by user action on the gate button

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-forest-green/5 text-forest-green">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-forest-green/10 animate-ping absolute" />
          <div className="w-12 h-12 rounded-2xl bg-forest-green flex items-center justify-center text-white shadow-lg">
            <Mountain size={24} className="animate-pulse" />
          </div>
        </div>
        <p className="text-sm font-semibold tracking-wide text-forest-green/80">
          Connecting to Devbhoomi Network...
        </p>
      </div>
    );
  }

  // Case 1: Unauthenticated user trying to access partner portal
  if (!isAuthenticated && partnerOnly) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(26, 67, 49, 0.92) 100%), url('/assets/badrinath.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/20 dark:border-slate-800 text-center animate-fadeIn">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-700 text-white flex items-center justify-center shadow-lg shadow-amber-700/20">
            <Building2 size={32} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck size={13} />
            <span>Verified Partner Network</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-display text-text-dark dark:text-white tracking-tight mb-3">
            Partner Business Portal
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto mb-6">
            Sign in to manage your homestay listings, vehicle fleet bookings, trek operations, and direct traveler payouts.
          </p>

          <div className="space-y-3">
            <button
              onClick={openPartnerAuth}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-bold text-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
            >
              <span>Partner Sign In / Register</span>
              <ArrowRight size={16} />
            </button>

            <Link
              to="/"
              className="inline-block text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 pt-2 transition-colors"
            >
              ← Return to Traveler Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Unauthenticated user trying to access general protected route (e.g. Profile)
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Case 3: Admin route restricted
  if (adminOnly && currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-cream/50 dark:bg-slate-950">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-red-200 dark:border-red-900/60 text-center animate-fadeIn">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-600 flex items-center justify-center">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">403 Access Restricted</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            You do not possess administrative clearance to access the Uttarakhand central command console.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold">
            <span>Return to Home</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // Case 4: Partner route accessed by non-partner
  if (partnerOnly && currentUser?.role !== 'partner' && currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#fdfbf7]">
        <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-sm border border-stone-200/90 text-center animate-fadeIn">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#0f3d2e] text-white flex items-center justify-center shadow-xs">
            <Building2 size={28} className="text-emerald-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Partner Portal Restricted</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
            This workspace is designated for registered homestay hosts, fleet operators, and certified mountain guides in Uttarakhand.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/profile" className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-stone-100 hover:bg-stone-200 text-slate-800 transition-colors">
              View Traveler Profile
            </Link>
            <Link
              to="/login"
              state={{ from: location, role: 'homestay' }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0f3d2e] hover:bg-[#144c3a] text-white transition-colors shadow-xs"
            >
              Switch / Register as Partner
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

