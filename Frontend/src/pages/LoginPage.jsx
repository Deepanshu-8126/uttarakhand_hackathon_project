import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mountain, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Loader2, 
  AlertCircle,
  User,
  Compass,
  Briefcase,
  Home,
  Car,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  MapPin,
  Crosshair,
  Phone,
  RefreshCw,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { promptGoogleSignIn } from '../utils/googleAuth';

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
  const { 
    login, 
    loginWithGoogle, 
    register, 
    registerPartnerAccount, 
    verifyOtp, 
    resendOtp, 
    forgotPassword, 
    verifyResetOtp, 
    resetPassword 
  } = useAuth();

  // Mode: 'traveler' | 'partner'
  const [accountMode, setAccountMode] = useState('traveler');
  // Partner sub-role: 'homestay' | 'rental' | 'guide'
  const [partnerSubRole, setPartnerSubRole] = useState('homestay');

  // Step state: 'auth' | 'verify_otp' | 'forgot_password' | 'reset_password'
  const [authStep, setAuthStep] = useState('auth');
  const [isRegister, setIsRegister] = useState(false);

  // Form Fields
  const [identifier, setIdentifier] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [otpDestination, setOtpDestination] = useState('');
  const [otpPurpose, setOtpPurpose] = useState('signup');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resetToken, setResetToken] = useState('');

  // Status & Feedback
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);

  // 60-Second Cooldown Timer for OTP Resend
  useEffect(() => {
    let interval = null;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCooldown]);

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        const { latitude, longitude } = pos.coords;
        setCoordinates([longitude, latitude]);
      },
      (err) => {
        setIsDetectingGps(false);
        console.warn('Geolocation denied or timed out:', err.message);
      },
      { timeout: 8000 }
    );
  };

  const isPartner = accountMode === 'partner';
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const redirectPath = redirectParam || location.state?.from?.pathname || (isPartner ? '/partner' : '/profile');

  // Real Google OAuth 2.0 & One-Tap Authentication Handler
  const handleGoogleAuth = async () => {
    setSubmitting(true);
    setErrorMessage('');
    setSuccessNotice('');
    try {
      const authResult = await promptGoogleSignIn();
      if (authResult?.error) {
        if (authResult.error === 'popup_closed_by_user' || authResult.error === 'access_denied') {
          return;
        }
        setErrorMessage(`Google Sign-In: ${authResult.error}`);
        return;
      }
      const { credential, profile } = authResult;
      if (!credential) return;

      if (profile?.email) {
        setSuccessNotice(`Signed in with Google as ${profile.email}`);
      }

      const res = await loginWithGoogle({
        credential,
        role: isPartner ? 'partner' : 'user',
      });
      if (res?.success) {
        navigate(isPartner ? '/partner' : redirectPath);
      } else {
        setErrorMessage(res?.message || 'Google Sign-In failed.');
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
    setSuccessNotice('');

    setSubmitting(true);
    try {
      if (isRegister) {
        // Registration validation
        const targetEmail = (email || identifier).trim().toLowerCase();
        if (!fullName.trim() || !targetEmail || !password.trim()) {
          setErrorMessage('Please fill in your name, email, and password.');
          setSubmitting(false);
          return;
        }

        if (password !== confirmPassword) {
          setErrorMessage('Password and confirm password do not match.');
          setSubmitting(false);
          return;
        }

        let res;
        if (isPartner) {
          let partnerType = 'Homestay';
          if (partnerSubRole === 'guide') partnerType = 'TourOperator';
          if (partnerSubRole === 'rental') partnerType = 'VehicleRental';

          res = await registerPartnerAccount({
            name: fullName.trim(),
            businessName: `${fullName.trim()}'s ${partnerSubRole === 'rental' ? 'Fleet' : partnerSubRole === 'guide' ? 'Expeditions' : 'Homestay'}`,
            email: targetEmail,
            mobile: mobile.trim() || undefined,
            password,
            confirmPassword,
            partnerType,
          });
        } else {
          res = await register({
            name: fullName.trim(),
            email: targetEmail,
            mobile: mobile.trim() || undefined,
            password,
            confirmPassword,
            location: (city || district || coordinates) ? {
              city: city.trim(),
              district: district.trim(),
              state: 'Uttarakhand',
              country: 'India',
              coordinates: coordinates || undefined
            } : undefined
          });
        }

        if (res?.requiresVerification) {
          setOtpDestination(res.email || targetEmail);
          setOtpPurpose('signup');
          setResendCooldown(60);
          setAuthStep('verify_otp');
          if (res?.devOtp) {
            setOtpCode(res.devOtp);
            setSuccessNotice(`Account created! Verification Code: ${res.devOtp} (Auto-filled)`);
          } else {
            setSuccessNotice('Account created! A 6-digit OTP code has been dispatched to your email.');
          }
          return;
        }

        if (res?.success) {
          navigate(isPartner ? '/partner' : redirectPath);
          return;
        } else {
          setErrorMessage(res?.message || 'Registration failed.');
        }
      } else {
        // Login Flow
        if (!identifier.trim() || !password.trim()) {
          setErrorMessage('Please provide your email/phone and password.');
          setSubmitting(false);
          return;
        }

        const res = await login({
          identifier: identifier.trim(),
          password: password.trim(),
        });

        if (res?.requiresVerification) {
          setOtpDestination(res.email || identifier.trim());
          setOtpPurpose('signup');
          setResendCooldown(60);
          setAuthStep('verify_otp');
          setSuccessNotice('Account not yet verified. A fresh OTP code has been dispatched to your email.');
          return;
        }

        if (res?.success) {
          const userRole = res.user?.role;
          if (userRole === 'partner') {
            navigate('/partner');
          } else if (userRole === 'admin') {
            navigate('/admin');
          } else {
            navigate(redirectPath || '/profile');
          }
        } else {
          setErrorMessage(res?.message || 'Login failed. Please verify your credentials.');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit OTP Verification
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await verifyOtp({
        destination: otpDestination,
        otp: otpCode.trim(),
        purpose: otpPurpose,
      });

      if (res?.success) {
        setSuccessNotice('✅ Verification successful! Activating your session...');
        setTimeout(() => {
          if (isPartner) {
            navigate('/partner');
          } else {
            navigate(redirectPath || '/profile');
          }
        }, 600);
      } else {
        setErrorMessage(res?.message || 'Verification failed. Please check your OTP.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage('');
    setSuccessNotice('');

    try {
      const res = await resendOtp({
        destination: otpDestination,
        purpose: otpPurpose,
      });

      if (res?.success) {
        setResendCooldown(60);
        const code = res?.data?.devOtp;
        if (code) {
          setOtpCode(code);
          setSuccessNotice(`New code generated: ${code} (Auto-filled)`);
        } else {
          setSuccessNotice('New verification code sent to your email.');
        }
      } else {
        setErrorMessage(res?.message || 'Failed to resend code.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resend code.');
    }
  };

  // Initiate Forgot Password
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const target = (email || identifier).trim();
    if (!target) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await forgotPassword({ email: target });
      if (res?.success) {
        setOtpDestination(target);
        setOtpPurpose('forgot-password');
        setResendCooldown(60);
        setAuthStep('reset_password');
        setSuccessNotice('If an account exists, a 6-digit password reset code has been sent.');
      } else {
        setErrorMessage(res?.message || 'Unable to process password reset request.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // Complete Password Reset
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit code received in your email.');
      return;
    }

    if (!password.trim() || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('New password and confirm password do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await resetPassword({
        email: otpDestination,
        otp: otpCode.trim(),
        newPassword: password,
        confirmPassword,
      });

      if (res?.success) {
        setSuccessNotice('Password reset successfully! You can now log in.');
        setTimeout(() => {
          setAuthStep('auth');
          setIsRegister(false);
          setOtpCode('');
          setPassword('');
          setConfirmPassword('');
        }, 1200);
      } else {
        setErrorMessage(res?.message || 'Password reset failed.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Password reset failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Hackathon Quick Mock Logins
  const handleQuickMockLogin = (role) => {
    localStorage.setItem('role', role);
    if (role === 'trekker') {
      const mockUser = {
        id: 'usr_trekker_1',
        name: 'Aryan Negi',
        email: 'trekker@test.com',
        role: 'trekker',
        trekId: 'TRK-82341'
      };
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      localStorage.setItem('token', 'mock_trekker_token_82341');
      navigate('/trekker');
    } else if (role === 'guide') {
      const mockUser = {
        id: 'usr_guide_1',
        name: 'Ramesh Rawat',
        email: 'guide@test.com',
        role: 'guide'
      };
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      localStorage.setItem('token', 'mock_guide_token_1234');
      navigate('/guide');
    } else if (role === 'admin') {
      const mockUser = {
        id: 'usr_admin_1',
        name: 'Rescue Ops Commander',
        email: 'admin@test.com',
        role: 'admin'
      };
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      localStorage.setItem('token', 'mock_admin_token_9999');
      navigate('/rescue-ops');
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#fdfbf7] text-slate-800 font-sans overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      
      {/* ── 1. Top Navigation Bar ───────────────────────────────────────── */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex items-center justify-between z-30">
        <button
          type="button"
          onClick={() => {
            if (authStep !== 'auth') {
              setAuthStep('auth');
              setErrorMessage('');
              setSuccessNotice('');
            } else if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/');
            }
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs font-bold transition-all shadow-xs hover:border-stone-400 cursor-pointer active:scale-95 whitespace-nowrap"
        >
          <ArrowLeft size={15} className="text-stone-700 shrink-0" />
          <span>{authStep !== 'auth' ? 'Back to Sign In' : 'Back'}</span>
        </button>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-900/10 hover:bg-emerald-900/20 text-[#0f3d2e] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
        >
          <Home size={14} className="shrink-0" />
          <span>Home</span>
        </Link>
      </div>

      {/* ── 2. Split Screen Main Layout ────────────────────────── */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 items-center gap-8 pb-12 sm:pb-16">
        
        {/* Left Column: Visual Brand Hero (Hidden on Mobile, Visible on Desktop lg:col-span-5) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between h-full min-h-[580px] p-8 rounded-3xl bg-gradient-to-br from-[#040e09] via-[#0f3d2e] to-[#081a13] text-white relative overflow-hidden shadow-2xl border border-emerald-500/20">
          
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Tag */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Discover Uttarakhand AI Portal</span>
            </div>

            <h2 className="text-3xl font-black tracking-tight leading-tight text-white mb-3">
              Sacred Trails, Verified Homestays &amp; 4x4 Mountain Rentals
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed font-medium">
              Join over 45,000 travelers and local Pahadi hosts exploring Garhwal and Kumaon with real-time AMS safeguards and Web3 verified trust.
            </p>
          </div>

          {/* Center Visual Feature Cards */}
          <div className="relative z-10 space-y-3 my-6">
            <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Char Dham &amp; High Treks</h4>
                <p className="text-[11px] text-stone-300">Live corridor status, weather advisories &amp; route guidance.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Web3 Escrow &amp; Bank-Grade Security</h4>
                <p className="text-[11px] text-stone-300">Cryptographic OTP authentication, HTTP-only sessions &amp; verified reviews.</p>
              </div>
            </div>
          </div>

          {/* Bottom Footer Quote */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-stone-400 font-medium">
            <span>Powered by Devbhoomi Himalayan Engine</span>
            <span className="text-emerald-400 font-bold">100% Encrypted</span>
          </div>
        </div>

        {/* Right Column: Clean Authentication Card (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center w-full">
          <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200/90 shadow-xl p-6 sm:p-8 relative">
            
            {/* Header Title */}
            <div className="text-center flex flex-col items-center mb-5">
              <img
                src="/logo.png"
                alt="Discovery Uttarakhand"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-2xl shadow-sm mb-2 border border-emerald-900/10 bg-white shrink-0"
              />

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {authStep === 'verify_otp'
                  ? 'Verify 6-Digit OTP'
                  : authStep === 'forgot_password'
                  ? 'Forgot Password'
                  : authStep === 'reset_password'
                  ? 'Set New Password'
                  : isRegister 
                  ? (isPartner ? 'Partner Onboarding' : 'Create Yatri Account') 
                  : 'Welcome Back'}
              </h1>

              <p className="text-xs text-slate-500 mt-1 font-medium max-w-xs">
                {authStep === 'verify_otp'
                  ? `Enter the 6-digit verification code sent to ${otpDestination}`
                  : authStep === 'forgot_password'
                  ? 'Enter your registered email to receive a password reset code.'
                  : authStep === 'reset_password'
                  ? 'Enter the code and create a secure new password.'
                  : isPartner 
                  ? 'Manage your homestays, rental fleet, and guest bookings.' 
                  : 'Sign in to plan journeys, book verified stays, and access permits.'}
              </p>
            </div>

            {/* Success / Error Banners */}
            {successNotice && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                <span>{successNotice}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ── VIEW A: VERIFY OTP SCREEN ── */}
            {authStep === 'verify_otp' && (
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-center">
                  <span className="text-xs font-semibold text-emerald-900 block mb-1">
                    Verification Code Sent To:
                  </span>
                  <span className="font-mono text-sm font-bold text-emerald-800 block">
                    {otpDestination}
                  </span>
                </div>

                <div>
                  <label htmlFor="otpCodeInput" className="block text-xs font-bold text-slate-700 mb-1 text-center">
                    Enter 6-Digit One-Time Password
                  </label>
                  <input
                    id="otpCodeInput"
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full text-center font-mono text-2xl tracking-[10px] font-bold bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/20 rounded-xl py-3 text-slate-900 focus:outline-none transition"
                  />
                  <p className="text-[11px] text-slate-500 text-center mt-1.5">
                    ⏱ Valid for 5 minutes • Maximum 5 verification attempts
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || otpCode.length !== 6}
                  className="w-full bg-[#0f3d2e] hover:bg-[#144c3a] text-white font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span>Verifying Code…</span>
                    </>
                  ) : (
                    <>
                      <span>Activate &amp; Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Resend OTP Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0}
                    className="text-[#0f3d2e] hover:underline font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:no-underline"
                  >
                    <RefreshCw size={12} className={resendCooldown > 0 ? '' : 'text-emerald-700'} />
                    <span>
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Verification Code'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep('auth');
                      setErrorMessage('');
                    }}
                    className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    Change Email
                  </button>
                </div>
              </form>
            )}

            {/* ── VIEW B: FORGOT PASSWORD SCREEN ── */}
            {authStep === 'forgot_password' && (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label htmlFor="forgotEmailInput" className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="forgotEmailInput"
                      type="email"
                      required
                      value={email || identifier}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setIdentifier(e.target.value);
                      }}
                      placeholder="name@example.com"
                      className="w-full bg-stone-50 text-slate-900 text-sm font-medium border border-stone-200 focus:bg-white focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/20 rounded-xl pl-10 pr-3 py-2.5 placeholder:text-slate-400 focus:outline-none transition"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    We will send a 6-digit verification code to reset your password.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#0f3d2e] hover:bg-[#144c3a] text-white font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span>Sending Code…</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep('auth');
                      setErrorMessage('');
                    }}
                    className="text-xs text-[#0f3d2e] hover:underline font-bold cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* ── VIEW C: RESET PASSWORD SCREEN ── */}
            {authStep === 'reset_password' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 font-medium">
                  Enter the 6-digit code sent to <strong className="font-mono">{otpDestination}</strong> and choose your new password.
                </div>

                <div>
                  <label htmlFor="resetOtpInput" className="block text-xs font-bold text-slate-700 mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    id="resetOtpInput"
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center font-mono text-xl tracking-[6px] font-bold bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/20 rounded-xl py-2.5 text-slate-900 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label htmlFor="resetNewPassword" className="block text-xs font-bold text-slate-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="resetNewPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      className="w-full bg-stone-50 text-slate-900 text-sm font-medium border border-stone-200 focus:bg-white focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/20 rounded-xl pl-10 pr-10 py-2.5 placeholder:text-slate-400 focus:outline-none transition"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="resetConfirmPassword" className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="resetConfirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full bg-stone-50 text-slate-900 text-sm font-medium border border-stone-200 focus:bg-white focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/20 rounded-xl pl-10 pr-3 py-2.5 placeholder:text-slate-400 focus:outline-none transition"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#0f3d2e] hover:bg-[#144c3a] text-white font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span>Updating Password…</span>
                    </>
                  ) : (
                    <>
                      <span>Update Password &amp; Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ── VIEW D: STANDARD SIGN IN & SIGN UP ── */}
            {authStep === 'auth' && (
              <>
                {/* Segmented Mode Switcher: Traveler vs Partner Hub */}
                <div className="p-1 bg-stone-100 rounded-2xl flex items-center gap-1 border border-stone-200/80 mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountMode('traveler');
                      setErrorMessage('');
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      accountMode === 'traveler'
                        ? 'bg-[#0f3d2e] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Compass size={14} className={accountMode === 'traveler' ? 'text-emerald-300' : 'text-slate-400'} />
                    <span>Traveler / Yatri</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAccountMode('partner');
                      setErrorMessage('');
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      accountMode === 'partner'
                        ? 'bg-[#0f3d2e] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Briefcase size={14} className={accountMode === 'partner' ? 'text-emerald-300' : 'text-slate-400'} />
                    <span>Partner Hub</span>
                  </button>
                </div>

                {/* Judge / Hackathon Demo Account Drawer */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setShowDemoDropdown(!showDemoDropdown)}
                    className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 text-emerald-900 text-xs font-bold transition cursor-pointer whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={13} className="text-emerald-700 shrink-0" />
                      <span>⚡ Hackathon Judge Demo Accounts</span>
                    </div>
                    <ChevronDown size={14} className={`text-emerald-700 transition-transform ${showDemoDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showDemoDropdown && (
                    <div className="mt-2 p-2 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5 animate-in fade-in duration-150">
                      <button
                        type="button"
                        onClick={() => {
                          setAccountMode('traveler');
                          setIdentifier('traveler@discovery.com');
                          setPassword('traveler123');
                          setShowDemoDropdown(false);
                          setSuccessNotice('Filled Traveler Demo: traveler@discovery.com');
                        }}
                        className="w-full p-2 rounded-xl bg-white hover:bg-emerald-50 border border-stone-200 text-left text-xs font-bold text-slate-800 flex items-center justify-between transition cursor-pointer"
                      >
                        <span>🧑🎒 Traveler Demo (traveler@discovery.com)</span>
                        <span className="text-[10px] text-emerald-700 font-mono">Fill Form</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAccountMode('partner');
                          setIdentifier('partner@discovery.com');
                          setPassword('partner123');
                          setShowDemoDropdown(false);
                          setSuccessNotice('Filled Partner Demo: partner@discovery.com');
                        }}
                        className="w-full p-2 rounded-xl bg-white hover:bg-emerald-50 border border-stone-200 text-left text-xs font-bold text-slate-800 flex items-center justify-between transition cursor-pointer"
                      >
                        <span>🏢 Partner Demo (partner@discovery.com)</span>
                        <span className="text-[10px] text-emerald-700 font-mono">Fill Form</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickMockLogin('trekker')}
                        className="w-full p-2 rounded-xl bg-white hover:bg-emerald-50 border border-stone-200 text-left text-xs font-bold text-slate-800 flex items-center justify-between transition cursor-pointer"
                      >
                        <span>🚀 1-Click Trekker SOS Dashboard</span>
                        <ArrowRight size={13} className="text-emerald-700 shrink-0" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickMockLogin('admin')}
                        className="w-full p-2 rounded-xl bg-white hover:bg-emerald-50 border border-stone-200 text-left text-xs font-bold text-slate-800 flex items-center justify-between transition cursor-pointer"
                      >
                        <span>🛡️ 1-Click Rescue Ops Command</span>
                        <ArrowRight size={13} className="text-emerald-700 shrink-0" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Partner Sub-Category Selection */}
                {isPartner && (
                  <div className="mb-4 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 animate-in fade-in duration-150">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-900 mb-2">
                      Select Business Category:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'homestay', label: 'Homestay / Hotel', icon: Home },
                        { id: 'rental', label: 'Taxi & Bike Fleet', icon: Car },
                        { id: 'guide', label: 'Local Guide', icon: Compass }
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSel = partnerSubRole === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setPartnerSubRole(item.id)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl text-center text-[10px] font-bold transition cursor-pointer border ${
                              isSel
                                ? 'bg-[#0f3d2e] text-white border-[#0f3d2e] shadow-2xs'
                                : 'bg-white text-slate-700 hover:bg-emerald-100/50 border-emerald-200/60'
                            }`}
                          >
                            <Icon size={14} className={`mb-1 shrink-0 ${isSel ? 'text-emerald-300' : 'text-emerald-800'}`} />
                            <span className="leading-tight">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Google SSO Button */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-stone-50 border border-stone-200/90 rounded-xl py-2.5 px-4 text-xs sm:text-sm font-bold text-slate-700 transition duration-150 shadow-2xs hover:border-stone-300 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  <GoogleIcon />
                  <span>Continue with Google ({isPartner ? 'Partner' : 'Traveler'})</span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-grow border-t border-stone-200" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    or with email
                  </span>
                  <div className="flex-grow border-t border-stone-200" />
                </div>

                {/* Standard Auth Form */}
                <form className="space-y-3.5" onSubmit={handleSubmit}>
                  
                  {isRegister && (
                    <>
                      {/* Full Name */}
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

                      {/* Email Address */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="regEmail">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            id="regEmail"
                            type="email"
                            required
                            value={email || identifier}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setIdentifier(e.target.value);
                            }}
                            placeholder="name@example.com"
                            className="w-full bg-stone-50 text-slate-900 text-sm font-medium border border-stone-200 focus:bg-white focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/20 rounded-xl pl-10 pr-3 py-2.5 placeholder:text-slate-400 focus:outline-none transition"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Mail className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {/* Mobile Number */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="regMobile">
                          Mobile Number
                        </label>
                        <div className="relative">
                          <input
                            id="regMobile"
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full bg-stone-50 text-slate-900 text-sm font-medium border border-stone-200 focus:bg-white focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/20 rounded-xl pl-10 pr-3 py-2.5 placeholder:text-slate-400 focus:outline-none transition"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Phone className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {!isPartner && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-slate-700" htmlFor="city">
                              Your Location / City (Optional)
                            </label>
                            <button
                              type="button"
                              onClick={handleDetectGps}
                              disabled={isDetectingGps}
                              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                            >
                              <Crosshair size={11} className={isDetectingGps ? 'animate-spin' : 'text-emerald-600'} />
                              <span>{isDetectingGps ? 'Locating...' : 'Use current location'}</span>
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="relative">
                              <input
                                id="city"
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="City (e.g. Nainital)"
                                className="w-full bg-stone-50 text-slate-900 text-xs sm:text-sm font-medium border border-stone-200 focus:bg-white focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/20 rounded-xl pl-8 pr-2.5 py-2 placeholder:text-slate-400 focus:outline-none transition"
                              />
                              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                              </div>
                            </div>
                            <div>
                              <input
                                id="district"
                                type="text"
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                                placeholder="District"
                                className="w-full bg-stone-50 text-slate-900 text-xs sm:text-sm font-medium border border-stone-200 focus:bg-white focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/20 rounded-xl px-3 py-2 placeholder:text-slate-400 focus:outline-none transition"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Sign In Email / Mobile Field */}
                  {!isRegister && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="identity">
                        {isPartner ? 'Partner Email or Mobile' : 'Email or Mobile Number'}
                      </label>
                      <div className="relative">
                        <input
                          id="identity"
                          name="identity"
                          type="text"
                          required
                          autoComplete="username"
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
                  )}

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700" htmlFor="password">
                        Password
                      </label>
                      {!isRegister && (
                        <button
                          type="button"
                          onClick={() => {
                            setAuthStep('forgot_password');
                            setErrorMessage('');
                          }}
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
                        autoComplete={isRegister ? 'new-password' : 'current-password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={isRegister ? 'Min 8 chars, 1 uppercase, 1 number' : 'Enter your password'}
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

                  {/* Confirm Password Field (Registration only) */}
                  {isRegister && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="confirmPassword">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full bg-stone-50 text-slate-900 text-sm font-medium border border-stone-200 focus:bg-white focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/20 rounded-xl pl-10 pr-3 py-2.5 placeholder:text-slate-400 focus:outline-none transition"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <KeyRound className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#0f3d2e] hover:bg-[#144c3a] text-white font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 rounded-xl shadow-sm transition-all duration-200 mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-98 whitespace-nowrap"
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
                            ? (isPartner ? 'Register Partner Portal' : 'Register & Verify') 
                            : (isPartner ? 'Sign In to Partner Portal' : 'Sign In to Account')}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-4 pt-3 border-t border-stone-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">Secure Encrypted Authentication</span>
                </div>

                {/* Sign In / Register Switch */}
                <p className="text-xs text-slate-600 text-center mt-3 font-medium">
                  {isRegister ? (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { setIsRegister(false); setErrorMessage(''); }}
                        className="text-[#0f3d2e] hover:underline font-bold ml-0.5 cursor-pointer whitespace-nowrap"
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
                        className="text-[#0f3d2e] hover:underline font-bold ml-0.5 cursor-pointer whitespace-nowrap"
                      >
                        Register Now
                      </button>
                    </>
                  )}
                </p>

                {/* Guest Explorer Link */}
                <div className="mt-4 pt-3 border-t border-stone-100 text-center">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#0f3d2e] transition-colors font-bold px-3.5 py-2 rounded-xl hover:bg-emerald-50 cursor-pointer whitespace-nowrap"
                  >
                    <ArrowLeft size={13} className="shrink-0" />
                    <span>Continue as Guest Explorer</span>
                  </Link>
                </div>
              </>
            )}

          </div>
        </div>

      </main>

    </div>
  );
}
