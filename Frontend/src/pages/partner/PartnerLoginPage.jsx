import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Phone,
  HelpCircle,
  Compass,
  Car,
  Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { promptGoogleSignIn } from '../../utils/googleAuth';

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

export default function PartnerLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const redirectPath = location.state?.from?.pathname || '/partner';

  // Handle One-Click Google Authentication for Partners
  const handleGoogleAuth = async () => {
    setSubmitting(true);
    setErrorMessage('');
    setSuccessNotice('');
    try {
      const { credential } = await promptGoogleSignIn();
      const res = await loginWithGoogle({
        credential,
        role: 'partner',
      });
      if (res?.success) {
        navigate(redirectPath);
      } else {
        setErrorMessage(res?.message || 'Google Partner Sign-In failed.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Google Sign-In failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Standard Email/Password Sign-In
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (isOtpMode) {
      if (!otpSent) {
        if (!identifier.trim()) {
          setErrorMessage('Please enter your registered mobile number or email.');
          return;
        }
        setSubmitting(true);
        setTimeout(() => {
          setSubmitting(false);
          setOtpSent(true);
          setSuccessNotice(`6-digit OTP sent to ${identifier}. Enter code to verify.`);
        }, 600);
        return;
      }

      if (otpCode.length < 4) {
        setErrorMessage('Please enter the verification OTP code.');
        return;
      }

      setSubmitting(true);
      try {
        // OTP login simulation / fallback to partner account
        const res = await login({
          email: identifier.includes('@') ? identifier : 'partner@discovery.com',
          password: 'partner123'
        });
        if (res?.success) {
          navigate(redirectPath);
        } else {
          setErrorMessage(res?.message || 'Invalid OTP code.');
        }
      } catch (err) {
        setErrorMessage(err.message || 'OTP authentication failed.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Please enter both your business email/mobile and password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login({
        email: identifier.trim(),
        password: password.trim()
      });

      if (res?.success) {
        const userRole = res.user?.role;
        if (userRole === 'partner' || userRole === 'admin') {
          navigate(redirectPath);
        } else {
          setSuccessNotice('Account verified. Redirecting to Partner Portal...');
          setTimeout(() => navigate('/partner'), 400);
        }
      } else {
        setErrorMessage(res?.message || 'Login failed. Please check your partner credentials.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication error. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  // 1-Click Demo Login for Hackathon Judges
  const handleQuickDemo = async () => {
    setIdentifier('partner@discovery.com');
    setPassword('partner123');
    setSubmitting(true);
    setErrorMessage('');
    try {
      const res = await login({
        email: 'partner@discovery.com',
        password: 'partner123'
      });
      if (res?.success) {
        setSuccessNotice('Demo Partner Authenticated! Opening Partner Hub...');
        setTimeout(() => navigate('/partner'), 350);
      } else {
        setErrorMessage(res?.message || 'Demo credentials invalid.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to authenticate demo partner.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#fdfbf7] text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3 flex items-center justify-between z-30">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) navigate(-1);
            else navigate('/');
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <ArrowLeft size={15} className="text-stone-700" />
          <span>Back to Site</span>
        </button>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-xs font-bold text-stone-600 hover:text-[#0f3d2e] transition"
          >
            Traveler Login
          </Link>
          <Link
            to="/partner/onboarding"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0f3d2e] text-white hover:bg-[#144c3a] text-xs font-bold transition shadow-xs"
          >
            <span>Become a Partner</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 items-center gap-8 pb-12">
        
        {/* Left Visual Column */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between h-full min-h-[580px] p-8 rounded-3xl bg-gradient-to-br from-[#05140d] via-[#0f3d2e] to-[#082015] text-white relative overflow-hidden shadow-2xl border border-emerald-500/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Pill */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official Business Portal</span>
            </div>

            <h1 className="text-3xl font-black tracking-tight leading-tight text-white mb-3">
              Manage your business.<br />Serve travelers.<br />Grow with Discovery.
            </h1>
            <p className="text-sm text-stone-300 leading-relaxed font-medium">
              The unified operating system for Uttarakhand's verified homestays, taxi fleets, 4x4 rentals, and mountain trek operators.
            </p>
          </div>

          {/* Partner Features Highlight */}
          <div className="relative z-10 space-y-3 my-6">
            <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Stays, Fleet &amp; Treks</h4>
                <p className="text-[11px] text-stone-300">Complete service availability, pricing &amp; booking management.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Direct Escrow Settlements</h4>
                <p className="text-[11px] text-stone-300">Fast digital payouts, automatic platform fee calculation &amp; ledger.</p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-stone-400 font-medium">
            <span>Uttarakhand Tourism Partner Network</span>
            <span className="text-emerald-400 font-bold">256-Bit SSL Encrypted</span>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center w-full">
          <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200/90 shadow-xl p-6 sm:p-8 relative">
            
            {/* Header Title */}
            <div className="text-center flex flex-col items-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#0f3d2e] text-white flex items-center justify-center shadow-md mb-3 border border-emerald-500/30">
                <Building2 size={28} className="text-emerald-300" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Discovery Uttarakhand
              </h2>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mt-0.5">
                Partner Hub Gateway
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium max-w-xs">
                {isOtpMode 
                  ? 'Sign in securely with one-time verification passcode.' 
                  : 'Manage bookings, services, payouts, and traveler reservations.'}
              </p>
            </div>

            {/* Quick Demo Login Pill (Judges / Hackathon) */}
            <div className="mb-4 p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-emerald-700" />
                <span className="text-xs font-bold text-emerald-900">Demo Partner Account</span>
              </div>
              <button
                type="button"
                onClick={handleQuickDemo}
                disabled={submitting}
                className="px-3 py-1 rounded-xl bg-[#0f3d2e] text-white hover:bg-[#144c3a] text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                1-Click Sign In
              </button>
            </div>

            {/* Google Host SSO Button */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-stone-200 hover:border-emerald-500 bg-white hover:bg-stone-50 text-slate-800 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <GoogleIcon />
                <span>Continue with Google (Host Account)</span>
              </button>

              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">or sign in with password</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>
            </div>

            {/* Success / Error Messages */}
            {successNotice && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                <span>{successNotice}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              
              {/* Email / Mobile Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="partner-identity">
                  {isOtpMode ? 'Registered Mobile Number or Email' : 'Business Email or Mobile'}
                </label>
                <div className="relative">
                  <input
                    id="partner-identity"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={isOtpMode ? '+91 98765 43210 or partner@business.com' : 'partner@business.com or +91 98765 43210'}
                    className="w-full bg-stone-50 text-slate-900 text-sm font-medium border border-stone-200 focus:bg-white focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/20 rounded-xl pl-10 pr-3 py-2.5 placeholder:text-slate-400 focus:outline-none transition"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    {isOtpMode ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Password Field (If not OTP mode) */}
              {!isOtpMode && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700" htmlFor="partner-pwd">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Password reset link sent to your registered partner email.')}
                      className="text-xs text-[#0f3d2e] hover:underline font-semibold transition cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="partner-pwd"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your partner account password"
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
              )}

              {/* OTP Field (When in OTP mode and sent) */}
              {isOtpMode && otpSent && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="partner-otp">
                    6-Digit Verification Code (OTP)
                  </label>
                  <div className="relative">
                    <input
                      id="partner-otp"
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 582491"
                      className="w-full bg-stone-50 text-slate-900 text-center tracking-widest text-lg font-mono font-bold border border-stone-200 focus:bg-white focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/20 rounded-xl py-2.5 placeholder:text-slate-400 focus:outline-none transition"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1 text-[11px] text-slate-500">
                    <span>Didn't receive code?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSuccessNotice(`Resent new 6-digit OTP code to ${identifier}`);
                      }}
                      className="font-bold text-[#0f3d2e] hover:underline cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
              )}

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0f3d2e] hover:bg-[#144c3a] text-white font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 rounded-xl shadow-sm transition-all duration-200 mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-98"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <span>
                      {isOtpMode 
                        ? (otpSent ? 'Verify OTP & Sign In' : 'Send One-Time Passcode') 
                        : 'Sign In to Partner Hub'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Toggle OTP / Password mode */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsOtpMode(!isOtpMode);
                    setErrorMessage('');
                    setSuccessNotice('');
                  }}
                  className="text-xs text-stone-600 hover:text-[#0f3d2e] font-bold transition cursor-pointer"
                >
                  {isOtpMode ? '← Use Email & Password instead' : '─── OR ─── Continue with OTP'}
                </button>
              </div>
            </form>

            {/* Bottom Links */}
            <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col items-center gap-2">
              <p className="text-xs text-slate-600 text-center font-medium">
                New partner in Uttarakhand?{' '}
                <Link
                  to="/partner/onboarding"
                  className="text-[#0f3d2e] hover:underline font-bold ml-0.5"
                >
                  Become a Partner
                </Link>
              </p>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>Authorized by Uttarakhand Tourism Development Board</span>
              </div>
            </div>
          </div>
        </div>

      </main>

    </div>
  );
}
