import React, { useState } from 'react';
import { api } from '../../lib/api';
import {
  Warning,
  X,
  Clock,
  ShieldCheck,
  CheckCircle,
  HourglassMedium,
  User,
  Image as ImageIcon,
  Scroll,
} from '@phosphor-icons/react';

const PRESETS = {
  NAME: {
    label: 'Profile Name Violation',
    icon: User,
    defaultMessage:
      'Your profile name appears to be a pseudonym, joke, or placeholder. Velvet Hearts requires genuine, real names for an authentic dating community. Please update your profile name to your real name within 24 hours to keep your account active.',
  },
  PHOTO: {
    label: 'Profile Photo Violation',
    icon: ImageIcon,
    defaultMessage:
      'One or more of your profile photos violates our community standards (clear personal face photo required; no celebrities, memes, cartoons, or group-only photos). Please replace the photo(s) within 24 hours.',
  },
  POLICY: {
    label: 'Community Standards Violation',
    icon: Scroll,
    defaultMessage:
      'Your profile content or bio violates Velvet Hearts Community Guidelines. Please review and adjust your profile details within 24 hours to avoid account suspension.',
  },
  CUSTOM: {
    label: 'Custom Notice',
    icon: Warning,
    defaultMessage: '',
  },
};

export const AdminWarningModal = ({ isOpen, onClose, user, onSuccess }) => {
  if (!isOpen || !user) return null;

  const [violationType, setViolationType] = useState('NAME');
  const [message, setMessage] = useState(PRESETS.NAME.defaultMessage);
  const [deadlineHours, setDeadlineHours] = useState(24);
  const [autoSuspend, setAutoSuspend] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSelectType = (type) => {
    setViolationType(type);
    setMessage(PRESETS[type].defaultMessage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please provide a warning message for the user.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const targetUserId = user.id || user.userId;
      await api.admin.issueWarning(targetUserId, {
        violationType,
        message: message.trim(),
        deadlineHours: Number(deadlineHours),
        autoSuspend,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to issue warning:', err);
      setError(err.message || 'Failed to issue warning. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const userName = user.name || user.profile?.name || 'User';
  const targetUserId = user.id || user.userId;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#1c1826] to-[#120f1a] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden text-white font-ui">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Warning size={24} weight="fill" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Issue Compliance Warning</h2>
              <p className="text-xs text-amber-300/80">
                To: <span className="text-white font-medium">{userName}</span> ({targetUserId.slice(0, 8)}...)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-200">
              {error}
            </div>
          )}

          {/* Violation Category Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
              Violation Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PRESETS).map(([key, config]) => {
                const Icon = config.icon;
                const isSelected = violationType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectType(key)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md shadow-amber-500/10'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon size={18} weight={isSelected ? 'fill' : 'regular'} className="text-amber-400 shrink-0" />
                    <span className="truncate">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Warning Message */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Warning Instructions
              </label>
              <span className="text-[11px] text-white/40">Visible to user in-app</span>
            </div>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Specify the exact issue and required action..."
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all resize-none"
            />
          </div>

          {/* Deadline Selector */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5 flex items-center gap-1.5">
                <Clock size={14} className="text-amber-400" />
                Compliance Deadline
              </label>
              <select
                value={deadlineHours}
                onChange={(e) => setDeadlineHours(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value={12}>12 Hours</option>
                <option value={24}>24 Hours (Standard)</option>
                <option value={48}>48 Hours (2 Days)</option>
                <option value={72}>72 Hours (3 Days)</option>
              </select>
            </div>

            {/* Auto Suspend Toggle */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2.5 p-2.5 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="checkbox"
                  checked={autoSuspend}
                  onChange={(e) => setAutoSuspend(e.target.checked)}
                  className="w-4 h-4 rounded border-white/30 text-amber-500 focus:ring-amber-400 bg-black/40"
                />
                <div className="text-[11px] leading-snug">
                  <span className="font-semibold text-white">Auto-Suspend</span>
                  <span className="block text-white/50">If uncorrected & not appealed</span>
                </div>
              </label>
            </div>
          </div>

          {/* Snapshot Info Box */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-200/90 leading-relaxed">
            <ShieldCheck size={18} weight="fill" className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Automated Change Tracking:</strong> The system automatically snapshots current profile data. If the user updates their details or submits an appeal with proof before the deadline, you will be notified and auto-suspension will be prevented.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-white/70 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !message.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <HourglassMedium size={16} className="animate-spin" />
                  <span>Issuing Warning...</span>
                </>
              ) : (
                <>
                  <Warning size={16} weight="bold" />
                  <span>Send Warning ({deadlineHours}h)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
