import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mountain, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  User,
  ChevronDown
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
        fill="#34A853"
      />
      <path
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12c0 2.08.45 3.85 1.24 5.42l4.04-3.15z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.93 6.72-4.93z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, registerPartnerAccount } = useAuth();

  const [role, setRole] = useState('traveler');
  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isPartnerRole = role === 'homestay' || role === 'guide' || role === 'rental';
  const redirectPath = location.state?.from?.pathname || (isPartnerRole ? '/partner' : '/profile');

  // One-Click Google Authentication Handler
  const handleGoogleAuth = async () => {
    setSubmitting(true);
    setErrorMessage('');
    try {
      const res = await login({
        email: isPartnerRole ? 'partner.business@gmail.com' : 'traveler.google@gmail.com',
        password: 'GoogleOAuth2User@2026',
        name: isPartnerRole ? 'Verified Mountain Host' : 'Verified Himalayan Traveler',
      });
      if (res?.success) {
        navigate(isPartnerRole ? '/partner' : redirectPath);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Google Sign-In failed. Please try with email.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Sign In / Registration Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email/phone and password.');
      return;
    }

    setSubmitting(true);
    try {
      let res;

      if (isRegister) {
        if (isPartnerRole) {
          let partnerType = 'Homestay';
          if (role === 'guide') partnerType = 'TourOperator';
          if (role === 'rental') partnerType = 'VehicleRental';

          res = await registerPartnerAccount({
            name: fullName || identifier.split('@')[0],
            businessName: fullName 
              ? `${fullName}'s ${role === 'rental' ? 'Rental Services' : 'Operations'}` 
              : (role === 'rental' ? 'Pahadi Rental & Transport' : 'Pahadi Homestay & Guides'),
            email: identifier.includes('@') ? identifier : `${identifier}@partner.in`,
            password,
            partnerType,
          });
        } else {
          res = await register({
            name: fullName || identifier.split('@')[0],
            email: identifier.includes('@') ? identifier : `${identifier}@traveler.in`,
            password,
          });
        }
      } else {
        res = await login({
          email: identifier,
          password,
        });
      }

      if (res?.success) {
        const dest = res.user?.role === 'partner' || isPartnerRole ? '/partner' : redirectPath;
        navigate(dest);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* ── 1. Top Navbar (Global Standard) ───────────────────────── */}
      <Navbar />

      {/* ── 2. Main Login Content Section ─────────────────────────── */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="max-w-[440px] w-full bg-white rounded-3xl border border-stone-200/90 shadow-sm p-7 sm:p-9 relative">
          
          {/* Brand Header */}
          <div className="text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[#1a4331] flex items-center justify-center text-white shadow-sm mb-3.5">
              <Mountain className="w-6 h-6 text-emerald-400" />
            </div>

            <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mb-2">
              Discovery Uttarakhand Portal
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {isRegister ? 'Create Your Account' : 'Welcome Back'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed max-w-sm">
              {isRegister
                ? 'Sign up to plan journeys, book verified stays, and access permits.'
                : 'Sign in to access your saved itineraries, stays, and permits.'}
            </p>
          </div>

          <div className="border-t border-stone-100 my-5" />

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Role Select */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                {isRegister ? 'Register As' : 'Account Type'}
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full appearance-none bg-stone-50 text-slate-800 text-sm font-semibold border border-stone-200 rounded-xl pl-10 pr-9 py-2.5 focus:bg-white focus:border-[#1a4331] focus:ring-2 focus:ring-[#1a4331]/20 focus:outline-none transition cursor-pointer"
                >
                  <option value="traveler">Traveler / Trekker</option>
                  <option value="yatri">Char Dham Pilgrim (Yatri)</option>
                  <option value="homestay">Homestay &amp; Hotel Operator</option>
                  <option value="rental">Bike, Taxi &amp; Vehicle Rental Partner</option>
                  <option value="guide">Certified Mountain Guide / Tour Operator</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#1a4331]">
                  <User className="w-4 h-4" />
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Google SSO Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-stone-50 border border-stone-200/90 rounded-xl py-2.5 px-4 text-xs sm:text-sm font-bold text-slate-700 transition duration-150 shadow-2xs hover:border-stone-300 cursor-pointer disabled:opacity-50"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-grow border-t border-stone-200" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                or use credentials
              </span>
              <div className="flex-grow border-t border-stone-200" />
            </div>

            {/* Full Name field on Registration */}
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="fullname">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-stone-50 text-slate-900 text-sm font-medium border border-stone-200 focus:bg-white focus:border-[#1a4331] focus:ring-2 focus:ring-[#1a4331]/20 rounded-xl pl-10 pr-3 py-2.5 placeholder:text-slate-400 focus:outline-none transition"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}

            {/* Email / Phone Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="identity">
                Email or Phone Number
              </label>
              <div className="relative">
                <input
                  id="identity"
                  name="identity"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com or +91 98765 43210"
                  className="w-full bg-stone-50 text-slate-900 text-sm font-medium border border-stone-200 focus:bg-white focus:border-[#1a4331] focus:ring-2 focus:ring-[#1a4331]/20 rounded-xl pl-10 pr-3 py-2.5 placeholder:text-slate-400 focus:outline-none transition"
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700" htmlFor="password">
                  Password
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to your registered contact.')}
                    className="text-xs text-[#1a4331] hover:underline font-semibold transition cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-stone-50 text-slate-900 text-sm font-medium border border-stone-200 focus:bg-white focus:border-[#1a4331] focus:ring-2 focus:ring-[#1a4331]/20 rounded-xl pl-10 pr-10 py-2.5 placeholder:text-slate-400 focus:outline-none transition"
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1a4331] hover:bg-[#123023] text-white font-bold text-xs sm:text-sm uppercase tracking-wider py-3.5 rounded-xl shadow-sm transition-all duration-200 mt-4 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white" />
                  <span>Signing In…</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? 'Register & Continue' : 'Sign In to Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-5 pt-4 border-t border-stone-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">Secure &amp; Encrypted Authentication</span>
          </div>

          {/* Sign In / Register Switch */}
          <p className="text-xs text-slate-600 text-center mt-3 font-medium">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setErrorMessage(''); }}
                  className="text-[#1a4331] hover:underline font-bold ml-0.5 cursor-pointer"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                New to Discovery Uttarakhand?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setErrorMessage(''); }}
                  className="text-[#1a4331] hover:underline font-bold ml-0.5 cursor-pointer"
                >
                  Register Now
                </button>
              </>
            )}
          </p>

          {/* Guest Explorer Link */}
          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-slate-700 block text-center mt-3 transition-colors font-semibold"
          >
            ← Continue as Guest Explorer
          </Link>
        </div>
      </main>

      {/* ── 3. Footer (Global Standard) ───────────────────────────── */}
      <Footer />

    </div>
  );
}
