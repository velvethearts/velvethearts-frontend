import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Heart, ChatCircleText, Sparkle, Lightning, Star, HandWaving, Coffee, Microphone, Play, Pause } from '@phosphor-icons/react';
import { PageHeader } from '../../components/UI/PageHeader';
import { EmptyState } from '../../components/UI/EmptyState';
import { Button } from '../../components/UI/Button';
import { getProfilePhoto, getDefaultAvatar } from '../../utils/avatar';
import { computeVibeMatch } from '../../utils/vibe';
import { triggerHaptic, playHapticSound } from '../../utils/haptics';

export const MatchesList = ({ onSelectConnection, onSelectProfile }) => {
  const { connections, interestsSent, interestStatuses, profiles, receivedInvites, sentInvitesList, setActiveTab, sendInterest, unsendInterest, onlineUserIds, sendMessage, nudgeSpark, userProfile, conversations = [], chats = {}, addToast } = useApp();
  const activeConnections = connections;

  // Sent interests that are still pending matching
  const pendingInterests = (sentInvitesList || []).filter(p => {
    const status = interestStatuses[p.id];
    return status !== 'mutual';
  });

  // Active audio player state for voice intros
  const [activeVoiceId, setActiveVoiceId] = useState(null);
  const audioRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const isLongPressHandledRef = useRef(false);

  // Quick Icebreaker Popover state
  const [activeIcebreakerId, setActiveIcebreakerId] = useState(null);

  // Confetti particles state
  const [confettiBurst, setConfettiBurst] = useState([]);

  // Handle 3-second long press on Recent Spark to play voice intro
  const handlePressStart = (conn) => {
    isLongPressHandledRef.current = false;
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);

    longPressTimerRef.current = setTimeout(() => {
      isLongPressHandledRef.current = true;
      const voiceUrl = conn.voiceIntroUrl || conn.profile?.voiceIntroUrl;
      if (voiceUrl) {
        triggerHaptic('heavy');
        playHapticSound('pop');
        if (audioRef.current) audioRef.current.pause();
        audioRef.current = new Audio(voiceUrl);
        audioRef.current.onended = () => setActiveVoiceId(null);
        audioRef.current.play();
        setActiveVoiceId(conn.id);
      } else {
        triggerHaptic('light');
        if (addToast) {
          addToast({
            title: 'No Voice Intro 🎙️',
            message: `${conn.name} hasn't recorded a voice intro yet.`,
          });
        }
      }
    }, 3000);
  };

  const handlePressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Handle Spark Click with Confetti Burst
  const handleSparkClick = (e, conn) => {
    triggerHaptic('medium');
    playHapticSound('match');

    // Trigger Heart Confetti Burst
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 80,
      y: y + (Math.random() - 0.5) * 80,
      scale: Math.random() * 0.8 + 0.6,
      color: i % 2 === 0 ? '#F3C68F' : '#FF6B81'
    }));

    setConfettiBurst(newParticles);
    setTimeout(() => setConfettiBurst([]), 1000);

    onSelectConnection(conn);
  };

  // Handle Quick Icebreaker Send
  const handleSendIcebreaker = (conn, text) => {
    triggerHaptic('heavy');
    playHapticSound('pop');
    sendMessage(conn.id, text);
    setActiveIcebreakerId(null);
    onSelectConnection(conn);
  };

  // Handle Voice Intro Toggle (up to 2 mins)
  const handleToggleVoiceIntro = (e, conn) => {
    e.stopPropagation();
    if (!conn.voiceIntroUrl) return;

    if (activeVoiceId === conn.id) {
      if (audioRef.current) audioRef.current.pause();
      setActiveVoiceId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(conn.voiceIntroUrl);
      audioRef.current.onended = () => setActiveVoiceId(null);
      audioRef.current.play();
      setActiveVoiceId(conn.id);
      triggerHaptic('light');
    }
  };

  // 24h Unsent Spark Notification Check
  useEffect(() => {
    activeConnections.forEach(conn => {
      const conv = conversations.find(c => c.partnerId === conn.id || c.partnerId === conn.userId || c.id === conn.id);
      const connChats = chats[conn.id] || chats[conn.userId] || [];
      const hasChatted = Boolean((conv?.lastMessage && conv.lastMessage.trim()) || connChats.length > 0);

      const matchTime = new Date(conn.createdAt || Date.now()).getTime();
      const hoursElapsed = (Date.now() - matchTime) / (1000 * 60 * 60);

      const notifKey = `vh-24h-notified-${conn.id}`;
      if (hoursElapsed >= 24 && !hasChatted && !sessionStorage.getItem(notifKey)) {
        sessionStorage.setItem(notifKey, 'true');
        if (addToast) {
          addToast({
            title: '24h Spark Notice ⏱️',
            message: `24 hours completed without texting ${conn.name}.`,
            photo: getProfilePhoto(conn)
          });
        }
      }
    });
  }, [activeConnections, conversations, chats, addToast]);

  const handleGoDiscover = () => {
    setActiveTab('discover');
  };

  return (
    <div className="matches-page page-enter">
      {/* Floating Confetti Particle Overlay */}
      {confettiBurst.length > 0 && (
        <div className="confetti-overlay" aria-hidden="true">
          {confettiBurst.map(p => (
            <div
              key={p.id}
              className="confetti-heart"
              style={{
                left: `${p.x}px`,
                top: `${p.y}px`,
                transform: `scale(${p.scale})`,
                color: p.color
              }}
            >
              <Heart size={20} weight="fill" />
            </div>
          ))}
        </div>
      )}

      <PageHeader
        title="Your Connections"
        subtitle="People you've shared mutual interest with."
      />

      {/* Interactive Recent Sparks Story Ring Carousel */}
      {activeConnections.length > 0 && (
        <div className="recent-matches-carousel-wrap">
          <h3 className="carousel-section-title font-ui">Recent Sparks</h3>

          <div className="recent-matches-row">
            {activeConnections.map(conn => {
              const isOnline = onlineUserIds?.has(conn.id) || onlineUserIds?.has(conn.userId);
              const vibeScore = computeVibeMatch(userProfile, conn);
              const hasVoiceIntro = Boolean(conn.voiceIntroUrl);
              const isPlayingVoice = activeVoiceId === conn.id;
              const showIcebreaker = activeIcebreakerId === conn.id;

              // Check if users have exchanged messages
              const conv = conversations.find(c => c.partnerId === conn.id || c.partnerId === conn.userId || c.id === conn.id);
              const connChats = chats[conn.id] || chats[conn.userId] || [];
              const hasChatted = Boolean((conv?.lastMessage && conv.lastMessage.trim()) || connChats.length > 0);

              // 24-hour match warmth timer
              const matchDate = new Date(conn.createdAt || Date.now()).getTime();
              const hoursElapsed = (Date.now() - matchDate) / (1000 * 60 * 60);
              const isTimerActive = hoursElapsed < 24 && !hasChatted;
              const hoursRemaining = Math.max(24 - hoursElapsed, 0.5);
              const timerPercent = Math.min(Math.max((hoursRemaining / 24) * 100, 5), 100);

              const ringClassName = isPlayingVoice
                ? 'highlight-avatar-ring is-playing-audio'
                : isTimerActive 
                  ? 'highlight-avatar-ring is-timer-ring' 
                  : isOnline 
                    ? 'highlight-avatar-ring is-online-ring' 
                    : 'highlight-avatar-ring';

              return (
                <div key={conn.id} className="spark-card-item-wrap">
                  <button
                    type="button"
                    className="story-highlight-circle"
                    onMouseDown={() => handlePressStart(conn)}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={() => {
                      handlePressEnd();
                      setActiveIcebreakerId(null);
                    }}
                    onTouchStart={() => handlePressStart(conn)}
                    onTouchEnd={handlePressEnd}
                    onClick={(e) => {
                      if (isLongPressHandledRef.current) {
                        e.stopPropagation();
                        isLongPressHandledRef.current = false;
                        return;
                      }
                      handleSparkClick(e, conn);
                    }}
                    onMouseEnter={() => setActiveIcebreakerId(conn.id)}
                    title={isTimerActive ? `Hold 3s for voice intro | ~${Math.round(hoursRemaining)}h remaining` : `Hold 3s for voice intro | Chat with ${conn.name}`}
                  >
                    <div className={ringClassName}>
                      {/* Live Animated Equalizer Overlay while Voice Intro plays */}
                      {isPlayingVoice && (
                        <div className="voice-playing-equalizer" title="Playing Voice Intro">
                          <span className="eq-bar" />
                          <span className="eq-bar" />
                          <span className="eq-bar" />
                          <span className="eq-bar" />
                        </div>
                      )}

                      {/* Rose Gold SVG 24h Countdown Ring — Rendered ONLY during first 24h if no chat */}
                      {isTimerActive && !isPlayingVoice && (
                        <svg className="countdown-ring-svg" viewBox="0 0 76 76">
                          <defs>
                            <linearGradient id={`timerGrad-${conn.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#F3C68F" />
                              <stop offset="100%" stopColor="#FF6B81" />
                            </linearGradient>
                          </defs>
                          <circle cx="38" cy="38" r="35" className="ring-bg" />
                          <circle
                            cx="38"
                            cy="38"
                            r="35"
                            className="ring-progress"
                            style={{
                              strokeDasharray: 220,
                              strokeDashoffset: 220 - (220 * timerPercent) / 100,
                              stroke: `url(#timerGrad-${conn.id})`
                            }}
                          />
                        </svg>
                      )}

                      <img
                        src={getProfilePhoto(conn)}
                        alt={conn.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getDefaultAvatar(conn?.gender);
                        }}
                      />

                      {/* 2-Min Voice Intro Button */}
                      {hasVoiceIntro && (
                        <button
                          type="button"
                          className={`voice-ring-btn ${isPlayingVoice ? 'playing' : ''}`}
                          onClick={(e) => handleToggleVoiceIntro(e, conn)}
                          title="Listen to 2-Min Voice Intro"
                        >
                          {isPlayingVoice ? <Pause size={12} weight="fill" /> : <Microphone size={12} weight="fill" />}
                        </button>
                      )}
                    </div>

                    <span className="highlight-name font-ui">{conn.name}</span>
                  </button>

                  {/* Quick Icebreaker & Nudge Floating Popover */}
                  {showIcebreaker && (
                    <div className="icebreaker-popover font-ui">
                      <button
                        type="button"
                        className="icebreaker-chip"
                        onClick={() => handleSendIcebreaker(conn, "👋 Hey! Loved your story.")}
                      >
                        <HandWaving size={14} color="#F3C68F" weight="fill" />
                        <span>Say Hello</span>
                      </button>

                      <button
                        type="button"
                        className="icebreaker-chip"
                        onClick={() => handleSendIcebreaker(conn, "☕ Up for coffee sometime soon?")}
                      >
                        <Coffee size={14} color="#FF6B81" weight="fill" />
                        <span>Coffee?</span>
                      </button>

                      <button
                        type="button"
                        className="icebreaker-chip nudge-chip"
                        onClick={() => {
                          nudgeSpark(conn.id, conn.name);
                          setActiveIcebreakerId(null);
                        }}
                      >
                        <Lightning size={14} color="#F3C68F" weight="fill" />
                        <span>Nudge Spark</span>
                      </button>
                    </div>
                  )}
                </div>
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

        .confetti-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 9999;
        }

        .confetti-heart {
          position: absolute;
          animation: burstUp 0.9s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        @keyframes burstUp {
          0% { opacity: 1; transform: translateY(0) scale(0.5); }
          100% { opacity: 0; transform: translateY(-70px) scale(1.4); }
        }

        .carousel-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-3);
        }

        .spark-count-badge {
          font-size: var(--text-caption);
          color: var(--gold-400);
          font-weight: 600;
          background: rgba(243, 198, 143, 0.1);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(243, 198, 143, 0.3);
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
          margin-bottom: var(--space-4);
        }

        .recent-matches-row {
          display: flex;
          gap: var(--space-4);
          overflow-x: auto;
          padding-top: var(--space-2);
          padding-bottom: var(--space-3);
          scrollbar-width: none;
        }

        .recent-matches-row::-webkit-scrollbar {
          display: none;
        }

        .spark-card-item-wrap {
          position: relative;
        }

        .story-highlight-circle {
          background: transparent;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          flex-shrink: 0;
          transition: transform var(--duration-fast);
        }

        .story-highlight-circle:hover,
        .story-highlight-circle:active {
          transform: translateY(-2px);
        }

        .highlight-avatar-ring {
          position: relative;
          width: 68px;
          height: 68px;
          border-radius: 50%;
          padding: 3px;
          background: linear-gradient(135deg, #800020, #4A0E17);
          border: 2px solid #F3C68F;
          box-shadow: 0 4px 14px rgba(128, 0, 32, 0.5);
          transition: all 0.3s ease;
        }

        .highlight-avatar-ring.is-playing-audio {
          background: linear-gradient(135deg, #F3C68F, #FF6B81);
          border: none;
          box-shadow: 0 0 20px rgba(243, 198, 143, 0.85), 0 0 35px rgba(255, 107, 129, 0.6);
          animation: audioGlowPulse 1.2s ease-in-out infinite alternate;
        }

        @keyframes audioGlowPulse {
          0% { box-shadow: 0 0 12px rgba(243, 198, 143, 0.6), 0 0 20px rgba(255, 107, 129, 0.4); transform: scale(1); }
          100% { box-shadow: 0 0 24px rgba(243, 198, 143, 0.95), 0 0 40px rgba(255, 107, 129, 0.85); transform: scale(1.04); }
        }

        .voice-playing-equalizer {
          position: absolute;
          inset: 3px;
          border-radius: 50%;
          background: rgba(18, 14, 16, 0.65);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          z-index: 8;
        }

        .voice-playing-equalizer .eq-bar {
          width: 3px;
          background-color: #F3C68F;
          border-radius: 2px;
          animation: eqBouncing 0.7s ease-in-out infinite alternate;
        }

        .voice-playing-equalizer .eq-bar:nth-child(1) { height: 10px; animation-delay: 0.1s; }
        .voice-playing-equalizer .eq-bar:nth-child(2) { height: 20px; animation-delay: 0.3s; }
        .voice-playing-equalizer .eq-bar:nth-child(3) { height: 14px; animation-delay: 0.2s; }
        .voice-playing-equalizer .eq-bar:nth-child(4) { height: 22px; animation-delay: 0.4s; }

        @keyframes eqBouncing {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1.3); }
        }

        .highlight-avatar-ring.is-timer-ring {
          background: transparent;
          border: none;
          box-shadow: 0 4px 14px rgba(243, 198, 143, 0.35);
        }

        .highlight-avatar-ring.is-online-ring {
          background: linear-gradient(135deg, #34D399, #10B981, #059669);
          border: none;
          box-shadow: 0 0 16px rgba(16, 185, 129, 0.75), 0 0 6px rgba(52, 211, 153, 0.9);
          animation: onlineGlowPulse 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate;
        }

        @keyframes onlineGlowPulse {
          0% { box-shadow: 0 0 10px rgba(16, 185, 129, 0.5), 0 0 3px rgba(52, 211, 153, 0.7); }
          100% { box-shadow: 0 0 22px rgba(16, 185, 129, 0.95), 0 0 8px rgba(52, 211, 153, 1); }
        }

        .countdown-ring-svg {
          position: absolute;
          top: -4px;
          left: -4px;
          width: 76px;
          height: 76px;
          transform: rotate(-90deg);
          pointer-events: none;
        }

        .countdown-ring-svg .ring-bg {
          fill: none;
          stroke: rgba(255, 255, 255, 0.1);
          stroke-width: 3;
        }

        .countdown-ring-svg .ring-progress {
          fill: none;
          stroke-width: 3;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.5s ease;
        }

        .voice-ring-btn {
          position: absolute;
          top: -2px;
          right: -2px;
          background: var(--burgundy-500);
          color: #FFFFFF;
          border: 1.5px solid var(--bg-surface);
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          box-shadow: var(--shadow-sm);
        }

        .voice-ring-btn.playing {
          background: var(--gold-400);
          color: var(--charcoal-900);
          animation: pulseAudio 1s ease-in-out infinite alternate;
        }

        @keyframes pulseAudio {
          0% { transform: scale(1); }
          100% { transform: scale(1.2); }
        }

        .spark-vibe-tag {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          font-size: 10px;
          font-weight: 700;
          color: #F3C68F;
          margin-top: 2px;
        }

        .icebreaker-popover {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 4px;
          background: rgba(18, 14, 16, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: var(--radius-md);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 100;
          white-space: nowrap;
          animation: popFade 0.2s ease-out;
        }

        @keyframes popFade {
          0% { opacity: 0; transform: translate(-50%, -6px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }

        .icebreaker-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: #FFFFFF;
          font-size: var(--text-caption);
          font-weight: 500;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background var(--duration-fast);
        }

        .icebreaker-chip:hover {
          background-color: rgba(255, 255, 255, 0.12);
        }

        .icebreaker-chip.nudge-chip {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: #F3C68F;
          font-weight: 600;
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
