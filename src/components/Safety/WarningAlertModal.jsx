import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import {
  Warning,
  Clock,
  UploadSimple,
  Trash,
  CheckCircle,
  X,
  ShieldWarning,
  ArrowRight,
  Eye,
  HourglassMedium,
  ChatCircleText,
} from '@phosphor-icons/react';

export const WarningAlertModal = () => {
  const navigate = useNavigate();
  const [warning, setWarning] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'appeal'
  const [appealText, setAppealText] = useState('');
  const [appealPhotos, setAppealPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submittingAppeal, setSubmittingAppeal] = useState(false);
  const [appealSuccess, setAppealSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [previewModalImg, setPreviewModalImg] = useState(null);

  // Fetch active warning on mount
  const fetchActiveWarning = async () => {
    try {
      const res = await api.warnings.getActive();
      if (res?.data) {
        setWarning(res.data);
        // Only open automatically if not dismissed this session or if appealed
        const dismissedId = sessionStorage.getItem('dismissed_warning_id');
        if (dismissedId !== res.data.id) {
          setIsOpen(true);
        }
      } else {
        setWarning(null);
        setIsOpen(false);
      }
    } catch {
      // User might be unauthenticated or no warning exists
    }
  };

  useEffect(() => {
    fetchActiveWarning();

    // Listen to real-time socket events
    const socket = getSocket();
    if (socket) {
      const handleWarningIssued = (data) => {
        setWarning({
          id: data.warningId,
          violationType: data.violationType,
          message: data.message,
          deadlineHours: data.deadlineHours,
          expiresAt: data.expiresAt,
          autoSuspend: data.autoSuspend,
          status: 'ACTIVE',
          remainingMs: Math.max(0, new Date(data.expiresAt).getTime() - Date.now()),
        });
        setIsOpen(true);
        sessionStorage.removeItem('dismissed_warning_id');
      };

      socket.on('warning_issued', handleWarningIssued);
      return () => {
        socket.off('warning_issued', handleWarningIssued);
      };
    }
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!warning || !warning.expiresAt || warning.status === 'APPEALED') return;

    const calculateTime = () => {
      const diff = new Date(warning.expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Expired (Subject to Suspension)');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m remaining`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s remaining`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [warning]);

  if (!isOpen || !warning) return null;

  const handleDismiss = () => {
    if (warning?.id) {
      sessionStorage.setItem('dismissed_warning_id', warning.id);
    }
    setIsOpen(false);
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploadingPhoto(true);
      setError(null);

      const uploadPromises = files.map(file => api.uploadPhoto(file));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.secureUrl).filter(Boolean);

      setAppealPhotos(prev => [...prev, ...newUrls].slice(0, 4));
    } catch (err) {
      console.error('Photo upload failed:', err);
      setError('Failed to upload proof photo. Please try an image under 10MB.');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const removeProofPhoto = (index) => {
    setAppealPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitAppeal = async (e) => {
    e.preventDefault();
    if (!appealText.trim()) {
      setError('Please provide an explanation for your appeal.');
      return;
    }

    try {
      setSubmittingAppeal(true);
      setError(null);

      await api.warnings.submitAppeal(warning.id, {
        appealText: appealText.trim(),
        appealPhotos,
      });

      setAppealSuccess(true);
      setWarning(prev => ({
        ...prev,
        status: 'APPEALED',
        appealText: appealText.trim(),
        appealPhotos,
      }));
    } catch (err) {
      console.error('Failed to submit appeal:', err);
      setError(err.message || 'Failed to submit appeal. Please try again.');
    } finally {
      setSubmittingAppeal(false);
    }
  };

  const isAppealed = warning.status === 'APPEALED';

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1e1927] to-[#120f18] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden text-white font-ui">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-amber-500 blur-sm rounded-full" />

        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/10 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${
              isAppealed
                ? 'bg-blue-500/20 border-blue-400/40 text-blue-400 shadow-blue-500/10'
                : 'bg-amber-500/20 border-amber-400/40 text-amber-400 shadow-amber-500/10'
            }`}>
              {isAppealed ? (
                <HourglassMedium size={26} weight="fill" className="animate-pulse" />
              ) : (
                <ShieldWarning size={28} weight="fill" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  {isAppealed ? 'Appeal In Review' : 'Profile Action Required'}
                </span>
                {warning.violationType && (
                  <span className="text-[10px] text-white/50 uppercase">
                    • {warning.violationType}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                {isAppealed ? 'Safe Harbor: Countdown Paused' : 'Account Compliance Warning'}
              </h2>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            title="Dismiss notification"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Status / Countdown Banner */}
          {isAppealed ? (
            <div className="p-4 bg-blue-500/10 border border-blue-400/30 rounded-2xl flex items-start gap-3 text-xs text-blue-200">
              <CheckCircle size={20} weight="fill" className="text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-blue-100">Your appeal is under active admin review.</p>
                <p className="text-blue-200/80 leading-relaxed">
                  The auto-suspension countdown has been paused. A moderator will review your explanation and proof images shortly.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-amber-500/10 border border-amber-400/30 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock size={20} weight="fill" className="text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="text-white/60 block text-[10px] uppercase font-bold tracking-wider">Compliance Deadline</span>
                  <span className="font-bold text-amber-300">{timeLeft || '24 Hours'}</span>
                </div>
              </div>
              {warning.autoSuspend && (
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 font-medium">
                  Auto-suspends on expiry
                </span>
              )}
            </div>
          )}

          {/* Admin Notice Message */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/60">
              Notice from Admin Team
            </label>
            <div className="p-4 bg-black/40 border border-white/10 rounded-2xl text-sm text-white/90 leading-relaxed font-sans whitespace-pre-wrap">
              {warning.message}
            </div>
          </div>

          {/* Navigation / Mode Tabs if not appealed yet */}
          {!isAppealed && (
            <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'overview'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                1. Update Profile (Recommended)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('appeal')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'appeal'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                2. Reply & Appeal with Proof
              </button>
            </div>
          )}

          {/* Tab 1: Direct Profile Update guidance */}
          {activeTab === 'overview' && !isAppealed && (
            <div className="p-4 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl space-y-3">
              <p className="text-xs text-white/80 leading-relaxed">
                If the notice is accurate, simply update your profile name or photos. The system will automatically detect the correction and resolve this warning immediately.
              </p>
              <button
                type="button"
                onClick={() => {
                  handleDismiss();
                  navigate('/profile');
                }}
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Go to Profile to Update</span>
                <ArrowRight size={16} weight="bold" />
              </button>
            </div>
          )}

          {/* Tab 2: Appeal Form with Proof Images */}
          {(activeTab === 'appeal' || isAppealed) && (
            <div className="space-y-4 pt-1">
              {isAppealed ? (
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                    Your Submitted Explanation
                  </label>
                  <div className="p-3.5 bg-black/40 border border-blue-400/20 rounded-xl text-xs text-white/90 leading-relaxed">
                    {warning.appealText}
                  </div>

                  {warning.appealPhotos && warning.appealPhotos.length > 0 && (
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-blue-300 mb-2 block">
                        Attached Proof Images ({warning.appealPhotos.length})
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {warning.appealPhotos.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => setPreviewModalImg(url)}
                            className="relative aspect-square rounded-xl overflow-hidden border border-white/20 group cursor-pointer"
                          >
                            <img src={url} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye size={18} className="text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmitAppeal} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-200">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                      Your Explanation / Reply
                    </label>
                    <textarea
                      rows={3}
                      value={appealText}
                      onChange={(e) => setAppealText(e.target.value)}
                      placeholder="Explain why this name/photo is legitimate (e.g., 'My real legal name genuinely is Luffy', or 'This photo is authentic')..."
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>

                  {/* Attach Proof Images */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-white/70">
                        Attach Proof Images (Optional)
                      </label>
                      <span className="text-[10px] text-white/40">ID proof, alternate photo, document</span>
                    </div>

                    {/* Previews */}
                    {appealPhotos.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mb-2.5">
                        {appealPhotos.map((url, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/20 group">
                            <img src={url} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeProofPhoto(idx)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-red-600/80 text-white hover:bg-red-600 transition-colors"
                            >
                              <Trash size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload button */}
                    {appealPhotos.length < 4 && (
                      <label className="flex items-center justify-center gap-2 p-3 bg-white/5 border border-dashed border-white/20 hover:border-amber-400/60 rounded-xl cursor-pointer hover:bg-white/10 transition-all text-xs text-white/70 hover:text-white">
                        <UploadSimple size={18} className="text-amber-400" />
                        <span>{uploadingPhoto ? 'Uploading Proof...' : 'Upload Proof Images (ID / Document)'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          disabled={uploadingPhoto}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submittingAppeal || !appealText.trim() || uploadingPhoto}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingAppeal ? (
                      <>
                        <HourglassMedium size={16} className="animate-spin" />
                        <span>Submitting Appeal...</span>
                      </>
                    ) : (
                      <>
                        <ChatCircleText size={16} weight="bold" />
                        <span>Submit Appeal & Pause Timer</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-black/40 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
          <span>Velvet Hearts Trust & Safety</span>
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white font-medium underline"
          >
            I understand
          </button>
        </div>
      </div>

      {/* Proof Image Fullscreen Lightbox Modal */}
      {previewModalImg && (
        <div
          className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPreviewModalImg(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/20 bg-black">
            <img src={previewModalImg} alt="Proof Fullscreen" className="w-full h-full object-contain" />
            <button
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/70 text-white hover:bg-black"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
