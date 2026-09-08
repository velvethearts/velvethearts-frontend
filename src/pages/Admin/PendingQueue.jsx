import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { PageHeader } from '../../components/UI/PageHeader';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { EmptyState } from '../../components/UI/EmptyState';
import { UserCheck, UserMinus, Clock, Phone, MapPin, CheckCircle, Warning, MagnifyingGlass, ClockCounterClockwise } from '@phosphor-icons/react';

export const PendingQueue = ({ onBack }) => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actioningUserId, setActioningUserId] = useState(null); // track which user is being approved/rejected

  // Phone history side drawer/modal state
  const [historyPhone, setHistoryPhone] = useState('');
  const [historyList, setHistoryList] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    setError('');
    try {
      if (api.isConfigured) {
        const data = await api.admin.getPending();
        setQueue(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch pending queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleApprove = async (userId) => {
    if (!window.confirm('Are you sure you want to APPROVE this user?')) return;
    setActioningUserId(userId);
    try {
      if (api.isConfigured) {
        await api.admin.approve(userId);
      }
      setQueue(prev => prev.filter(u => u.userId !== userId));
      alert('User approved successfully!');
    } catch (err) {
      alert(err.message || 'Failed to approve user.');
    } finally {
      setActioningUserId(null);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Are you sure you want to REJECT this user?')) return;
    setActioningUserId(userId);
    try {
      if (api.isConfigured) {
        await api.admin.reject(userId);
      }
      setQueue(prev => prev.filter(u => u.userId !== userId));
      alert('User rejected successfully!');
    } catch (err) {
      alert(err.message || 'Failed to reject user.');
    } finally {
      setActioningUserId(null);
    }
  };

  const handleViewPhoneHistory = async (phoneNum) => {
    setHistoryPhone(phoneNum);
    setLoadingHistory(true);
    setHistoryList(null);
    try {
      if (api.isConfigured) {
        const data = await api.admin.getPhoneHistory(phoneNum);
        setHistoryList(data);
      }
    } catch (err) {
      alert(err.message || 'Failed to retrieve phone history.');
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="pending-queue-page page-enter">
      <PageHeader
        title="Pending Verifications"
        subtitle="Review and process new member registrations."
        onBack={onBack}
      />

      {loading ? (
        <div className="queue-loader-wrap">
          <div className="queue-spinner" />
          <p className="font-ui">Fetching verification queue...</p>
        </div>
      ) : error ? (
        <EmptyState
          title="Failed to Load Queue"
          desc={error}
          actionLabel="Try Again"
          onActionClick={fetchQueue}
          icon={<Warning size={40} className="font-error" />}
        />
      ) : queue.length > 0 ? (
        <div className="queue-content-layout">
          {/* Main List */}
          <div className="queue-list font-ui">
            {queue.map(user => (
              <Card key={user.userId} className="pending-user-card">
                <div className="user-card-layout">
                  {/* Photo Preview */}
                  <div className="user-photo-wrap">
                    {user.photos && user.photos.length > 0 ? (
                      <img src={user.photos[0]} alt={user.name || 'User'} className="user-photo" />
                    ) : (
                      <div className="user-photo-placeholder font-display">V♥</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="user-details-wrap">
                    <div className="user-header-row">
                      <h3 className="user-name font-display">{user.name || 'Anonymous User'}</h3>
                      <span className="completion-badge">
                        {user.profileCompletion}% Complete
                      </span>
                    </div>

                    <p className="user-phone">
                      <Phone size={14} />
                      <span>{user.phoneNumber}</span>
                    </p>

                    {user.hasPriorHistory && (
                      <div className="prior-history-badge font-ui">
                        {user.priorRejections > 0 ? (
                          <span className="badge-warning">
                            ⚠️ RE-REGISTRATION (Rejected {user.priorRejections} time{user.priorRejections > 1 ? 's' : ''} in past)
                          </span>
                        ) : user.priorDeletions > 0 ? (
                          <span className="badge-info">
                            ⏳ RE-REGISTRATION (Deleted/re-onboarded {user.priorDeletions} time{user.priorDeletions > 1 ? 's' : ''} in past)
                          </span>
                        ) : (
                          <span className="badge-info">
                            ⏳ RE-REGISTRATION (Prior records found)
                          </span>
                        )}
                      </div>
                    )}

                    <div className="user-meta-info font-body">
                      {user.city && (
                        <span className="meta-item">
                          <MapPin size={14} />
                          <span>{user.city}</span>
                        </span>
                      )}
                      {user.gender && <span className="meta-tag">{user.gender}</span>}
                      {user.relationshipIntent && <span className="meta-tag">{user.relationshipIntent}</span>}
                    </div>

                    <p className="submission-time font-ui">
                      <Clock size={12} />
                      <span>Submitted: {new Date(user.submissionTime).toLocaleString()}</span>
                    </p>

                    {/* Action buttons */}
                    <div className="user-actions">
                      <Button
                        variant="primary"
                        onClick={() => handleApprove(user.userId)}
                        disabled={actioningUserId !== null}
                        loading={actioningUserId === user.userId}
                        className="btn-approve"
                      >
                        <UserCheck size={18} />
                        <span>Approve</span>
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() => handleReject(user.userId)}
                        disabled={actioningUserId !== null}
                        className="btn-reject"
                      >
                        <UserMinus size={18} />
                        <span>Reject</span>
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() => handleViewPhoneHistory(user.phoneNumber)}
                        disabled={actioningUserId !== null}
                        className="btn-history"
                      >
                        <ClockCounterClockwise size={18} />
                        <span>Audit Log</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Audit History Panel (Sidebar overlay style) */}
          {historyPhone && (
            <div className="audit-sidebar font-ui page-enter">
              <div className="audit-sidebar-header">
                <h3>Audit History for:</h3>
                <p className="phone-highlight">{historyPhone}</p>
                <button className="close-audit-btn" onClick={() => setHistoryPhone('')}>&times;</button>
              </div>

              <div className="audit-sidebar-body">
                {loadingHistory ? (
                  <div className="audit-spinner-wrap">
                    <div className="queue-spinner" />
                    <p>Loading history...</p>
                  </div>
                ) : historyList && historyList.length > 0 ? (
                  <div className="audit-timeline">
                    {historyList.map((log, index) => (
                      <div key={log.id || index} className="timeline-node">
                        <div className="timeline-dot" />
                        <div className="timeline-content">
                          <span className={`status-pill status-${log.approvalStatus.toLowerCase()}`}>
                            {log.approvalStatus}
                          </span>
                          <p className="node-detail">System Status: {log.status}</p>
                          <p className="node-detail">Role: {log.role}</p>
                          <p className="node-time">Created: {new Date(log.createdAt).toLocaleString()}</p>
                          {log.deletedAt && (
                            <p className="node-time node-deleted">Deleted: {new Date(log.deletedAt).toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-audit font-body">
                    <p>No prior registration or verification history found for this phone number.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="All Caught Up!"
          desc="There are currently no new registration requests pending verification."
          icon={<CheckCircle size={48} className="font-success" />}
        />
      )}

      <style>{`
        .pending-queue-page {
          max-width: var(--content-max-width);
          margin: 0 auto;
          padding: var(--space-6) var(--space-4) var(--space-12);
        }

        .queue-loader-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 40vh;
          gap: var(--space-4);
          color: var(--text-secondary);
        }

        .queue-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid var(--border-default);
          border-top-color: var(--burgundy-500);
          border-radius: 50%;
          animation: qspin 0.8s linear infinite;
        }

        @keyframes qspin {
          to { transform: rotate(360deg); }
        }

        .queue-content-layout {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
          position: relative;
        }

        @media (min-width: 992px) {
          .queue-content-layout {
            display: grid;
            grid-template-columns: 1fr 340px;
            align-items: start;
          }
        }

        .queue-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          flex: 1;
        }

        .pending-user-card {
          padding: var(--space-5);
        }

        .user-card-layout {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        @media (min-width: 576px) {
          .user-card-layout {
            flex-direction: row;
          }
        }

        .user-photo-wrap {
          width: 100px;
          height: 100px;
          border-radius: var(--radius-md);
          overflow: hidden;
          background-color: var(--charcoal-200);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-photo-placeholder {
          font-size: 2rem;
          color: var(--burgundy-300);
          font-weight: bold;
        }

        .user-details-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .user-header-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .user-name {
          font-size: var(--text-body-lg);
          font-weight: bold;
          color: var(--text-primary);
        }

        .completion-badge {
          font-size: 11px;
          background-color: var(--bg-accent-subtle);
          color: var(--text-accent);
          padding: 2px var(--space-2);
          border-radius: var(--radius-full);
          font-weight: 600;
        }

        .user-phone {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
        }

        .prior-history-badge {
          margin-top: 4px;
          font-size: 11px;
          font-weight: bold;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .badge-warning {
          background-color: #fff3cd;
          color: #856404;
          border: 1px solid #ffeeba;
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
          display: inline-block;
          width: fit-content;
        }

        .badge-info {
          background-color: #e2e3e5;
          color: #383d41;
          border: 1px solid #d6d8db;
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
          display: inline-block;
          width: fit-content;
        }

        .user-meta-info {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          align-items: center;
          margin-top: 2px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
        }

        .meta-tag {
          font-size: var(--text-caption);
          background-color: var(--bg-muted);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
        }

        .submission-time {
          font-size: var(--text-caption);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
        }

        .user-actions {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-top: var(--space-4);
        }

        .user-actions button {
          font-size: var(--text-body-sm) !important;
          padding: var(--space-2) var(--space-3) !important;
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
        }

        .btn-approve {
          background: linear-gradient(135deg, var(--success), #2e7d32) !important;
          border: none !important;
          color: #FFFFFF !important;
        }

        .btn-approve:hover {
          opacity: 0.9;
        }

        .btn-reject:hover {
          border-color: var(--error) !important;
          color: var(--error) !important;
          background-color: var(--error-light) !important;
        }

        /* Audit sidebar */
        .audit-sidebar {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          box-shadow: var(--shadow-md);
        }

        .audit-sidebar-header {
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: var(--space-3);
          position: relative;
        }

        .audit-sidebar-header h3 {
          font-size: var(--text-body-sm);
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: bold;
        }

        .phone-highlight {
          font-size: var(--text-body-lg);
          font-weight: bold;
          color: var(--text-primary);
          margin-top: 4px;
        }

        .close-audit-btn {
          position: absolute;
          top: 0;
          right: 0;
          font-size: var(--text-heading);
          color: var(--text-muted);
          background: none;
          border: none;
          cursor: pointer;
        }

        .close-audit-btn:hover {
          color: var(--text-primary);
        }

        .audit-spinner-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-6);
          color: var(--text-secondary);
          gap: var(--space-3);
        }

        .audit-timeline {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          position: relative;
          padding-left: var(--space-4);
          border-left: 2px solid var(--border-subtle);
          margin-left: 6px;
        }

        .timeline-node {
          position: relative;
        }

        .timeline-dot {
          position: absolute;
          left: -22px;
          top: 6px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: var(--burgundy-400);
          border: 2px solid var(--bg-surface);
        }

        .timeline-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .status-pill {
          font-size: var(--text-caption);
          font-weight: bold;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          align-self: flex-start;
          text-transform: uppercase;
        }

        .status-approved { background-color: var(--success-light); color: var(--success); }
        .status-pending { background-color: var(--gold-50); color: var(--gold-500); }
        .status-rejected { background-color: var(--error-light); color: var(--error); }

        .node-detail {
          font-size: var(--text-body-sm);
          color: var(--text-primary);
        }

        .node-time {
          font-size: 10px;
          color: var(--text-muted);
        }

        .node-deleted {
          color: var(--error);
        }

        .empty-audit {
          color: var(--text-secondary);
          font-style: italic;
          font-size: var(--text-body-sm);
        }
      `}</style>
    </div>
  );
};
