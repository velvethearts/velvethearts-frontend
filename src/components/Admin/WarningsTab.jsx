import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import { getSocket } from '../../lib/socket';
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
      const list = Array.isArray(res) ? res : (res?.data || res?.warnings || []);
      setWarnings(list);
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

  // Real-time synchronization: listen to local dispatch events and backend web socket broadcasts
  useEffect(() => {
    const handleRefresh = () => {
      fetchWarnings();
    };

    window.addEventListener('vh:warning_issued', handleRefresh);
    window.addEventListener('vh:warning_updated', handleRefresh);

    const socket = getSocket();
    if (socket) {
      socket.on('admin_warning_updated', handleRefresh);
      socket.on('warning_issued', handleRefresh);
      socket.on('appeal_submitted', handleRefresh);
    }

    return () => {
      window.removeEventListener('vh:warning_issued', handleRefresh);
      window.removeEventListener('vh:warning_updated', handleRefresh);
      if (socket) {
        socket.off('admin_warning_updated', handleRefresh);
        socket.off('warning_issued', handleRefresh);
        socket.off('appeal_submitted', handleRefresh);
      }
    };
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
      return 'Paused (Appeal In Review)';
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
    <div className="warnings-tab-container font-ui">
      {/* Top Metrics Cards */}
      <div className="warnings-metrics-grid">
        <div
          onClick={() => setStatusFilter('ACTIVE')}
          className={`warnings-metric-card card-active ${statusFilter === 'ACTIVE' ? 'selected' : ''}`}
        >
          <div className="metric-header">
            <span className="metric-label text-active">Active Warnings</span>
            <Warning size={20} weight="fill" className="metric-icon text-active" />
          </div>
          <p className="metric-value">{activeCount}</p>
          <p className="metric-sub">Under 24h compliance countdown</p>
        </div>

        <div
          onClick={() => setStatusFilter('APPEALED')}
          className={`warnings-metric-card card-appealed ${statusFilter === 'APPEALED' ? 'selected' : ''}`}
        >
          <div className="metric-header">
            <span className="metric-label text-appealed">Appeals Pending</span>
            <HourglassMedium size={20} weight="fill" className="metric-icon text-appealed" />
          </div>
          <p className="metric-value">{appealedCount}</p>
          <p className="metric-sub">Proof attached, timer paused</p>
        </div>

        <div
          onClick={() => setStatusFilter('RESOLVED')}
          className={`warnings-metric-card card-resolved ${statusFilter === 'RESOLVED' ? 'selected' : ''}`}
        >
          <div className="metric-header">
            <span className="metric-label text-resolved">Auto-Resolved</span>
            <CheckCircle size={20} weight="fill" className="metric-icon text-resolved" />
          </div>
          <p className="metric-value">{resolvedCount}</p>
          <p className="metric-sub">User made required changes</p>
        </div>

        <div
          onClick={() => setStatusFilter('SUSPENDED')}
          className={`warnings-metric-card card-suspended ${statusFilter === 'SUSPENDED' ? 'selected' : ''}`}
        >
          <div className="metric-header">
            <span className="metric-label text-suspended">Suspended</span>
            <Prohibit size={20} weight="fill" className="metric-icon text-suspended" />
          </div>
          <p className="metric-value">{suspendedCount}</p>
          <p className="metric-sub">Non-compliant accounts</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="warnings-toolbar">
        <div className="warnings-search-wrap">
          <MagnifyingGlass size={16} className="warnings-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user name, phone, email, ID, or appeal..."
            className="warnings-search-input"
          />
        </div>

        <div className="warnings-toolbar-actions">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="warnings-select-filter"
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
            className="warnings-refresh-btn"
            title="Refresh list"
          >
            <ArrowsClockwise size={16} className={loading ? 'icon-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Warnings List */}
      {loading ? (
        <div className="warnings-loading-box">
          <HourglassMedium size={36} className="icon-spin text-active" />
          <p>Loading compliance warnings...</p>
        </div>
      ) : filteredWarnings.length === 0 ? (
        <div className="warnings-empty-box">
          <ShieldCheck size={44} className="empty-icon" />
          <h4 className="empty-title">No warnings match your criteria</h4>
          <p className="empty-desc">
            Use the "⚠️ Warn" button in the User Inspector to issue a compliance notice.
          </p>
        </div>
      ) : (
        <div className="warnings-list">
          {filteredWarnings.map((w) => {
            const isLoading = actionLoadingId === w.id;
            const isAppealed = w.status === 'APPEALED';
            const isResolved = w.status === 'RESOLVED';
            const isSuspended = w.status === 'SUSPENDED';

            let cardStatusClass = 'status-card-active';
            if (isAppealed) cardStatusClass = 'status-card-appealed';
            else if (isResolved) cardStatusClass = 'status-card-resolved';
            else if (isSuspended) cardStatusClass = 'status-card-suspended';

            return (
              <div key={w.id} className={`warning-item-card ${cardStatusClass}`}>
                {/* Header Row */}
                <div className="warning-card-header">
                  <div className="warning-user-cell">
                    <div className="warning-avatar-wrap">
                      {w.currentPhotos?.[0] ? (
                        <img src={w.currentPhotos[0]} alt={w.userName} className="warning-avatar-img" />
                      ) : (
                        <User size={22} className="warning-avatar-fallback" />
                      )}
                    </div>
                    <div>
                      <div className="warning-user-name-row">
                        <h3 className="warning-user-name">{w.userName}</h3>
                        <span className={`warning-violation-badge violation-${w.violationType?.toLowerCase()}`}>
                          {w.violationType}
                        </span>
                      </div>
                      <div className="warning-user-meta-row">
                        <span
                          onClick={() => copyText(w.userId, 'User ID')}
                          className="warning-id-pill"
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
                  <div className="warning-status-pill-wrap">
                    <div className={`warning-status-pill pill-${w.status?.toLowerCase()}`}>
                      {isAppealed ? (
                        <>
                          <HourglassMedium size={14} weight="fill" className="icon-pulse" />
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
                <div className="warning-content-grid">
                  {/* Left Column: Admin Message */}
                  <div className="warning-col">
                    <span className="warning-section-title">
                      Warning Notice Sent ({new Date(w.createdAt).toLocaleDateString()})
                    </span>
                    <div className="warning-message-box">
                      {w.message}
                    </div>
                    {w.resolutionNote && (
                      <div className="warning-resolution-box">
                        <strong>Resolution Note:</strong> {w.resolutionNote}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Automated Change Detection */}
                  <div className="warning-col">
                    <span className="warning-section-title">
                      Automated Change Verification
                    </span>

                    {w.violationType === 'NAME' && (
                      <div className="warning-diff-box">
                        <div className="diff-row">
                          <span className="diff-label">Snapshot at Warning:</span>
                          <code className="diff-val-old">{w.snapshot?.name || '—'}</code>
                        </div>
                        <div className="diff-row">
                          <span className="diff-label">Current Live Name:</span>
                          <code className="diff-val-new">{w.currentName || '—'}</code>
                        </div>

                        {w.nameChanged ? (
                          <div className="diff-alert diff-alert-success">
                            <CheckCircle size={15} weight="fill" />
                            <span>Name updated by user! (Compliance satisfied)</span>
                          </div>
                        ) : (
                          <div className="diff-alert diff-alert-pending">
                            <Clock size={15} />
                            <span>User has not changed name yet.</span>
                          </div>
                        )}
                      </div>
                    )}

                    {w.violationType === 'PHOTO' && (
                      <div className="warning-diff-box">
                        <div className="diff-row">
                          <span className="diff-label">Photos at Warning:</span>
                          <span className="diff-val-old">{w.snapshot?.photos?.length || 0} photos</span>
                        </div>
                        <div className="diff-row">
                          <span className="diff-label">Current Live Photos:</span>
                          <span className="diff-val-new">{w.currentPhotos?.length || 0} photos</span>
                        </div>

                        {w.photosChanged ? (
                          <div className="diff-alert diff-alert-success">
                            <CheckCircle size={15} weight="fill" />
                            <span>Photos updated by user! (Compliance satisfied)</span>
                          </div>
                        ) : (
                          <div className="diff-alert diff-alert-pending">
                            <Clock size={15} />
                            <span>User has not modified photos yet.</span>
                          </div>
                        )}
                      </div>
                    )}

                    {w.violationType !== 'NAME' && w.violationType !== 'PHOTO' && (
                      <div className="warning-diff-box text-muted-box">
                        Profile policy monitoring active. Account will auto-suspend if unaddressed by deadline.
                      </div>
                    )}
                  </div>
                </div>

                {/* Appeal & Proof Section if user submitted reply */}
                {w.appealText && (
                  <div className="warning-appeal-section">
                    <div className="appeal-header">
                      <div className="appeal-header-left">
                        <ChatCircleText size={16} weight="fill" />
                        <span>User Appeal & Explanation</span>
                      </div>
                      {w.appealedAt && (
                        <span className="appeal-timestamp">
                          Submitted {new Date(w.appealedAt).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <p className="appeal-text-quote">
                      "{w.appealText}"
                    </p>

                    {/* Attached Proof Images Preview */}
                    {w.appealPhotos && w.appealPhotos.length > 0 && (
                      <div className="appeal-photos-wrap">
                        <span className="appeal-photos-title">
                          Attached Proof Images ({w.appealPhotos.length}) - Click to enlarge:
                        </span>
                        <div className="appeal-thumbnails-row">
                          {w.appealPhotos.map((imgUrl, imgIdx) => (
                            <div
                              key={imgIdx}
                              onClick={() => setSelectedProofImage(imgUrl)}
                              className="appeal-thumb-card"
                              title="Click to view full image"
                            >
                              <img src={imgUrl} alt={`Proof ${imgIdx + 1}`} className="appeal-thumb-img" />
                              <div className="appeal-thumb-overlay">
                                <Eye size={18} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Controls */}
                <div className="warning-card-footer">
                  <div className="warning-issued-by">
                    Issued by <strong>{w.adminName}</strong>
                  </div>

                  <div className="warning-actions-group">
                    {onViewUser && (
                      <button
                        type="button"
                        onClick={() => onViewUser({ id: w.userId, name: w.userName })}
                        className="btn-warn-inspect"
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
                          className="btn-warn-dismiss"
                        >
                          <CheckCircle size={14} weight="bold" />
                          <span>Clear / Dismiss</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResolve(w.id, 'EXTEND')}
                          disabled={isLoading}
                          className="btn-warn-extend"
                        >
                          <Clock size={14} weight="bold" />
                          <span>Extend (+24h)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResolve(w.id, 'SUSPEND')}
                          disabled={isLoading}
                          className="btn-warn-suspend"
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
          className="admin-lightbox-overlay"
          onClick={() => setSelectedProofImage(null)}
        >
          <div
            className="admin-lightbox-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-lightbox-header">
              <span className="admin-lightbox-title">User Appeal Proof Document (High Resolution)</span>
              <button
                type="button"
                onClick={() => setSelectedProofImage(null)}
                className="admin-lightbox-close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="admin-lightbox-body">
              <img
                src={selectedProofImage}
                alt="Enlarged Proof"
                className="admin-lightbox-img"
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .warnings-tab-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          color: var(--text-primary, #111827);
          transition: color 0.3s ease;
        }

        /* ── Metric Cards Grid ── */
        .warnings-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        @media (max-width: 900px) {
          .warnings-metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .warnings-metrics-grid {
            grid-template-columns: 1fr;
          }
        }

        .warnings-metric-card {
          padding: 18px 20px;
          border-radius: var(--radius-lg, 18px);
          background: #FFFFFF;
          border: 1.5px solid #E5E7EB;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        /* Distinct Luxury Light Mode Card Palettes */
        .warnings-metric-card.card-active {
          background: #FFFBEB;
          border-color: #FDE68A;
          box-shadow: 0 2px 8px rgba(217, 119, 6, 0.08);
        }
        .warnings-metric-card.card-active:hover {
          background: #FEF3C7;
          border-color: #FCD34D;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(217, 119, 6, 0.15);
        }
        .warnings-metric-card.card-active.selected {
          border-color: #D97706;
          box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.25), 0 6px 18px rgba(217, 119, 6, 0.18);
        }

        .warnings-metric-card.card-appealed {
          background: #F0F9FF;
          border-color: #BAE6FD;
          box-shadow: 0 2px 8px rgba(2, 132, 199, 0.08);
        }
        .warnings-metric-card.card-appealed:hover {
          background: #E0F2FE;
          border-color: #7DD3FC;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(2, 132, 199, 0.15);
        }
        .warnings-metric-card.card-appealed.selected {
          border-color: #0284C7;
          box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.25), 0 6px 18px rgba(2, 132, 199, 0.18);
        }

        .warnings-metric-card.card-resolved {
          background: #F0FDF4;
          border-color: #BBF7D0;
          box-shadow: 0 2px 8px rgba(22, 163, 74, 0.08);
        }
        .warnings-metric-card.card-resolved:hover {
          background: #DCFCE7;
          border-color: #86EFAC;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(22, 163, 74, 0.15);
        }
        .warnings-metric-card.card-resolved.selected {
          border-color: #16A34A;
          box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.25), 0 6px 18px rgba(22, 163, 74, 0.18);
        }

        .warnings-metric-card.card-suspended {
          background: #FEF2F2;
          border-color: #FECACA;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.08);
        }
        .warnings-metric-card.card-suspended:hover {
          background: #FEE2E2;
          border-color: #FCA5A5;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(220, 38, 38, 0.15);
        }
        .warnings-metric-card.card-suspended.selected {
          border-color: #DC2626;
          box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.25), 0 6px 18px rgba(220, 38, 38, 0.18);
        }

        /* Dark Theme Card Overrides */
        [data-theme="dark"] .warnings-metric-card {
          background: rgba(255, 255, 255, 0.03) !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
          box-shadow: none !important;
        }
        [data-theme="dark"] .warnings-metric-card:hover {
          background: rgba(255, 255, 255, 0.06) !important;
          border-color: rgba(255, 255, 255, 0.16) !important;
        }
        [data-theme="dark"] .warnings-metric-card.card-active.selected {
          background: rgba(245, 158, 11, 0.12) !important;
          border-color: rgba(245, 158, 11, 0.6) !important;
          box-shadow: 0 4px 20px rgba(245, 158, 11, 0.2) !important;
        }
        [data-theme="dark"] .warnings-metric-card.card-appealed.selected {
          background: rgba(56, 189, 248, 0.12) !important;
          border-color: rgba(56, 189, 248, 0.6) !important;
          box-shadow: 0 4px 20px rgba(56, 189, 248, 0.2) !important;
        }
        [data-theme="dark"] .warnings-metric-card.card-resolved.selected {
          background: rgba(16, 185, 129, 0.12) !important;
          border-color: rgba(16, 185, 129, 0.6) !important;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2) !important;
        }
        [data-theme="dark"] .warnings-metric-card.card-suspended.selected {
          background: rgba(239, 68, 68, 0.12) !important;
          border-color: rgba(239, 68, 68, 0.6) !important;
          box-shadow: 0 4px 20px rgba(239, 68, 68, 0.2) !important;
        }

        .metric-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .metric-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .text-active { color: #B45309; }
        .text-appealed { color: #0284C7; }
        .text-resolved { color: #15803D; }
        .text-suspended { color: #DC2626; }

        [data-theme="dark"] .text-active { color: #fbbf24; }
        [data-theme="dark"] .text-appealed { color: #38bdf8; }
        [data-theme="dark"] .text-resolved { color: #34d399; }
        [data-theme="dark"] .text-suspended { color: #f87171; }

        .metric-value {
          font-size: 28px;
          font-weight: 800;
          margin: 10px 0 2px;
          line-height: 1;
        }

        .card-active .metric-value { color: #78350F; }
        .card-appealed .metric-value { color: #0C4A6E; }
        .card-resolved .metric-value { color: #14532D; }
        .card-suspended .metric-value { color: #7F1D1D; }

        [data-theme="dark"] .metric-value {
          color: #ffffff !important;
        }

        .metric-sub {
          font-size: 11.5px;
          margin: 0;
          font-weight: 500;
        }

        .card-active .metric-sub { color: #92400E; }
        .card-appealed .metric-sub { color: #0369A1; }
        .card-resolved .metric-sub { color: #166534; }
        .card-suspended .metric-sub { color: #991B1B; }

        [data-theme="dark"] .metric-sub {
          color: rgba(255, 255, 255, 0.6) !important;
        }

        /* ── Search & Filter Toolbar ── */
        .warnings-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-lg, 16px);
          background: #FFFFFF;
          border: 1.5px solid #E5E7EB;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          flex-wrap: wrap;
        }

        [data-theme="dark"] .warnings-toolbar {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: none;
        }

        .warnings-search-wrap {
          position: relative;
          flex: 1;
          min-width: 260px;
        }

        .warnings-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted, #9CA3AF);
          pointer-events: none;
        }

        .warnings-search-input {
          width: 100%;
          padding: 10px 14px 10px 38px;
          border-radius: var(--radius-md, 12px);
          background: #FFFFFF !important;
          border: 1.5px solid #D1D5DB !important;
          color: #111827 !important;
          font-size: 13px;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .warnings-search-input::placeholder {
          color: #6B7280 !important;
        }

        [data-theme="dark"] .warnings-search-input {
          background: rgba(0, 0, 0, 0.45) !important;
          border-color: rgba(255, 255, 255, 0.14) !important;
          color: #ffffff !important;
          box-shadow: none;
        }

        [data-theme="dark"] .warnings-search-input::placeholder {
          color: rgba(255, 255, 255, 0.45) !important;
        }

        .warnings-search-input:focus {
          border-color: var(--burgundy-500, #B8436A) !important;
          box-shadow: 0 0 0 3px rgba(184, 67, 106, 0.15) !important;
        }

        [data-theme="dark"] .warnings-search-input:focus {
          border-color: #D4AD6A !important;
          background: rgba(0, 0, 0, 0.65) !important;
          box-shadow: 0 0 0 3px rgba(212, 173, 106, 0.2) !important;
        }

        .warnings-toolbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .warnings-select-filter {
          padding: 10px 14px;
          border-radius: var(--radius-md, 12px);
          background: #FFFFFF !important;
          border: 1.5px solid #D1D5DB !important;
          color: #111827 !important;
          font-size: 13px;
          font-weight: 600;
          outline: none;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        [data-theme="dark"] .warnings-select-filter {
          background: rgba(24, 17, 21, 0.9) !important;
          border-color: rgba(255, 255, 255, 0.14) !important;
          color: #ffffff !important;
          box-shadow: none;
        }

        .warnings-select-filter:focus {
          border-color: var(--burgundy-500, #B8436A) !important;
          box-shadow: 0 0 0 3px rgba(184, 67, 106, 0.15) !important;
        }

        [data-theme="dark"] .warnings-select-filter:focus {
          border-color: #D4AD6A !important;
          box-shadow: 0 0 0 3px rgba(212, 173, 106, 0.2) !important;
        }

        .warnings-refresh-btn {
          padding: 10px;
          border-radius: var(--radius-md, 12px);
          background: #FFFFFF;
          border: 1.5px solid #D1D5DB;
          color: #374151;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .warnings-refresh-btn:hover {
          background: rgba(184, 67, 106, 0.08);
          border-color: var(--burgundy-500, #B8436A);
          color: var(--burgundy-600, #9B3456);
        }

        [data-theme="dark"] .warnings-refresh-btn {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.85);
          box-shadow: none;
        }

        [data-theme="dark"] .warnings-refresh-btn:hover {
          background: rgba(255, 255, 255, 0.14);
          color: #ffffff;
        }

        /* ── Loading / Empty States ── */
        .warnings-loading-box,
        .warnings-empty-box {
          padding: 48px 24px;
          text-align: center;
          border-radius: var(--radius-xl, 20px);
          background: var(--bg-surface, #FFFFFF);
          border: 1px solid var(--border-subtle, #E5E7EB);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          color: var(--text-secondary, #4B5563);
        }

        [data-theme="dark"] .warnings-loading-box,
        [data-theme="dark"] .warnings-empty-box {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.6);
        }

        .empty-icon {
          color: var(--text-muted, #9CA3AF);
        }

        [data-theme="dark"] .empty-icon {
          color: rgba(255, 255, 255, 0.25);
        }

        .empty-title {
          font-family: var(--font-display, 'DM Serif Display', serif);
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary, #111827);
          margin: 0;
        }

        [data-theme="dark"] .empty-title {
          color: #ffffff;
        }

        .empty-desc {
          font-size: 12.5px;
          color: var(--text-muted, #6B7280);
          margin: 0;
          max-width: 440px;
        }

        /* ── Warnings List & Cards ── */
        .warnings-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .warning-item-card {
          border-radius: var(--radius-xl, 20px);
          padding: 22px 24px;
          background: var(--bg-surface, #FFFFFF);
          border: 1.5px solid #E2E8F0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .warning-item-card:hover {
          border-color: var(--burgundy-500, #B8436A);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
        }

        [data-theme="dark"] .warning-item-card {
          background: linear-gradient(165deg, rgba(28, 20, 24, 0.95) 0%, rgba(14, 10, 12, 0.98) 100%);
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: none;
        }

        [data-theme="dark"] .warning-item-card:hover {
          border-color: rgba(212, 173, 106, 0.35);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
        }

        .status-card-appealed {
          border-color: #38BDF8 !important;
        }

        [data-theme="dark"] .status-card-appealed {
          background: linear-gradient(165deg, rgba(14, 25, 45, 0.95) 0%, rgba(10, 14, 25, 0.98) 100%);
          border-color: rgba(56, 189, 248, 0.35) !important;
        }

        .status-card-resolved {
          border-color: #34D399 !important;
        }

        [data-theme="dark"] .status-card-resolved {
          border-color: rgba(16, 185, 129, 0.3) !important;
        }

        .status-card-suspended {
          border-color: #F87171 !important;
        }

        [data-theme="dark"] .status-card-suspended {
          border-color: rgba(239, 68, 68, 0.3) !important;
        }

        /* Card Header */
        .warning-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding-bottom: 16px;
          border-bottom: 1.5px solid #E5E7EB;
          flex-wrap: wrap;
        }

        [data-theme="dark"] .warning-card-header {
          border-bottom-color: rgba(255, 255, 255, 0.08);
        }

        .warning-user-cell {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .warning-avatar-wrap {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: #F3F4F6;
          border: 1px solid #D1D5DB;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .warning-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .warning-avatar-fallback {
          color: #9CA3AF;
        }

        [data-theme="dark"] .warning-avatar-wrap {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.14);
        }

        [data-theme="dark"] .warning-avatar-fallback {
          color: rgba(255, 255, 255, 0.6);
        }

        .warning-user-name-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .warning-user-name {
          font-size: 16px;
          font-weight: 800;
          color: #111827;
          margin: 0;
        }

        [data-theme="dark"] .warning-user-name {
          color: #ffffff;
        }

        .warning-violation-badge {
          font-size: 10.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 3px 10px;
          border-radius: 999px;
          border-width: 1.5px;
          border-style: solid;
        }

        .violation-name {
          background: #F3E8FF;
          border-color: #C084FC;
          color: #7E22CE;
        }

        .violation-photo {
          background: #FFE4E6;
          border-color: #FB7185;
          color: #BE123C;
        }

        .violation-policy {
          background: #FEF3C7;
          border-color: #FBBF24;
          color: #92400E;
        }

        [data-theme="dark"] .violation-name {
          background: rgba(168, 85, 247, 0.15);
          border-color: rgba(168, 85, 247, 0.4);
          color: #c084fc;
        }

        [data-theme="dark"] .violation-photo {
          background: rgba(244, 63, 94, 0.15);
          border-color: rgba(244, 63, 94, 0.4);
          color: #fb7185;
        }

        [data-theme="dark"] .violation-policy {
          background: rgba(245, 158, 11, 0.15);
          border-color: rgba(245, 158, 11, 0.4);
          color: #fbbf24;
        }

        .warning-user-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #4B5563;
          font-weight: 500;
          margin-top: 4px;
          flex-wrap: wrap;
        }

        [data-theme="dark"] .warning-user-meta-row {
          color: rgba(255, 255, 255, 0.6);
        }

        .warning-id-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          background: #F3F4F6;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          cursor: pointer;
          color: #374151;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .warning-id-pill:hover {
          color: #9B3456;
          background: #FDF2F4;
          border-color: #B8436A;
        }

        [data-theme="dark"] .warning-id-pill {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.7);
        }

        [data-theme="dark"] .warning-id-pill:hover {
          color: #D4AD6A;
          background: rgba(212, 173, 106, 0.12);
        }

        /* Status Pill */
        .warning-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.02em;
          border: 1.5px solid transparent;
        }

        .pill-active {
          background: #FFFBEB;
          border-color: #F59E0B;
          color: #92400E;
          box-shadow: 0 1px 3px rgba(245, 158, 11, 0.12);
        }

        .pill-appealed {
          background: #F0F9FF;
          border-color: #38BDF8;
          color: #0369A1;
          box-shadow: 0 1px 3px rgba(56, 189, 248, 0.12);
        }

        .pill-resolved {
          background: #ECFDF5;
          border-color: #34D399;
          color: #065F46;
          box-shadow: 0 1px 3px rgba(16, 185, 129, 0.12);
        }

        .pill-suspended {
          background: #FEF2F2;
          border-color: #F87171;
          color: #991B1B;
          box-shadow: 0 1px 3px rgba(239, 68, 68, 0.12);
        }

        [data-theme="dark"] .pill-active {
          background: rgba(245, 158, 11, 0.15);
          border-color: rgba(245, 158, 11, 0.4);
          color: #fbbf24;
          box-shadow: none;
        }

        [data-theme="dark"] .pill-appealed {
          background: rgba(56, 189, 248, 0.15);
          border-color: rgba(56, 189, 248, 0.4);
          color: #38bdf8;
          box-shadow: none;
        }

        [data-theme="dark"] .pill-resolved {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.4);
          color: #34d399;
          box-shadow: none;
        }

        [data-theme="dark"] .pill-suspended {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.4);
          color: #f87171;
          box-shadow: none;
        }

        /* Content Grid */
        .warning-content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 800px) {
          .warning-content-grid {
            grid-template-columns: 1fr;
          }
        }

        .warning-col {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .warning-section-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6B7280;
        }

        [data-theme="dark"] .warning-section-title {
          color: rgba(255, 255, 255, 0.5);
        }

        .warning-message-box {
          padding: 14px 16px;
          border-radius: var(--radius-md, 12px);
          background: #FAF8F5;
          border: 1.5px solid #E5E7EB;
          color: #1F2937;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.6;
        }

        [data-theme="dark"] .warning-message-box {
          background: rgba(0, 0, 0, 0.35);
          border-color: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.88);
        }

        .warning-resolution-box {
          padding: 10px 14px;
          border-radius: var(--radius-sm, 10px);
          background: #F3F4F6;
          border: 1.5px solid #E5E7EB;
          font-size: 12px;
          color: #374151;
        }

        [data-theme="dark"] .warning-resolution-box {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.7);
        }

        .warning-diff-box {
          padding: 14px 16px;
          border-radius: var(--radius-md, 12px);
          background: #FAF8F5;
          border: 1.5px solid #E5E7EB;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 12.5px;
        }

        [data-theme="dark"] .warning-diff-box {
          background: rgba(0, 0, 0, 0.35);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .diff-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .diff-label {
          color: #4B5563;
          font-weight: 600;
        }

        [data-theme="dark"] .diff-label {
          color: rgba(255, 255, 255, 0.55);
        }

        .diff-val-old {
          color: #B45309;
          font-weight: 700;
          font-family: inherit;
        }

        [data-theme="dark"] .diff-val-old {
          color: #fbbf24;
        }

        .diff-val-new {
          color: #111827;
          font-weight: 700;
          font-family: inherit;
        }

        [data-theme="dark"] .diff-val-new {
          color: #ffffff;
        }

        .diff-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
        }

        .diff-alert-success {
          background: #D1FAE5;
          border: 1.5px solid #10B981;
          color: #065F46;
        }

        [data-theme="dark"] .diff-alert-success {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.35);
          color: #34d399;
        }

        .diff-alert-pending {
          background: #FEF3C7;
          border: 1.5px solid #F59E0B;
          color: #92400E;
        }

        [data-theme="dark"] .diff-alert-pending {
          background: rgba(245, 158, 11, 0.15);
          border-color: rgba(245, 158, 11, 0.35);
          color: #fcd34d;
        }

        .text-muted-box {
          color: #4B5563;
          line-height: 1.5;
        }

        [data-theme="dark"] .text-muted-box {
          color: rgba(255, 255, 255, 0.6);
        }

        /* Appeal Section */
        .warning-appeal-section {
          margin-top: 4px;
          padding: 16px;
          border-radius: 14px;
          background: #F0F9FF;
          border: 1.5px solid #7DD3FC;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        [data-theme="dark"] .warning-appeal-section {
          background: rgba(14, 25, 45, 0.6);
          border-color: rgba(56, 189, 248, 0.3);
        }

        .appeal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .appeal-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #0284C7;
        }

        [data-theme="dark"] .appeal-header-left {
          color: #38bdf8;
        }

        .appeal-timestamp {
          font-size: 11px;
          color: #0369A1;
        }

        [data-theme="dark"] .appeal-timestamp {
          color: rgba(56, 189, 248, 0.6);
        }

        .appeal-text-quote {
          margin: 0;
          padding: 12px 14px;
          border-radius: 10px;
          background: #FFFFFF;
          border: 1.5px solid #BAE6FD;
          color: #0C4A6E;
          font-size: 12.5px;
          line-height: 1.6;
          white-space: pre-wrap;
          font-weight: 500;
        }

        [data-theme="dark"] .appeal-text-quote {
          background: rgba(0, 0, 0, 0.4);
          border-color: rgba(56, 189, 248, 0.2);
          color: #e0f2fe;
        }

        .appeal-photos-wrap {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .appeal-photos-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #0284C7;
        }

        [data-theme="dark"] .appeal-photos-title {
          color: #38bdf8;
        }

        .appeal-thumbnails-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .appeal-thumb-card {
          position: relative;
          width: 76px;
          height: 76px;
          border-radius: 12px;
          overflow: hidden;
          border: 1.5px solid #7DD3FC;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .appeal-thumb-card:hover {
          transform: scale(1.05);
        }

        [data-theme="dark"] .appeal-thumb-card {
          border-color: rgba(56, 189, 248, 0.4);
        }

        .appeal-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .appeal-thumb-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
          color: #ffffff;
        }

        .appeal-thumb-card:hover .appeal-thumb-overlay {
          opacity: 1;
        }

        /* Footer & Actions */
        .warning-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1.5px solid #E5E7EB;
          gap: 12px;
          flex-wrap: wrap;
        }

        [data-theme="dark"] .warning-card-footer {
          border-top-color: rgba(255, 255, 255, 0.08);
        }

        .warning-issued-by {
          font-size: 12px;
          color: #6B7280;
        }

        .warning-issued-by strong {
          color: #111827;
        }

        [data-theme="dark"] .warning-issued-by {
          color: rgba(255, 255, 255, 0.5);
        }

        [data-theme="dark"] .warning-issued-by strong {
          color: rgba(255, 255, 255, 0.88);
        }

        .warning-actions-group {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn-warn-inspect,
        .btn-warn-dismiss,
        .btn-warn-extend,
        .btn-warn-suspend {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: var(--radius-md, 10px);
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1.5px solid transparent;
        }

        .btn-warn-inspect {
          background: #FFFFFF;
          border-color: #D1D5DB;
          color: #374151;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .btn-warn-inspect:hover {
          background: #F3F4F6;
          border-color: #9CA3AF;
          color: #111827;
        }

        [data-theme="dark"] .btn-warn-inspect {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.14);
          color: rgba(255, 255, 255, 0.85);
          box-shadow: none;
        }

        [data-theme="dark"] .btn-warn-inspect:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }

        .btn-warn-dismiss {
          background: #ECFDF5;
          border-color: #34D399;
          color: #065F46;
          box-shadow: 0 1px 3px rgba(16, 185, 129, 0.15);
        }

        .btn-warn-dismiss:hover {
          background: #D1FAE5;
          border-color: #10B981;
          color: #064E3B;
          transform: translateY(-1px);
        }

        [data-theme="dark"] .btn-warn-dismiss {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.4);
          color: #34d399;
          box-shadow: none;
        }

        [data-theme="dark"] .btn-warn-dismiss:hover {
          background: rgba(16, 185, 129, 0.25);
          border-color: rgba(16, 185, 129, 0.6);
          color: #6ee7b7;
        }

        .btn-warn-extend {
          background: #FFFBEB;
          border-color: #FBBF24;
          color: #92400E;
          box-shadow: 0 1px 3px rgba(245, 158, 11, 0.15);
        }

        .btn-warn-extend:hover {
          background: #FEF3C7;
          border-color: #F59E0B;
          color: #78350F;
          transform: translateY(-1px);
        }

        [data-theme="dark"] .btn-warn-extend {
          background: rgba(245, 158, 11, 0.15);
          border-color: rgba(245, 158, 11, 0.4);
          color: #fbbf24;
          box-shadow: none;
        }

        [data-theme="dark"] .btn-warn-extend:hover {
          background: rgba(245, 158, 11, 0.25);
          border-color: rgba(245, 158, 11, 0.6);
          color: #fde68a;
        }

        .btn-warn-suspend {
          background: #FEF2F2;
          border-color: #F87171;
          color: #991B1B;
          box-shadow: 0 1px 3px rgba(239, 68, 68, 0.15);
        }

        .btn-warn-suspend:hover {
          background: #FEE2E2;
          border-color: #EF4444;
          color: #7F1D1D;
          transform: translateY(-1px);
        }

        [data-theme="dark"] .btn-warn-suspend {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.4);
          color: #f87171;
          box-shadow: none;
        }

        [data-theme="dark"] .btn-warn-suspend:hover {
          background: rgba(239, 68, 68, 0.25);
          border-color: rgba(239, 68, 68, 0.6);
          color: #fca5a5;
        }

        /* ── Lightbox Modal ── */
        .admin-lightbox-overlay {
          position: fixed;
          inset: 0;
          z-index: 100000;
          background: rgba(0, 0, 0, 0.92);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: adminFadeIn 0.2s ease-out;
        }

        .admin-lightbox-card {
          position: relative;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          background: #0f0a0d;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
        }

        .admin-lightbox-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
        }

        .admin-lightbox-title {
          font-size: 13px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.85);
        }

        .admin-lightbox-close {
          padding: 6px;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .admin-lightbox-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .admin-lightbox-body {
          padding: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: auto;
          max-height: 80vh;
        }

        .admin-lightbox-img {
          max-width: 100%;
          max-height: 75vh;
          object-fit: contain;
          border-radius: 10px;
        }

        .icon-spin {
          animation: adminIconSpin 1s linear infinite;
        }

        .icon-pulse {
          animation: adminIconPulse 1.5s ease-in-out infinite;
        }

        @keyframes adminIconSpin {
          to { transform: rotate(360deg); }
        }

        @keyframes adminIconPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.92); }
        }

        @keyframes adminFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
