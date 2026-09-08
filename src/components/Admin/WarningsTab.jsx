import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import {
  Warning,
  ArrowsClockwise,
  Clock,
  ShieldCheck,
  CheckCircle,
  XCircle,
  HourglassMedium,
  User,
  Image as ImageIcon,
  Scroll,
  Eye,
  MagnifyingGlass,
  ArrowRight,
  Prohibit,
  Copy,
  ChatCircleText,
  X,
  Plus,
} from '@phosphor-icons/react';

export const WarningsTab = ({ showAlert, onViewUser }) => {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProofImage, setSelectedProofImage] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchWarnings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.admin.getWarnings(statusFilter !== 'ALL' ? statusFilter : undefined);
      setWarnings(res?.data || []);
    } catch (err) {
      console.error('Failed to fetch warnings:', err);
      showAlert?.(err?.response?.data?.message || err?.message || 'Failed to load warnings.', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showAlert]);

  useEffect(() => {
    fetchWarnings();
  }, [fetchWarnings]);

  const handleResolve = async (warningId, action, note) => {
    try {
      setActionLoadingId(warningId);
      await api.admin.resolveWarning(warningId, { action, note });
      showAlert?.(`Warning marked as ${action}.`, 'success');
      fetchWarnings();
    } catch (err) {
      console.error(`Failed to resolve warning with ${action}:`, err);
      showAlert?.(err?.response?.data?.message || err?.message || `Failed to apply ${action}.`, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const copyText = (text, label) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showAlert?.(`Copied ${label}: ${text}`, 'info');
    }
  };

  // Filter warnings
  const filteredWarnings = warnings.filter((w) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (w.userName && w.userName.toLowerCase().includes(query)) ||
      (w.userEmail && w.userEmail.toLowerCase().includes(query)) ||
      (w.userPhone && w.userPhone.includes(query)) ||
      (w.userId && w.userId.toLowerCase().includes(query)) ||
      (w.message && w.message.toLowerCase().includes(query)) ||
      (w.appealText && w.appealText.toLowerCase().includes(query))
    );
  });

  // Stats
  const activeCount = warnings.filter((w) => w.status === 'ACTIVE').length;
  const appealedCount = warnings.filter((w) => w.status === 'APPEALED').length;
  const resolvedCount = warnings.filter((w) => w.status === 'RESOLVED').length;
  const suspendedCount = warnings.filter((w) => w.status === 'SUSPENDED').length;

  const formatRemainingTime = (warning) => {
    if (warning.status === 'APPEALED') {
      return 'Paused (Appeal Submitted)';
    }
    if (warning.status !== 'ACTIVE') {
      return warning.status;
    }
    const diff = new Date(warning.expiresAt).getTime() - Date.now();
    if (diff <= 0) {
      return 'Expired (Pending Auto-Suspend)';
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m left`;
  };

  return (
    <div className="space-y-6 page-enter font-ui text-white">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div
          onClick={() => setStatusFilter('ACTIVE')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'ACTIVE'
              ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/10'
              : 'bg-white/5 border-white/10 hover:bg-white/[0.08]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Active Warnings</span>
            <Warning size={20} weight="fill" className="text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{activeCount}</p>
          <p className="text-[11px] text-white/50 mt-0.5">Under 24h compliance countdown</p>
        </div>

        <div
          onClick={() => setStatusFilter('APPEALED')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'APPEALED'
              ? 'bg-blue-500/20 border-blue-400 shadow-lg shadow-blue-500/10'
              : 'bg-white/5 border-white/10 hover:bg-white/[0.08]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Appeals Pending</span>
            <HourglassMedium size={20} weight="fill" className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{appealedCount}</p>
          <p className="text-[11px] text-white/50 mt-0.5">Proof attached, timer paused</p>
        </div>

        <div
          onClick={() => setStatusFilter('RESOLVED')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'RESOLVED'
              ? 'bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/10'
              : 'bg-white/5 border-white/10 hover:bg-white/[0.08]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Auto-Resolved</span>
            <CheckCircle size={20} weight="fill" className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{resolvedCount}</p>
          <p className="text-[11px] text-white/50 mt-0.5">User made required changes</p>
        </div>

        <div
          onClick={() => setStatusFilter('SUSPENDED')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'SUSPENDED'
              ? 'bg-red-500/20 border-red-400 shadow-lg shadow-red-500/10'
              : 'bg-white/5 border-white/10 hover:bg-white/[0.08]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-300 uppercase tracking-wider">Suspended</span>
            <Prohibit size={20} weight="fill" className="text-red-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{suspendedCount}</p>
          <p className="text-[11px] text-white/50 mt-0.5">Non-compliant accounts</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-2xl">
        <div className="relative flex-1 w-full">
          <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user name, phone, email, ID, or appeal text..."
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active (Countdown)</option>
            <option value="APPEALED">Appealed (Review Proof)</option>
            <option value="RESOLVED">Resolved (Complied)</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DISMISSED">Dismissed</option>
          </select>

          <button
            type="button"
            onClick={fetchWarnings}
            disabled={loading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-colors"
            title="Refresh list"
          >
            <ArrowsClockwise size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Warnings List */}
      {loading ? (
        <div className="p-12 text-center text-white/50 flex flex-col items-center gap-3">
          <HourglassMedium size={32} className="animate-spin text-amber-400" />
          <p className="text-sm">Loading compliance warnings...</p>
        </div>
      ) : filteredWarnings.length === 0 ? (
        <div className="p-12 text-center bg-white/[0.02] border border-white/5 rounded-2xl text-white/50 space-y-2">
          <ShieldCheck size={40} className="mx-auto text-white/30" />
          <p className="text-base font-semibold text-white/70">No warnings match your criteria</p>
          <p className="text-xs text-white/40">Use the "⚠️ Warn" button in the User Inspector to issue a compliance notice.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWarnings.map((w) => {
            const isLoading = actionLoadingId === w.id;
            const isAppealed = w.status === 'APPEALED';
            const isResolved = w.status === 'RESOLVED';
            const isSuspended = w.status === 'SUSPENDED';

            return (
              <div
                key={w.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isAppealed
                    ? 'bg-gradient-to-br from-blue-950/30 to-black/40 border-blue-500/30 shadow-lg shadow-blue-500/5'
                    : isResolved
                    ? 'bg-gradient-to-br from-emerald-950/20 to-black/40 border-emerald-500/30'
                    : isSuspended
                    ? 'bg-gradient-to-br from-red-950/20 to-black/40 border-red-500/30'
                    : 'bg-gradient-to-br from-white/[0.04] to-black/40 border-white/10 hover:border-amber-500/30'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3.5 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      {w.currentPhotos?.[0] ? (
                        <img src={w.currentPhotos[0]} alt={w.userName} className="w-full h-full object-cover" />
                      ) : (
                        <User size={22} className="text-white/60" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-white">{w.userName}</h3>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                          w.violationType === 'NAME'
                            ? 'bg-purple-500/20 border-purple-400/40 text-purple-300'
                            : w.violationType === 'PHOTO'
                            ? 'bg-pink-500/20 border-pink-400/40 text-pink-300'
                            : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                        }`}>
                          {w.violationType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
                        <span
                          onClick={() => copyText(w.userId, 'User ID')}
                          className="hover:text-amber-300 cursor-pointer flex items-center gap-1"
                          title="Click to copy User ID"
                        >
                          <code>{w.userId.slice(0, 10)}...</code>
                          <Copy size={11} />
                        </span>
                        {w.userPhone && <span>• {w.userPhone}</span>}
                        {w.userEmail && <span>• {w.userEmail}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Status Badges & Timer */}
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                      isAppealed
                        ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                        : isResolved
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : isSuspended
                        ? 'bg-red-500/20 border-red-400 text-red-300'
                        : 'bg-amber-500/20 border-amber-400 text-amber-300'
                    }`}>
                      {isAppealed ? (
                        <>
                          <HourglassMedium size={14} weight="fill" className="animate-pulse" />
                          <span>APPEAL SUBMITTED</span>
                        </>
                      ) : isResolved ? (
                        <>
                          <CheckCircle size={14} weight="fill" />
                          <span>AUTO-RESOLVED</span>
                        </>
                      ) : isSuspended ? (
                        <>
                          <Prohibit size={14} weight="fill" />
                          <span>SUSPENDED</span>
                        </>
                      ) : (
                        <>
                          <Clock size={14} weight="fill" />
                          <span>{formatRemainingTime(w)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notice & Change Detection Body */}
                <div className="py-3.5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Left Column: Admin Message */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 block">
                      Warning Notice Sent ({new Date(w.createdAt).toLocaleDateString()})
                    </span>
                    <div className="p-3 bg-black/40 border border-white/10 rounded-xl text-white/90 leading-relaxed">
                      {w.message}
                    </div>
                    {w.resolutionNote && (
                      <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-[11px] text-white/70">
                        <strong className="text-white">Resolution Note:</strong> {w.resolutionNote}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Automated Change Detection */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 block">
                      Automated Change Verification
                    </span>

                    {w.violationType === 'NAME' && (
                      <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Snapshot at Warning:</span>
                          <code className="text-amber-300 font-semibold">{w.snapshot?.name || '—'}</code>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Current Live Name:</span>
                          <code className="text-white font-semibold">{w.currentName || '—'}</code>
                        </div>

                        {w.nameChanged ? (
                          <div className="p-2 bg-emerald-500/20 border border-emerald-400/40 rounded-lg text-emerald-300 font-medium flex items-center gap-1.5">
                            <CheckCircle size={14} weight="fill" />
                            <span>Name updated by user! (Compliance satisfied)</span>
                          </div>
                        ) : (
                          <div className="p-2 bg-amber-500/10 border border-amber-400/20 rounded-lg text-amber-200/80 flex items-center gap-1.5">
                            <Clock size={14} />
                            <span>User has not changed name yet.</span>
                          </div>
                        )}
                      </div>
                    )}

                    {w.violationType === 'PHOTO' && (
                      <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Photos at Warning:</span>
                          <span className="text-amber-300 font-semibold">{w.snapshot?.photos?.length || 0} photos</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Current Live Photos:</span>
                          <span className="text-white font-semibold">{w.currentPhotos?.length || 0} photos</span>
                        </div>

                        {w.photosChanged ? (
                          <div className="p-2 bg-emerald-500/20 border border-emerald-400/40 rounded-lg text-emerald-300 font-medium flex items-center gap-1.5">
                            <CheckCircle size={14} weight="fill" />
                            <span>Photos updated by user! (Compliance satisfied)</span>
                          </div>
                        ) : (
                          <div className="p-2 bg-amber-500/10 border border-amber-400/20 rounded-lg text-amber-200/80 flex items-center gap-1.5">
                            <Clock size={14} />
                            <span>User has not modified photos yet.</span>
                          </div>
                        )}
                      </div>
                    )}

                    {w.violationType !== 'NAME' && w.violationType !== 'PHOTO' && (
                      <div className="p-3 bg-black/40 border border-white/10 rounded-xl text-white/70">
                        Profile policy monitoring active. Auto-suspends if unaddressed.
                      </div>
                    )}
                  </div>
                </div>

                {/* Appeal & Proof Section if user submitted reply */}
                {w.appealText && (
                  <div className="mt-2 pt-3 border-t border-blue-500/30 bg-blue-950/20 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-300 font-bold text-xs uppercase tracking-wider">
                        <ChatCircleText size={16} weight="fill" />
                        <span>User Appeal & Explanation</span>
                      </div>
                      {w.appealedAt && (
                        <span className="text-[11px] text-blue-200/60">
                          Submitted {new Date(w.appealedAt).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-blue-100 leading-relaxed bg-black/40 p-3 rounded-lg border border-blue-500/20 whitespace-pre-wrap">
                      "{w.appealText}"
                    </p>

                    {/* Attached Proof Images Preview */}
                    {w.appealPhotos && w.appealPhotos.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                          Attached Proof Images ({w.appealPhotos.length}) - Click to enlarge:
                        </span>
                        <div className="flex flex-wrap gap-2.5">
                          {w.appealPhotos.map((imgUrl, imgIdx) => (
                            <div
                              key={imgIdx}
                              onClick={() => setSelectedProofImage(imgUrl)}
                              className="relative w-20 h-20 rounded-xl overflow-hidden border border-blue-400/40 cursor-pointer group hover:scale-105 transition-transform"
                            >
                              <img src={imgUrl} alt={`Proof ${imgIdx + 1}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye size={18} className="text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Controls */}
                <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-white/40">
                    Issued by <span className="text-white/70 font-medium">{w.adminName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onViewUser && (
                      <button
                        type="button"
                        onClick={() => onViewUser({ id: w.userId, name: w.userName })}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80 hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        <Eye size={14} />
                        <span>Inspect Profile</span>
                      </button>
                    )}

                    {w.status !== 'DISMISSED' && w.status !== 'RESOLVED' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleResolve(w.id, 'DISMISS')}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-semibold text-emerald-300 transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle size={14} weight="bold" />
                          <span>Clear / Dismiss</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResolve(w.id, 'EXTEND')}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-semibold text-amber-300 transition-colors flex items-center gap-1.5"
                        >
                          <Clock size={14} weight="bold" />
                          <span>Extend (+24h)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResolve(w.id, 'SUSPEND')}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-xs font-semibold text-red-300 transition-colors flex items-center gap-1.5"
                        >
                          <Prohibit size={14} weight="bold" />
                          <span>Suspend Account</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Proof Lightbox Modal for Admins to view ID/Proof full size */}
      {selectedProofImage && (
        <div
          className="fixed inset-0 z-[1050] bg-black/95 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedProofImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-black rounded-2xl border border-white/20 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs text-white/80">
              <span className="font-semibold">User Appeal Proof Document (High Resolution)</span>
              <button
                onClick={() => setSelectedProofImage(null)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center">
              <img
                src={selectedProofImage}
                alt="Enlarged Proof"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
