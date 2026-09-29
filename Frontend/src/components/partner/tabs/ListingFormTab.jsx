import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight,
  Check, 
  UploadCloud, 
  Trash2, 
  Star, 
  Loader2, 
  AlertCircle, 
  Home, 
  Car, 
  Bike, 
  Compass, 
  Mountain,
  MapPin,
  Camera,
  IndianRupee,
  ShieldCheck,
  Send,
  Save
} from 'lucide-react';
import { uploadPartnerImages } from '../../../api/partnerApi';

const categories = [
  { id: 'stays', name: 'Homestay / Hotel', icon: Home, type: 'Stay', defaultUnit: 'night', hint: 'Rooms, cottages, luxury tents, and traditional homestays' },
  { id: 'car_rental', name: 'Car / Taxi / Cab', icon: Car, type: 'Rental', defaultUnit: 'day', hint: 'SUVs, sedans, 4x4 Boleros, and commercial cabs' },
  { id: 'bike_rental', name: 'Bike / Scooter', icon: Bike, type: 'Rental', defaultUnit: 'day', hint: 'Royal Enfields, Himalayans, mountain bikes, scooties' },
  { id: 'guides', name: 'Local Guide', icon: Compass, type: 'Guide', defaultUnit: 'day', hint: 'Trekking guides, heritage experts, Char Dham escorts' },
  { id: 'activities', name: 'Activity / Experience', icon: Mountain, type: 'Activity', defaultUnit: 'person', hint: 'Rafting, paragliding, camping, skiing, rock climbing' }
];

const uttarakhandDistricts = [
  'Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 
  'Haridwar', 'Nainital', 'Pauri Garhwal', 'Pithoragarh', 
  'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi'
];

const STEPS = [
  { number: 1, label: 'Category' },
  { number: 2, label: 'Basic Info' },
  { number: 3, label: 'Photos' },
  { number: 4, label: 'Pricing' },
  { number: 5, label: 'Availability' },
  { number: 6, label: 'Review & Submit' }
];

const ListingFormTab = ({ 
  initialData = null, 
  onSave, 
  onCancel, 
  isSubmitting 
}) => {
  const isEditing = Boolean(initialData?._id);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepError, setStepError] = useState('');

  // Initial category resolver
  const getInitialCat = () => {
    if (!initialData) return 'stays';
    if (initialData.category === 'bike_rental' || initialData.category === 'scooty_rental') return 'bike_rental';
    if (initialData.category === 'car_rental' || initialData.category === 'rentals') return 'car_rental';
    if (initialData.category === 'guides' || initialData.listingType === 'Guide') return 'guides';
    if (initialData.category === 'activities' || initialData.listingType === 'Activity') return 'activities';
    return 'stays';
  };

  // Form states
  const [category, setCategory] = useState(getInitialCat);
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [district, setDistrict] = useState(initialData?.district || 'Dehradun');
  const [city, setCity] = useState(initialData?.city || '');
  const [locality, setLocality] = useState(initialData?.locality || '');
  const [address, setAddress] = useState(initialData?.location?.address || initialData?.address || '');

  // Photos
  const initialPhotos = initialData?.photos || (initialData?.images ? initialData.images.map(img => typeof img === 'string' ? img : img.url).filter(Boolean) : []);
  const [photos, setPhotos] = useState(initialPhotos);
  const [isUploading, setIsUploading] = useState(false);

  // Pricing
  const [price, setPrice] = useState(
    initialData?.pricingDetails?.pricePerDay || initialData?.pricing?.amount || initialData?.price || ''
  );
  const currentCatObj = categories.find(c => c.id === category) || categories[0];
  const [unit, setUnit] = useState(initialData?.pricing?.unit || currentCatObj.defaultUnit);
  const [securityDeposit, setSecurityDeposit] = useState(initialData?.pricingDetails?.securityDeposit || 0);

  // Availability & Capacity
  const [totalUnits, setTotalUnits] = useState(initialData?.availabilityDetails?.totalUnits || 1);
  const [maxGuests, setMaxGuests] = useState(initialData?.capacity?.maxGuests || 2);

  // Photo Upload Handler
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    setStepError('');
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      const res = await uploadPartnerImages(formData);
      if (res.success) {
        const urls = Array.isArray(res.urls) ? res.urls : (res.data ? res.data.map(d => typeof d === 'string' ? d : d.url).filter(Boolean) : []);
        setPhotos(prev => [...prev, ...urls]);
      } else {
        setStepError(res.message || 'Failed to upload photos. Please try again.');
      }
    } catch (err) {
      setStepError('Upload error. Please check image files and connection.');
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  // Step Validation & Navigation
  const validateCurrentStep = () => {
    setStepError('');
    if (currentStep === 1) {
      if (!category) {
        setStepError('Please select a service category.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!title.trim()) {
        setStepError('Please enter a service or property name.');
        return false;
      }
      if (!city.trim()) {
        setStepError('Please specify the city / town in Uttarakhand.');
        return false;
      }
    } else if (currentStep === 4) {
      if (!price || Number(price) <= 0) {
        setStepError('Please enter a valid price greater than ₹0.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const handleBack = () => {
    setStepError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Final Submission
  const handleSaveListing = (submitForVerification = false) => {
    if (!title.trim() || !city.trim() || !price) {
      setStepError('Please complete all required fields (Name, Location, Price).');
      return;
    }

    const payload = {
      category,
      listingType: currentCatObj.type,
      title: title.trim(),
      description: description.trim(),
      district,
      city: city.trim(),
      locality: locality.trim(),
      address: address.trim(),
      photos,
      images: photos.map(p => ({ url: p, isPrimary: false })),
      pricing: {
        amount: Number(price),
        unit,
        currency: 'INR',
        provenance: 'PARTNER_CLAIMED'
      },
      pricingDetails: {
        pricePerDay: Number(price),
        pricePerHour: 0,
        securityDeposit: Number(securityDeposit) || 0
      },
      capacity: {
        maxGuests: Number(maxGuests) || 2
      },
      availabilityDetails: {
        totalUnits: Number(totalUnits) || 1,
        availableUnits: Number(totalUnits) || 1
      },
      submitForVerification
    };

    onSave(payload);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft size={15} />
          <span>Back to Services</span>
        </button>
        <span className="text-xs font-bold text-stone-400">
          Step {currentStep} of 6
        </span>
      </div>

      {/* Visual Stepper */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => {
            const isDone = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            return (
              <React.Fragment key={step.number}>
                <button
                  onClick={() => {
                    if (step.number < currentStep || validateCurrentStep()) {
                      setCurrentStep(step.number);
                    }
                  }}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone ? 'bg-emerald-700 text-white' :
                    isCurrent ? 'bg-emerald-800 text-white ring-4 ring-emerald-100 shadow-xs' :
                    'bg-stone-100 text-stone-400'
                  }`}>
                    {isDone ? <Check size={14} /> : step.number}
                  </div>
                  <span className={`text-[10px] font-bold hidden sm:block ${
                    isCurrent ? 'text-emerald-900' : isDone ? 'text-stone-700' : 'text-stone-400'
                  }`}>
                    {step.label}
                  </span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.number ? 'bg-emerald-700' : 'bg-stone-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Validation Banner */}
      {stepError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0 text-rose-600" />
          <span>{stepError}</span>
        </div>
      )}

      {/* Step Body */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs">
        {/* STEP 1: What do you offer? */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-stone-900">What service do you offer?</h3>
              <p className="text-xs text-stone-500 mt-0.5">Select the type of tourism service you operate in Uttarakhand.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => {
                      setCategory(cat.id);
                      setUnit(cat.defaultUnit);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50/50 ring-2 ring-emerald-700/20'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-stone-500'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{cat.name}</h4>
                      <p className="text-xs text-stone-500 mt-0.5 leading-snug">{cat.hint}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Basic Information */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-stone-900">Basic Service Information</h3>
              <p className="text-xs text-stone-500 mt-0.5">Provide a recognizable title, location, and description.</p>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Service / Property Name *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Himalayan Riverside Homestay, Royal Enfield 350 Classic..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">District *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs bg-white"
                  >
                    {uttarakhandDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">City / Town *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Rishikesh, Joshimath, Nainital"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Specific Address / Landmark</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Tapovan, Near Laxman Jhula"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your service, key features, and why travelers will love it..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Photos */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-stone-900">Photos</h3>
              <p className="text-xs text-stone-500 mt-0.5">High quality photos increase booking chances by up to 80%.</p>
            </div>

            {/* Upload Area */}
            <label className="border-2 border-dashed border-stone-300 hover:border-emerald-600 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-stone-50/50 hover:bg-emerald-50/30 transition-colors">
              <Camera size={28} className="text-stone-400 mb-2" />
              <span className="text-xs font-bold text-stone-700">Click to upload photos</span>
              <span className="text-[11px] text-stone-400 mt-0.5">PNG, JPG, WebP up to 10MB</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            {isUploading && (
              <div className="flex items-center justify-center gap-2 text-xs text-emerald-800 font-semibold py-2">
                <Loader2 size={16} className="animate-spin" />
                <span>Uploading photos to cloud...</span>
              </div>
            )}

            {/* Photos Grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {photos.map((url, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-stone-200 h-24">
                    <img src={url} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-emerald-800 text-white text-[9px] font-bold">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Pricing */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-stone-900">Pricing Matrix</h3>
              <p className="text-xs text-stone-500 mt-0.5">Set a clear tariff for travelers without hidden charges.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Price in INR (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-stone-500 text-sm">₹</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="2500"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Pricing Unit *</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs bg-white"
                >
                  <option value="night">Per Night</option>
                  <option value="day">Per Day</option>
                  <option value="person">Per Person</option>
                  <option value="trip">Per Trip</option>
                </select>
              </div>

              {category.includes('rental') && (
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Refundable Security Deposit (₹)</label>
                  <input
                    type="number"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(e.target.value)}
                    placeholder="e.g. 2000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Returned to guest upon safe return of vehicle.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: Availability */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-stone-900">Availability & Capacity</h3>
              <p className="text-xs text-stone-500 mt-0.5">Specify how many units or rooms you have ready for bookings.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {category === 'stays' ? 'Number of Rooms Available' : 'Available Units in Fleet'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalUnits}
                  onChange={(e) => setTotalUnits(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {category === 'stays' ? 'Max Guests per Room' : 'Passenger / Group Capacity'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxGuests}
                  onChange={(e) => setMaxGuests(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Review & Submit */}
        {currentStep === 6 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-stone-900">Everything looks good?</h3>
              <p className="text-xs text-stone-500 mt-0.5">Review your listing preview before saving or submitting for verification.</p>
            </div>

            {/* Preview Card */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-full sm:w-36 h-28 rounded-xl bg-stone-200 overflow-hidden shrink-0">
                {photos[0] ? (
                  <img src={photos[0]} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">No Photo</div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  {currentCatObj.name}
                </span>
                <h4 className="text-sm font-bold text-stone-900 truncate">{title || 'Untitled Service'}</h4>
                <p className="text-xs text-stone-500 flex items-center gap-1">
                  <MapPin size={11} /> {city || 'Uttarakhand'}, {district}
                </p>
                <div className="pt-2 flex items-baseline gap-1">
                  <span className="text-base font-extrabold text-stone-900">₹{Number(price || 0).toLocaleString('en-IN')}</span>
                  <span className="text-xs text-stone-500">/ {unit}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
              <p className="font-semibold">What happens next?</p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Saving as draft keeps it private for further edits. Submitting sends it to our admin team for verification so it can go live across Discovery Uttarakhand.
              </p>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Back
            </button>
          ) : <div />}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors flex items-center gap-1"
            >
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveListing(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Save size={13} /> Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleSaveListing(true)}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
                Submit for Verification
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingFormTab;
