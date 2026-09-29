import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Building2,
  Car,
  ShieldCheck,
  ExternalLink,
  Plus,
  X,
  Loader2
} from 'lucide-react';

const DOCUMENT_CATEGORIES = [
  {
    id: 'business',
    title: 'Business & Tourism Credentials',
    description: 'Official registrations certifying your tourism entity',
    icon: Building2,
    types: [
      { key: 'business_registration', label: 'Business Registration / MSME / Shop Act' },
      { key: 'tourism_registration', label: 'Uttarakhand Tourism Registration' },
      { key: 'gst_document', label: 'GST Certificate (if registered)' }
    ]
  },
  {
    id: 'vehicle',
    title: 'Vehicle & Transport Permits',
    description: 'Required for commercial taxi, cab, bike, and fleet rentals',
    icon: Car,
    types: [
      { key: 'vehicle_registration', label: 'Vehicle Registration Certificate (RC)' },
      { key: 'driving_license', label: 'Commercial Driving License' },
      { key: 'permit', label: 'State / Hill Route Transport Permit' },
      { key: 'insurance', label: 'Commercial Vehicle Insurance' }
    ]
  },
  {
    id: 'identity',
    title: 'Identity & Address Proof',
    description: 'Owner verification for secure payouts and legal compliance',
    icon: ShieldCheck,
    types: [
      { key: 'identity_proof', label: 'Aadhaar / Passport / Voter ID' },
      { key: 'address_proof', label: 'Proof of Local Operating Address' },
      { key: 'ownership_proof', label: 'Property Ownership / Lease Agreement' }
    ]
  }
];

const DocumentsTab = ({ 
  documents = [], 
  expiringCount = 0, 
  onUpload, 
  onDelete, 
  isUploading = false 
}) => {
  const [activeUploadType, setActiveUploadType] = useState(null);
  const [expiryDate, setExpiryDate] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadNotes, setUploadNotes] = useState('');
  const [formError, setFormError] = useState('');

  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Helper to find existing doc for a type
  const getDocForType = (typeKey) => {
    return documents.find(d => d.documentType === typeKey);
  };

  const handleStartUpload = (typeKey) => {
    setActiveUploadType(typeKey);
    setExpiryDate('');
    setSelectedFile(null);
    setUploadNotes('');
    setFormError('');
  };

  const handleSaveUpload = async () => {
    if (!selectedFile) {
      setFormError('Please select a document file to upload.');
      return;
    }
    const formData = new FormData();
    formData.append('documents', selectedFile);
    formData.append('documentType', activeUploadType);
    if (expiryDate) formData.append('expiryDate', expiryDate);
    if (uploadNotes) formData.append('notes', uploadNotes);

    await onUpload(formData);
    setActiveUploadType(null);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-stone-900">Compliance & Business Documents</h2>
        <p className="text-xs text-stone-500 mt-0.5">Upload required government proofs and licenses to verify your business</p>
      </div>

      {/* Expiry Warning */}
      {expiringCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs text-amber-900">
          <AlertTriangle className="text-amber-600 shrink-0" size={18} />
          <span>
            <strong>{expiringCount} document(s) expiring within 30 days.</strong> Please upload updated renewals to maintain continuous verification.
          </span>
        </div>
      )}

      {/* Grouped Document Sections */}
      <div className="space-y-6">
        {DOCUMENT_CATEGORIES.map((cat) => {
          const CatIcon = cat.icon;
          return (
            <div key={cat.id} className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                  <CatIcon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">{cat.title}</h3>
                  <p className="text-xs text-stone-500">{cat.description}</p>
                </div>
              </div>

              {/* Items in this category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {cat.types.map((t) => {
                  const doc = getDocForType(t.key);
                  const isExpiringSoon = doc?.expiryDate && new Date(doc.expiryDate) <= thirtyDays && doc.status === 'VERIFIED';
                  const isExpired = doc?.status === 'EXPIRED';

                  return (
                    <div 
                      key={t.key}
                      className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-stone-900 truncate">
                            {t.label}
                          </h4>
                          {doc ? (
                            <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                              File: {doc.fileName || 'Uploaded file'}
                            </p>
                          ) : (
                            <p className="text-[11px] text-stone-400 mt-0.5">
                              Not uploaded yet
                            </p>
                          )}
                        </div>

                        {/* Status chip */}
                        {doc ? (
                          isExpiringSoon ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              <AlertTriangle size={11} /> Expires Soon
                            </span>
                          ) : doc.status === 'VERIFIED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 size={11} /> Verified ✓
                            </span>
                          ) : doc.status === 'REJECTED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <XCircle size={11} /> Needs Update
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock size={11} /> Under Review
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-200 text-stone-600">
                            Required
                          </span>
                        )}
                      </div>

                      {/* Expiry Date string if present */}
                      {doc?.expiryDate && (
                        <div className="text-[11px] text-stone-500">
                          Valid until: {new Date(doc.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-2 border-t border-stone-200/70 flex items-center justify-between">
                        {doc?.fileUrl ? (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink size={12} /> View File
                          </a>
                        ) : <div />}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartUpload(t.key)}
                            className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:border-emerald-600 text-stone-800 text-xs font-bold transition-colors shadow-2xs"
                          >
                            {doc ? 'Replace' : 'Upload'}
                          </button>

                          {doc && ['PENDING', 'REJECTED'].includes(doc.status) && (
                            <button
                              onClick={() => onDelete(doc._id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                              title="Delete document"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {activeUploadType && (
        <div className="fixed inset-0 bg-stone-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">Upload Verification Document</h3>
              <button 
                onClick={() => setActiveUploadType(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {formError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Select File (PDF, Image) *</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Expiry Date (if applicable)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="e.g. Renewed license valid till 2028"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveUploadType(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUpload}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
              >
                {isUploading && <Loader2 size={13} className="animate-spin" />}
                <span>Upload Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsTab;
