import React from 'react';
import { useApp } from '../../context/AppContext';
import { Heart, ChatCircleText } from '@phosphor-icons/react';
import { PageHeader } from '../../components/UI/PageHeader';
import { EmptyState } from '../../components/UI/EmptyState';
import { Button } from '../../components/UI/Button';

export const MatchesList = ({ onSelectConnection }) => {
  const { connections, interestsSent, interestStatuses, profiles, setActiveTab, chats } = useApp();

  // Mutual connections where BOTH haven't messaged each other yet
 const activeConnections = connections;

  // Sent interests that are still pending matching (status 'sent' or 'pending')
  const pendingInterests = profiles.filter(p => {
    const status = interestStatuses[p.id];
    return interestsSent.includes(p.id) && (status === 'sent' || status === 'pending');
  });

  const handleGoDiscover = () => {
    setActiveTab('discover');
  };

  return (
    <div className="matches-page page-enter">
      <PageHeader
        title="Your Connections"
        subtitle="People you've shared mutual interest with."
      />

      {/* Active Connections Section */}
      <section className="connections-section">
        <h2 className="section-group-title font-ui">Active Connections ({activeConnections.length})</h2>
        {activeConnections.length > 0 ? (
          <div className="connections-grid">
            {activeConnections.map(conn => (
              <div 
                key={conn.id} 
                className="connection-item-card"
                onClick={() => onSelectConnection(conn)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelectConnection(conn);
                }}
              >
                <img src={conn.photo} alt={conn.name} className="connection-avatar-img" />
                
                <div className="connection-card-info">
                  <div className="connection-name-row">
                    <span className="connection-name font-display">{conn.name}</span>
                    <span className="connection-age font-ui">, {conn.age}</span>
                  </div>
                  <p className="connection-meta font-ui">{conn.city} &bull; {conn.relationshipIntent}</p>
                  <p className="connection-preview-text font-body italic">Click to chat and get to know each other...</p>
                </div>

                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectConnection(conn);
                  }}
                  variant="secondary"
                  className="chat-cta-btn-refactored"
                >
                  Chat
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="A quiet space for mutual connections"
            desc="Connections form when interest is shared by both of you. Take your time browsing stories — meaningful conversations are worth the wait."
            actionLabel="Discover People"
            onActionClick={handleGoDiscover}
            icon={
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.85 }}>
                <circle cx="50" cy="40" r="16" fill="var(--warning-light)" opacity="0.6" />
                <path d="M50 24C50 24 45 35 45 42C45 46.5 47 48 50 48C53 48 55 46.5 55 42C55 35 50 24 50 24Z" fill="var(--warning)" />
                <path d="M50 32C50 32 47 38 47 42C47 44.5 48 45 50 45C52 45 53 44.5 53 42C53 38 50 32 50 32Z" fill="#FFFFFF" />
                <path d="M50 46V52" stroke="var(--charcoal-600)" strokeWidth="2" strokeLinecap="round" />
                <rect x="42" y="52" width="16" height="28" rx="2" fill="var(--burgundy-500)" />
                <path d="M30 80H70" stroke="var(--border-default)" strokeWidth="3" strokeLinecap="round" />
              </svg>
            }
          />
        )}
      </section>

      {/* Pending Interests Section */}
      <section className="pending-section border-top">
        <h2 className="section-group-title font-ui">Sent Interests ({pendingInterests.length})</h2>
        {pendingInterests.length > 0 ? (
          <div className="pending-grid">
            {pendingInterests.map(profile => {
              const status = interestStatuses[profile.id];
              return (
                <div key={profile.id} className="pending-item-card">
                  <img src={profile.photo} alt={profile.name} className="pending-avatar-img" />
                  <div className="pending-card-info">
                    <div className="pending-name-row">
                      <span className="pending-name font-ui">{profile.name}</span>
                      <span className="pending-age">, {profile.age}</span>
                    </div>
                    <span className={`pending-status-badge font-ui ${status === 'pending' ? 'status-review' : ''}`}>
                      {status === 'pending' ? 'Pending Review...' : 'Interest Sent'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-pending-wrap font-ui">
            <p className="no-pending-text font-body">
              You don't have any pending sent interests. Let someone know you're interested!
            </p>
          </div>
        )}
      </section>

      <style>{`
        .matches-page {
          max-width: var(--content-max-width);
          margin: 0 auto;
          padding: var(--space-6) var(--space-4);
        }

        .section-group-title {
          font-size: var(--text-body-sm);
          font-weight: bold;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: var(--tracking-wide);
          margin-bottom: var(--space-4);
        }

        .connections-section {
          margin-bottom: var(--space-8);
        }

        /* Connections */
        .connections-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .connection-item-card {
          display: flex;
          align-items: center;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          box-shadow: var(--shadow-sm);
          cursor: pointer;
          transition: all var(--duration-fast);
          gap: var(--space-4);
        }

        .connection-item-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--burgundy-300);
        }

        .connection-avatar-img {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #FFFFFF;
          box-shadow: var(--shadow-sm);
          flex-shrink: 0;
        }

        .connection-card-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
        }

        .connection-name-row {
          display: flex;
          align-items: baseline;
        }

        .connection-name {
          font-size: var(--text-body-lg);
          font-weight: bold;
          color: var(--text-primary);
        }

        .connection-age {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
        }

        .connection-meta {
          font-size: var(--text-caption);
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .connection-preview-text {
          font-size: var(--text-body-sm);
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .chat-cta-btn-refactored {
          padding: var(--space-2) var(--space-4);
          font-size: var(--text-body-sm);
        }

        .empty-heart-pulse {
          animation: heartbeat 1.5s infinite;
        }

        /* Pending */
        .border-top {
          border-top: 1px solid var(--border-subtle);
          padding-top: var(--space-6);
        }

        .pending-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: var(--space-3);
        }

        .pending-item-card {
          display: flex;
          align-items: center;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: var(--space-3);
          gap: var(--space-3);
        }

        .pending-avatar-img {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }

        .pending-card-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .pending-name-row {
          font-size: var(--text-body-sm);
          font-weight: 600;
          color: var(--text-primary);
        }

        .pending-age {
          font-weight: normal;
          color: var(--text-secondary);
        }

        .pending-status-badge {
          font-size: var(--text-caption);
          color: var(--burgundy-500);
          font-weight: 600;
        }

        .pending-status-badge.status-review {
          color: var(--gold-500);
        }

        .empty-pending-wrap {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: var(--space-4);
        }

        .no-pending-text {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          font-style: italic;
          text-align: center;
        }
      `}</style>
    </div>
  );
};
