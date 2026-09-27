import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  X, Mail, Lock, User, Phone, Briefcase, Eye, EyeOff, 
  ShieldCheck, Sparkles, ArrowRight, CheckCircle2, Compass, Building2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PARTNER_TYPES = [
  { value: 'Homestay', label: '🏡 Hotel / Homestay' },
  { value: 'Guide', label: '🧭 Certified Mountain Guide' },
  { value: 'VehicleRental', label: '🛵 Bike / Scooty / 4x4 Fleet' },
  { value: 'TrekOperator', label: '⛰️ Trek & Expedition Operator' },
  { value: 'ActivityProvider', label: '🎯 Rafting & Adventure Sports' },
];

export default function AuthModal() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    authModalOpen,
    setAuthModalOpen,
    login,
    register,
    registerPartnerAccount,
    authError,
    setAuthError,
    authMode,
  } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [accountType, setAccountType] = useState('user'); // 'user' | 'partner'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidation] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    businessName: '',
    partnerType: '',
  });

  useEffect(() => {
    if (authModalOpen) {
      setAccountType(authMode === 'partner' ? 'partner' : 'user');
      setIsLogin(true);
      setValidation('');
      setAuthError(null);
      setForm({ name: '', email: '', password: '', confirmPassword: '', phone: '', businessName: '', partnerType: '' });
    }
  }, [authModalOpen, authMode, setAuthError]);

  if (!authModalOpen) return null;

  const isPartner = accountType === 'partner';
  const close = () => setAuthModalOpen(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setValidation('');
  };

  const validate = () => {
    if (!form.email.trim() || !form.password) {
      setValidation('Please fill in all required fields.');
      return false;
    }
    if (!isLogin) {
      if (!form.name.trim()) {
        setValidation('Please enter your full name.');
        return false;
      }
      if (form.password.length < 6) {
        setValidation('Password must be at least 6 characters.');
        return false;
      }
      if (form.password !== form.confirmPassword) {
        setValidation('Passwords do not match.');
        return false;
      }
      if (isPartner && !form.partnerType) {
        setValidation('Please select your business type.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await login({ email: form.email.trim(), password: form.password.trim() });
      } else if (isPartner) {
        result = await registerPartnerAccount({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password.trim(),
          phone: form.phone.trim(),
          businessName: form.businessName.trim() || form.name.trim(),
          partnerType: form.partnerType,
        });
      } else {
        result = await register({ name: form.name.trim(), email: form.email.trim(), password: form.password.trim() });
      }

      if (result?.success) {
        const role = result.user?.role;
        if (role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (role === 'partner') {
          navigate('/partner', { replace: true });
        } else {
          const from = location.state?.from?.pathname;
          const safePath =
            from &&
            from.startsWith('/') &&
            !from.startsWith('/partner') &&
            !from.startsWith('/admin') &&
            !from.startsWith('http')
              ? from
              : '/';
          navigate(safePath, { replace: true });
        }
      } else {
        setValidation(result?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (roleType = 'user') => {
    setLoading(true);
    setValidation('');
    try {
      const demoEmail = roleType === 'partner' ? 'partner@devbhoomi.in' : 'traveler@devbhoomi.in';
      const demoPass = 'demo123456';
      const result = await login({ email: demoEmail, password: demoPass });
      if (result?.success) {
        const role = result.user?.role;
        if (role === 'partner') navigate('/partner', { replace: true });
        else navigate('/profile', { replace: true });
      } else {
        // Fallback simulated guest session
        setAuthModalOpen(false);
      }
    } catch {
      setAuthModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const errorMsg = validationError || authError;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && close()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xl animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto bg-gradient-to-b from-stone-900 via-[#0f3d2e] to-stone-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-white select-none scrollbar-thin scrollbar-thumb-emerald-800">
        
        {/* Top Radial Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={close}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 active:scale-95 z-20"
        >
          <X size={18} />
        </button>

        {/* Header Icon & Brand Badge */}
        <div className="flex flex-col items-center text-center mb-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 p-0.5 shadow-lg shadow-emerald-950/50 mb-3">
            <div className="w-full h-full bg-stone-950 rounded-[14px] flex items-center justify-center text-emerald-400">
              <Compass size={28} className="animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Discovery Uttarakhand</span>
          </h2>
          <p className="text-xs text-stone-300 mt-1 max-w-xs leading-relaxed font-medium">
            {isLogin 
              ? 'Sign in to access verified homestays, 4x4 mountain rentals & AI itinerary planner.' 
              : 'Create your Devbhoomi account for verified high-altitude travel.'}
          </p>
        </div>

        {/* Account Role Selector Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-950/60 rounded-2xl border border-white/10 mb-6 relative z-10">
          <button
            type="button"
            onClick={() => { setAccountType('user'); setAuthError(null); setValidation(''); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              !isPartner
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass size={14} className="shrink-0" />
            <span>Traveler</span>
          </button>
          <button
            type="button"
            onClick={() => { setAccountType('partner'); setAuthError(null); setValidation(''); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              isPartner
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 size={14} className="shrink-0" />
            <span>Partner / Host</span>
          </button>
        </div>

        {/* Error Advisory Banner */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold text-center animate-in fade-in duration-150">
            {errorMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          
          {/* Full Name (Register Only) */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                Full Name <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950/70 border border-white/10 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all font-medium"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1.5">
              Email Address <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-stone-950/70 border border-white/10 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1.5">
              Password <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 bg-stone-950/70 border border-white/10 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Register Only) */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                Confirm Password <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950/70 border border-white/10 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all font-medium"
                />
              </div>
            </div>
          )}

          {/* Partner Fields */}
          {!isLogin && isPartner && (
            <>
              <div className="pt-2">
                <label className="block text-xs font-bold text-stone-300 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-950/70 border border-white/10 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">Business / Agency Name</label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    name="businessName"
                    value={form.businessName}
                    onChange={handleChange}
                    placeholder="e.g. Himalayan Adventure Stays"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-950/70 border border-white/10 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Business Type <span className="text-amber-400">*</span>
                </label>
                <select
                  name="partnerType"
                  value={form.partnerType}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 bg-stone-950/70 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-medium cursor-pointer"
                >
                  <option value="" className="bg-stone-900 text-stone-400">Select business type...</option>
                  {PARTNER_TYPES.map((pt) => (
                    <option key={pt.value} value={pt.value} className="bg-stone-900 text-white">
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl text-xs font-extrabold tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-lg active:scale-95 ${
              loading 
                ? 'bg-stone-700 text-stone-400 cursor-not-allowed'
                : isPartner
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-amber-950/40'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-black shadow-emerald-950/40'
            }`}
          >
            {loading ? (
              <span>Connecting to Devbhoomi...</span>
            ) : (
              <>
                <span>{isLogin ? (isPartner ? 'Sign In to Partner Portal' : 'Sign In') : (isPartner ? 'Create Partner Account' : 'Create Account')}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Sign-In Shortcut */}
        <div className="mt-4 pt-4 border-t border-white/10 text-center relative z-10">
          <p className="text-[11px] text-stone-400 font-semibold mb-2.5">
            Testing features without account creation?
          </p>
          <button
            type="button"
            onClick={() => handleDemoSignIn(isPartner ? 'partner' : 'user')}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-300 hover:text-emerald-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Sparkles size={14} className="text-emerald-400" />
            <span>⚡ One-Tap Demo Sign-In ({isPartner ? 'Partner' : 'Traveler'})</span>
          </button>
        </div>

        {/* Toggle Login / Register */}
        <div className="mt-4 text-center text-xs text-stone-400 relative z-10">
          <span>{isLogin ? "Don't have an account yet? " : 'Already registered? '}</span>
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setValidation(''); setAuthError(null); }}
            className="font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer ml-1"
          >
            {isLogin ? (isPartner ? 'Register Business' : 'Create Account') : 'Sign In'}
          </button>
        </div>

        {/* Verified Security Footer Badge */}
        <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-center gap-1.5 text-[10.5px] text-emerald-400/80 font-bold uppercase tracking-wider relative z-10">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>256-Bit Escrow &amp; Local Verification Safe</span>
        </div>

      </div>
    </div>
  );
}
