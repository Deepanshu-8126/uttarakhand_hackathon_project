import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  User, 
  MapPin, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  Home, 
  Car, 
  Compass, 
  Upload, 
  Sparkles,
  Layers,
  Phone,
  Mail
} from 'lucide-react';
import { registerPartner, uploadPartnerDocument } from '../../api/partnerApi';
import { useAuth } from '../../context/AuthContext';

const UTTARAKHAND_DISTRICTS = [
  'Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 
  'Haridwar', 'Nainital', 'Pauri Garhwal', 'Pithoragarh', 
  'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi'
];

const BUSINESS_TYPES = [
  {
    id: 'Homestay',
    title: 'Homestay & Hotel Host',
    desc: 'Traditional Kumaoni/Garhwali homestays, boutique mountain lodges & stays',
    icon: Home,
    capabilities: ['Private Rooms', 'Entire Cottage', 'Homecooked Pahadi Meals', 'Village Walk']
  },
  {
    id: 'VehicleRental',
    title: 'Fleet & Vehicle Rental',
    desc: 'Mountain bikes, 4x4 Scorpio/Thar rentals, and self-drive cars',
    icon: Car,
    capabilities: ['Royal Enfield / Bikes', 'Scooters', '4x4 Expedition SUVs', 'Camping Gear']
  },
  {
    id: 'TransportOperator',
    title: 'Transport & Mobility Operator',
    desc: 'Taxis, Shared Max Cabs, Jeeps & inter-valley transfers',
    icon: Car,
    capabilities: ['Max Cabs (10-12 seater)', 'Private Taxi', 'Shared Corridor Rides', 'Airport/Station Transfers']
  },
  {
    id: 'Guide',
    title: 'Certified Mountain Guide',
    desc: 'High-altitude treks, pilgrimage circuits & heritage trails',
    icon: Compass,
    capabilities: ['High Treks', 'Char Dham Spiritual Tours', 'Birdwatching & Flora', 'Local Heritage Walks']
  }
];

export default function PartnerOnboardingPage() {
  const navigate = useNavigate();
  const { currentUser, updateUser } = useAuth();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [partnerType, setPartnerType] = useState('Homestay');
  const [businessName, setBusinessName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [contactPerson, setContactPerson] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('Nainital');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCapabilities, setSelectedCapabilities] = useState(['Private Rooms']);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const toggleCapability = (cap) => {
    setSelectedCapabilities(prev => 
      prev.includes(cap) ? prev.filter(c => c !== cap) : [...prev, cap]
    );
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleNext = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!contactPerson.trim() || !phone.trim() || !email.trim()) {
        setErrorMsg('Please enter your full contact details (Name, Phone, and Email).');
        return;
      }
    }
    if (step === 2) {
      if (!businessName.trim()) {
        setErrorMsg('Please specify your registered Business / Property Name.');
        return;
      }
    }
    if (step === 5) {
      if (!district || !city.trim() || !address.trim()) {
        setErrorMsg('Please specify your complete location and address in Uttarakhand.');
        return;
      }
    }
    setStep(prev => Math.min(prev + 1, 7));
  };

  const handleBack = () => {
    setErrorMsg('');
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        partnerType,
        businessName,
        legalBusinessName: legalName || businessName,
        contactPerson,
        phone,
        email,
        description,
        district,
        city,
        address,
        serviceCategories: selectedCapabilities
      };

      const res = await registerPartner(payload);

      if (res?.success) {
        // Upload any queued documents if selected
        if (uploadedFiles.length > 0) {
          const docForm = new FormData();
          uploadedFiles.forEach(f => docForm.append('documents', f));
          docForm.append('documentType', 'BUSINESS_REGISTRATION');
          docForm.append('documentName', 'Onboarding Initial Verification Proof');
          await uploadPartnerDocument(docForm).catch(e => console.warn('Doc upload deferred:', e));
        }

        if (updateUser) {
          updateUser({ role: 'partner' });
        }

        navigate('/partner/overview');
      } else {
        setErrorMsg(res?.message || 'Failed to submit partner onboarding. Please try again.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Onboarding registration failed. Please verify all details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-slate-800 font-sans selection:bg-emerald-500 selection:text-white pb-16">
      
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-4 flex items-center justify-between border-b border-stone-200">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-xs" />
            <span className="text-sm font-black text-slate-900 tracking-tight">Discovery Uttarakhand</span>
          </Link>
          <span className="text-stone-300">/</span>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Partner Onboarding</span>
        </div>

        <Link
          to="/partner/login"
          className="text-xs font-bold text-stone-600 hover:text-[#0f3d2e] transition"
        >
          Already have an account? Sign In
        </Link>
      </header>

      {/* Progress Stepper */}
      <div className="max-w-3xl mx-auto px-4 mt-8 mb-6">
        <div className="flex items-center justify-between relative">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <div key={num} className="flex flex-col items-center relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                num < step 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : num === step 
                  ? 'bg-[#0f3d2e] text-white ring-4 ring-emerald-500/20 shadow-md' 
                  : 'bg-white text-stone-400 border border-stone-200'
              }`}>
                {num < step ? '✓' : num}
              </div>
            </div>
          ))}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-stone-200 -z-0" />
        </div>

        <div className="flex justify-between text-[11px] font-bold text-stone-500 mt-2">
          <span>Identity</span>
          <span>Business</span>
          <span>Category</span>
          <span>Capabilities</span>
          <span>Location</span>
          <span>Compliance</span>
          <span>Submit</span>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-lg p-6 sm:p-8">
          
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: Partner Identity */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-b border-stone-100 pb-3">
                <h2 className="text-xl font-black text-slate-900">Step 1: Partner Identity</h2>
                <p className="text-xs text-slate-500 mt-1">Provide your primary contact credentials for business verification.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Ramesh Singh Bisht"
                    className="w-full bg-stone-50 text-sm font-medium border border-stone-200 rounded-xl pl-10 pr-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#0f3d2e]"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone (WhatsApp enabled)</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-stone-50 text-sm font-medium border border-stone-200 rounded-xl pl-10 pr-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#0f3d2e]"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Business Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="host@pahadihomestay.in"
                      className="w-full bg-stone-50 text-sm font-medium border border-stone-200 rounded-xl pl-10 pr-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#0f3d2e]"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Business Profile */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b border-stone-100 pb-3">
                <h2 className="text-xl font-black text-slate-900">Step 2: Business Profile</h2>
                <p className="text-xs text-slate-500 mt-1">What is your property or tourism service known as?</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Public Business Name</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Kedarnath Valley Heritage Homestay"
                  className="w-full bg-stone-50 text-sm font-medium border border-stone-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#0f3d2e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Legal Registered Entity Name (Optional)</label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="e.g. Bisht Hospitality Enterprises LLP"
                  className="w-full bg-stone-50 text-sm font-medium border border-stone-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#0f3d2e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell travelers about your mountain heritage, scenic valley views, and offerings..."
                  className="w-full bg-stone-50 text-sm font-medium border border-stone-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:border-[#0f3d2e]"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Business Type */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="border-b border-stone-100 pb-3">
                <h2 className="text-xl font-black text-slate-900">Step 3: Select Primary Business Type</h2>
                <p className="text-xs text-slate-500 mt-1">Choose how your services will appear in the Discovery marketplace.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BUSINESS_TYPES.map((bt) => {
                  const Icon = bt.icon;
                  const isSel = partnerType === bt.id;
                  return (
                    <div
                      key={bt.id}
                      onClick={() => {
                        setPartnerType(bt.id);
                        setSelectedCapabilities(bt.capabilities.slice(0, 2));
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSel 
                          ? 'border-[#0f3d2e] bg-emerald-50/50 shadow-xs ring-2 ring-[#0f3d2e]/10' 
                          : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className={`p-2 rounded-xl ${isSel ? 'bg-[#0f3d2e] text-white' : 'bg-stone-100 text-stone-700'}`}>
                          <Icon size={18} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{bt.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500">{bt.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Capabilities */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="border-b border-stone-100 pb-3">
                <h2 className="text-xl font-black text-slate-900">Step 4: Operational Capabilities</h2>
                <p className="text-xs text-slate-500 mt-1">Select the specific services your business is ready to fulfill.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(BUSINESS_TYPES.find(b => b.id === partnerType)?.capabilities || []).map((cap) => {
                  const isSel = selectedCapabilities.includes(cap);
                  return (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => toggleCapability(cap)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        isSel 
                          ? 'bg-[#0f3d2e] text-white border-[#0f3d2e]' 
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {isSel ? '✓ ' : '+ '}
                      {cap}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-slate-500 italic mt-2">
                💡 You can configure detailed pricing, vehicle seating, or room types later inside Partner Hub.
              </p>
            </div>
          )}

          {/* STEP 5: Location */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="border-b border-stone-100 pb-3">
                <h2 className="text-xl font-black text-slate-900">Step 5: Location in Uttarakhand</h2>
                <p className="text-xs text-slate-500 mt-1">Where will travelers find or meet your business?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-stone-50 text-sm font-medium border border-stone-200 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#0f3d2e]"
                  >
                    {UTTARAKHAND_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Town / City / Valley</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Joshimath / Pangot"
                    className="w-full bg-stone-50 text-sm font-medium border border-stone-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#0f3d2e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Street Address or Landmark</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Near Gurudwara Road, Upper Bazaar"
                  className="w-full bg-stone-50 text-sm font-medium border border-stone-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#0f3d2e]"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Documents & Compliance */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="border-b border-stone-100 pb-3">
                <h2 className="text-xl font-black text-slate-900">Step 6: Compliance &amp; Verification</h2>
                <p className="text-xs text-slate-500 mt-1">Upload tourism permits, homestay registration or Aadhaar (PDF/JPG/PNG).</p>
              </div>

              <div className="p-6 border-2 border-dashed border-stone-300 rounded-2xl bg-stone-50/60 text-center">
                <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-800">Upload Registration Document</h4>
                <p className="text-[11px] text-slate-500 mb-3">Govt. Certificate, RC for Taxi/Vehicle, or Tourism License</p>
                
                <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-300 text-slate-700 text-xs font-bold cursor-pointer hover:bg-stone-100 shadow-xs">
                  <span>Browse File</span>
                  <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                </label>

                {uploadedFiles.length > 0 && (
                  <div className="mt-3 text-left space-y-1">
                    {uploadedFiles.map((f, idx) => (
                      <div key={idx} className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>{f.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-400">
                🔒 Documents remain isolated in private encrypted storage and are never shown publicly.
              </p>
            </div>
          )}

          {/* STEP 7: Review & Submit */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="border-b border-stone-100 pb-3">
                <h2 className="text-xl font-black text-slate-900">Step 7: Verification Submission</h2>
                <p className="text-xs text-slate-500 mt-1">Review your business profile before submitting to Discovery Uttarakhand.</p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Business Name:</span>
                  <span className="font-bold text-slate-900">{businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Category:</span>
                  <span className="font-bold text-slate-900">{partnerType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Location:</span>
                  <span className="font-bold text-slate-900">{city}, {district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Contact:</span>
                  <span className="font-bold text-slate-900">{contactPerson} ({phone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Capabilities:</span>
                  <span className="font-bold text-emerald-800">{selectedCapabilities.join(', ')}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
                <Sparkles size={16} className="text-amber-700 shrink-0" />
                <span>Upon submission, you can immediately access the Partner Hub to build services and view customer previews.</span>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 text-slate-700 text-xs font-bold hover:bg-stone-100 transition cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0f3d2e] hover:bg-[#144c3a] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-white" />
                    <span>Submitting Onboarding...</span>
                  </>
                ) : (
                  <>
                    <span>Submit &amp; Open Partner Hub</span>
                    <CheckCircle2 size={14} />
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </main>

    </div>
  );
}
