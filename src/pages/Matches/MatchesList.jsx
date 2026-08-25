import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Heart, ChatCircleText, Sparkle, Lightning, Star, HandWaving, Coffee, Microphone, Play, Pause, NotePencil, PencilSimple, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { PageHeader } from '../../components/UI/PageHeader';
import { EmptyState } from '../../components/UI/EmptyState';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { ProtectedImage } from '../../components/UI/ProtectedImage';
import { getProfilePhoto, getDefaultAvatar } from '../../utils/avatar';
import { computeVibeMatch } from '../../utils/vibe';
import { triggerHaptic, playHapticSound } from '../../utils/haptics';
import { VerifiedBadge } from '../../components/UI/VerifiedBadge';

const DEMO_ACTIVE_CONNECTION = {
  id: 'demo-active-match-1',
  userId: 'demo-active-user-1',
  name: 'Elena',
  age: 26,
  gender: 'female',
  city: 'San Francisco, CA',
  verified: true,
  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'],
  story: 'Sound artist & vinyl collector. Looking for sincere conversations and shared playlists.',
  interests: ['Analog Synths', 'Coffee Roasting', 'Midnight Walks'],
  sparkNote: 'Listening to Japanese jazz on vinyl today ☕',
  voiceIntroUrl: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
  matchedAt: new Date().toISOString()
};

const DEMO_RECEIVED_SUPER_SPARK = {
  id: 'demo-received-super-1',
  userId: 'demo-received-user-1',
  name: 'Julian',
  age: 28,
  gender: 'male',
  city: 'Brooklyn, NY',
  verified: true,
  photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'],
  story: 'Architect designing restorative spaces. Big fan of gallery strolls and rooftop espresso.',
  interests: ['Architecture', 'Film Photography', 'Espresso'],
  isSuper: true,
  isSuperSpark: true,
  relationshipIntent: 'Long-term'
};

const DEMO_SENT_INTEREST = {
  id: 'demo-sent-interest-1',
  userId: 'demo-sent-user-1',
  name: 'Clara',
  age: 25,
  gender: 'female',
  city: 'Seattle, WA',
  verified: true,
  photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
  photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80'],
  status: 'pending'
};

export const MatchesList = ({ onSelectConnection, onSelectProfile }) => {
  const { connections, interestsSent, interestStatuses, profiles, receivedInvites, sentInvitesList, setActiveTab, sendInterest, unsendInterest, onlineUserIds, sendMessage, userProfile, updateUserProfile, conversations = [], chats = {}, addToast, isFeatureTourActive } = useApp();

  const activeConnections = isFeatureTourActive && (!connections || connections.length === 0)
    ? [DEMO_ACTIVE_CONNECTION]
    : (connections || []);

  const displayReceivedInvites = isFeatureTourActive && (!receivedInvites || receivedInvites.length === 0)
    ? [DEMO_RECEIVED_SUPER_SPARK]
    : (receivedInvites || []);

  const rawPendingInterests = (sentInvitesList || []).filter(p => {
    const status = interestStatuses[p.id];
    return status !== 'mutual';
  });

  const pendingInterests = isFeatureTourActive && rawPendingInterests.length === 0
    ? [DEMO_SENT_INTEREST]
    : rawPendingInterests;

  // Pagination parameters (3 items per page for active/received, 4 items for sent)
  const ACTIVE_PER_PAGE = 3;
  const RECEIVED_PER_PAGE = 3;
  const SENT_PER_PAGE = 4;

  const [activeConnPage, setActiveConnPage] = useState(1);
  const [receivedPage, setReceivedPage] = useState(1);
  const [sentPage, setSentPage] = useState(1);

  const totalActivePages = Math.ceil(activeConnections.length / ACTIVE_PER_PAGE) || 1;
  const paginatedActiveConnections = activeConnections.slice(
    (activeConnPage - 1) * ACTIVE_PER_PAGE,
    activeConnPage * ACTIVE_PER_PAGE
  );

  const totalReceivedPages = Math.ceil(displayReceivedInvites.length / RECEIVED_PER_PAGE) || 1;
  const paginatedReceivedInvites = displayReceivedInvites.slice(
    (receivedPage - 1) * RECEIVED_PER_PAGE,
    receivedPage * RECEIVED_PER_PAGE
  );

  const totalSentPages = Math.ceil(pendingInterests.length / SENT_PER_PAGE) || 1;
  const paginatedSentInterests = pendingInterests.slice(
    (sentPage - 1) * SENT_PER_PAGE,
    sentPage * SENT_PER_PAGE
  );

  useEffect(() => {
    if (activeConnPage > totalActivePages) setActiveConnPage(Math.max(1, totalActivePages));
  }, [activeConnPage, totalActivePages]);

  useEffect(() => {
    if (receivedPage > totalReceivedPages) setReceivedPage(Math.max(1, totalReceivedPages));
  }, [receivedPage, totalReceivedPages]);

  useEffect(() => {
    if (sentPage > totalSentPages) setSentPage(Math.max(1, totalSentPages));
  }, [sentPage, totalSentPages]);

  const renderPagination = (currentPage, totalPages, setPage) => {
    if (totalPages <= 1) return null;
    return (
      <div className="section-pagination-bar font-ui">
        <button
          type="button"
          className="section-page-nav-btn"
          disabled={currentPage === 1}
          onClick={() => {
            triggerHaptic('selection');
            setPage(p => Math.max(1, p - 1));
          }}
          aria-label="Previous page"
        >
          <CaretLeft size={14} weight="bold" />
          <span>Previous</span>
        </button>
        <div className="section-page-dots">
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(num => (
            <button
              key={num}
              type="button"
              className={`section-page-dot-btn ${num === currentPage ? 'active' : ''}`}
              onClick={() => {
                triggerHaptic('selection');
                setPage(num);
              }}
              aria-label={`Go to page ${num}`}
            >
              {num}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="section-page-nav-btn"
          disabled={currentPage === totalPages}
          onClick={() => {
            triggerHaptic('selection');
            setPage(p => Math.min(totalPages, p + 1));
          }}
          aria-label="Next page"
        >
          <span>Next</span>
          <CaretRight size={14} weight="bold" />
        </button>
      </div>
    );
  };

  // Spark Note Modal state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteInput, setNoteInput] = useState(userProfile?.sparkNote || '');

  // Reply to Match's Spark Note state
  const [selectedNoteReplyMatch, setSelectedNoteReplyMatch] = useState(null);
  const [noteReplyInput, setNoteReplyInput] = useState('');

  const handleCloseNoteModal = React.useCallback(() => {
    setShowNoteModal(false);
  }, []);

  const handleSaveSparkNote = async (e) => {
    if (e) e.preventDefault();
    const trimmed = noteInput.trim();
    if (updateUserProfile) {
      await updateUserProfile({
        ...userProfile,
        sparkNote: trimmed || null
      });
    }
    setShowNoteModal(false);
  };

  const handleSendNoteReply = async (e) => {
    if (e) e.preventDefault();
    if (!selectedNoteReplyMatch || !noteReplyInput.trim()) return;

    const partnerId = selectedNoteReplyMatch.match.id || selectedNoteReplyMatch.match.userId;
    const noteText = selectedNoteReplyMatch.noteText;
    const replyMsg = `[NOTE_REPLY:"${noteText}"] ${noteReplyInput.trim()}`;

    try {
      if (sendMessage) {
        await sendMessage(partnerId, replyMsg);
      }
      if (addToast) {
        addToast(`Reply sent to ${selectedNoteReplyMatch.match.name}! 🚀`, 'success');
      }
      const matchToSelect = selectedNoteReplyMatch.match;
      setSelectedNoteReplyMatch(null);
      setNoteReplyInput('');
      onSelectConnection(matchToSelect);
    } catch (err) {
      console.error('Error sending note reply:', err);
      if (addToast) addToast('Failed to send reply. Please try again.', 'error');
    }
  };

  // Active audio player state for voice intros
  const [activeVoiceId, setActiveVoiceId] = useState(null);
  const audioRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const isLongPressHandledRef = useRef(false);



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

  // 24h Unsent Spark Notification Check & Auto-Text Dispatcher
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

      {/* Story Ring Carousel with Instagram-style Spark Notes */}
      {activeConnections.length > 0 && (
        <div className="recent-matches-carousel-wrap">
          <div className="recent-matches-row">
            {/* User's Own Spark Note Tile */}
            <div className="spark-card-item-wrap own-spark-note-card">
              <button
                type="button"
                className="story-highlight-circle own-note-circle"
                onClick={() => {
                  setNoteInput(userProfile?.sparkNote || '');
                  setShowNoteModal(true);
                }}
                title="Share a 24h Note with your matches"
              >
                {userProfile?.sparkNote && (
                  <div className="spark-note-bubble own font-ui page-enter">
                    <span className="note-text">&ldquo;{userProfile.sparkNote}&rdquo;</span>
                    <PencilSimple size={10} className="edit-icon" />
                  </div>
                )}
                <div className="highlight-avatar-ring is-own-ring">
                  <ProtectedImage
                    src={getProfilePhoto(userProfile)}
                    alt="Your Note"
                    className="highlight-avatar-img-wrap"
                    style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                    imgStyle={{ borderRadius: '50%' }}
                    fallbackSrc={getDefaultAvatar(userProfile?.gender)}
                  />
                  <span className="add-note-plus-badge">+</span>
                </div>
                <span className="highlight-name font-ui">Your Note</span>
              </button>
            </div>

            {/* Matches' Avatar Items with Spark Notes */}
            {activeConnections.map(conn => {
              const targetUserId = (typeof conn.userId === 'string' && conn.userId.trim()) || (typeof conn.id === 'string' && conn.id.trim()) || null;
              const isOnline = Boolean(
                onlineUserIds &&
                targetUserId &&
                onlineUserIds.has(targetUserId)
              );
              const hasVoiceIntro = Boolean(conn.voiceIntroUrl);
              const isPlayingVoice = activeVoiceId === conn.id;

              // Check if users have exchanged messages
              const conv = conversations.find(c => c.partnerId === conn.id || c.partnerId === conn.userId || c.id === conn.id);
              const connChats = chats[conn.id] || chats[conn.userId] || [];
              const hasChatted = Boolean((conv?.lastMessage && conv.lastMessage.trim()) || connChats.length > 0);

              // 24-hour match warmth timer
              const rawDate = conn.matchedAt || conn.matchedCreatedAt || conn.createdAt;
              const parsedDate = rawDate ? new Date(rawDate).getTime() : Date.now();
              const matchDate = isNaN(parsedDate) ? Date.now() : parsedDate;
              const hoursElapsed = Math.max(0, (Date.now() - matchDate) / (1000 * 60 * 60));
              const isTimerActive = hoursElapsed < 24 && !hasChatted;
              const hoursRemaining = Math.max(24 - hoursElapsed, 0.5);
              const timerPercent = Math.min(Math.max((hoursRemaining / 24) * 100, 5), 100);

              const ringClassName = isPlayingVoice
                ? 'highlight-avatar-ring is-playing-audio'
                : isOnline
                  ? 'highlight-avatar-ring is-online-ring'
                  : isTimerActive
                    ? 'highlight-avatar-ring is-timer-ring'
                    : 'highlight-avatar-ring';

              return (
                <div key={conn.id} className="spark-card-item-wrap">
                  <button
                    type="button"
                    className="story-highlight-circle"
                    onMouseDown={() => handlePressStart(conn)}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressEnd}
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
                  >
                    {/* Floating Instagram-style Spark Note Bubble */}
                    {conn.sparkNote && (
                      <div
                        className="spark-note-bubble match font-ui page-enter"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNoteReplyMatch({ match: conn, noteText: conn.sparkNote });
                          setNoteReplyInput('');
                        }}
                        title={`Click to reply to ${conn.name}'s note`}
                      >
                        <span className="note-text">&ldquo;{conn.sparkNote}&rdquo;</span>
                      </div>
                    )}

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

                      {/* Rose Gold SVG 24h Countdown Ring — Rendered ONLY during first 24h if no chat and not online */}
                      {isTimerActive && !isPlayingVoice && !isOnline && (
                        <svg className="countdown-ring-svg" viewBox="0 0 86 86">
                          <defs>
                            <linearGradient id={`timerGrad-${conn.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#F3C68F" />
                              <stop offset="100%" stopColor="#FF6B81" />
                            </linearGradient>
                          </defs>
                          <circle cx="43" cy="43" r="40" className="ring-bg" />
                          <circle
                            cx="43"
                            cy="43"
                            r="40"
                            className="ring-progress"
                            style={{
                              strokeDasharray: 251,
                              strokeDashoffset: 251 - (251 * timerPercent) / 100,
                              stroke: `url(#timerGrad-${conn.id})`
                            }}
                          />
                        </svg>
                      )}

                      <ProtectedImage
                        src={getProfilePhoto(conn)}
                        alt={conn.name}
                        className="highlight-avatar-img-wrap"
                        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                        imgStyle={{ borderRadius: '50%' }}
                        fallbackSrc={getDefaultAvatar(conn?.gender)}
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
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Connections Section */}
      <section className="connections-section">
        <div className="section-group-header">
          <h2 className="section-group-title font-ui" style={{ margin: 0 }}>Active Connections ({activeConnections.length})</h2>
          {totalActivePages > 1 && (
            <div className="section-header-pagination font-ui">
              <button
                type="button"
                className="section-mini-nav-btn"
                disabled={activeConnPage === 1}
                onClick={() => {
                  triggerHaptic('selection');
                  setActiveConnPage(p => Math.max(1, p - 1));
                }}
                title="Previous page"
              >
                <CaretLeft size={13} weight="bold" />
              </button>
              <span className="section-mini-page-text">{activeConnPage} / {totalActivePages}</span>
              <button
                type="button"
                className="section-mini-nav-btn"
                disabled={activeConnPage === totalActivePages}
                onClick={() => {
                  triggerHaptic('selection');
                  setActiveConnPage(p => Math.min(totalActivePages, p + 1));
                }}
                title="Next page"
              >
                <CaretRight size={13} weight="bold" />
              </button>
            </div>
          )}
        </div>
        {activeConnections.length > 0 ? (
          <>
            <div className="connections-grid">
              {paginatedActiveConnections.map(conn => {
              const targetUserId = (typeof conn.userId === 'string' && conn.userId.trim()) || (typeof conn.id === 'string' && conn.id.trim()) || null;
              const isOnline = Boolean(
                onlineUserIds &&
                targetUserId &&
                onlineUserIds.has(targetUserId)
              );
              const hasVoiceIntro = Boolean(conn.voiceIntroUrl);
              const isPlayingVoice = activeVoiceId === conn.id;

              const vibeScore = computeVibeMatch(userProfile, conn);
              const photoUrl = getProfilePhoto(conn);

              return (
                <div
                  key={conn.id}
                  className="match-profile-card"
                  onClick={() => onSelectConnection(conn)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSelectConnection(conn);
                  }}
                >
                  {/* Card Hero Image Area */}
                  <div className="match-card-photo-wrap">
                    <ProtectedImage
                      src={photoUrl}
                      alt={conn.name}
                      className="match-card-photo-protected"
                      imgClassName="match-card-photo"
                      style={{ width: '100%', height: '100%' }}
                      fallbackSrc={getDefaultAvatar(conn?.gender)}
                    />

                    {/* Gradient Overlay for Text Readability */}
                    <div className="match-card-gradient-overlay" />

                    {/* Voice Intro Player button */}
                    {hasVoiceIntro && (
                      <button
                        type="button"
                        className={`match-voice-btn ${isPlayingVoice ? 'playing' : ''}`}
                        onClick={(e) => handleToggleVoiceIntro(e, conn)}
                        title="Listen to Voice Intro"
                      >
                        {isPlayingVoice ? <Pause size={13} weight="fill" /> : <Microphone size={13} weight="fill" />}
                        <span>{isPlayingVoice ? 'Playing' : 'Voice'}</span>
                      </button>
                    )}

                    {/* Online Presence Indicator */}
                    <div className="match-card-presence-wrap">
                      <span
                        className={`match-online-dot ${isOnline ? 'online' : 'offline'}`}
                        title={isOnline ? 'Online now' : 'Offline'}
                      />
                    </div>

                    {/* Spark Note Overlay Bubble */}
                    {conn.sparkNote && (
                      <div
                        className="match-card-spark-note font-ui"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNoteReplyMatch({ match: conn, noteText: conn.sparkNote });
                          setNoteReplyInput('');
                        }}
                        title={`Reply to ${conn.name}'s note`}
                      >
                        <span className="note-text">&ldquo;{conn.sparkNote}&rdquo;</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content Details */}
                  <div className="match-card-content font-ui">
                    <div className="match-card-info-header">
                      <div className="match-name-age-row">
                        <h3 className="match-card-name font-display">{conn.name}</h3>
                        <span className="match-card-age font-ui">, {conn.age}</span>
                        {conn.verified && (
                          <VerifiedBadge variant="icon" size="sm" />
                        )}
                        {vibeScore > 0 && (
                          <span className="badge-vibe-inline font-ui" title={`${vibeScore}% Vibe Match`}>
                            <Sparkle size={11} color="var(--gold-500, #D4AD6A)" weight="fill" />
                            <span>{vibeScore}% Vibe</span>
                          </span>
                        )}
                      </div>
                      <p className="match-card-location-intent font-ui">
                        {conn.city} {conn.relationshipIntent ? `• ${conn.relationshipIntent}` : ''}
                      </p>
                    </div>

                    {/* Story or Interests Context Line */}
                    {conn.story ? (
                      <p className="match-card-story font-body italic">&ldquo;{conn.story}&rdquo;</p>
                    ) : conn.interests?.length > 0 ? (
                      <div className="match-card-interests font-ui">
                        {conn.interests.slice(0, 3).map(interest => (
                          <span key={interest} className="match-interest-tag">{interest}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="match-card-preview-text font-body italic">Tap to chat or view story...</p>
                    )}

                    {/* Preserved Match Action Buttons */}
                    <div className="match-card-actions">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectProfile) onSelectProfile(conn);
                        }}
                        variant="secondary"
                        className="match-action-btn story-btn font-ui"
                      >
                        View Story
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectConnection(conn);
                        }}
                        variant="primary"
                        className="match-action-btn chat-btn font-ui"
                      >
                        <ChatCircleText size={16} weight="fill" />
                        Chat
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {renderPagination(activeConnPage, totalActivePages, setActiveConnPage)}
        </>
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
                <path d="M50 32C50 32 47 38 47 42C47 44.5 48 45 50 45C53 45 53 44.5 53 42C53 38 50 32 50 32Z" fill="#FFFFFF" />
                <path d="M50 46V52" stroke="var(--charcoal-600)" strokeWidth="2" strokeLinecap="round" />
                <rect x="42" y="52" width="16" height="28" rx="2" fill="var(--burgundy-500)" />
                <path d="M30 80H70" stroke="var(--border-default)" strokeWidth="3" strokeLinecap="round" />
              </svg>
            }
          />
        )}
      </section>

      {/* Received Invites Section */}
      <section className="received-section border-top">
        <div className="section-group-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h2 className="section-group-title font-ui" style={{ margin: 0 }}>Received Invites ({displayReceivedInvites.length})</h2>
            {displayReceivedInvites.length > 0 && displayReceivedInvites.some(i => i.isSuper || i.isSuperSpark) && (
              <span className="vibe-badge-pill font-ui" style={{ borderColor: 'var(--gold-400)', color: 'var(--gold-400)' }}>
                <Star size={12} weight="fill" color="var(--gold-400)" /> Priority Super Spark
              </span>
            )}
          </div>
          {totalReceivedPages > 1 && (
            <div className="section-header-pagination font-ui">
              <button
                type="button"
                className="section-mini-nav-btn"
                disabled={receivedPage === 1}
                onClick={() => {
                  triggerHaptic('selection');
                  setReceivedPage(p => Math.max(1, p - 1));
                }}
                title="Previous page"
              >
                <CaretLeft size={13} weight="bold" />
              </button>
              <span className="section-mini-page-text">{receivedPage} / {totalReceivedPages}</span>
              <button
                type="button"
                className="section-mini-nav-btn"
                disabled={receivedPage === totalReceivedPages}
                onClick={() => {
                  triggerHaptic('selection');
                  setReceivedPage(p => Math.min(totalReceivedPages, p + 1));
                }}
                title="Next page"
              >
                <CaretRight size={13} weight="bold" />
              </button>
            </div>
          )}
        </div>
        {displayReceivedInvites.length > 0 ? (
          <>
            <div className="received-grid">
              {paginatedReceivedInvites.map(profile => {
                const isSuper = profile.isSuper || profile.isSuperSpark || profile.isSuperLike;
                const vibeScore = computeVibeMatch(userProfile, profile);
                return (
                  <div
                    key={profile.id}
                    className={`received-profile-card ${isSuper ? 'is-super-spark' : ''}`}
                    onClick={() => onSelectProfile(profile)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSelectProfile(profile);
                    }}
                  >
                    <div className="received-card-media">
                      <ProtectedImage
                        src={getProfilePhoto(profile)}
                        alt={profile.name}
                        className="received-card-image-wrap"
                        imgClassName="received-card-image"
                        style={{ width: '100%', height: '100%' }}
                        fallbackSrc={getDefaultAvatar(profile?.gender)}
                      />
                      <div className="received-card-gradient" />
                      {isSuper && (
                        <div className="received-super-badge font-ui">
                          <Star size={12} weight="fill" color="#1A1517" /> SUPER SPARK
                        </div>
                      )}
                    </div>
                    <div className="received-card-body font-ui">
                      <div className="received-name-row">
                        <h3 className="received-name font-display">{profile.name}</h3>
                        <span className="received-age font-ui">, {profile.age}</span>
                        {profile.verified && (
                          <VerifiedBadge variant="icon" size="sm" />
                        )}
                        {vibeScore > 0 && (
                          <span className="badge-vibe-inline font-ui" title={`${vibeScore}% Vibe Match`}>
                            <Sparkle size={11} color="var(--gold-500, #D4AD6A)" weight="fill" />
                            <span>{vibeScore}% Vibe</span>
                          </span>
                        )}
                      </div>
                      <p className="received-meta font-ui">{profile.city} {profile.relationshipIntent ? `• ${profile.relationshipIntent}` : ''}</p>
                      {profile.story && (
                        <p className="received-story font-body italic">&ldquo;{profile.story}&rdquo;</p>
                      )}
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
                    </div>
                  </div>
                );
              })}
            </div>
            {renderPagination(receivedPage, totalReceivedPages, setReceivedPage)}
          </>
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
        <div className="section-group-header">
          <h2 className="section-group-title font-ui" style={{ margin: 0 }}>Sent Interests ({pendingInterests.length})</h2>
          {totalSentPages > 1 && (
            <div className="section-header-pagination font-ui">
              <button
                type="button"
                className="section-mini-nav-btn"
                disabled={sentPage === 1}
                onClick={() => {
                  triggerHaptic('selection');
                  setSentPage(p => Math.max(1, p - 1));
                }}
                title="Previous page"
              >
                <CaretLeft size={13} weight="bold" />
              </button>
              <span className="section-mini-page-text">{sentPage} / {totalSentPages}</span>
              <button
                type="button"
                className="section-mini-nav-btn"
                disabled={sentPage === totalSentPages}
                onClick={() => {
                  triggerHaptic('selection');
                  setSentPage(p => Math.min(totalSentPages, p + 1));
                }}
                title="Next page"
              >
                <CaretRight size={13} weight="bold" />
              </button>
            </div>
          )}
        </div>
        {pendingInterests.length > 0 ? (
          <>
            <div className="pending-grid">
              {paginatedSentInterests.map(profile => {
                const status = interestStatuses[profile.id];
                const isSuper = profile.isSuper || profile.isSuperSpark || status === 'super';
                const vibeScore = computeVibeMatch(userProfile, profile);
                return (
                  <div key={profile.id} className={`pending-profile-card ${isSuper ? 'is-super-sent' : ''}`}>
                    <ProtectedImage
                      src={getProfilePhoto(profile)}
                      alt={profile.name}
                      className="pending-avatar-img-wrap"
                      imgClassName="pending-avatar-img"
                      style={{ width: '60px', height: '60px', borderRadius: '50%' }}
                      imgStyle={{ borderRadius: '50%' }}
                      fallbackSrc={getDefaultAvatar(profile?.gender)}
                    />
                    <div className="pending-card-info font-ui">
                      <div className="pending-name-row">
                        <span className="pending-name font-display">{profile.name}</span>
                        <span className="pending-age font-ui">, {profile.age}</span>
                        {profile.verified && (
                          <VerifiedBadge variant="icon" size="sm" />
                        )}
                        {vibeScore > 0 && (
                          <span className="badge-vibe-inline font-ui" title={`${vibeScore}% Vibe Match`}>
                            <Sparkle size={11} color="var(--gold-500, #D4AD6A)" weight="fill" />
                            <span>{vibeScore}% Vibe</span>
                          </span>
                        )}
                      </div>
                      <p className="pending-meta">{profile.city}</p>
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
            {renderPagination(sentPage, totalSentPages, setSentPage)}
          </>
        ) : (
          <div className="empty-pending-wrap font-ui">
            <p className="no-pending-text font-body">
              Profiles you have sent interest to will appear here until they respond.
            </p>
          </div>
        )}
      </section>

      {/* Spark Note Editor Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={handleCloseNoteModal}
        title="Your Spark Note 📝"
      >
        <p className="spark-note-modal-desc font-body">
          Share a quick status note (e.g. <em>&ldquo;Craving sushi 🍣&rdquo;</em>, <em>&ldquo;Coffee time ☕&rdquo;</em>) visible to your matches.
        </p>
        <form onSubmit={handleSaveSparkNote}>
          <div className="spark-note-input-wrap">
            <input
              type="text"
              maxLength={20}
              placeholder="What's on your mind? (max 20 chars)"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              className="spark-note-input font-ui"
              autoFocus
            />
            <span className="spark-note-char-count font-ui">{noteInput.length}/20</span>
          </div>

          <div className="spark-note-modal-actions font-ui">
            {userProfile?.sparkNote && (
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  setNoteInput('');
                  if (updateUserProfile) await updateUserProfile({ ...userProfile, sparkNote: null });
                  setShowNoteModal(false);
                }}
              >
                Clear Note
              </Button>
            )}
            <Button type="submit" variant="primary">
              Save Note
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reply to Match's Spark Note Modal */}
      <Modal
        isOpen={Boolean(selectedNoteReplyMatch)}
        onClose={() => setSelectedNoteReplyMatch(null)}
        title={`Reply to ${selectedNoteReplyMatch?.match?.name || 'Note'} 💬`}
      >
        {selectedNoteReplyMatch && (
          <div className="note-reply-modal-content">
            <div className="note-reply-quote-card font-ui">
              <ProtectedImage
                src={getProfilePhoto(selectedNoteReplyMatch.match)}
                alt={selectedNoteReplyMatch.match.name}
                className="note-reply-avatar-wrap"
                imgClassName="note-reply-avatar"
                style={{ width: '44px', height: '44px', borderRadius: '50%' }}
                imgStyle={{ borderRadius: '50%' }}
                fallbackSrc={getDefaultAvatar(selectedNoteReplyMatch.match?.gender)}
              />
              <div className="note-reply-quote-body">
                <span className="note-reply-author font-ui">{selectedNoteReplyMatch.match.name}&rsquo;s Spark Note</span>
                <p className="note-reply-text font-body">&ldquo;{selectedNoteReplyMatch.noteText}&rdquo;</p>
              </div>
            </div>

            <form onSubmit={handleSendNoteReply}>
              <div className="spark-note-input-wrap">
                <input
                  type="text"
                  placeholder={`Send a reply to ${selectedNoteReplyMatch.match.name}...`}
                  value={noteReplyInput}
                  onChange={(e) => setNoteReplyInput(e.target.value)}
                  className="spark-note-input font-ui"
                  autoFocus
                />
              </div>

              <div className="spark-note-modal-actions font-ui">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSelectedNoteReplyMatch(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!noteReplyInput.trim()}
                >
                  Send Reply
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>

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
          flex-direction: column;
          gap: 2px;
          margin-bottom: var(--space-3);
        }

        .carousel-section-subtitle {
          font-size: var(--text-xs);
          color: var(--text-muted);
        }

        .recent-matches-carousel-wrap {
          margin-top: 20px;
          margin-bottom: var(--space-5);
        }

        .spark-card-item-wrap {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .spark-note-bubble {
          position: absolute;
          top: -34px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(30, 20, 24, 0.96);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(212, 173, 106, 0.45);
          color: #fce7f3;
          padding: 5px 12px;
          border-radius: 14px;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.25;
          max-width: 110px;
          width: max-content;
          box-sizing: border-box;
          z-index: 12;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
          cursor: pointer;
          animation: floatSparkNote 3.2s ease-in-out infinite alternate;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          text-align: center;
        }

        .spark-note-bubble .note-text {
          white-space: normal;
          word-break: break-word;
          max-width: 94px;
          text-align: center;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes floatSparkNote {
          0% { transform: translate(-50%, 0px); }
          100% { transform: translate(-50%, -3px); }
        }

        .spark-note-bubble.own {
          background: var(--burgundy-600);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.35);
        }

        .spark-note-bubble.empty {
          background: rgba(184, 67, 106, 0.85);
          color: #ffffff;
          border: 1px dashed rgba(255, 255, 255, 0.5);
        }

        .edit-icon {
          opacity: 0.8;
        }

        .is-own-ring {
          border: 2px dashed var(--gold-400, #d4ad6a);
          position: relative;
        }

        .add-note-plus-badge {
          position: absolute;
          bottom: 2px;
          right: 2px;
          background: var(--gold-500, #d4ad6a);
          color: #000000;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: bold;
          border: 2px solid var(--bg-surface);
        }

        .spark-note-modal-desc {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-bottom: var(--space-4);
          line-height: var(--leading-relaxed);
        }

        .spark-note-input-wrap {
          position: relative;
          margin-bottom: var(--space-5);
        }

        .spark-note-input {
          width: 100%;
          padding: var(--space-3) var(--space-10) var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          background: var(--bg-base);
          color: var(--text-primary);
          font-size: var(--text-sm);
          outline: none;
          box-sizing: border-box;
          transition: border-color var(--duration-fast);
        }

        .spark-note-input:focus {
          border-color: var(--burgundy-500);
          box-shadow: 0 0 0 3px var(--burgundy-100, rgba(184, 67, 106, 0.15));
        }

        .spark-note-char-count {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: var(--text-caption);
          color: var(--text-muted);
        }

        .spark-note-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-3);
        }

        .note-reply-quote-card {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          background: var(--bg-base);
          border: 1px solid var(--border-subtle);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-xl);
          margin-bottom: var(--space-4);
        }

        .note-reply-avatar {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-full);
          object-fit: cover;
          border: 2px solid var(--burgundy-400);
          flex-shrink: 0;
        }

        .note-reply-quote-body {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .note-reply-author {
          font-size: var(--text-caption);
          font-weight: 600;
          color: var(--burgundy-400);
          letter-spacing: var(--tracking-wide);
          text-transform: uppercase;
        }

        .note-reply-text {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-primary);
          font-style: italic;
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
          gap: var(--space-5);
          overflow-x: auto;
          padding: 38px 16px 12px 16px;
          margin: 0 -16px;
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
          width: 78px;
          height: 78px;
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
          background: linear-gradient(135deg, #34D399, #10B981, #059669) !important;
          border: none !important;
          box-shadow: 0 0 16px rgba(16, 185, 129, 0.75), 0 0 6px rgba(52, 211, 153, 0.9) !important;
          animation: onlineGlowPulse 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate !important;
        }

        @keyframes onlineGlowPulse {
          0% { box-shadow: 0 0 10px rgba(16, 185, 129, 0.5), 0 0 3px rgba(52, 211, 153, 0.7); }
          100% { box-shadow: 0 0 22px rgba(16, 185, 129, 0.95), 0 0 8px rgba(52, 211, 153, 1); }
        }

        .countdown-ring-svg {
          position: absolute;
          top: -5px;
          left: -5px;
          width: 88px;
          height: 88px;
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
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 8px;
          top: auto;
          background: rgba(18, 14, 16, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: var(--radius-md);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 100;
          white-space: nowrap;
          animation: popFadeUp 0.2s ease-out;
        }

        @keyframes popFadeUp {
          0% { opacity: 0; transform: translate(-50%, 6px); }
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

        .highlight-avatar-ring img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--bg-surface);
        }

        .highlight-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          max-width: 82px;
          margin-top: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .spark-presence-dot,
        .online-presence-dot {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2.5px solid var(--bg-surface);
          z-index: 3;
          transition: background-color 0.2s ease, box-shadow 0.2s ease;
        }

        .spark-presence-dot {
          bottom: 1px;
          right: 1px;
          width: 15px;
          height: 15px;
        }

        .spark-presence-dot.online,
        .online-presence-dot.online {
          background-color: #10B981;
          box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
        }

        .spark-presence-dot.offline,
        .online-presence-dot.offline {
          background-color: #9CA3AF;
          opacity: 0.85;
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

        .section-group-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-4);
          gap: var(--space-3);
        }

        .section-group-title {
          font-size: var(--text-body-sm);
          font-weight: bold;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: var(--tracking-wide);
          margin-bottom: 0;
        }

        .section-header-pagination {
          display: flex;
          align-items: center;
          gap: 4px;
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          padding: 2px 6px;
          border-radius: var(--radius-full);
          box-shadow: var(--shadow-sm);
        }

        .section-mini-nav-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: var(--radius-full);
          transition: all var(--duration-fast);
        }

        .section-mini-nav-btn:hover:not(:disabled) {
          background: var(--bg-accent-subtle);
          color: var(--text-primary);
        }

        .section-mini-nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .section-mini-page-text {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-muted);
          padding: 0 4px;
        }

        .section-pagination-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: var(--space-6);
          padding-top: var(--space-2);
        }

        .section-page-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 14px;
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-full);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .section-page-nav-btn:hover:not(:disabled) {
          background: var(--bg-surface-warm);
          border-color: var(--border-focus);
          color: var(--text-primary);
          transform: translateY(-1px);
        }

        .section-page-nav-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .section-page-dots {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .section-page-dot-btn {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-full);
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .section-page-dot-btn:hover:not(.active) {
          background: var(--bg-surface-warm);
          color: var(--text-primary);
          border-color: var(--border-subtle);
        }

        .section-page-dot-btn.active {
          background: var(--burgundy-500, #b8334a);
          border-color: var(--burgundy-400);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(184, 51, 74, 0.4);
        }

        .connections-section {
          margin-bottom: var(--space-8);
        }

        /* Connections Responsive Grid */
        .connections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-6);
        }

        @media (max-width: 900px) {
          .connections-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-4);
          }
        }

        @media (max-width: 600px) {
          .connections-grid {
            grid-template-columns: 1fr;
            gap: var(--space-5);
          }
        }

        .match-profile-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .match-profile-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(184, 67, 106, 0.2);
          border-color: rgba(184, 67, 106, 0.4);
        }

        .match-card-photo-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 4/5;
          min-height: 260px;
          max-height: 360px;
          background-color: var(--charcoal-900);
          overflow: hidden;
        }

        .match-card-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }

        .match-profile-card:hover .match-card-photo {
          transform: scale(1.04);
        }

        .match-card-gradient-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(18, 14, 16, 0.95) 0%, rgba(18, 14, 16, 0.4) 45%, transparent 100%);
          pointer-events: none;
        }

        .match-card-top-badges {
          position: absolute;
          top: var(--space-3);
          left: var(--space-3);
          right: var(--space-3);
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 5;
          pointer-events: none;
        }

        .match-vibe-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(18, 14, 16, 0.85);
          border: 1px solid rgba(243, 198, 143, 0.4);
          color: #F3C68F;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: var(--radius-full);
          backdrop-filter: blur(8px);
        }

        .match-verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: rgba(46, 125, 50, 0.85);
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          backdrop-filter: blur(4px);
        }

        .match-voice-btn {
          position: absolute;
          top: var(--space-3);
          right: var(--space-3);
          background: rgba(184, 67, 106, 0.9);
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          z-index: 6;
          backdrop-filter: blur(6px);
          transition: all 0.2s ease;
        }

        .match-voice-btn.playing {
          background: linear-gradient(135deg, #F3C68F, #FF6B81);
          color: #1A1517;
          border-color: #F3C68F;
          box-shadow: 0 0 12px rgba(243, 198, 143, 0.8);
        }

        .match-card-presence-wrap {
          position: absolute;
          bottom: var(--space-3);
          right: var(--space-3);
          z-index: 5;
        }

        .match-online-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid var(--bg-surface);
          display: block;
        }

        .match-online-dot.online {
          background-color: #10B981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
        }

        .match-online-dot.offline {
          background-color: #6B7280;
          opacity: 0.7;
        }

        .match-card-spark-note {
          position: absolute;
          bottom: var(--space-3);
          left: var(--space-3);
          max-width: calc(100% - 48px);
          background: rgba(30, 20, 24, 0.95);
          border: 1px solid rgba(212, 173, 106, 0.5);
          color: #FCE7F3;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          z-index: 6;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .match-card-content {
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          flex: 1;
          background: var(--bg-surface);
        }

        .match-card-info-header {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .match-name-age-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px 6px;
        }

        .badge-vibe-inline {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: rgba(212, 173, 106, 0.14);
          border: 1px solid rgba(212, 173, 106, 0.35);
          color: var(--gold-700, #8A6D3B);
          font-size: 10px;
          font-weight: 700;
          padding: 1.5px 6px;
          border-radius: var(--radius-full);
          line-height: 1;
          white-space: nowrap;
        }

        [data-theme="dark"] .badge-vibe-inline {
          background: rgba(212, 173, 106, 0.16);
          border-color: rgba(212, 173, 106, 0.35);
          color: var(--gold-300, #E6C78E);
        }

        .match-card-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .match-card-age {
          font-size: 1rem;
          color: var(--text-secondary);
          font-weight: 400;
        }

        .match-card-location-intent {
          font-size: var(--text-caption);
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .match-intent-text {
          color: var(--burgundy-400, #D0607F);
          font-weight: 600;
        }

        .match-card-story {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 2px 0;
        }

        .match-card-interests {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin: 2px 0;
        }

        .match-interest-tag {
          font-size: 11px;
          background: var(--bg-surface-raised, rgba(255, 255, 255, 0.06));
          color: var(--text-secondary);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
        }

        .match-card-preview-text {
          font-size: var(--text-caption);
          color: var(--text-muted);
        }

        .match-card-actions {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-top: auto;
          padding-top: var(--space-2);
        }

        .match-action-btn {
          flex: 1;
          padding: 8px 12px !important;
          font-size: var(--text-body-sm) !important;
          font-weight: 600 !important;
          border-radius: var(--radius-full) !important;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        /* Received Section */
        .received-section {
          margin-top: var(--space-6);
        }

        .received-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-5);
        }

        @media (max-width: 600px) {
          .received-grid {
            grid-template-columns: 1fr;
          }
        }

        .received-profile-card {
          display: flex;
          flex-direction: column;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          position: relative;
        }

        .received-profile-card.is-super-spark {
          border: 1.5px solid var(--gold-400);
          background: linear-gradient(135deg, rgba(212, 173, 106, 0.12), rgba(30, 24, 27, 0.95));
          box-shadow: 0 6px 24px rgba(212, 173, 106, 0.25);
        }

        .received-profile-card:hover {
          transform: translateY(-3px);
          border-color: var(--burgundy-400);
          box-shadow: 0 12px 28px rgba(184, 67, 106, 0.25);
        }

        .received-card-media {
          position: relative;
          width: 100%;
          height: 220px;
          overflow: hidden;
          background-color: var(--charcoal-900);
        }

        .received-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .received-profile-card:hover .received-card-image {
          transform: scale(1.04);
        }

        .received-card-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(18, 14, 16, 0.95) 0%, transparent 80%);
          pointer-events: none;
        }

        .received-super-badge {
          position: absolute;
          top: var(--space-3);
          left: var(--space-3);
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(212, 173, 106, 0.95);
          color: #1A1517;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.5px;
          padding: 3px 9px;
          border-radius: var(--radius-full);
          z-index: 5;
        }

        .received-card-body {
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .received-name-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px 6px;
        }

        .received-name {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .received-age {
          font-size: 1rem;
          color: var(--text-secondary);
          font-weight: 400;
        }

        .received-meta {
          font-size: var(--text-caption);
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .received-story {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .accept-invite-btn {
          width: 100%;
          justify-content: center;
          gap: 6px;
          margin-top: var(--space-2);
          padding: 10px 16px !important;
          font-size: var(--text-body-sm) !important;
          font-weight: 700 !important;
        }

        /* Pending Sent Section */
        .border-top {
          border-top: 1px solid var(--border-subtle);
          padding-top: var(--space-6);
        }

        .pending-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: var(--space-4);
        }

        @media (max-width: 600px) {
          .pending-grid {
            grid-template-columns: 1fr;
          }
        }

        .pending-profile-card {
          display: flex;
          align-items: center;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: 16px;
          padding: var(--space-3) var(--space-4);
          gap: var(--space-3);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .pending-profile-card:hover {
          border-color: var(--border-default);
          transform: translateY(-2px);
        }

        .pending-profile-card.is-super-sent {
          border: 1px solid var(--gold-400);
          background: linear-gradient(135deg, rgba(212, 173, 106, 0.08), var(--bg-surface));
        }

        .pending-avatar-img {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
          border: 2px solid var(--border-subtle);
        }

        .pending-card-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
        }

        .pending-name-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px 6px;
        }

        .pending-name {
          font-size: var(--text-body);
          font-weight: 700;
          color: var(--text-primary);
        }

        .pending-age {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
        }

        .pending-meta {
          font-size: var(--text-caption);
          color: var(--text-tertiary);
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
      `}</style>
    </div>
  );
};
