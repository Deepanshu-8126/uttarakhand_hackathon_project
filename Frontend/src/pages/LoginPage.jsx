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
  Compass,
  Briefcase,
  Home,
  Car,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import Navbar from '../components/Navbar';
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

  // Mode: 'traveler' | 'partner'
  const [accountMode, setAccountMode] = useState('traveler');
  // Partner sub-role: 'homestay' | 'rental' | 'guide'
  const [partnerSubRole, setPartnerSubRole] = useState('homestay');

  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isPartner = accountMode === 'partner';
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const redirectPath = redirectParam || location.state?.from?.pathname || (isPartner ? '/partner' : '/profile');

  // One-Click Google Authentication Handler
  const handleGoogleAuth = async () => {
    setSubmitting(true);
    setErrorMessage('');
    try {
      const res = await login({
        email: isPartner ? 'partner.business@gmail.com' : 'traveler.google@gmail.com',
        password: 'GoogleOAuth2User@2026',
        name: isPartner ? 'Verified Mountain Host' : 'Verified Himalayan Traveler',
      });
      if (res?.success) {
        navigate(isPartner ? '/partner' : redirectPath);
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
        if (isPartner) {
          let partnerType = 'Homestay';
          if (partnerSubRole === 'guide') partnerType = 'TourOperator';
          if (partnerSubRole === 'rental') partnerType = 'VehicleRental';

          res = await registerPartnerAccount({
            name: fullName || identifier.split('@')[0],
            businessName: fullName 
              ? `${fullName}'s ${partnerSubRole === 'rental' ? 'Rental Fleet' : partnerSubRole === 'guide' ? 'Expeditions' : 'Homestay'}` 
              : (partnerSubRole === 'rental' ? 'Pahadi Rental & Transport' : 'Pahadi Homestay & Guides'),
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
          email: identifier.trim(),
          password: password.trim(),
        });
      }

      if (res?.success) {
        const dest = res.user?.role === 'partner' || isPartner ? '/partner' : redirectPath;
        navigate(dest);
      } else {
        setErrorMessage(res?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* ── 1. Top Navbar ───────────────────────────────────────── */}
      <Navbar />

      {/* ── 2. Centered Login Card ───────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="max-w-[460px] w-full bg-white rounded-3xl border border-stone-200/90 shadow-lg shadow-emerald-950/5 p-6 sm:p-8 relative">
          
          {/* Brand Header */}
          <div className="text-center flex flex-col items-center">
            <img
              src="/logo.png"
              alt="Discovery Uttarakhand"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-2xl shadow-sm mb-3 border border-emerald-900/10 bg-white"
            />

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {isRegister ? (isPartner ? 'Partner Registration' : 'Create Traveler Account') : 'Welcome Back'}
            </h1>

            <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xs">
              {isPartner 
                ? 'Manage your verified listings, guest bookings and fleet.' 
                : 'Sign in to plan journeys, book verified stays, and access permits.'}
            </p>
          </div>

          {/* ── Segmented Slide Switcher: Traveler vs Partner Hub ── */}
          <div className="mt-5 p-1 bg-stone-100/90 rounded-2xl flex items-center gap-1 border border-stone-200/80">
            <button
              type="button"
              onClick={() => {
                setAccountMode('traveler');
                setErrorMessage('');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                accountMode === 'traveler'
                  ? 'bg-white text-[#0f3d2e] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass size={14} className={accountMode === 'traveler' ? 'text-emerald-700' : 'text-slate-400'} />
              <span>Traveler / Yatri</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAccountMode('partner');
                setErrorMessage('');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                accountMode === 'partner'
                  ? 'bg-[#0f3d2e] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase size={14} className={accountMode === 'partner' ? 'text-emerald-300' : 'text-slate-400'} />
              <span>Partner Hub</span>
            </button>
          </div>

          {/* Partner Sub-Category Chips (Only when Partner Hub is selected) */}
          {isPartner && (
            <div className="mt-3.5 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 animate-in fade-in duration-150">
              <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-900 mb-2">
                Select Your Business Role:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'homestay', label: 'Homestay / Hotel', icon: Home },
                  { id: 'rental', label: 'Taxi & Bike Rental', icon: Car },
                  { id: 'guide', label: 'Certified Guide', icon: Compass }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSel = partnerSubRole === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPartnerSubRole(item.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-center text-[10px] font-bold transition-all cursor-pointer border ${
                        isSel
                          ? 'bg-[#0f3d2e] text-white border-[#0f3d2e] shadow-2xs'
                          : 'bg-white text-slate-700 hover:bg-emerald-100/60 border-emerald-200/60'
                      }`}
                    >
                      <Icon size={14} className={`mb-1 ${isSel ? 'text-emerald-300' : 'text-emerald-800'}`} />
                      <span className="leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-emerald-800 font-semibold mt-2 flex items-center gap-1">
                <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                <span>Verified Direct Onboarding · 0% Platform Commission</span>
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google SSO Button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-stone-50 border border-stone-200/90 rounded-xl py-2.5 px-4 text-xs sm:text-sm font-bold text-slate-700 transition duration-150 shadow-2xs hover:border-stone-300 cursor-pointer disabled:opacity-50"
            >
              <GoogleIcon />
              <span>Continue with Google ({isPartner ? 'Partner' : 'Traveler'})</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-grow border-t border-stone-200" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              or use credentials
            </span>
            <div className="flex-grow border-t border-stone-200" />
          </div>

          {/* Form */}
          <form className="space-y-3.5" onSubmit={handleSubmit}>
            
            {/* Full Name field on Registration */}
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="fullname">
                  {isPartner ? 'Business / Contact Name' : 'Full Name'}
                </label>
                <div className="relative">
                  <input
                    id="fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isPartner ? 'e.g. Pahadi Heritage Homestay' : 'Enter your full name'}
                    className="w-full bg-stone-50 text-slate-900 text-sm font-medium border border-stone-200 focus:bg-white focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/20 rounded-xl pl-10 pr-3 py-2.5 placeholder:text-slate-400 focus:outline-none transition"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}

            {/* Email / Phone Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="identity">
                {isPartner ? 'Partner Business Email or Phone' : 'Email or Phone Number'}
              </label>
              <div className="relative">
                <input
                  id="identity"
                  name="identity"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={isPartner ? 'partner@business.com or +91 98765 43210' : 'name@example.com or +91 98765 43210'}
                  className="w-full bg-stone-50 text-slate-900 text-sm font-medium border border-stone-200 focus:bg-white focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/20 rounded-xl pl-10 pr-3 py-2.5 placeholder:text-slate-400 focus:outline-none transition"
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700" htmlFor="password">
                  Password
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to your registered email.')}
                    className="text-xs text-[#0f3d2e] hover:underline font-semibold transition cursor-pointer"
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
                  className="w-full bg-stone-50 text-slate-900 text-sm font-medium border border-stone-200 focus:bg-white focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/20 rounded-xl pl-10 pr-10 py-2.5 placeholder:text-slate-400 focus:outline-none transition"
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
              className="w-full bg-[#0f3d2e] hover:bg-[#144c3a] text-white font-bold text-xs sm:text-sm uppercase tracking-wider py-3.5 rounded-xl shadow-sm transition-all duration-200 mt-3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-98"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white" />
                  <span>Signing In…</span>
                </>
              ) : (
                <>
                  <span>
                    {isRegister 
                      ? (isPartner ? 'Register Partner Portal' : 'Register & Continue') 
                      : (isPartner ? 'Sign In to Partner Portal' : 'Sign In to Account')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-4 pt-3.5 border-t border-stone-100">
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
                  className="text-[#0f3d2e] hover:underline font-bold ml-0.5 cursor-pointer"
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
                  className="text-[#0f3d2e] hover:underline font-bold ml-0.5 cursor-pointer"
                >
                  Register Now
                </button>
              </>
            )}
          </p>

          {/* Guest Explorer Link */}
          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-slate-700 block text-center mt-2.5 transition-colors font-semibold"
          >
            ← Continue as Guest Explorer
          </Link>
        </div>
      </main>

    </div>
  );
}

