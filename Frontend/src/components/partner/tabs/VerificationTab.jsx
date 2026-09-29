import React from 'react';
import { ShieldCheck, Clock, CheckCircle2, XCircle, AlertTriangle, ArrowRight, FileText, ChevronRight } from 'lucide-react';

const VERIFICATION_STATES = {
  NOT_STARTED: { label: 'Not Started', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock, step: 0 },
  DRAFT: { label: 'Draft', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: FileText, step: 1 },
  PENDING_VERIFICATION: { label: 'Under Review', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock, step: 2 },
  VERIFIED: { label: 'Verified', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2, step: 3 },
  REJECTED: { label: 'Rejected', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: XCircle, step: 2 },
  SUSPENDED: { label: 'Suspended', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle, step: -1 },
  REVOKED: { label: 'Revoked', color: 'bg-red-200 text-red-900 border-red-300', icon: XCircle, step: -1 }
};

const STEPS = [
  { label: 'Register', description: 'Create partner profile' },
  { label: 'Submit', description: 'Complete details & documents' },
  { label: 'Review', description: 'Admin verification in progress' },
  { label: 'Verified', description: 'Business verified & active' }
];

const VerificationTab = ({ partnerProfile, onNavigateTab }) => {
  const status = partnerProfile?.verificationStatus || 'DRAFT';
  const cfg = VERIFICATION_STATES[status] || VERIFICATION_STATES.DRAFT;
  const StatusIcon = cfg.icon;
  const currentStep = cfg.step;
  const isRejected = status === 'REJECTED';

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className={`p-6 rounded-2xl border-2 ${isRejected ? 'border-rose-300 bg-rose-50' : status === 'VERIFIED' ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isRejected ? 'bg-rose-200' : status === 'VERIFIED' ? 'bg-emerald-200' : 'bg-gray-100'}`}>
            <StatusIcon size={28} className={isRejected ? 'text-rose-700' : status === 'VERIFIED' ? 'text-emerald-700' : 'text-gray-600'} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-gray-900">Verification Status</h2>
              <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold border ${cfg.color}`}>
                <StatusIcon size={12}/> {cfg.label}
              </span>
            </div>
            {status === 'VERIFIED' && (
              <p className="text-sm text-emerald-700">Your business is verified. Your listings can be published on Discovery Uttarakhand.</p>
            )}
            {status === 'PENDING_VERIFICATION' && (
              <p className="text-sm text-amber-700">Your verification is under admin review. You will be notified once it's processed.</p>
            )}
            {['DRAFT', 'NOT_STARTED'].includes(status) && (
              <p className="text-sm text-gray-600">Complete your business profile and upload required documents to start the verification process.</p>
            )}
            {isRejected && (
              <div className="space-y-1">
                <p className="text-sm text-rose-700 font-medium">Your verification was rejected. Please update your details and resubmit.</p>
                {partnerProfile?.verificationNotes && (
                  <p className="text-xs text-rose-600 bg-rose-100 px-3 py-2 rounded-xl mt-2">
                    <strong>Admin feedback:</strong> {partnerProfile.verificationNotes}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      {currentStep >= 0 && (
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Verification Progress</h3>
          <div className="flex items-center gap-0">
            {STEPS.map((step, i) => {
              const isCompleted = i < currentStep;
              const isCurrent = i === currentStep;
              const isRejectedStep = isRejected && i === 2;
              return (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      isRejectedStep ? 'border-rose-400 bg-rose-100 text-rose-700' :
                      isCompleted ? 'border-emerald-400 bg-emerald-100 text-emerald-700' :
                      isCurrent ? 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-200' :
                      'border-gray-200 bg-gray-50 text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle2 size={16}/> : isRejectedStep ? <XCircle size={16}/> : i + 1}
                    </div>
                    <p className={`text-xs font-semibold mt-2 text-center whitespace-nowrap ${
                      isRejectedStep ? 'text-rose-700' : isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                    }`}>{step.label}</p>
                    <p className="text-[10px] text-gray-500 text-center mt-0.5 hidden sm:block">{step.description}</p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mt-[-24px] ${isCompleted ? 'bg-emerald-400' : 'bg-gray-200'}`}/>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Business Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Business Name</span><span className="font-semibold text-gray-900">{partnerProfile?.businessName || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Partner Type</span><span className="font-semibold text-gray-900">{partnerProfile?.partnerType || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">District</span><span className="font-semibold text-gray-900">{partnerProfile?.district || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Contact</span><span className="font-semibold text-gray-900">{partnerProfile?.phone || '—'}</span></div>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Verification Timeline</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Registered</span><span className="font-semibold text-gray-900">{partnerProfile?.createdAt ? new Date(partnerProfile.createdAt).toLocaleDateString('en-IN') : '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Submitted</span><span className="font-semibold text-gray-900">{partnerProfile?.submittedAt ? new Date(partnerProfile.submittedAt).toLocaleDateString('en-IN') : 'Not yet'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Verified</span><span className="font-semibold text-gray-900">{partnerProfile?.verifiedAt ? new Date(partnerProfile.verifiedAt).toLocaleDateString('en-IN') : 'Pending'}</span></div>
            {partnerProfile?.rejectedAt && (
              <div className="flex justify-between"><span className="text-gray-500">Rejected</span><span className="font-semibold text-rose-700">{new Date(partnerProfile.rejectedAt).toLocaleDateString('en-IN')}</span></div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onNavigateTab('profile')}
          className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors flex items-center gap-2"
        >
          Update Business Profile <ChevronRight size={14}/>
        </button>
        <button
          onClick={() => onNavigateTab('documents')}
          className="px-4 py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-2"
        >
          <FileText size={14}/> Manage Documents <ChevronRight size={14}/>
        </button>
      </div>
    </div>
  );
};

export default VerificationTab;
