import { useApp } from '../../context/AppContext';
import { Heart, ChatCircleText, Sparkle, Lightning, Star } from '@phosphor-icons/react';
import { PageHeader } from '../../components/UI/PageHeader';
import { EmptyState } from '../../components/UI/EmptyState';
import { Button } from '../../components/UI/Button';
import { getProfilePhoto, getDefaultAvatar } from '../../utils/avatar';

export const MatchesList = ({ onSelectConnection, onSelectProfile }) => {
  const { connections, interestsSent, interestStatuses, profiles, receivedInvites, sentInvitesList, setActiveTab, sendInterest, unsendInterest, onlineUserIds } = useApp();
  const activeConnections = connections;

  // Sent interests that are still pending matching
  const pendingInterests = (sentInvitesList || []).filter(p => {
    const status = interestStatuses[p.id];
    return status !== 'mutual';
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

      {/* New Match Story Ring Highlights Carousel */}
      {activeConnections.length > 0 && (
        <div className="recent-matches-carousel-wrap">
          <h3 className="carousel-section-title font-ui">Recent Sparks</h3>
          <div className="recent-matches-row">
            {activeConnections.map(conn => {
              const isOnline = onlineUserIds?.has(conn.id) || onlineUserIds?.has(conn.userId);
              return (
                <button
                  key={conn.id}
                  type="button"
                  className="story-highlight-circle"
                  onClick={() => onSelectConnection(conn)}
                  title={`Chat with ${conn.name}`}
                >
                  <div className="highlight-avatar-ring">
                    <img
                      src={getProfilePhoto(conn)}
                      alt={conn.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getDefaultAvatar(conn?.gender);
                      }}
                    />
                    {isOnline && <span className="online-presence-dot" title="Online now" />}
                  </div>
                  <span className="highlight-name font-ui">{conn.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Connections Section */}
      <section className="connections-section">
        <h2 className="section-group-title font-ui">Active Connections ({activeConnections.length})</h2>
        {activeConnections.length > 0 ? (
          <div className="connections-grid">
            {activeConnections.map(conn => {
              const isOnline = onlineUserIds?.has(conn.id) || onlineUserIds?.has(conn.userId);
              return (
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
                  <div className="connection-avatar-wrap">
                    <img
                      src={getProfilePhoto(conn)}
                      alt={conn.name}
                      className="connection-avatar-img"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getDefaultAvatar(conn?.gender);
                      }}
                    />
                    {isOnline && <span className="online-presence-dot" title="Online now" />}
                  </div>
                  
                  <div className="connection-card-info">
                    <div className="connection-name-row">
                      <span className="connection-name font-display">{conn.name}</span>
                      <span className="connection-age font-ui">, {conn.age}</span>
                    </div>
                    <p className="connection-meta font-ui">{conn.city} &bull; {conn.relationshipIntent}</p>
                    <p className="connection-preview-text font-body italic">Click to open conversation...</p>
                  </div>

                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectProfile) onSelectProfile(conn);
                    }}
                    variant="secondary"
                    className="chat-cta-btn-refactored font-ui"
                  >
                    View Story
                  </Button>
                </div>
              );
            })}
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

      {/* Received Invites / Secret Admirers Section */}
      <section className="received-section border-top">
        <div className="section-group-header">
          <h2 className="section-group-title font-ui">Received Invites ({receivedInvites.length})</h2>
          {receivedInvites.length > 0 && receivedInvites.some(i => i.isSuper || i.isSuperSpark) && (
            <span className="vibe-badge-pill font-ui" style={{ borderColor: 'var(--gold-400)', color: 'var(--gold-400)' }}>
              <Star size={12} weight="fill" color="var(--gold-400)" /> Priority Super Spark
            </span>
          )}
        </div>
        {receivedInvites.length > 0 ? (
          <div className="received-grid">
            {receivedInvites.map(profile => {
              const isSuper = profile.isSuper || profile.isSuperSpark || profile.isSuperLike;
              return (
                <button
                  key={profile.id}
                  type="button"
                  className={`received-item-card ${isSuper ? 'is-super-spark' : ''}`}
                  onClick={() => onSelectProfile(profile)}
                >
                  <div className="received-avatar-wrap">
                    <img
                      src={getProfilePhoto(profile)}
                      alt={profile.name}
                      className={`received-avatar-img ${isSuper ? 'super-avatar' : ''}`}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getDefaultAvatar(profile?.gender);
                      }}
                    />
                    {isSuper && (
                      <div className="super-star-avatar-badge" title="Super Spark Sent">
                        <Star size={11} weight="fill" color="#FFFFFF" />
                      </div>
                    )}
                  </div>
                  <div className="received-card-info">
                    <div className="received-name-row">
                      {isSuper && (
                        <span className="received-super-badge font-ui">
                          <Star size={12} weight="fill" color="var(--gold-400)" /> SUPER SPARK
                        </span>
                      )}
                      <span className="received-name font-ui">{profile.name}</span>
                      <span className="received-age">, {profile.age}</span>
                    </div>
                    <p className="received-meta font-ui">{profile.city} &bull; {profile.relationshipIntent}</p>
                    <p className="received-story font-body">&ldquo;{profile.story}&rdquo;</p>
                  </div>
                  <Button
                    variant="primary"
                    className={`accept-invite-btn ${isSuper ? 'super-accept-btn' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      sendInterest(profile.id);
                    }}
                  >
                    {isSuper ? <Star size={16} weight="fill" /> : <Heart size={16} weight="fill" />}
                    Accept & Connect
                  </Button>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="empty-pending-wrap font-ui">
            <p className="no-pending-text font-body">
              Invites from people interested in you will appear here.
            </p>
          </div>
        )}
      </section>

      {/* Pending Sent Interests Section */}
      <section className="pending-section border-top">
        <h2 className="section-group-title font-ui">Sent Interests ({pendingInterests.length})</h2>
        {pendingInterests.length > 0 ? (
          <div className="pending-grid">
            {pendingInterests.map(profile => {
              const status = interestStatuses[profile.id];
              const isSuper = profile.isSuper || profile.isSuperSpark || status === 'super';
              return (
                <div key={profile.id} className={`pending-item-card ${isSuper ? 'is-super-sent' : ''}`}>
                  <img
                    src={getProfilePhoto(profile)}
                    alt={profile.name}
                    className="pending-avatar-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getDefaultAvatar(profile?.gender);
                    }}
                  />
                  <div className="pending-card-info">
                    <div className="pending-name-row">
                      <span className="pending-name font-ui">{profile.name}</span>
                      <span className="pending-age">, {profile.age}</span>
                    </div>
                    <span className={`pending-status-badge font-ui ${isSuper ? 'status-super' : status === 'pending' ? 'status-review' : ''}`}>
                      {isSuper ? 'SUPER SPARK SENT ⭐️' : status === 'pending' ? 'Pending Review...' : 'Interest Sent'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    className="unsend-invite-btn font-ui"
                    onClick={(e) => {
                      e.stopPropagation();
                      unsendInterest(profile.id, profile.name);
                    }}
                    title="Unsend invite"
                  >
                    Unsend
                  </Button>
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

        /* Recent Sparks Story Carousel */
        .recent-matches-carousel-wrap {
          margin-bottom: var(--space-6);
        }

        .carousel-section-title {
          font-size: var(--text-body-sm);
          font-weight: bold;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: var(--tracking-wide);
          margin-bottom: var(--space-3);
        }

        .recent-matches-row {
          display: flex;
          gap: var(--space-4);
          overflow-x: auto;
          padding-bottom: var(--space-3);
          scrollbar-width: none;
        }

        .recent-matches-row::-webkit-scrollbar {
          display: none;
        }

        .story-highlight-circle {
          background: transparent;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-1);
          cursor: pointer;
          flex-shrink: 0;
          transition: transform var(--duration-fast);
        }

        .story-highlight-circle:hover {
          transform: scale(1.06);
        }

        .highlight-avatar-ring {
          position: relative;
          width: 68px;
          height: 68px;
          border-radius: 50%;
          padding: 3px;
          background: linear-gradient(135deg, var(--burgundy-400), var(--gold-400));
          box-shadow: 0 4px 12px rgba(184, 67, 106, 0.25);
        }

        .highlight-avatar-ring img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--bg-surface);
        }

        .highlight-name {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-primary);
          max-width: 68px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .online-presence-dot {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background-color: var(--success);
          border: 2.5px solid var(--bg-surface);
        }

        .connection-avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }

        .section-group-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-4);
        }

        .vibe-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          background-color: var(--bg-accent-subtle);
          color: var(--text-accent);
          border: 1px solid var(--burgundy-200);
          padding: 2px var(--space-3);
          border-radius: var(--radius-full);
          font-weight: 600;
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
          flex: 1;
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

        .pending-item-card.is-super-sent {
          border: 1px solid var(--gold-400);
          background: linear-gradient(135deg, rgba(212, 173, 106, 0.08), var(--bg-surface));
        }

        .pending-status-badge {
          font-size: var(--text-caption);
          color: var(--burgundy-500);
          font-weight: 600;
        }

        .pending-status-badge.status-review {
          color: var(--gold-500);
        }

        .pending-status-badge.status-super {
          color: var(--gold-400);
          font-weight: 700;
        }

        .unsend-invite-btn {
          margin-left: auto;
          font-size: var(--text-caption) !important;
          color: var(--burgundy-500) !important;
          padding: 4px 10px !important;
          border-radius: var(--radius-full) !important;
        }

        .unsend-invite-btn:hover {
          background-color: var(--burgundy-50) !important;
          color: var(--burgundy-700) !important;
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

        .received-section {
          margin-top: var(--space-6);
        }

        .received-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .received-item-card {
          display: flex;
          align-items: center;
          width: 100%;
          text-align: left;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          box-shadow: var(--shadow-sm);
          cursor: pointer;
          transition: all var(--duration-fast);
          gap: var(--space-4);
          position: relative;
        }

        .received-item-card.is-super-spark {
          border: 1.5px solid var(--gold-400);
          background: linear-gradient(135deg, rgba(212, 173, 106, 0.12), rgba(30, 24, 27, 0.95));
          box-shadow: 0 4px 20px rgba(212, 173, 106, 0.2);
        }

        .received-item-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--burgundy-300);
        }

        .received-item-card.is-super-spark:hover {
          border-color: var(--gold-300);
          box-shadow: 0 6px 24px rgba(212, 173, 106, 0.35);
        }

        .received-avatar-wrap {
          position: relative;
          display: inline-block;
          flex-shrink: 0;
        }

        .received-avatar-img {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #FFFFFF;
          box-shadow: var(--shadow-sm);
          flex-shrink: 0;
        }

        .received-avatar-img.super-avatar {
          border: 2px solid var(--gold-400);
          box-shadow: 0 0 12px rgba(212, 173, 106, 0.5);
        }

        .super-star-avatar-badge {
          position: absolute;
          bottom: 0;
          right: 0;
          background: linear-gradient(135deg, var(--gold-400), var(--gold-500));
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #1A1517;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }

        .received-card-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .received-name-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-body);
          font-weight: 700;
          color: var(--text-primary);
        }

        .received-super-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(212, 173, 106, 0.18);
          border: 1px solid var(--gold-400);
          color: var(--gold-400);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.5px;
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }

        .super-accept-btn {
          background: linear-gradient(135deg, var(--gold-400), var(--gold-500)) !important;
          color: #1A1517 !important;
          font-weight: 700 !important;
          border: none !important;
          box-shadow: 0 4px 14px rgba(212, 173, 106, 0.4) !important;
        }

        .super-accept-btn:hover {
          background: linear-gradient(135deg, var(--gold-300), var(--gold-400)) !important;
          transform: translateY(-1px) scale(1.03) !important;
        }

        .received-age {
          font-weight: 400;
          color: var(--text-secondary);
        }

        .received-meta {
          font-size: var(--text-caption);
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .received-story {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .accept-invite-btn {
          flex-shrink: 0;
          padding: var(--space-2) var(--space-4);
          font-size: var(--text-body-sm);
        }

        @media (max-width: 560px) {
          .received-item-card {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .accept-invite-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
