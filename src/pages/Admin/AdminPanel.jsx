import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/UI/PageHeader';
import { Button } from '../../components/UI/Button';
import { EmptyState } from '../../components/UI/EmptyState';
import { VerifiedBadge } from '../../components/UI/VerifiedBadge';
import { ProfileDetail } from '../ProfileDetail/ProfileDetail';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  UserCircle,
  Clock,
  Eye,
  CaretDown,
  CaretUp,
  CaretLeft,
  CaretRight,
  Users,
  ChartBar,
  IdentificationBadge,
  Warning,
  ArrowsClockwise,
  MagnifyingGlass,
  Sparkle,
  SealCheck,
  HourglassMedium,
  Prohibit,
  ArrowCounterClockwise,
  Trash,
  Copy,
  ArrowLeft,
} from '@phosphor-icons/react';

// ─── REUSABLE LUXURY PAGINATION COMPONENT ───
const AdminPagination = ({ page, totalPages, totalItems, pageSize, onPageChange }) => {
  if (totalPages <= 1) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="admin-pagination-wrapper font-ui">
      <span className="admin-pagination-info">
        Showing <strong className="admin-pagination-highlight">{startItem}–{endItem}</strong> of <strong className="admin-pagination-highlight">{totalItems}</strong>
      </span>
      <div className="admin-pagination-controls">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="admin-page-nav-btn"
          title="Previous page"
          aria-label="Previous page"
        >
          <CaretLeft size={15} weight="bold" />
          <span>Prev</span>
        </button>
        <span className="admin-page-indicator">
          Page <strong>{page}</strong> of <strong>{totalPages}</strong>
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="admin-page-nav-btn"
          title="Next page"
          aria-label="Next page"
        >
          <span>Next</span>
          <CaretRight size={15} weight="bold" />
        </button>
      </div>
    </div>
  );
};

// ─── ADMIN PHOTO DISPLAY WITH OUTLINED PLACEHOLDER FALLBACK ───
const AdminPhotoDisplay = ({ src, alt = '', placeholderText = 'No user image added yet' }) => {
  const [loadFailed, setLoadFailed] = useState(false);

  // If no source is provided or loading failed, display the dashed outlined placeholder box
  if (!src || loadFailed) {
    return (
      <div className="admin-photo-placeholder" role="img" aria-label={placeholderText}>
        <UserCircle size={48} weight="thin" />
        <span>{placeholderText}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="admin-photo-img"
      loading="lazy"
      onError={() => setLoadFailed(true)}
    />
  );
};

// ─── ADMIN PROFILE INSPECTOR VIEW ───
const AdminProfileInspector = ({ user, onBack, onUserUpdated, showAlert: propShowAlert }) => {
  const { showAlert: appShowAlert, showConfirm } = useApp();
  const showAlert = propShowAlert || appShowAlert;
  const [currentUser, setCurrentUser] = useState(user);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const handleToggleVerif = async () => {
    setActionLoading(true);
    try {
      const nextVerified = !currentUser.verified;
      await api.admin.toggleUserVerification(currentUser.id, nextVerified);
      const updated = {
        ...currentUser,
        verified: nextVerified,
        profile: currentUser.profile ? { ...currentUser.profile, verified: nextVerified } : null,
      };
      setCurrentUser(updated);
      onUserUpdated?.(updated);
      showAlert?.(`User verification status changed to ${nextVerified ? 'VERIFIED' : 'UNVERIFIED'}.`, 'success');
    } catch (err) {
      showAlert?.(err?.response?.data?.message || err?.message || 'Failed to update verification status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveRegistration = async () => {
    setActionLoading(true);
    try {
      await api.admin.approve(currentUser.id);
      const updated = { ...currentUser, approvalStatus: 'APPROVED' };
      setCurrentUser(updated);
      onUserUpdated?.(updated);
      showAlert?.('User registration has been APPROVED.', 'success');
    } catch (err) {
      showAlert?.(err?.response?.data?.message || err?.message || 'Failed to approve registration.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRegistration = async () => {
    setActionLoading(true);
    try {
      await api.admin.reject(currentUser.id);
      const updated = { ...currentUser, approvalStatus: 'REJECTED' };
      setCurrentUser(updated);
      onUserUpdated?.(updated);
      showAlert?.('User registration has been REJECTED.', 'info');
    } catch (err) {
      showAlert?.(err?.response?.data?.message || err?.message || 'Failed to reject registration.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSusp = async () => {
    if (currentUser.role === 'ADMIN') {
      showAlert?.('Admin accounts cannot be suspended.', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const isCurrentlySuspended = currentUser.status === 'SUSPENDED' || currentUser.status === 'DELETED';
      if (isCurrentlySuspended) {
        await api.admin.restoreUser(currentUser.id);
        const updated = { ...currentUser, status: 'ACTIVE' };
        setCurrentUser(updated);
        onUserUpdated?.(updated);
        showAlert?.('User account restored to ACTIVE.', 'success');
      } else {
        await api.admin.suspendUser(currentUser.id);
        const updated = { ...currentUser, status: 'SUSPENDED' };
        setCurrentUser(updated);
        onUserUpdated?.(updated);
        showAlert?.('User account SUSPENDED.', 'info');
      }
    } catch (err) {
      showAlert?.(err?.response?.data?.message || err?.message || 'Failed to update account status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (currentUser.role === 'ADMIN') {
      showAlert?.('Admin accounts cannot be deleted.', 'error');
      return;
    }
    const confirmed = await showConfirm({
      title: 'Confirm Account Deletion',
      message: `Are you sure you want to mark account "${currentUser.name || 'this user'}" as DELETED? The account will be deactivated and marked as deleted.`,
      okText: 'Delete Account',
      cancelText: 'Keep Account',
      variant: 'danger',
    });
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await api.admin.deleteUser(currentUser.id);
      const updated = { ...currentUser, status: 'DELETED' };
      setCurrentUser(updated);
      onUserUpdated?.(updated);
      showAlert?.('User account marked as DELETED.', 'info');
    } catch (err) {
      showAlert?.(err?.response?.data?.message || err?.message || 'Failed to delete user.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const copyId = (id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id);
      showAlert?.(`Copied User ID: ${id}`, 'info');
    }
  };

  const resolvedProfile = currentUser.hasProfile ? {
    ...(currentUser.profile || {}),
    id: currentUser.profile?.id || currentUser.id,
    userId: currentUser.id,
    name: currentUser.profile?.name || currentUser.name || 'Member',
    age: currentUser.profile?.age || 25,
    gender: currentUser.profile?.gender || 'Not specified',
    city: currentUser.profile?.city || currentUser.city || 'India',
    story: currentUser.profile?.story || 'No story provided yet.',
    interests: currentUser.profile?.interests || [],
    photos: currentUser.photos?.length > 0 ? currentUser.photos : (currentUser.profile?.photos || []),
    verified: currentUser.verified,
    email: currentUser.email,
    phoneNumber: currentUser.phoneNumber,
  } : null;

  return (
    <div className="admin-profile-inspector-wrapper page-enter">
      {/* Top Administrative Bar */}
      <div className="admin-inspector-topbar">
        <button
          type="button"
          onClick={onBack}
          className="admin-inspector-back-btn font-ui"
          title="Back to Directory"
        >
          <ArrowLeft size={18} weight="bold" />
          <span>Back to Directory</span>
        </button>

        {/* User Full ID Chip */}
        <div 
          className="admin-user-id-chip inspector-chip"
          onClick={() => copyId(currentUser.id)}
          title="Click to copy full User ID"
        >
          <span className="admin-id-tag">User ID:</span>
          <code className="admin-id-full">{currentUser.id}</code>
          <Copy size={13} className="admin-id-copy-icon" />
        </div>

        {/* Badges */}
        <div className="admin-inspector-badges">
          <span className={`admin-role-badge ${currentUser.role === 'ADMIN' ? 'role-admin' : 'role-user'}`}>
            {currentUser.role}
          </span>
          <span className={`admin-status-pill status-${currentUser.status?.toLowerCase()}`}>
            {currentUser.status}
          </span>
          {currentUser.approvalStatus && (
            <span className={`admin-approval-pill status-${currentUser.approvalStatus?.toLowerCase()}`}>
              {currentUser.approvalStatus}
            </span>
          )}
        </div>

        {/* Quick Admin Actions in Header */}
        <div className="admin-inspector-actions">
          {currentUser.approvalStatus !== 'APPROVED' && (
            <button
              type="button"
              onClick={handleApproveRegistration}
              disabled={actionLoading}
              className="admin-btn admin-btn-sm admin-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', fontSize: '13px' }}
              title="Approve user registration"
            >
              <CheckCircle size={16} weight="bold" />
              <span>Approve</span>
            </button>
          )}

          {currentUser.approvalStatus !== 'REJECTED' && currentUser.role !== 'ADMIN' && (
            <button
              type="button"
              onClick={handleRejectRegistration}
              disabled={actionLoading}
              className="admin-btn admin-btn-sm admin-btn-danger"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', fontSize: '13px' }}
              title="Reject user registration"
            >
              <XCircle size={16} weight="bold" />
              <span>Reject</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleVerif}
            disabled={actionLoading}
            className={`admin-verify-toggle-btn ${currentUser.verified ? 'is-verified' : ''}`}
            title={currentUser.verified ? 'Revoke verification badge' : 'Grant verified badge'}
          >
            <SealCheck size={16} weight="fill" />
            <span>{actionLoading ? 'Saving…' : currentUser.verified ? 'Verified' : 'Verify'}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleSusp}
            disabled={actionLoading || currentUser.role === 'ADMIN'}
            className={`admin-suspend-toggle-btn ${currentUser.status === 'SUSPENDED' || currentUser.status === 'DELETED' ? 'is-suspended' : ''}`}
            title={
              currentUser.role === 'ADMIN'
                ? 'Admin accounts cannot be suspended'
                : currentUser.status === 'DELETED'
                ? 'Restore deleted account'
                : currentUser.status === 'SUSPENDED'
                ? 'Restore account'
                : 'Suspend account'
            }
            style={currentUser.role === 'ADMIN' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            {currentUser.status === 'SUSPENDED' || currentUser.status === 'DELETED' ? (
              <>
                <ArrowCounterClockwise size={15} weight="bold" />
                <span>Restore</span>
              </>
            ) : (
              <>
                <Prohibit size={15} weight="bold" />
                <span>Suspend</span>
              </>
            )}
          </button>

          {currentUser.status !== 'DELETED' && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={actionLoading || currentUser.role === 'ADMIN'}
              className="admin-delete-toggle-btn"
              title={
                currentUser.role === 'ADMIN'
                  ? 'Admin accounts cannot be deleted'
                  : 'Mark account as Deleted'
              }
              style={currentUser.role === 'ADMIN' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              <Trash size={15} weight="bold" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {currentUser.hasProfile && resolvedProfile ? (
        <div className="admin-profile-content-wrap">
          <ProfileDetail profile={resolvedProfile} onBack={onBack} />
        </div>
      ) : (
        <div className="admin-incomplete-profile-card">
          <div className="admin-incomplete-header">
            <UserCircle size={64} weight="fill" className="admin-incomplete-avatar" />
            <div>
              <h3 className="admin-incomplete-name font-display">{currentUser.name || 'Anonymous Member'}</h3>
              <p className="admin-incomplete-meta font-ui">
                Registered on {new Date(currentUser.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="admin-incomplete-notice">
            <Warning size={20} weight="fill" className="notice-icon" />
            <div>
              <strong>Profile Onboarding Incomplete</strong>
              <p>
                This member has registered and authenticated via Firebase, but has not completed their dating profile onboarding (photos, story bio, passions, prompts) yet.
              </p>
            </div>
          </div>

          <div className="admin-incomplete-details-grid font-ui">
            <div className="admin-detail-cell">
              <span className="cell-label">Full User ID</span>
              <code className="cell-value">{currentUser.id}</code>
            </div>
            <div className="admin-detail-cell">
              <span className="cell-label">Email Address</span>
              <span className="cell-value">{currentUser.email || 'None on file'}</span>
            </div>
            <div className="admin-detail-cell">
              <span className="cell-label">Phone Number</span>
              <span className="cell-value">{currentUser.phoneNumber || 'None on file'}</span>
            </div>
            <div className="admin-detail-cell">
              <span className="cell-label">Location / City</span>
              <span className="cell-value">{currentUser.city || 'Not provided'}</span>
            </div>
            <div className="admin-detail-cell">
              <span className="cell-label">Account Status</span>
              <span className="cell-value">{currentUser.status}</span>
            </div>
            <div className="admin-detail-cell">
              <span className="cell-label">Verification Status</span>
              <span className="cell-value">{currentUser.verified ? 'Pre-Approved / Verified' : 'Unverified'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Admin Panel Tabs ───
const TABS = [
  { id: 'stats', label: 'Dashboard', icon: ChartBar },
  { id: 'verifications', label: 'Verification Requests', icon: IdentificationBadge },
  { id: 'users', label: 'Users Directory', icon: Users },
  { id: 'pending', label: 'Pending Approvals', icon: Clock },
];

export const AdminPanel = () => {
  const { showAlert, userRole } = useApp();
  const [activeTab, setActiveTab] = useState('stats');
  const [inspectingUser, setInspectingUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUserUpdated = (updatedUser) => {
    setInspectingUser(updatedUser);
    setRefreshKey(k => k + 1);
  };

  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

  if (!isAdmin) {
    return (
      <EmptyState
        icon={<Warning size={48} />}
        title="Access Denied"
        desc="You don't have permission to access the Velvet Hearts Admin Panel."
      />
    );
  }

  if (inspectingUser) {
    return (
      <div className="admin-panel">
        <AdminProfileInspector
          user={inspectingUser}
          onBack={() => {
            setInspectingUser(null);
            setRefreshKey(k => k + 1);
          }}
          onUserUpdated={handleUserUpdated}
          showAlert={showAlert}
        />
        <style>{adminStyles}</style>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <PageHeader 
        title="Admin Control Center" 
        subtitle="Manage user verifications, view registered members, and oversee platform health"
      />

      {/* Luxury Segmented Tab Navigation Rail */}
      <div className="admin-tabs-wrapper">
        <nav className="admin-tabs" role="tablist" aria-label="Admin Navigation">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                className={`admin-tab ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="admin-tab-content" key={refreshKey}>
        {activeTab === 'stats' && <DashboardStatsTab onNavigateTab={setActiveTab} onViewUser={setInspectingUser} showAlert={showAlert} />}
        {activeTab === 'verifications' && <VerificationRequestsTab showAlert={showAlert} onViewUser={setInspectingUser} />}
        {activeTab === 'users' && <UsersDirectoryTab showAlert={showAlert} onViewUser={setInspectingUser} />}
        {activeTab === 'pending' && <PendingUsersTab showAlert={showAlert} onViewUser={setInspectingUser} />}
      </div>

      <style>{adminStyles}</style>
    </div>
  );
};

// ─── 1. DASHBOARD STATS TAB ───
const DashboardStatsTab = ({ onNavigateTab, onViewUser, showAlert }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentPage, setRecentPage] = useState(1);
  const recentPageSize = 5;

  const copyId = (id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id);
      showAlert?.(`Copied User ID: ${id}`, 'info');
    }
  };

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.admin.getStats();
      const statsData = res?.stats ? res : (res?.data || null);
      setStats(statsData);
      setRecentPage(1);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Real-time socket listener: refresh metrics when verification requests are submitted
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewVerification = () => {
      fetchStats();
    };

    socket.on('verification_request_submitted', handleNewVerification);
    return () => {
      socket.off('verification_request_submitted', handleNewVerification);
    };
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="admin-loading">
        <ArrowsClockwise size={28} className="admin-spinner" />
        <span>Loading dashboard metrics…</span>
      </div>
    );
  }

  if (!stats) {
    return <EmptyState icon={<ChartBar size={48} />} title="No Data Available" desc="Unable to load dashboard statistics at this moment." />;
  }

  const statCards = [
    {
      id: 'total',
      label: 'Total Registered',
      value: stats.stats?.totalCount || 0,
      color: '#60a5fa',
      accentBg: 'rgba(96, 165, 250, 0.12)',
      icon: Users,
      onClick: () => onNavigateTab('users'),
    },
    {
      id: 'active',
      label: 'Active Profiles',
      value: stats.stats?.activeCount || 0,
      color: '#4ade80',
      accentBg: 'rgba(74, 222, 128, 0.12)',
      icon: CheckCircle,
      onClick: () => onNavigateTab('users'),
    },
    {
      id: 'verifications',
      label: 'Pending Verifications',
      value: stats.stats?.verificationPendingCount || 0,
      color: '#D4AD6A',
      accentBg: 'rgba(212, 173, 106, 0.14)',
      icon: HourglassMedium,
      onClick: () => onNavigateTab('verifications'),
      badge: (stats.stats?.verificationPendingCount || 0) > 0 ? 'Action Needed' : null,
    },
    {
      id: 'verified',
      label: 'Verified Profiles',
      value: stats.stats?.verifiedCount || 0,
      color: '#B8436A',
      accentBg: 'rgba(184, 67, 106, 0.14)',
      icon: SealCheck,
      onClick: () => onNavigateTab('users'),
    },
    {
      id: 'reports',
      label: 'Open Reports',
      value: stats.stats?.reportsCount || 0,
      color: '#c084fc',
      accentBg: 'rgba(192, 132, 252, 0.12)',
      icon: Warning,
    },
    {
      id: 'suspended',
      label: 'Suspended Accounts',
      value: stats.stats?.suspendedCount || 0,
      color: '#fb923c',
      accentBg: 'rgba(251, 146, 60, 0.12)',
      icon: UserCircle,
    },
  ];

  const recentList = stats.recentRegistrations || [];
  const totalRecentPages = Math.ceil(recentList.length / recentPageSize) || 1;
  const displayedRegistrations = recentList.slice((recentPage - 1) * recentPageSize, recentPage * recentPageSize);

  return (
    <div className="admin-section">
      {/* Metric Cards Grid */}
      <div className="admin-stats-grid">
        {statCards.map((s) => {
          const CardIcon = s.icon;
          return (
            <div
              key={s.id}
              className={`admin-stat-card ${s.onClick ? 'interactive' : ''}`}
              onClick={s.onClick}
              role={s.onClick ? 'button' : undefined}
              tabIndex={s.onClick ? 0 : undefined}
              title={s.onClick ? `View ${s.label}` : undefined}
            >
              <div className="admin-stat-top">
                <div className="admin-stat-icon-wrap" style={{ background: s.accentBg, color: s.color }}>
                  <CardIcon size={18} weight="fill" />
                </div>
                {s.badge && (
                  <span className="admin-stat-pill-badge font-ui">{s.badge}</span>
                )}
              </div>
              <span className="admin-stat-value font-display">{s.value}</span>
              <span className="admin-stat-label font-ui">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Quick Action Bar with App-Styled Buttons */}
      <div className="admin-quick-actions">
        <div className="admin-actions-left">
          <Button
            variant="primary"
            onClick={() => onNavigateTab('verifications')}
            className="admin-action-btn"
          >
            <ShieldCheck size={18} weight="fill" />
            <span>Review Verification Requests</span>
            {(stats.stats?.verificationPendingCount || 0) > 0 && (
              <span className="admin-pill-counter">
                {stats.stats.verificationPendingCount}
              </span>
            )}
          </Button>

          <Button
            variant="secondary"
            onClick={() => onNavigateTab('users')}
            className="admin-action-btn"
          >
            <Users size={18} weight="bold" />
            <span>Browse All Users</span>
            <span className="admin-pill-counter secondary">
              {stats.stats?.totalCount || 0}
            </span>
          </Button>
        </div>

        <div className="admin-actions-right">
          <button
            type="button"
            onClick={fetchStats}
            disabled={loading}
            className="admin-refresh-button font-ui"
            title="Refresh dashboard metrics"
            aria-label="Refresh dashboard metrics"
          >
            <ArrowsClockwise
              size={17}
              weight="bold"
              className={`admin-refresh-icon ${loading ? 'spinning' : ''}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Recent Registrations Table with Pagination */}
      <div className="admin-recent-block">
        <div className="admin-block-header">
          <h3 className="admin-section-heading font-display">Recent Registrations</h3>
          {recentList.length > 0 && (
            <span className="admin-section-count font-ui">{recentList.length} members</span>
          )}
        </div>
        {recentList.length === 0 ? (
          <div className="admin-empty-inline">No registrations found.</div>
        ) : (
          <>
            <div className="admin-recent-table-wrap">
              <table className="admin-recent-table font-ui">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Contact</th>
                    <th>Location</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRegistrations.map((u) => (
                    <tr 
                      key={u.id}
                      className="admin-table-row is-clickable"
                      onClick={() => onViewUser?.(u)}
                      title="Click row to inspect member profile"
                    >
                      <td>
                        <div className="admin-table-user">
                          <div className="admin-table-avatar-wrap">
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt="" className="admin-table-avatar" />
                            ) : (
                              <UserCircle size={32} weight="fill" className="admin-table-avatar-icon" />
                            )}
                            <span className="admin-avatar-hover-hint">
                              <Eye size={12} weight="bold" />
                            </span>
                          </div>
                          <div>
                            <div className="admin-table-name">
                              <span>{u.name || 'Anonymous User'}</span>
                              {u.verified && <VerifiedBadge variant="icon" size="sm" />}
                              <Eye size={13} className="admin-name-view-hint" />
                            </div>
                            <div 
                              className="admin-user-id-chip table-id"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyId(u.id);
                              }}
                              title="Click to copy full User ID"
                            >
                              <span className="admin-id-tag">ID:</span>
                              <code className="admin-id-full">{u.id}</code>
                              <Copy size={11} className="admin-id-copy-icon" />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-table-contact">{u.email || u.phoneNumber || '—'}</span>
                      </td>
                      <td>{u.city || '—'}</td>
                      <td>
                        <span className={`admin-role-badge ${u.role === 'ADMIN' ? 'role-admin' : 'role-user'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-status-pill status-${u.status?.toLowerCase()}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="admin-table-date">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AdminPagination
              page={recentPage}
              totalPages={totalRecentPages}
              totalItems={recentList.length}
              pageSize={recentPageSize}
              onPageChange={setRecentPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

// ─── 2. VERIFICATION REQUESTS TAB ───
const VerificationRequestsTab = ({ showAlert, onViewUser }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [actionLoading, setActionLoading] = useState(null);
  const [notesMap, setNotesMap] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const copyId = (id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id);
      showAlert?.(`Copied User ID: ${id}`, 'info');
    }
  };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.admin.getVerifications(filter || undefined);
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setRequests(list);
      setPage(1);
    } catch (err) {
      console.error('Failed to fetch verification requests:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Real-time socket listener: refresh queue immediately when any user submits a verification scan
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewVerification = () => {
      fetchRequests();
    };

    socket.on('verification_request_submitted', handleNewVerification);
    return () => {
      socket.off('verification_request_submitted', handleNewVerification);
    };
  }, [fetchRequests]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.admin.approveVerification(id, notesMap[id] || '');
      showAlert?.('✅ Verification approved — user profile is now officially verified.', 'success');
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

  const totalPages = Math.ceil(requests.length / pageSize) || 1;
  const paginatedRequests = requests.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="admin-section">
      {/* Filter Row */}
      <div className="admin-filter-bar">
        <div className="admin-filter-row">
          {['PENDING', 'APPROVED', 'REJECTED', ''].map(status => (
            <button
              key={status || 'all'}
              className={`admin-filter-btn ${filter === status ? 'active' : ''}`}
              onClick={() => {
                setFilter(status);
                setPage(1);
              }}
            >
              {status || 'All'}
            </button>
          ))}
        </div>
        {requests.length > 0 && (
          <span className="admin-section-count font-ui">
            {requests.length} {filter ? filter.toLowerCase() : 'total'} request{requests.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="admin-empty-box">
          <EmptyState
            icon={<ShieldCheck size={48} />}
            title="No Verification Requests"
            desc={`There are currently no ${filter?.toLowerCase() || ''} verification requests in the queue. When users fail auto-verification and request manual review, their live selfie submissions will appear here for comparison.`}
          />
        </div>
      ) : (
        <>
          <div className="admin-cards-grid">
            {paginatedRequests.map(req => (
              <div key={req.id} className={`admin-verification-card status-${req.status?.toLowerCase()}`}>
                {/* Card Header */}
                <div className="admin-card-header">
                  <div 
                    className={`admin-card-user-info ${req.user ? 'is-clickable' : ''}`}
                    onClick={() => req.user && onViewUser?.(req.user)}
                    title={req.user ? 'Click to inspect member profile' : undefined}
                  >
                    <div className="admin-card-avatar-wrap">
                      <UserCircle size={36} weight="fill" className="admin-card-avatar" />
                      {req.user && (
                        <span className="admin-avatar-hover-hint">
                          <Eye size={12} weight="bold" />
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="admin-card-name-row">
                        <h4 className="admin-card-name font-display">{req.userName}</h4>
                        {req.user && <Eye size={13} className="admin-name-view-hint" />}
                      </div>
                      <span className="admin-card-meta">{req.userPhone || 'No phone'} • {req.userCity || 'City not set'}</span>
                      <div 
                        className="admin-user-id-chip inline-chip"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyId(req.userId);
                        }}
                        title="Click to copy full User ID"
                      >
                        <span className="admin-id-tag">ID:</span>
                        <code className="admin-id-full">{req.userId}</code>
                        <Copy size={11} className="admin-id-copy-icon" />
                      </div>
                    </div>
                  </div>
                  <span className={`admin-status-badge status-${req.status?.toLowerCase()}`}>
                    {req.status}
                  </span>
                </div>

                {/* Photo Comparison */}
                <div className="admin-photo-compare">
                  <div className="admin-photo-box">
                    <span className="admin-photo-label">Live Camera Selfie</span>
                    <AdminPhotoDisplay
                      src={req.selfieUrl}
                      alt="Live selfie submitted"
                      placeholderText="No user image added yet"
                    />
                  </div>
                  <div className="admin-photo-box">
                    <span className="admin-photo-label">Current Profile Photo</span>
                    <AdminPhotoDisplay
                      src={req.referenceUrl || req.profilePhotos?.[0]}
                      alt="Profile reference"
                      placeholderText="No profile photo"
                    />
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
                        <span className="admin-photo-label">All Profile Photos ({req.profilePhotos.length})</span>
                        <div className="admin-photos-row">
                          {req.profilePhotos.map((url, idx) => (
                            <img key={idx} src={url} alt={`Profile ${idx + 1}`} className="admin-photo-thumb" loading="lazy" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Area (only if PENDING) */}
                {req.status === 'PENDING' && (
                  <div className="admin-card-actions">
                    <input
                      type="text"
                      placeholder="Admin review notes (optional)…"
                      className="admin-notes-input"
                      value={notesMap[req.id] || ''}
                      onChange={e => setNotesMap({ ...notesMap, [req.id]: e.target.value })}
                    />
                    <div className="admin-action-buttons">
                      <Button
                        variant="primary"
                        onClick={() => handleApprove(req.id)}
                        disabled={actionLoading === req.id}
                        className="admin-approve-btn"
                      >
                        <CheckCircle size={18} weight="bold" />
                        <span>{actionLoading === req.id ? 'Authorizing…' : 'Approve & Verify'}</span>
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

          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={requests.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

// ─── 3. USERS DIRECTORY TAB ───
const UsersDirectoryTab = ({ showAlert: propShowAlert, onViewUser }) => {
  const { showAlert: appShowAlert, showConfirm } = useApp();
  const showAlert = propShowAlert || appShowAlert;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('');
  const [profileFilter, setProfileFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [dirStats, setDirStats] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const pageSize = 10;

  const copyId = (id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id);
      showAlert?.(`Copied User ID: ${id}`, 'info');
    }
  };

  const fetchDirStats = useCallback(async () => {
    try {
      const stats = await api.admin.getDashboardStats();
      const st = stats?.data || stats;
      if (st) setDirStats(st);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.admin.getUsers({
        searchQuery: search,
        role: roleFilter,
        status: statusFilter,
        approvalStatus: approvalFilter,
        profileStatus: profileFilter,
        page,
        limit: pageSize,
      });

      const userList = res?.data?.users || res?.users || [];
      const pagination = res?.data?.pagination || res?.pagination || {};

      setUsers(userList);
      setTotalPages(pagination.pages || 1);
      setTotalUsers(pagination.total || userList.length);
    } catch (err) {
      console.error('Failed to fetch users directory:', err);
      showAlert?.(err?.message || 'Failed to fetch users list.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, approvalFilter, profileFilter, page, showAlert]);

  useEffect(() => {
    fetchUsers();
    fetchDirStats();
  }, [fetchUsers, fetchDirStats]);

  // Real-time listener: refresh directory when any member completes onboarding
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleOnboardingCompleted = () => {
      fetchUsers();
      fetchDirStats();
    };

    socket.on('profile_onboarding_completed', handleOnboardingCompleted);
    return () => {
      socket.off('profile_onboarding_completed', handleOnboardingCompleted);
    };
  }, [fetchUsers, fetchDirStats]);

  const handleToggleVerification = async (user) => {
    const userId = user.id;
    const currentVerified = user.verified;
    setActionLoading(userId);
    try {
      const nextState = !currentVerified;
      await api.admin.toggleUserVerification(userId, nextState);
      setUsers(prev => prev.map(u => u.id === userId ? {
        ...u,
        verified: nextState,
        profile: u.profile ? { ...u.profile, verified: nextState } : null
      } : u));

      if (!user.hasProfile && nextState) {
        showAlert?.(
          `Pre-approved verification for ${user.name || 'user'}! Badge will automatically activate once profile onboarding is completed.`,
          'success'
        );
      } else {
        showAlert?.(`User verification status changed to ${nextState ? 'VERIFIED' : 'UNVERIFIED'}.`, 'success');
      }
      fetchUsers();
      fetchDirStats();
    } catch (err) {
      showAlert?.(err?.response?.data?.message || 'Failed to update verification status.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleSuspend = async (user) => {
    if (user.role === 'ADMIN') {
      showAlert?.('Admin accounts cannot be suspended.', 'error');
      return;
    }
    const userId = user.id;
    const currentStatus = user.status;
    setActionLoading(userId);
    try {
      if (currentStatus === 'SUSPENDED' || currentStatus === 'DELETED') {
        await api.admin.restoreUser(userId);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'ACTIVE' } : u));
        showAlert?.('User account restored successfully.', 'success');
      } else {
        await api.admin.suspendUser(userId);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'SUSPENDED' } : u));
        showAlert?.('User account suspended.', 'info');
      }
      fetchUsers();
      fetchDirStats();
    } catch (err) {
      showAlert?.(err?.response?.data?.message || err?.message || 'Failed to update account status.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveRegistration = async (userId) => {
    setActionLoading(userId);
    try {
      await api.admin.approve(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, approvalStatus: 'APPROVED' } : u));
      showAlert?.('User registration approved.', 'success');
      fetchUsers();
      fetchDirStats();
    } catch (err) {
      showAlert?.(err?.response?.data?.message || err?.message || 'Failed to approve registration.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.role === 'ADMIN') {
      showAlert?.('Admin accounts cannot be deleted.', 'error');
      return;
    }
    const userId = user.id;
    const userName = user.name;
    const confirmed = await showConfirm({
      title: 'Confirm Account Deletion',
      message: `Are you sure you want to mark the account for "${userName || 'this user'}" as DELETED? The account will be deactivated and moved to Deleted accounts.`,
      okText: 'Delete Account',
      cancelText: 'Keep Account',
      variant: 'danger',
    });
    if (!confirmed) {
      return;
    }
    setActionLoading(userId);
    try {
      await api.admin.deleteUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'DELETED' } : u));
      showAlert?.('User account marked as deleted.', 'info');
      fetchUsers();
      fetchDirStats();
    } catch (err) {
      showAlert?.(err?.response?.data?.message || err?.message || 'Failed to delete user account.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const isFilterActive = Boolean(search || roleFilter || statusFilter || approvalFilter || profileFilter);

  const handleClearFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setApprovalFilter('');
    setProfileFilter('');
    setPage(1);
  };

  return (
    <div className="admin-section">
      {/* Search & Filters Toolbar */}
      <div className="admin-user-toolbar">
        <div className="admin-search-input-wrap">
          <MagnifyingGlass size={18} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search by name, User ID, email, or phone…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="admin-search-input"
          />
        </div>

        <div className="admin-filter-selects">
          <select 
            value={profileFilter} 
            onChange={(e) => {
              setProfileFilter(e.target.value);
              setPage(1);
            }} 
            className="admin-select-filter"
            title="Filter by Profile Completion"
          >
            <option value="">All Profiles {dirStats?.totalCount !== undefined ? `(${dirStats.totalCount})` : ''}</option>
            <option value="COMPLETED">Completed Profiles {dirStats?.completedProfileCount !== undefined ? `(${dirStats.completedProfileCount})` : ''}</option>
            <option value="INCOMPLETE">Incomplete Profiles {dirStats?.incompleteProfileCount !== undefined ? `(${dirStats.incompleteProfileCount})` : ''}</option>
          </select>

          <select 
            value={roleFilter} 
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }} 
            className="admin-select-filter"
            title="Filter by Role"
          >
            <option value="">All Roles {dirStats?.totalCount !== undefined ? `(${dirStats.totalCount})` : ''}</option>
            <option value="USER">Standard Users {dirStats?.userCount !== undefined ? `(${dirStats.userCount})` : ''}</option>
            <option value="ADMIN">Admins {dirStats?.adminCount !== undefined ? `(${dirStats.adminCount})` : ''}</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }} 
            className="admin-select-filter"
            title="Filter by Account Status"
          >
            <option value="">All Statuses {dirStats?.totalCount !== undefined ? `(${dirStats.totalCount})` : ''}</option>
            <option value="ACTIVE">Active {dirStats?.activeCount !== undefined ? `(${dirStats.activeCount})` : ''}</option>
            <option value="SUSPENDED">Suspended {dirStats?.suspendedCount !== undefined ? `(${dirStats.suspendedCount})` : ''}</option>
            <option value="DELETED">Deleted {dirStats?.deletedCount !== undefined ? `(${dirStats.deletedCount})` : ''}</option>
          </select>

          <select 
            value={approvalFilter} 
            onChange={(e) => {
              setApprovalFilter(e.target.value);
              setPage(1);
            }} 
            className="admin-select-filter"
            title="Filter by Registration Approval"
          >
            <option value="">All Approvals {dirStats?.totalCount !== undefined ? `(${dirStats.totalCount})` : ''}</option>
            <option value="APPROVED">Approved {dirStats?.approvedCount !== undefined ? `(${dirStats.approvedCount})` : ''}</option>
            <option value="PENDING">Pending {dirStats?.pendingCount !== undefined ? `(${dirStats.pendingCount})` : ''}</option>
            <option value="REJECTED">Rejected {dirStats?.rejectedCount !== undefined ? `(${dirStats.rejectedCount})` : ''}</option>
          </select>

          {isFilterActive && (
            <button
              type="button"
              className="admin-clear-filter-btn"
              onClick={handleClearFilters}
              title="Reset all filters"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <ArrowsClockwise size={28} className="admin-spinner" />
          <span>Loading users…</span>
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={<Users size={48} />}
          title={
            profileFilter === 'INCOMPLETE'
              ? 'No Incomplete Profiles'
              : profileFilter === 'COMPLETED'
              ? 'No Completed Profiles'
              : statusFilter === 'SUSPENDED'
              ? 'No Suspended Accounts'
              : statusFilter === 'DELETED'
              ? 'No Deleted Accounts'
              : approvalFilter === 'PENDING'
              ? 'No Pending Approvals'
              : approvalFilter === 'REJECTED'
              ? 'No Rejected Registrations'
              : search
              ? 'No Matching Accounts'
              : 'No Users Found'
          }
          desc={
            profileFilter === 'INCOMPLETE'
              ? 'All registered members have finished their dating profile onboarding!'
              : profileFilter === 'COMPLETED'
              ? 'No accounts matching the criteria have completed onboarding yet.'
              : statusFilter === 'SUSPENDED'
              ? `There are currently 0 suspended accounts. All ${dirStats?.activeCount || totalUsers || 'active'} members are in good standing.`
              : statusFilter === 'DELETED'
              ? 'There are currently 0 deleted accounts in the database.'
              : approvalFilter === 'PENDING'
              ? 'All registered users are already approved. There are 0 pending registration reviews.'
              : approvalFilter === 'REJECTED'
              ? 'There are currently 0 rejected user registrations.'
              : search
              ? `No user accounts matched "${search}". Try searching by a different name, User ID, email, or phone number.`
              : 'No accounts matched the selected filter criteria.'
          }
          action={
            isFilterActive ? (
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={handleClearFilters}
                style={{ marginTop: '8px' }}
              >
                Clear All Filters
              </button>
            ) : null
          }
        />
      ) : (
        <>
          <div className="admin-users-list">
            {users.map(u => (
              <div key={u.id} className="admin-user-row">
                <div 
                  className="admin-user-row-main is-clickable"
                  onClick={() => onViewUser?.(u)}
                  title="Click to inspect full member profile"
                >
                  <div className="admin-user-avatar-wrap">
                    {u.photos?.[0] ? (
                      <img src={u.photos[0]} alt="" className="admin-user-avatar" />
                    ) : (
                      <UserCircle size={44} weight="fill" className="admin-user-avatar-icon" />
                    )}
                    <span className="admin-avatar-hover-hint">
                      <Eye size={14} weight="bold" />
                    </span>
                  </div>
                  <div className="admin-user-info-col">
                    <div className="admin-user-name-line">
                      <span className="admin-user-name font-display">{u.name || 'Anonymous Member'}</span>
                      <Eye size={14} className="admin-name-view-hint" />
                      {u.verified && <VerifiedBadge variant="pill" size="sm" />}
                    </div>

                    <div className="admin-user-badges-row">
                      {!u.hasProfile && (
                        <span 
                          className="admin-onboarding-pill" 
                          title="User authenticated via OAuth/Phone, but dating profile onboarding is not yet completed"
                        >
                          Profile Incomplete
                        </span>
                      )}
                      <span className={`admin-role-badge ${u.role === 'ADMIN' ? 'role-admin' : 'role-user'}`}>
                        {u.role}
                      </span>
                      <span className={`admin-status-pill status-${u.status?.toLowerCase()}`}>
                        {u.status}
                      </span>
                      {u.approvalStatus && (
                        <span className={`admin-approval-pill status-${u.approvalStatus?.toLowerCase()}`}>
                          {u.approvalStatus}
                        </span>
                      )}
                    </div>

                    <div className="admin-user-subline font-ui">
                      <span>{u.email || u.phoneNumber || 'No contact on file'}</span>
                      <span> • {u.city || 'Location not set'}</span>
                      <span> • Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div 
                      className="admin-user-id-chip inline-chip"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyId(u.id);
                      }}
                      title={`Click to copy full User ID: ${u.id}`}
                    >
                      <span className="admin-id-tag">ID:</span>
                      <code className="admin-id-full">{u.id}</code>
                      <Copy size={12} className="admin-id-copy-icon" />
                    </div>
                  </div>
                </div>

                {/* Row Action Controls */}
                <div className="admin-user-row-actions">
                  {u.approvalStatus === 'PENDING' && (
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm admin-btn-primary"
                      onClick={() => handleApproveRegistration(u.id)}
                      disabled={actionLoading === u.id}
                      style={{ padding: '4px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      title="Approve user registration"
                    >
                      <CheckCircle size={15} weight="bold" />
                      <span>Approve</span>
                    </button>
                  )}

                  <button
                    className={`admin-verify-toggle-btn ${u.verified ? 'is-verified' : ''}`}
                    onClick={() => handleToggleVerification(u)}
                    disabled={actionLoading === u.id}
                    title={u.verified ? 'Revoke verification badge' : 'Grant verified badge'}
                  >
                    <SealCheck size={17} weight="fill" />
                    <span>{actionLoading === u.id ? 'Saving…' : u.verified ? 'Verified' : 'Verify'}</span>
                  </button>

                  <button
                    className={`admin-suspend-toggle-btn ${u.status === 'SUSPENDED' || u.status === 'DELETED' ? 'is-suspended' : ''}`}
                    onClick={() => handleToggleSuspend(u)}
                    disabled={actionLoading === u.id || u.role === 'ADMIN'}
                    title={
                      u.role === 'ADMIN'
                        ? 'Admin accounts cannot be suspended'
                        : u.status === 'DELETED'
                        ? 'Restore deleted account'
                        : u.status === 'SUSPENDED'
                        ? 'Restore suspended account'
                        : 'Suspend user account'
                    }
                    style={u.role === 'ADMIN' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  >
                    {u.status === 'SUSPENDED' || u.status === 'DELETED' ? (
                      <>
                        <ArrowCounterClockwise size={16} weight="bold" />
                        <span>Restore</span>
                      </>
                    ) : (
                      <>
                        <Prohibit size={16} weight="bold" />
                        <span>Suspend</span>
                      </>
                    )}
                  </button>

                  {u.status !== 'DELETED' && (
                    <button
                      className="admin-delete-toggle-btn"
                      onClick={() => handleDeleteUser(u)}
                      disabled={actionLoading === u.id || u.role === 'ADMIN'}
                      title={
                        u.role === 'ADMIN'
                          ? 'Admin accounts cannot be deleted'
                          : 'Mark user account as Deleted'
                      }
                      style={u.role === 'ADMIN' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      <Trash size={16} weight="bold" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalUsers}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

// ─── 4. PENDING APPROVALS TAB ───
const PendingUsersTab = ({ showAlert, onViewUser }) => {
  const [subTab, setSubTab] = useState('verifications'); // 'verifications' | 'registrations'
  const [queue, setQueue] = useState([]);
  const [verificationsQueue, setVerificationsQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [notesMap, setNotesMap] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);

  const copyId = (id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id);
      showAlert?.(`Copied User ID: ${id}`, 'info');
    }
  };

  // Pagination for both sub-queues
  const [verifPage, setVerifPage] = useState(1);
  const [regPage, setRegPage] = useState(1);
  const pageSize = 6;

  const fetchAllPending = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingRes, verifRes] = await Promise.all([
        api.admin.getPending().catch(err => {
          console.error('Failed to fetch pending registrations:', err);
          return [];
        }),
        api.admin.getVerifications('PENDING').catch(err => {
          console.error('Failed to fetch pending verifications:', err);
          return [];
        }),
      ]);

      const pendingList = Array.isArray(pendingRes) ? pendingRes : (Array.isArray(pendingRes?.data) ? pendingRes.data : []);
      const verifList = Array.isArray(verifRes) ? verifRes : (Array.isArray(verifRes?.data) ? verifRes.data : []);

      setQueue(pendingList);
      setVerificationsQueue(verifList);

      // Auto-focus on whichever queue has items waiting
      if (verifList.length > 0 && pendingList.length === 0) {
        setSubTab('verifications');
      } else if (pendingList.length > 0 && verifList.length === 0) {
        setSubTab('registrations');
      }
    } catch (err) {
      console.error('Failed to fetch pending approvals:', err);
      showAlert?.('Failed to load pending approvals.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchAllPending();
  }, [fetchAllPending]);

  // Real-time socket listener: refresh pending queue when new verification requests or registrations arrive
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewPending = () => {
      fetchAllPending();
    };

    socket.on('verification_request_submitted', handleNewPending);
    socket.on('profile_onboarding_completed', handleNewPending);
    return () => {
      socket.off('verification_request_submitted', handleNewPending);
      socket.off('profile_onboarding_completed', handleNewPending);
    };
  }, [fetchAllPending]);

  // Handle User Registration Approvals
  const handleApproveUser = async (userId) => {
    setActionLoading(userId);
    try {
      await api.admin.approve(userId);
      showAlert?.('✅ User registration approved.', 'success');
      fetchAllPending();
    } catch (err) {
      showAlert?.('Failed to approve user.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectUser = async (userId) => {
    setActionLoading(userId);
    try {
      await api.admin.reject(userId);
      showAlert?.('❌ User rejected.', 'info');
      fetchAllPending();
    } catch (err) {
      showAlert?.('Failed to reject user.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Photo Verification Approvals
  const handleApproveVerification = async (id) => {
    setActionLoading(id);
    try {
      await api.admin.approveVerification(id, notesMap[id] || '');
      showAlert?.('✅ Verification approved — user profile is now officially verified.', 'success');
      fetchAllPending();
    } catch (err) {
      showAlert?.('Failed to approve verification.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectVerification = async (id) => {
    setActionLoading(id);
    try {
      await api.admin.rejectVerification(id, notesMap[id] || '');
      showAlert?.('❌ Verification request rejected.', 'info');
      fetchAllPending();
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
        <span>Loading pending approvals queue…</span>
      </div>
    );
  }

  const verifTotalPages = Math.ceil(verificationsQueue.length / pageSize) || 1;
  const displayedVerifications = verificationsQueue.slice((verifPage - 1) * pageSize, verifPage * pageSize);

  const regTotalPages = Math.ceil(queue.length / pageSize) || 1;
  const displayedRegistrations = queue.slice((regPage - 1) * pageSize, regPage * pageSize);

  return (
    <div className="admin-section">
      {/* Pending Queue Sub-Tabs Selector */}
      <div className="admin-subtabs-row">
        <button
          type="button"
          className={`admin-subtab-btn ${subTab === 'verifications' ? 'active' : ''}`}
          onClick={() => setSubTab('verifications')}
        >
          <ShieldCheck size={18} weight={subTab === 'verifications' ? 'fill' : 'regular'} />
          <span>Photo Verifications</span>
          <span className={`admin-pill-counter ${subTab === 'verifications' ? '' : 'secondary'}`}>
            {verificationsQueue.length}
          </span>
        </button>

        <button
          type="button"
          className={`admin-subtab-btn ${subTab === 'registrations' ? 'active' : ''}`}
          onClick={() => setSubTab('registrations')}
        >
          <Users size={18} weight={subTab === 'registrations' ? 'fill' : 'regular'} />
          <span>User Registrations</span>
          <span className={`admin-pill-counter ${subTab === 'registrations' ? '' : 'secondary'}`}>
            {queue.length}
          </span>
        </button>
      </div>

      {/* SUBTAB 1: Photo Verifications Queue */}
      {subTab === 'verifications' && (
        <>
          {verificationsQueue.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck size={48} />}
              title="No Pending Verification Requests"
              desc="All member identity verifications are currently up to date."
            />
          ) : (
            <>
              <div className="admin-cards-grid">
                {displayedVerifications.map(req => (
                  <div key={req.id} className="admin-verification-card status-pending">
                    <div className="admin-card-header">
                      <div 
                        className={`admin-card-user-info ${req.user ? 'is-clickable' : ''}`}
                        onClick={() => req.user && onViewUser?.(req.user)}
                        title={req.user ? 'Click to inspect member profile' : undefined}
                      >
                        <div className="admin-card-avatar-wrap">
                          <UserCircle size={36} weight="fill" className="admin-card-avatar" />
                          {req.user && (
                            <span className="admin-avatar-hover-hint">
                              <Eye size={12} weight="bold" />
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="admin-card-name-row">
                            <h4 className="admin-card-name font-display">{req.userName}</h4>
                            {req.user && <Eye size={13} className="admin-name-view-hint" />}
                          </div>
                          <span className="admin-card-meta">{req.userPhone || 'No phone'} • {req.userCity || 'City not set'}</span>
                          <div 
                            className="admin-user-id-chip inline-chip"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyId(req.userId);
                            }}
                            title="Click to copy full User ID"
                          >
                            <span className="admin-id-tag">ID:</span>
                            <code className="admin-id-full">{req.userId}</code>
                            <Copy size={11} className="admin-id-copy-icon" />
                          </div>
                        </div>
                      </div>
                      <span className="admin-status-badge status-pending">PENDING</span>
                    </div>

                    <div className="admin-photo-compare">
                      <div className="admin-photo-box">
                        <span className="admin-photo-label">Live Camera Selfie</span>
                        <AdminPhotoDisplay
                          src={req.selfieUrl}
                          alt="Selfie submitted"
                          placeholderText="No user image added yet"
                        />
                      </div>
                      <div className="admin-photo-box">
                        <span className="admin-photo-label">Current Profile Photo</span>
                        <AdminPhotoDisplay
                          src={req.referenceUrl || req.profilePhotos?.[0]}
                          alt="Reference"
                          placeholderText="No profile photo"
                        />
                      </div>
                    </div>

                    {req.autoFailReason && (
                      <div className="admin-fail-reason">
                        <Warning size={16} weight="fill" />
                        <span>{req.autoFailReason}</span>
                      </div>
                    )}

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
                        {req.profilePhotos?.length > 1 && (
                          <div className="admin-all-photos">
                            <span className="admin-photo-label">All Profile Photos ({req.profilePhotos.length})</span>
                            <div className="admin-photos-row">
                              {req.profilePhotos.map((url, idx) => (
                                <img key={idx} src={url} alt={`Profile ${idx + 1}`} className="admin-photo-thumb" loading="lazy" />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="admin-card-actions">
                      <input
                        type="text"
                        placeholder="Admin review notes (optional)…"
                        className="admin-notes-input"
                        value={notesMap[req.id] || ''}
                        onChange={e => setNotesMap({ ...notesMap, [req.id]: e.target.value })}
                      />
                      <div className="admin-action-buttons">
                        <Button
                          variant="primary"
                          onClick={() => handleApproveVerification(req.id)}
                          disabled={actionLoading === req.id}
                          className="admin-approve-btn"
                        >
                          <CheckCircle size={18} weight="bold" />
                          <span>{actionLoading === req.id ? 'Authorizing…' : 'Approve & Verify'}</span>
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleRejectVerification(req.id)}
                          disabled={actionLoading === req.id}
                          className="admin-reject-btn"
                        >
                          <XCircle size={18} weight="bold" />
                          <span>Reject</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <AdminPagination
                page={verifPage}
                totalPages={verifTotalPages}
                totalItems={verificationsQueue.length}
                pageSize={pageSize}
                onPageChange={setVerifPage}
              />
            </>
          )}
        </>
      )}

      {/* SUBTAB 2: User Registrations Queue */}
      {subTab === 'registrations' && (
        <>
          {queue.length === 0 ? (
            <EmptyState
              icon={<Users size={48} />}
              title="No Pending Registrations"
              desc="All user registrations have been approved and are active on Velvet Hearts."
            />
          ) : (
            <>
              <div className="admin-cards-grid">
                {displayedRegistrations.map(user => (
                  <div key={user.userId || user.id} className="admin-user-card">
                    <div className="admin-card-header">
                      <div 
                        className="admin-card-user-info is-clickable"
                        onClick={() => onViewUser?.(user)}
                        title="Click to inspect member profile"
                      >
                        <div className="admin-card-avatar-wrap">
                          {user.photos?.[0] ? (
                            <img src={user.photos[0]} alt="" className="admin-user-avatar" />
                          ) : (
                            <UserCircle size={36} weight="fill" className="admin-card-avatar" />
                          )}
                          <span className="admin-avatar-hover-hint">
                            <Eye size={12} weight="bold" />
                          </span>
                        </div>
                        <div>
                          <div className="admin-card-name-row">
                            <h4 className="admin-card-name font-display">{user.name || 'Unnamed'}</h4>
                            <Eye size={13} className="admin-name-view-hint" />
                          </div>
                          <span className="admin-card-meta">{user.phoneNumber || user.email || 'No contact'} • {user.city || 'Unknown'}</span>
                          <div 
                            className="admin-user-id-chip inline-chip"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyId(user.userId || user.id);
                            }}
                            title="Click to copy full User ID"
                          >
                            <span className="admin-id-tag">ID:</span>
                            <code className="admin-id-full">{user.userId || user.id}</code>
                            <Copy size={11} className="admin-id-copy-icon" />
                          </div>
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
                        onClick={() => handleApproveUser(user.userId)}
                        disabled={actionLoading === user.userId}
                        className="admin-approve-btn"
                      >
                        <CheckCircle size={18} weight="bold" />
                        <span>{actionLoading === user.userId ? 'Processing…' : 'Approve'}</span>
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleRejectUser(user.userId)}
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

              <AdminPagination
                page={regPage}
                totalPages={regTotalPages}
                totalItems={queue.length}
                pageSize={pageSize}
                onPageChange={setRegPage}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

// ─── STYLES ───
const adminStyles = `
  .admin-panel {
    padding: var(--space-4);
    max-width: 1060px;
    margin: 0 auto;
    color: var(--text-primary);
    box-sizing: border-box;
    width: 100%;
    overflow-x: hidden;
  }

  .admin-tabs-wrapper {
    margin-bottom: var(--space-6);
    display: flex;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 4px;
    scrollbar-width: none;
    -ms-overflow-style: none;
    max-width: 100%;
    box-sizing: border-box;
  }

  .admin-tabs-wrapper::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }

  .admin-tabs {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px;
    background: var(--bg-surface-elevated, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
    border-radius: var(--radius-full, 9999px);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
  }

  [data-theme="dark"] .admin-tabs {
    background: rgba(28, 20, 24, 0.7);
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
  }

  .admin-tab {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 18px;
    border-radius: var(--radius-full, 9999px);
    color: var(--text-secondary);
    font-family: var(--font-ui);
    font-weight: 600;
    font-size: var(--text-body-sm, 13px);
    white-space: nowrap;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;
  }

  .admin-tab:hover {
    color: var(--text-primary);
    background: rgba(184, 67, 106, 0.08);
  }

  [data-theme="dark"] .admin-tab:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.06);
  }

  .admin-tab.active {
    background: linear-gradient(135deg, var(--burgundy-500, #B8436A) 0%, var(--burgundy-700, #8A2548) 100%);
    color: #FFFFFF !important;
    border-color: rgba(255, 255, 255, 0.18);
    box-shadow: 0 4px 14px rgba(184, 67, 106, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.22);
  }

  [data-theme="dark"] .admin-tab.active {
    background: linear-gradient(135deg, #B8436A 0%, #7A1D3A 100%);
    color: #FFFFFF !important;
    border-color: rgba(212, 173, 106, 0.35);
    box-shadow: 0 4px 16px rgba(184, 67, 106, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25);
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

  .admin-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
    gap: 14px;
    margin-bottom: var(--space-6);
  }

  .admin-stat-card {
    position: relative;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl, 18px);
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: var(--shadow-sm);
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
  }

  .admin-stat-card.interactive {
    cursor: pointer;
  }

  [data-theme="dark"] .admin-stat-card {
    background: linear-gradient(160deg, rgba(32, 22, 27, 0.85) 0%, rgba(20, 15, 18, 0.95) 100%);
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }

  .admin-stat-card.interactive:hover {
    transform: translateY(-3px);
    border-color: rgba(184, 67, 106, 0.35);
    box-shadow: 0 10px 26px rgba(0, 0, 0, 0.12), 0 0 20px rgba(184, 67, 106, 0.12);
  }

  [data-theme="dark"] .admin-stat-card.interactive:hover {
    border-color: rgba(212, 173, 106, 0.35);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6), 0 0 24px rgba(184, 67, 106, 0.25);
  }

  .admin-stat-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .admin-stat-icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
  }

  .admin-stat-card:hover .admin-stat-icon-wrap {
    transform: scale(1.08);
  }

  .admin-stat-value {
    font-family: var(--font-display);
    font-size: 2.1rem;
    font-weight: 700;
    line-height: 1.1;
    color: var(--text-primary);
    margin: 2px 0 0;
  }

  .admin-stat-label {
    font-family: var(--font-ui);
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .admin-stat-pill-badge {
    font-family: var(--font-ui);
    font-size: 10px;
    font-weight: 700;
    color: #D4AD6A;
    background: rgba(212, 173, 106, 0.16);
    border: 1px solid rgba(212, 173, 106, 0.35);
    padding: 2px 8px;
    border-radius: 9999px;
    letter-spacing: 0.02em;
    animation: adminBadgePulse 2s infinite;
  }

  @keyframes adminBadgePulse {
    0% { box-shadow: 0 0 0 0 rgba(212, 173, 106, 0.5); }
    70% { box-shadow: 0 0 0 6px rgba(212, 173, 106, 0); }
    100% { box-shadow: 0 0 0 0 rgba(212, 173, 106, 0); }
  }

  .admin-quick-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: var(--space-6);
    flex-wrap: wrap;
  }

  .admin-actions-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .admin-actions-right {
    margin-left: auto;
    display: flex;
    align-items: center;
  }

  .admin-pill-counter {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.22);
    color: #FFFFFF;
    font-size: 11px;
    font-weight: 700;
    margin-left: 4px;
    line-height: 1.2;
  }

  .admin-pill-counter.secondary {
    background: rgba(184, 67, 106, 0.15);
    color: var(--burgundy-500, #B8436A);
  }

  [data-theme="dark"] .admin-pill-counter.secondary {
    background: rgba(212, 173, 106, 0.18);
    color: #D4AD6A;
  }

  /* Velvet Hearts Luxury Refresh Button */
  .admin-refresh-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 18px;
    height: 42px;
    border-radius: var(--radius-full, 9999px);
    background: var(--bg-surface, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--border-default, rgba(255, 255, 255, 0.12));
    color: var(--text-primary);
    font-family: var(--font-ui);
    font-size: var(--text-body-sm, 13px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  [data-theme="dark"] .admin-refresh-button {
    background: rgba(36, 26, 30, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .admin-refresh-button:hover:not(:disabled) {
    background: rgba(184, 67, 106, 0.14);
    border-color: rgba(184, 67, 106, 0.5);
    color: var(--rose-400, #F0A0AD);
    transform: translateY(-1.5px);
    box-shadow: 0 6px 16px rgba(184, 67, 106, 0.3);
  }

  [data-theme="dark"] .admin-refresh-button:hover:not(:disabled) {
    background: rgba(184, 67, 106, 0.22);
    border-color: rgba(212, 173, 106, 0.45);
    color: #FFFFFF;
    box-shadow: 0 6px 20px rgba(184, 67, 106, 0.4);
  }

  .admin-refresh-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .admin-refresh-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .admin-refresh-icon.spinning {
    animation: adminSpin 0.75s linear infinite;
  }

  @keyframes adminSpin {
    to { transform: rotate(360deg); }
  }

  .admin-section-heading {
    font-size: var(--text-heading-sm);
    color: var(--text-primary);
    margin-bottom: var(--space-3);
  }

  .admin-recent-table-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    background: var(--bg-surface);
    box-shadow: var(--shadow-sm);
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .admin-recent-table-wrap::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }

  .admin-recent-table {
    width: 100%;
    min-width: 680px;
    border-collapse: collapse;
    font-size: var(--text-body-sm);
    text-align: left;
  }

  .admin-recent-table th,
  .admin-recent-table td {
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--border-subtle);
    vertical-align: middle;
    color: var(--text-primary);
    white-space: nowrap;
  }

  .admin-recent-table tr:last-child td {
    border-bottom: none;
  }

  .admin-recent-table tr:hover td {
    background: rgba(184, 67, 106, 0.04);
  }

  .admin-table-user {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-width: 230px;
    white-space: nowrap;
  }

  .admin-table-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    object-fit: cover;
    border: 1.5px solid var(--border-subtle);
  }

  .admin-table-avatar-icon {
    color: var(--text-muted);
  }

  .admin-table-name {
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  .admin-table-id {
    font-size: 0.72rem;
    color: var(--text-muted);
  }

  .admin-table-contact {
    color: var(--text-secondary);
    font-size: var(--text-caption);
    font-weight: 500;
  }

  .admin-table-date {
    color: var(--text-muted);
    font-size: var(--text-caption);
    white-space: nowrap;
  }

  .admin-role-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: var(--radius-full);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.03em;
  }

  .admin-role-badge.role-admin {
    background: rgba(184, 67, 106, 0.2);
    color: #b8436a;
    border: 1px solid rgba(184, 67, 106, 0.4);
  }

  [data-theme="dark"] .admin-role-badge.role-admin {
    background: rgba(184, 67, 106, 0.3);
    color: #f0bdc8;
    border-color: #d4ad6a;
  }

  .admin-role-badge.role-user {
    background: var(--bg-muted);
    color: var(--text-secondary);
  }

  .admin-status-pill {
    display: inline-block;
    padding: 3px 10px;
    border-radius: var(--radius-full);
    font-size: 0.72rem;
    font-weight: 700;
  }

  .admin-status-pill.status-active {
    background: rgba(74, 222, 128, 0.15);
    color: #16a34a;
    border: 1px solid rgba(74, 222, 128, 0.3);
  }

  [data-theme="dark"] .admin-status-pill.status-active {
    color: #4ade80;
  }

  .admin-status-pill.status-suspended {
    background: rgba(251, 146, 60, 0.15);
    color: #ea580c;
    border: 1px solid rgba(251, 146, 60, 0.3);
  }

  /* Filter bar */
  .admin-filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
    flex-wrap: wrap;
  }

  .admin-filter-row {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .admin-filter-btn {
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    font-size: var(--text-caption);
    font-family: var(--font-ui);
    font-weight: 600;
    color: var(--text-secondary);
    border: 1.5px solid var(--border-subtle);
    background: var(--bg-surface);
    cursor: pointer;
    transition: all var(--duration-fast);
    text-transform: capitalize;
  }

  .admin-filter-btn:hover {
    background-color: var(--bg-muted);
    color: var(--text-primary);
    border-color: var(--border-default);
  }

  .admin-filter-btn.active {
    background-color: var(--burgundy-500);
    color: #FFFFFF !important;
    border-color: var(--burgundy-500);
    box-shadow: 0 2px 8px rgba(184, 67, 106, 0.3);
  }

  /* Cards Grid */
  .admin-cards-grid {
    display: grid;
    gap: var(--space-4);
  }

  .admin-verification-card,
  .admin-user-card {
    background-color: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
    box-shadow: var(--shadow-sm);
    transition: all var(--duration-fast);
  }

  .admin-verification-card:hover,
  .admin-user-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }

  .admin-verification-card.status-approved {
    border-left: 4px solid #16a34a;
  }
  .admin-verification-card.status-rejected {
    border-left: 4px solid #ef4444;
  }
  .admin-verification-card.status-pending {
    border-left: 4px solid #D4AD6A;
  }

  .admin-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-3);
  }

  .admin-card-user-info {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .admin-card-avatar {
    color: var(--text-accent);
  }

  .admin-card-name {
    font-size: var(--text-body);
    font-weight: 600;
    color: var(--text-primary);
  }

  .admin-card-meta {
    font-size: var(--text-caption);
    color: var(--text-secondary);
    font-family: var(--font-ui);
  }

  .admin-status-badge {
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    font-size: var(--text-caption);
    font-family: var(--font-ui);
    font-weight: 700;
  }

  .admin-status-badge.status-approved {
    background-color: rgba(74, 222, 128, 0.15);
    color: #16a34a;
  }
  [data-theme="dark"] .admin-status-badge.status-approved {
    color: #4ade80;
  }

  .admin-status-badge.status-rejected {
    background-color: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }

  .admin-status-badge.status-pending {
    background-color: rgba(212, 173, 106, 0.2);
    color: #b45309;
  }
  [data-theme="dark"] .admin-status-badge.status-pending {
    color: #D4AD6A;
  }

  /* Photo compare */
  .admin-photo-compare {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
    margin: var(--space-4) 0;
  }

  .admin-photo-box {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .admin-photo-label {
    font-size: var(--text-caption);
    color: var(--text-primary);
    font-family: var(--font-ui);
    font-weight: 600;
  }

  .admin-photo-img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: var(--radius-md);
    border: 1.5px solid var(--border-subtle);
    box-shadow: var(--shadow-sm);
  }

  .admin-photo-placeholder {
    width: 100%;
    aspect-ratio: 1;
    border-radius: var(--radius-md);
    border: 2px dashed var(--border-subtle);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    font-size: var(--text-caption);
    font-family: var(--font-ui);
    gap: var(--space-1);
    background: var(--bg-muted);
  }

  .admin-fail-reason {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3);
    background-color: rgba(251, 146, 60, 0.12);
    border: 1px solid rgba(251, 146, 60, 0.3);
    border-radius: var(--radius-md);
    color: #ea580c;
    font-size: var(--text-body-sm);
    font-family: var(--font-ui);
    margin: var(--space-3) 0;
    font-weight: 500;
  }

  [data-theme="dark"] .admin-fail-reason {
    color: #fb923c;
  }

  .admin-expand-btn {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: var(--text-caption);
    font-family: var(--font-ui);
    cursor: pointer;
    padding: var(--space-1) 0;
    margin-top: var(--space-2);
    font-weight: 600;
  }

  .admin-expand-btn:hover {
    color: var(--burgundy-500);
  }

  .admin-card-details {
    margin-top: var(--space-2);
    padding-top: var(--space-3);
    border-top: 1px solid var(--border-subtle);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    font-size: var(--text-caption);
    color: var(--text-secondary);
    font-family: var(--font-ui);
  }

  .admin-detail-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .admin-notes-text {
    font-style: italic;
  }

  .admin-all-photos {
    margin-top: var(--space-2);
  }

  .admin-photos-row {
    display: flex;
    gap: var(--space-2);
    overflow-x: auto;
    margin-top: var(--space-1);
  }

  .admin-photo-thumb {
    width: 64px;
    height: 64px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    border: 1.5px solid var(--border-subtle);
    flex-shrink: 0;
  }

  .admin-card-actions {
    margin-top: var(--space-4);
    padding-top: var(--space-4);
    border-top: 1px solid var(--border-subtle);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .admin-notes-input {
    width: 100%;
    padding: var(--space-3);
    border: 1.5px solid var(--border-subtle);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: var(--text-body-sm);
    font-family: var(--font-ui);
    transition: all var(--duration-fast);
  }

  .admin-notes-input:focus {
    outline: none;
    border-color: var(--burgundy-500);
    box-shadow: 0 0 0 3px rgba(184, 67, 106, 0.18);
  }

  .admin-action-buttons {
    display: flex;
    gap: var(--space-3);
  }

  .admin-approve-btn {
    flex: 1;
    background-color: #16a34a !important;
    color: #ffffff !important;
    border: none !important;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(22, 163, 74, 0.3) !important;
  }

  .admin-approve-btn:hover:not(:disabled) {
    background-color: #15803d !important;
    color: #ffffff !important;
    box-shadow: 0 6px 18px rgba(22, 163, 74, 0.45) !important;
    transform: translateY(-1.5px);
  }

  .admin-reject-btn {
    flex: 1;
    background-color: rgba(239, 68, 68, 0.12) !important;
    color: #ef4444 !important;
    border: 1.5px solid rgba(239, 68, 68, 0.4) !important;
    font-weight: 600;
  }

  .admin-reject-btn:hover:not(:disabled) {
    background-color: #ef4444 !important;
    color: #ffffff !important;
    border-color: #ef4444 !important;
    box-shadow: 0 6px 18px rgba(239, 68, 68, 0.4) !important;
    transform: translateY(-1.5px);
  }

  /* Users directory */
  .admin-user-search-bar {
    display: flex;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
  }

  .admin-search-input-wrap {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
  }

  .admin-search-icon {
    position: absolute;
    left: var(--space-3);
    color: var(--text-muted);
    pointer-events: none;
  }

  .admin-search-input {
    width: 100%;
    padding: var(--space-3) var(--space-3) var(--space-3) 38px;
    border-radius: var(--radius-md);
    border: 1.5px solid var(--border-subtle);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: var(--font-ui);
    font-size: var(--text-body-sm);
    transition: all var(--duration-fast);
  }

  .admin-search-input:focus {
    outline: none;
    border-color: var(--burgundy-500);
    box-shadow: 0 0 0 3px rgba(184, 67, 106, 0.18);
  }

  .admin-role-select {
    padding: var(--space-3);
    border-radius: var(--radius-md);
    border: 1.5px solid var(--border-subtle);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: var(--font-ui);
    font-size: var(--text-body-sm);
    font-weight: 500;
    cursor: pointer;
  }

  .admin-role-select:focus {
    outline: none;
    border-color: var(--burgundy-500);
  }

  .admin-users-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .admin-user-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4);
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    gap: var(--space-3);
    box-shadow: var(--shadow-sm);
    transition: all var(--duration-fast);
  }

  .admin-user-row:hover {
    border-color: var(--border-default);
    box-shadow: var(--shadow-md);
  }

  .admin-user-row-main {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    flex: 1;
    min-width: 0;
  }

  .admin-user-avatar-wrap {
    flex-shrink: 0;
  }

  .admin-user-avatar {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    object-fit: cover;
    border: 1.5px solid var(--border-subtle);
    flex-shrink: 0;
  }

  .admin-user-avatar-icon {
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .admin-user-info-col {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  .admin-user-name-line {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .admin-user-name {
    font-weight: 600;
    color: var(--text-primary);
    font-size: var(--text-body);
    word-break: normal;
  }

  .admin-user-badges-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 1px;
  }

  .admin-user-subline {
    font-size: var(--text-caption);
    color: var(--text-secondary);
    margin-top: 2px;
    font-weight: 500;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
  }

  .admin-user-row-actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-shrink: 0;
  }

  .admin-verify-toggle-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    border: 1.5px solid var(--border-subtle);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: var(--font-ui);
    font-size: var(--text-caption);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--duration-fast);
  }

  .admin-verify-toggle-btn:hover:not(:disabled) {
    background: #16a34a !important;
    border-color: #16a34a !important;
    color: #ffffff !important;
    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4);
    transform: translateY(-1px);
  }

  .admin-verify-toggle-btn.is-verified {
    background: rgba(184, 67, 106, 0.15);
    border-color: #b8436a;
    color: #b8436a;
  }

  [data-theme="dark"] .admin-verify-toggle-btn.is-verified {
    color: #f0bdc8;
    border-color: #d4ad6a;
  }

  .admin-verify-toggle-btn.is-verified:hover:not(:disabled) {
    background: #ef4444 !important;
    border-color: #ef4444 !important;
    color: #ffffff !important;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    transform: translateY(-1px);
  }

  /* ── Block Header & Counts ── */
  .admin-block-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-3);
  }

  .admin-section-count {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-secondary);
    background: var(--bg-surface-elevated, rgba(255, 255, 255, 0.06));
    border: 1px solid var(--border-subtle);
    padding: 3px 10px;
    border-radius: var(--radius-full, 9999px);
    letter-spacing: 0.02em;
  }

  /* ── Luxury Pagination Bar ── */
  .admin-pagination-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: var(--space-4);
    padding: 10px 18px;
    background: var(--bg-surface, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-full, 9999px);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .admin-pagination-info {
    font-size: 12px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .admin-pagination-highlight {
    color: var(--text-primary);
    font-weight: 700;
  }

  .admin-pagination-controls {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .admin-page-nav-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 12px;
    border-radius: var(--radius-full, 9999px);
    border: 1px solid var(--border-default);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: 12px;
    font-weight: 600;
    font-family: var(--font-ui);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .admin-page-nav-btn:hover:not(:disabled) {
    background: rgba(184, 67, 106, 0.14);
    border-color: rgba(184, 67, 106, 0.5);
    color: var(--burgundy-500, #B8436A);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(184, 67, 106, 0.2);
  }

  [data-theme="dark"] .admin-page-nav-btn:hover:not(:disabled) {
    background: rgba(184, 67, 106, 0.24);
    border-color: rgba(212, 173, 106, 0.45);
    color: #FFFFFF;
  }

  .admin-page-nav-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .admin-page-indicator {
    font-size: 12px;
    color: var(--text-secondary);
    padding: 0 4px;
    white-space: nowrap;
  }

  .admin-page-indicator strong {
    color: var(--text-primary);
  }

  /* ── Users Directory Toolbar ── */
  .admin-user-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: var(--space-4);
    flex-wrap: wrap;
  }

  .admin-filter-selects {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .admin-select-filter {
    padding: 8px 14px;
    border-radius: var(--radius-full, 9999px);
    border: 1px solid var(--border-subtle);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .admin-select-filter:focus {
    outline: none;
    border-color: var(--burgundy-500);
    box-shadow: 0 0 0 2px rgba(184, 67, 106, 0.2);
  }

  .admin-user-id-sub {
    font-size: 11px;
    color: var(--text-muted);
  }

  .admin-approval-pill {
    display: inline-block;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .admin-approval-pill.status-approved {
    background: rgba(74, 222, 128, 0.12);
    color: #16a34a;
    border: 1px solid rgba(74, 222, 128, 0.3);
  }

  [data-theme="dark"] .admin-approval-pill.status-approved {
    color: #4ade80;
  }

  .admin-approval-pill.status-pending {
    background: rgba(212, 173, 106, 0.15);
    color: #D4AD6A;
    border: 1px solid rgba(212, 173, 106, 0.35);
  }

  .admin-approval-pill.status-rejected {
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  /* ── Role, Status & Filter Badges ── */
  .admin-clear-filter-btn {
    padding: 7px 14px;
    border-radius: var(--radius-full, 9999px);
    border: 1px solid var(--border-default);
    background: var(--bg-surface);
    color: var(--text-secondary);
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .admin-clear-filter-btn:hover {
    background: rgba(184, 67, 106, 0.15);
    border-color: var(--burgundy-500);
    color: var(--text-primary);
  }

  .admin-role-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: var(--radius-full, 9999px);
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .admin-role-badge.role-admin {
    background: rgba(212, 173, 106, 0.16);
    color: #D4AD6A;
    border: 1px solid rgba(212, 173, 106, 0.4);
  }

  .admin-role-badge.role-user {
    background: rgba(255, 255, 255, 0.06);
    color: var(--text-secondary);
    border: 1px solid var(--border-subtle);
  }

  .admin-status-pill {
    display: inline-block;
    padding: 2px 8px;
    border-radius: var(--radius-full, 9999px);
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .admin-status-pill.status-active {
    background: rgba(74, 222, 128, 0.12);
    color: #16a34a;
    border: 1px solid rgba(74, 222, 128, 0.3);
  }

  [data-theme="dark"] .admin-status-pill.status-active {
    color: #4ade80;
  }

  .admin-status-pill.status-suspended {
    background: rgba(251, 146, 60, 0.12);
    color: #ea580c;
    border: 1px solid rgba(251, 146, 60, 0.35);
  }

  [data-theme="dark"] .admin-status-pill.status-suspended {
    color: #fb923c;
  }

  .admin-status-pill.status-deleted {
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .admin-onboarding-pill {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: var(--radius-full, 9999px);
    font-size: 0.68rem;
    font-weight: 600;
    background: rgba(168, 85, 247, 0.12);
    color: #a855f7;
    border: 1px dashed rgba(168, 85, 247, 0.4);
    letter-spacing: 0.01em;
  }

  [data-theme="dark"] .admin-onboarding-pill {
    color: #c084fc;
    border-color: rgba(192, 132, 252, 0.4);
  }

  /* ── Suspend / Restore Button ── */
  .admin-suspend-toggle-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    border: 1.5px solid var(--border-subtle);
    background: var(--bg-surface);
    color: var(--text-secondary);
    font-family: var(--font-ui);
    font-size: var(--text-caption);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--duration-fast);
  }

  .admin-suspend-toggle-btn:hover:not(:disabled) {
    border-color: #fb923c;
    color: #ea580c;
    background: rgba(251, 146, 60, 0.12);
    transform: translateY(-1px);
  }

  .admin-suspend-toggle-btn.is-suspended {
    border-color: #4ade80;
    color: #16a34a;
    background: rgba(74, 222, 128, 0.12);
  }

  .admin-suspend-toggle-btn.is-suspended:hover:not(:disabled) {
    border-color: #16a34a;
    background: rgba(74, 222, 128, 0.22);
  }

  .admin-suspend-toggle-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* ── Delete Button ── */
  .admin-delete-toggle-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    border: 1.5px solid var(--border-subtle);
    background: var(--bg-surface);
    color: var(--text-secondary);
    font-family: var(--font-ui);
    font-size: var(--text-caption);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--duration-fast);
  }

  .admin-delete-toggle-btn:hover:not(:disabled) {
    border-color: #ef4444;
    color: #ef4444;
    background: rgba(239, 68, 68, 0.12);
    transform: translateY(-1px);
  }

  .admin-delete-toggle-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* ── Pending Approvals Sub-Tabs Rail ── */
  .admin-subtabs-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: var(--space-5);
    flex-wrap: wrap;
  }

  .admin-subtab-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 18px;
    border-radius: var(--radius-full, 9999px);
    border: 1px solid var(--border-subtle);
    background: var(--bg-surface, rgba(255, 255, 255, 0.04));
    color: var(--text-secondary);
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .admin-subtab-btn:hover {
    color: var(--text-primary);
    border-color: rgba(184, 67, 106, 0.35);
  }

  .admin-subtab-btn.active {
    background: linear-gradient(135deg, var(--burgundy-500, #B8436A) 0%, var(--burgundy-700, #8A2548) 100%);
    color: #FFFFFF !important;
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 14px rgba(184, 67, 106, 0.35);
  }

  [data-theme="dark"] .admin-subtab-btn.active {
    background: linear-gradient(135deg, #B8436A 0%, #7A1D3A 100%);
    border-color: rgba(212, 173, 106, 0.35);
    box-shadow: 0 4px 16px rgba(184, 67, 106, 0.5);
  }

  /* ── Interactive Profile Click Affordances ── */
  .admin-table-row.is-clickable {
    cursor: pointer;
    transition: background-color var(--duration-fast, 0.15s) ease;
  }

  .admin-table-row.is-clickable:hover td {
    background-color: rgba(184, 67, 106, 0.05);
  }

  [data-theme="dark"] .admin-table-row.is-clickable:hover td {
    background-color: rgba(184, 67, 106, 0.1);
  }

  .admin-user-row-main.is-clickable {
    cursor: pointer;
    border-radius: var(--radius-md, 12px);
    padding: 6px 8px;
    margin: -6px -8px;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .admin-user-row-main.is-clickable:hover {
    background: rgba(184, 67, 106, 0.06);
  }

  [data-theme="dark"] .admin-user-row-main.is-clickable:hover {
    background: rgba(184, 67, 106, 0.12);
  }

  .admin-card-user-info.is-clickable {
    cursor: pointer;
    border-radius: var(--radius-md, 10px);
    padding: 4px 6px;
    margin: -4px -6px;
    transition: all 0.2s ease;
  }

  .admin-card-user-info.is-clickable:hover {
    background: rgba(184, 67, 106, 0.06);
  }

  [data-theme="dark"] .admin-card-user-info.is-clickable:hover {
    background: rgba(184, 67, 106, 0.12);
  }

  /* ── Avatar Wrap & Hover Eye Overlay ── */
  .admin-table-avatar-wrap,
  .admin-user-avatar-wrap,
  .admin-card-avatar-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .admin-avatar-hover-hint {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(184, 67, 106, 0.75);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: scale(0.85);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
  }

  .admin-table-row.is-clickable:hover .admin-avatar-hover-hint,
  .admin-user-row-main.is-clickable:hover .admin-avatar-hover-hint,
  .admin-card-user-info.is-clickable:hover .admin-avatar-hover-hint {
    opacity: 1;
    transform: scale(1);
  }

  .admin-name-view-hint {
    opacity: 0;
    color: var(--burgundy-500, #B8436A);
    transition: all 0.2s ease;
    transform: translateX(-3px);
  }

  .admin-table-row.is-clickable:hover .admin-name-view-hint,
  .admin-user-row-main.is-clickable:hover .admin-name-view-hint,
  .admin-card-user-info.is-clickable:hover .admin-name-view-hint {
    opacity: 0.9;
    transform: translateX(0);
  }

  .admin-card-name-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* ── Full User ID Chip & Copy ── */
  .admin-user-id-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 8px;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.04);
    border: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
    color: var(--text-secondary);
    font-family: var(--font-mono, 'JetBrains Mono', 'Fira Code', 'Courier New', monospace);
    font-size: 11px;
    line-height: 1.2;
    cursor: copy;
    transition: all 0.15s ease;
    max-width: 100%;
    vertical-align: middle;
    white-space: nowrap;
    flex-shrink: 0;
  }

  [data-theme="dark"] .admin-user-id-chip {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .admin-user-id-chip:hover {
    border-color: var(--burgundy-400, #c8527a);
    color: var(--burgundy-500, #B8436A);
    background: rgba(184, 67, 106, 0.08);
  }

  .admin-user-id-chip.table-id {
    margin-top: 4px;
    white-space: nowrap;
    display: inline-flex;
  }

  .admin-user-id-chip.inline-chip {
    margin-left: 4px;
    white-space: nowrap;
    display: inline-flex;
  }

  .admin-id-tag {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.75;
    flex-shrink: 0;
  }

  .admin-id-full {
    font-family: inherit;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.2px;
    user-select: all;
    white-space: nowrap;
  }

  .admin-id-copy-icon {
    flex-shrink: 0;
    opacity: 0.6;
    transition: opacity 0.15s ease;
  }

  .admin-user-id-chip:hover .admin-id-copy-icon {
    opacity: 1;
  }

  /* ── In-Panel Profile Inspector Header & Canvas ── */
  .admin-profile-inspector-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: var(--space-8);
  }

  .admin-inspector-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 14px;
    padding: 16px 22px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg, 16px);
    margin-bottom: var(--space-6);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }

  [data-theme="dark"] .admin-inspector-topbar {
    background: rgba(26, 26, 26, 0.85);
    backdrop-filter: blur(12px);
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  }

  .admin-inspector-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: var(--radius-full, 9999px);
    border: 1.5px solid var(--border-subtle);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .admin-inspector-back-btn:hover {
    border-color: var(--burgundy-500, #B8436A);
    color: var(--burgundy-500, #B8436A);
    background: rgba(184, 67, 106, 0.06);
    transform: translateX(-2px);
  }

  .admin-user-id-chip.inspector-chip {
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 13px;
    gap: 8px;
    background: var(--bg-elevated, rgba(0, 0, 0, 0.04));
    border: 1px solid var(--border-subtle);
  }

  [data-theme="dark"] .admin-user-id-chip.inspector-chip {
    background: rgba(255, 255, 255, 0.06);
  }

  .admin-user-id-chip.inspector-chip .admin-id-full {
    font-size: 12px;
  }

  .admin-inspector-badges {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .admin-inspector-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .admin-profile-content-wrap {
    width: 100%;
  }

  /* ── Incomplete Profile Fallback Inspector ── */
  .admin-incomplete-profile-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg, 16px);
    padding: 32px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }

  [data-theme="dark"] .admin-incomplete-profile-card {
    background: rgba(26, 26, 26, 0.85);
    border-color: rgba(255, 255, 255, 0.08);
  }

  .admin-incomplete-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-subtle);
  }

  .admin-incomplete-avatar {
    color: var(--text-muted);
  }

  .admin-incomplete-name {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 4px 0;
  }

  .admin-incomplete-meta {
    font-size: 13px;
    color: var(--text-muted);
    margin: 0;
  }

  .admin-incomplete-notice {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 16px 20px;
    border-radius: 12px;
    background: rgba(251, 146, 60, 0.1);
    border: 1px solid rgba(251, 146, 60, 0.3);
    color: #ea580c;
    margin-bottom: 28px;
  }

  [data-theme="dark"] .admin-incomplete-notice {
    color: #fb923c;
  }

  .admin-incomplete-notice .notice-icon {
    flex-shrink: 0;
    margin-top: 2px;
  }

  .admin-incomplete-notice strong {
    display: block;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .admin-incomplete-notice p {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-secondary);
  }

  .admin-incomplete-details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }

  .admin-detail-cell {
    background: var(--bg-subtle, rgba(0, 0, 0, 0.02));
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  [data-theme="dark"] .admin-detail-cell {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.06);
  }

  .admin-detail-cell .cell-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
    color: var(--text-muted);
  }

  .admin-detail-cell .cell-value {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    word-break: break-all;
  }

  /* ── Responsive Mobile & Tablet Optimizations ── */
  @media (max-width: 860px) {
    .admin-user-row {
      flex-direction: column;
      align-items: stretch;
      gap: 14px;
      padding: 16px;
    }

    .admin-user-row-main {
      width: 100%;
      min-width: 0;
      align-items: flex-start;
    }

    .admin-user-info-col {
      flex: 1;
      min-width: 0;
    }

    .admin-user-row-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      border-top: 1px solid var(--border-subtle);
      padding-top: 12px;
      margin-top: 2px;
    }

    .admin-verify-toggle-btn,
    .admin-suspend-toggle-btn,
    .admin-delete-toggle-btn {
      flex: 1;
      justify-content: center;
      padding: 8px 10px;
      font-size: 12px;
      min-height: 38px;
      box-sizing: border-box;
      white-space: nowrap;
    }

    .admin-user-id-chip.inline-chip {
      margin-left: 0;
      margin-top: 5px;
      max-width: 100%;
    }

    .admin-user-id-chip .admin-id-full {
      max-width: 210px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  @media (max-width: 640px) {
    .admin-panel {
      padding: 12px 10px;
    }

    .admin-tabs-wrapper {
      margin-left: -4px;
      margin-right: -4px;
      padding-left: 4px;
      padding-right: 28px;
      padding-bottom: 6px;
      margin-bottom: 16px;
    }

    .admin-tabs {
      flex-shrink: 0;
    }

    .admin-user-toolbar {
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
    }

    .admin-search-input {
      width: 100%;
      box-sizing: border-box;
    }

    .admin-filter-selects {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      width: 100%;
    }

    .admin-select-filter {
      width: 100%;
      min-width: 0;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      box-sizing: border-box;
      padding: 7px 10px;
      font-size: 11.5px;
    }

    .admin-clear-filter-btn {
      grid-column: 1 / -1;
      width: 100%;
      text-align: center;
      justify-content: center;
    }

    .admin-user-name {
      font-size: 15px;
    }

    .admin-user-avatar {
      width: 42px;
      height: 42px;
      flex-shrink: 0;
    }

    .admin-user-avatar-icon {
      width: 42px;
      height: 42px;
      flex-shrink: 0;
    }

    .admin-user-id-chip .admin-id-full {
      max-width: 175px;
    }

    .admin-verify-toggle-btn,
    .admin-suspend-toggle-btn,
    .admin-delete-toggle-btn {
      font-size: 11.5px;
      padding: 7px 6px;
      gap: 4px;
    }
  }

  @media (max-width: 420px) {
    .admin-user-row {
      padding: 12px;
    }

    .admin-filter-selects {
      grid-template-columns: 1fr;
    }

    .admin-user-id-chip .admin-id-full {
      max-width: 145px;
    }
  }
`;

