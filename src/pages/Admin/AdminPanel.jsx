import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/UI/PageHeader';
import { Button } from '../../components/UI/Button';
import { EmptyState } from '../../components/UI/EmptyState';
import {
  Crown,
  ShieldCheck,
  CheckCircle,
  XCircle,
  UserCircle,
  Clock,
  Eye,
  CaretDown,
  CaretUp,
  Users,
  ChartBar,
  IdentificationBadge,
  Warning,
  ArrowsClockwise,
} from '@phosphor-icons/react';

// ─── Admin Panel Tabs ───
const TABS = [
  { id: 'verifications', label: 'Verification Requests', icon: IdentificationBadge },
  { id: 'pending', label: 'Pending Users', icon: Users },
  { id: 'stats', label: 'Dashboard', icon: ChartBar },
];

export const AdminPanel = () => {
  const { showAlert, userRole } = useApp();
  const [activeTab, setActiveTab] = useState('verifications');

  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

  if (!isAdmin) {
    return (
      <EmptyState
        icon={<Warning size={48} />}
        title="Access Denied"
        desc="You don't have permission to access this page."
      />
    );
  }

  return (
    <div className="admin-panel">
      <PageHeader title="Admin Panel" subtitle="Manage verification requests, users, and platform settings" />

      {/* Tab Navigation */}
      <div className="admin-tabs">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} weight={activeTab === tab.id ? 'fill' : 'regular'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="admin-tab-content">
        {activeTab === 'verifications' && <VerificationRequestsTab showAlert={showAlert} />}
        {activeTab === 'pending' && <PendingUsersTab showAlert={showAlert} />}
        {activeTab === 'stats' && <DashboardStatsTab />}
      </div>

      <style>{adminStyles}</style>
    </div>
  );
};

// ─── VERIFICATION REQUESTS TAB ───
const VerificationRequestsTab = ({ showAlert }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [actionLoading, setActionLoading] = useState(null);
  const [notesMap, setNotesMap] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.admin.getVerifications(filter || undefined);
      setRequests(res?.data || []);
    } catch (err) {
      console.error('Failed to fetch verification requests:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.admin.approveVerification(id, notesMap[id] || '');
      showAlert?.('✅ Verification approved — user is now verified.', 'success');
      fetchRequests();
    } catch (err) {
      showAlert?.('Failed to approve verification.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await api.admin.rejectVerification(id, notesMap[id] || '');
      showAlert?.('❌ Verification request rejected.', 'info');
      fetchRequests();
    } catch (err) {
      showAlert?.('Failed to reject verification.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <ArrowsClockwise size={28} className="admin-spinner" />
        <span>Loading verification requests…</span>
      </div>
    );
  }

  return (
    <div className="admin-section">
      {/* Filter */}
      <div className="admin-filter-row">
        {['PENDING', 'APPROVED', 'REJECTED', ''].map(status => (
          <button
            key={status || 'all'}
            className={`admin-filter-btn ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck size={48} />}
          title="No Verification Requests"
          desc={`No ${filter?.toLowerCase() || ''} verification requests found.`}
        />
      ) : (
        <div className="admin-cards-grid">
          {requests.map(req => (
            <div key={req.id} className={`admin-verification-card status-${req.status?.toLowerCase()}`}>
              {/* Card Header */}
              <div className="admin-card-header">
                <div className="admin-card-user-info">
                  <UserCircle size={36} weight="fill" className="admin-card-avatar" />
                  <div>
                    <h4 className="admin-card-name font-display">{req.userName}</h4>
                    <span className="admin-card-meta">{req.userPhone} • {req.userCity || 'Unknown city'}</span>
                  </div>
                </div>
                <span className={`admin-status-badge status-${req.status?.toLowerCase()}`}>
                  {req.status}
                </span>
              </div>

              {/* Photo Comparison */}
              <div className="admin-photo-compare">
                <div className="admin-photo-box">
                  <span className="admin-photo-label">Selfie Submitted</span>
                  <img
                    src={req.selfieUrl}
                    alt="Verification selfie"
                    className="admin-photo-img"
                    loading="lazy"
                  />
                </div>
                <div className="admin-photo-box">
                  <span className="admin-photo-label">Profile Photo</span>
                  {req.referenceUrl || req.profilePhotos?.[0] ? (
                    <img
                      src={req.referenceUrl || req.profilePhotos?.[0]}
                      alt="Profile reference"
                      className="admin-photo-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="admin-photo-placeholder">
                      <UserCircle size={48} weight="thin" />
                      <span>No photo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Auto-fail Reason */}
              {req.autoFailReason && (
                <div className="admin-fail-reason">
                  <Warning size={16} weight="fill" />
                  <span>{req.autoFailReason}</span>
                </div>
              )}

              {/* Expandable Details */}
              <button
                className="admin-expand-btn"
                onClick={() => setExpandedCard(expandedCard === req.id ? null : req.id)}
              >
                {expandedCard === req.id ? <CaretUp size={16} /> : <CaretDown size={16} />}
                <span>{expandedCard === req.id ? 'Hide Details' : 'Show Details'}</span>
              </button>

              {expandedCard === req.id && (
                <div className="admin-card-details">
                  <div className="admin-detail-row">
                    <Clock size={14} />
                    <span>Submitted: {new Date(req.createdAt).toLocaleString()}</span>
                  </div>
                  {req.reviewedAt && (
                    <div className="admin-detail-row">
                      <Eye size={14} />
                      <span>Reviewed: {new Date(req.reviewedAt).toLocaleString()} by {req.reviewerName || 'Admin'}</span>
                    </div>
                  )}
                  {req.adminNotes && (
                    <div className="admin-detail-row">
                      <span className="admin-notes-text">Notes: {req.adminNotes}</span>
                    </div>
                  )}
                  {/* All profile photos */}
                  {req.profilePhotos?.length > 1 && (
                    <div className="admin-all-photos">
                      <span className="admin-photo-label">All Profile Photos</span>
                      <div className="admin-photos-row">
                        {req.profilePhotos.map((url, idx) => (
                          <img key={idx} src={url} alt={`Profile ${idx + 1}`} className="admin-photo-thumb" loading="lazy" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions (only for pending) */}
              {req.status === 'PENDING' && (
                <div className="admin-card-actions">
                  <textarea
                    className="admin-notes-input"
                    placeholder="Admin notes (optional)…"
                    value={notesMap[req.id] || ''}
                    onChange={(e) => setNotesMap(prev => ({ ...prev, [req.id]: e.target.value }))}
                    rows={2}
                  />
                  <div className="admin-action-buttons">
                    <Button
                      variant="primary"
                      onClick={() => handleApprove(req.id)}
                      disabled={actionLoading === req.id}
                      className="admin-approve-btn"
                    >
                      <CheckCircle size={18} weight="bold" />
                      <span>{actionLoading === req.id ? 'Processing…' : 'Approve'}</span>
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleReject(req.id)}
                      disabled={actionLoading === req.id}
                      className="admin-reject-btn"
                    >
                      <XCircle size={18} weight="bold" />
                      <span>Reject</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── PENDING USERS TAB ───
const PendingUsersTab = ({ showAlert }) => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.admin.getPending();
      setQueue(res?.data || []);
    } catch (err) {
      console.error('Failed to fetch pending users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (userId) => {
    setActionLoading(userId);
    try {
      await api.admin.approve(userId);
      showAlert?.('✅ User approved successfully.', 'success');
      fetchPending();
    } catch (err) {
      showAlert?.('Failed to approve user.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    setActionLoading(userId);
    try {
      await api.admin.reject(userId);
      showAlert?.('❌ User rejected.', 'info');
      fetchPending();
    } catch (err) {
      showAlert?.('Failed to reject user.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <ArrowsClockwise size={28} className="admin-spinner" />
        <span>Loading pending users…</span>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <EmptyState
        icon={<Users size={48} />}
        title="No Pending Users"
        desc="All user registrations have been reviewed."
      />
    );
  }

  return (
    <div className="admin-section">
      <div className="admin-cards-grid">
        {queue.map(user => (
          <div key={user.userId} className="admin-user-card">
            <div className="admin-card-header">
              <div className="admin-card-user-info">
                {user.photos?.[0] ? (
                  <img src={user.photos[0]} alt="" className="admin-user-avatar" />
                ) : (
                  <UserCircle size={36} weight="fill" className="admin-card-avatar" />
                )}
                <div>
                  <h4 className="admin-card-name font-display">{user.name || 'Unnamed'}</h4>
                  <span className="admin-card-meta">{user.phoneNumber} • {user.city || 'Unknown'}</span>
                </div>
              </div>
              <span className="admin-completion-badge">{user.profileCompletion}%</span>
            </div>

            <div className="admin-user-details">
              <span>{user.gender || '—'} • {user.relationshipIntent || '—'}</span>
              {user.hasPriorHistory && (
                <span className="admin-prior-flag">
                  <Warning size={14} weight="fill" />
                  Prior history: {user.priorRejections} rejection(s), {user.priorDeletions} deletion(s)
                </span>
              )}
            </div>

            {/* Photo thumbnails */}
            {user.photos?.length > 0 && (
              <div className="admin-photos-row">
                {user.photos.slice(0, 4).map((url, idx) => (
                  <img key={idx} src={url} alt={`Photo ${idx + 1}`} className="admin-photo-thumb" loading="lazy" />
                ))}
              </div>
            )}

            <div className="admin-action-buttons">
              <Button
                variant="primary"
                onClick={() => handleApprove(user.userId)}
                disabled={actionLoading === user.userId}
                className="admin-approve-btn"
              >
                <CheckCircle size={18} weight="bold" />
                <span>{actionLoading === user.userId ? 'Processing…' : 'Approve'}</span>
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleReject(user.userId)}
                disabled={actionLoading === user.userId}
                className="admin-reject-btn"
              >
                <XCircle size={18} weight="bold" />
                <span>Reject</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── DASHBOARD STATS TAB ───
const DashboardStatsTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.admin.getStats();
        setStats(res?.data || null);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        <ArrowsClockwise size={28} className="admin-spinner" />
        <span>Loading dashboard…</span>
      </div>
    );
  }

  if (!stats) {
    return <EmptyState icon={<ChartBar size={48} />} title="No Data" desc="Unable to load dashboard statistics." />;
  }

  const statCards = [
    { label: 'Pending Approvals', value: stats.stats?.pendingCount || 0, color: '#D4AD6A' },
    { label: 'Active Users', value: stats.stats?.activeCount || 0, color: '#4ade80' },
    { label: 'Suspended', value: stats.stats?.suspendedCount || 0, color: '#fb923c' },
    { label: 'Deleted', value: stats.stats?.deletedCount || 0, color: '#f87171' },
    { label: 'Open Reports', value: stats.stats?.reportsCount || 0, color: '#c084fc' },
    { label: 'Total Users', value: stats.stats?.totalCount || 0, color: '#60a5fa' },
  ];

  return (
    <div className="admin-section">
      <div className="admin-stats-grid">
        {statCards.map((s, idx) => (
          <div key={idx} className="admin-stat-card" style={{ borderTopColor: s.color }}>
            <span className="admin-stat-value" style={{ color: s.color }}>{s.value}</span>
            <span className="admin-stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Styles ───
const adminStyles = `
  .admin-panel {
    padding: var(--space-4);
    max-width: 960px;
    margin: 0 auto;
  }

  .admin-tabs {
    display: flex;
    gap: var(--space-2);
    margin-bottom: var(--space-6);
    overflow-x: auto;
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--border-subtle);
  }

  .admin-tab {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    font-family: var(--font-ui);
    font-weight: 500;
    font-size: var(--text-body-sm);
    white-space: nowrap;
    transition: all var(--duration-fast);
    border: 1px solid transparent;
  }

  .admin-tab:hover {
    background-color: var(--bg-muted);
    color: var(--text-primary);
  }

  .admin-tab.active {
    background-color: var(--bg-accent-subtle);
    color: var(--text-accent);
    border-color: var(--text-accent);
  }

  .admin-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    padding: var(--space-10) 0;
    color: var(--text-secondary);
    font-family: var(--font-ui);
  }

  .admin-spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .admin-filter-row {
    display: flex;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
    flex-wrap: wrap;
  }

  .admin-filter-btn {
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-full);
    font-size: var(--text-caption);
    font-family: var(--font-ui);
    font-weight: 500;
    color: var(--text-secondary);
    border: 1px solid var(--border-subtle);
    transition: all var(--duration-fast);
    text-transform: capitalize;
  }

  .admin-filter-btn:hover {
    background-color: var(--bg-muted);
  }

  .admin-filter-btn.active {
    background-color: var(--text-accent);
    color: #fff;
    border-color: var(--text-accent);
  }

  .admin-cards-grid {
    display: grid;
    gap: var(--space-4);
  }

  .admin-verification-card,
  .admin-user-card {
    background-color: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    transition: box-shadow var(--duration-fast);
  }

  .admin-verification-card:hover,
  .admin-user-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  .admin-verification-card.status-approved {
    border-left: 3px solid #4ade80;
  }
  .admin-verification-card.status-rejected {
    border-left: 3px solid #f87171;
  }
  .admin-verification-card.status-pending {
    border-left: 3px solid #D4AD6A;
  }

  .admin-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-3);
  }

  .admin-card-user-info {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .admin-card-avatar {
    color: var(--text-muted);
  }

  .admin-user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
  }

  .admin-card-name {
    font-size: var(--text-body);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .admin-card-meta {
    font-size: var(--text-caption);
    color: var(--text-tertiary);
  }

  .admin-status-badge {
    font-size: 11px;
    font-weight: 600;
    font-family: var(--font-ui);
    padding: 3px 10px;
    border-radius: var(--radius-full);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .admin-status-badge.status-pending {
    background-color: rgba(212, 173, 106, 0.15);
    color: #D4AD6A;
  }
  .admin-status-badge.status-approved {
    background-color: rgba(74, 222, 128, 0.15);
    color: #4ade80;
  }
  .admin-status-badge.status-rejected {
    background-color: rgba(248, 113, 113, 0.15);
    color: #f87171;
  }

  .admin-completion-badge {
    font-size: 13px;
    font-weight: 600;
    font-family: var(--font-ui);
    color: var(--text-accent);
  }

  .admin-photo-compare {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
    margin-bottom: var(--space-3);
  }

  .admin-photo-box {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .admin-photo-label {
    font-size: var(--text-caption);
    color: var(--text-tertiary);
    font-weight: 500;
    font-family: var(--font-ui);
  }

  .admin-photo-img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-subtle);
    background-color: var(--bg-muted);
  }

  .admin-photo-placeholder {
    width: 100%;
    aspect-ratio: 1;
    border-radius: var(--radius-md);
    border: 1px dashed var(--border-subtle);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-1);
    color: var(--text-muted);
    font-size: var(--text-caption);
  }

  .admin-fail-reason {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background-color: rgba(248, 113, 113, 0.08);
    border-radius: var(--radius-sm);
    color: #f87171;
    font-size: var(--text-caption);
    font-family: var(--font-ui);
    margin-bottom: var(--space-3);
    line-height: 1.4;
  }

  .admin-expand-btn {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    color: var(--text-tertiary);
    font-size: var(--text-caption);
    font-family: var(--font-ui);
    padding: var(--space-1) 0;
    margin-bottom: var(--space-2);
    transition: color var(--duration-fast);
  }

  .admin-expand-btn:hover {
    color: var(--text-primary);
  }

  .admin-card-details {
    padding: var(--space-2) 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    border-top: 1px solid var(--border-subtle);
  }

  .admin-detail-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-caption);
    color: var(--text-tertiary);
  }

  .admin-notes-text {
    font-style: italic;
    color: var(--text-secondary);
  }

  .admin-user-details {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    font-size: var(--text-caption);
    color: var(--text-secondary);
    margin-bottom: var(--space-3);
  }

  .admin-prior-flag {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    color: #fb923c;
    font-weight: 500;
  }

  .admin-photos-row {
    display: flex;
    gap: var(--space-2);
    overflow-x: auto;
    padding-bottom: var(--space-2);
    margin-bottom: var(--space-3);
  }

  .admin-photo-thumb {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-sm);
    object-fit: cover;
    border: 1px solid var(--border-subtle);
    flex-shrink: 0;
  }

  .admin-card-actions {
    border-top: 1px solid var(--border-subtle);
    padding-top: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .admin-notes-input {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-subtle);
    background-color: var(--bg-muted);
    color: var(--text-primary);
    font-family: var(--font-ui);
    font-size: var(--text-caption);
    resize: vertical;
    min-height: 40px;
  }

  .admin-notes-input:focus {
    outline: none;
    border-color: var(--text-accent);
  }

  .admin-action-buttons {
    display: flex;
    gap: var(--space-2);
  }

  .admin-approve-btn {
    flex: 1;
  }

  .admin-reject-btn {
    flex: 1;
  }

  .admin-all-photos {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    margin-top: var(--space-2);
  }

  /* Stats Grid */
  .admin-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--space-3);
  }

  .admin-stat-card {
    background-color: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-top: 3px solid;
    border-radius: var(--radius-md);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
  }

  .admin-stat-value {
    font-size: 28px;
    font-weight: 700;
    font-family: var(--font-display);
  }

  .admin-stat-label {
    font-size: var(--text-caption);
    color: var(--text-tertiary);
    font-family: var(--font-ui);
    text-align: center;
  }

  @media (max-width: 600px) {
    .admin-photo-compare {
      grid-template-columns: 1fr 1fr;
    }

    .admin-stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;
