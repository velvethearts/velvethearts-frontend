import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { PageHeader } from '../../components/UI/PageHeader';
import { Card } from '../../components/UI/Card';
import { Clock, UserList, ClockCounterClockwise, CheckCircle, ShieldWarning } from '@phosphor-icons/react';

export const AdminDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (api.isConfigured) {
          const pendingData = await api.admin.getPending();
          const count = Array.isArray(pendingData) ? pendingData.length : 0;
          setStats(prev => ({
            ...prev,
            pendingCount: count
          }));
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard-page page-enter">
      <PageHeader
        title="Admin Panel"
        subtitle="Review membership requests and verify user identities."
      />

      <div className="admin-dashboard-grid font-ui">
        {/* Metric Cards */}
        <div className="metrics-row">
          <Card className="metric-card">
            <Clock size={32} className="metric-icon font-gold" />
            <div className="metric-details">
              <span className="metric-value">{stats.pendingCount}</span>
              <span className="metric-label">Pending Approval</span>
            </div>
          </Card>
          
          <Card className="metric-card">
            <CheckCircle size={32} className="metric-icon font-success" />
            <div className="metric-details">
              <span className="metric-value">Active</span>
              <span className="metric-label">Verification Queue</span>
            </div>
          </Card>
        </div>

        {/* Action Cards */}
        <h2 className="admin-section-title">Operations</h2>
        <div className="admin-actions-grid">
          <Card hoverable className="admin-action-card" onClick={() => onNavigate('pending')}>
            <div className="action-card-content">
              <UserList size={36} className="action-card-icon font-accent" />
              <div className="action-card-text">
                <h3>Verification Queue</h3>
                <p>Process pending users, view profile drafts, and approve/reject accounts.</p>
              </div>
              <span className="action-card-arrow">&rarr;</span>
            </div>
          </Card>

          <Card hoverable className="admin-action-card" onClick={() => onNavigate('history')}>
            <div className="action-card-content">
              <ClockCounterClockwise size={36} className="action-card-icon" />
              <div className="action-card-text">
                <h3>Phone Audit History</h3>
                <p>Search verification events, status logs, and historical entries by phone number.</p>
              </div>
              <span className="action-card-arrow">&rarr;</span>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        .admin-dashboard-page {
          max-width: var(--content-max-width);
          margin: 0 auto;
          padding: var(--space-6) var(--space-4);
        }

        .admin-dashboard-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .metrics-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
        }

        @media (min-width: 576px) {
          .metrics-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        .metric-card {
          padding: var(--space-5);
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .metric-icon {
          flex-shrink: 0;
        }

        .metric-icon.font-gold {
          color: var(--gold-500, #D4AD6A);
        }

        .metric-icon.font-success {
          color: var(--success);
        }

        .metric-details {
          display: flex;
          flex-direction: column;
        }

        .metric-value {
          font-size: var(--text-heading-lg, 2rem);
          font-weight: bold;
          color: var(--text-primary);
          line-height: 1;
        }

        .metric-label {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .admin-section-title {
          font-size: var(--text-body);
          font-weight: bold;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: var(--tracking-wide);
          margin-top: var(--space-4);
        }

        .admin-actions-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .admin-action-card {
          padding: var(--space-5);
          cursor: pointer;
        }

        .action-card-content {
          display: flex;
          align-items: center;
          gap: var(--space-5);
          width: 100%;
        }

        .action-card-icon {
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .action-card-icon.font-accent {
          color: var(--text-accent);
        }

        .action-card-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .action-card-text h3 {
          font-size: var(--text-body-lg);
          font-weight: bold;
          color: var(--text-primary);
        }

        .action-card-text p {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          line-height: var(--leading-normal);
        }

        .action-card-arrow {
          font-size: var(--text-body-lg);
          color: var(--text-muted);
          transition: transform var(--duration-fast);
        }

        .admin-action-card:hover .action-card-arrow {
          transform: translateX(4px);
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};
