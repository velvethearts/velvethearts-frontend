import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { PaperPlaneRight, ArrowLeft, DotsThreeVertical, ShieldWarning, Prohibit, ChatCircleText } from '@phosphor-icons/react';
import { EmptyState } from '../../components/UI/EmptyState';
import { Button } from '../../components/UI/Button';
import { getSocket, joinConversation, leaveConversation, emitStartTyping, emitStopTyping } from '../../lib/socket';

export const ChatView = ({ preselectedConnectionId, onClearPreselected }) => {
  const { connections, conversations, chats, sendMessage, unmatchConnection, blockUser, reportUser } = useApp();
  const [activeChatId, setActiveChatId] = useState(preselectedConnectionId || null);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [localIsTyping, setLocalIsTyping] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Synchronize preselected chat from matches tab
  useEffect(() => {
    if (preselectedConnectionId) {
      setActiveChatId(preselectedConnectionId);
    }
  }, [preselectedConnectionId]);

  // Find all active chat partners where both have sent messages to each other,
  // or temporarily include the active chat partner if they are currently selected.
  const chatPartners = connections.filter(conn => {
    const partnerChats = chats[conn.id] || [];
    const userSent = partnerChats.some(m => m.sender === 'user');
    const partnerSent = partnerChats.some(m => m.sender === 'partner');
    return (userSent && partnerSent) || conn.id === activeChatId;
  });

  // Find active chat partner details
  const activePartner = connections.find(c => c.id === activeChatId);

  const conversation = conversations.find(c => c.partnerId === activeChatId);
  const conversationId = conversation?.id;

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, activeChatId, isTyping]);

  // Join/Leave conversation rooms
  useEffect(() => {
    if (conversationId) {
      joinConversation(conversationId);
      return () => {
        leaveConversation(conversationId);
      };
    }
  }, [conversationId]);

  // Listen for real-time typing events via socket
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !conversationId) return;

    const handleTyping = (data) => {
      if (data.conversationId === conversationId) {
        setIsTyping(data.isTyping);
      }
    };

    socket.on('typing', handleTyping);

    return () => {
      socket.off('typing', handleTyping);
      setIsTyping(false);
    };
  }, [conversationId]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !activeChatId) return;

    sendMessage(activeChatId, messageText.trim());
    setMessageText('');

    if (conversationId) {
      setLocalIsTyping(false);
      emitStopTyping(conversationId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setMessageText(val);

    if (!conversationId) return;

    if (!localIsTyping && val.trim().length > 0) {
      setLocalIsTyping(true);
      emitStartTyping(conversationId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setLocalIsTyping(false);
      emitStopTyping(conversationId);
    }, 2000);
  };

  const handleUnmatch = () => {
    if (window.confirm(`Remove ${activePartner.name} from your connections? You can rediscover each other later — this doesn't block them.`)) {
      unmatchConnection(activePartner.matchId, activeChatId);
      setActiveChatId(null);
      setShowDropdown(false);
      if (onClearPreselected) onClearPreselected();
    }
  };

  const handleBlock = () => {
    if (window.confirm(`Block ${activePartner.name}? They will be permanently removed from your connections and won't be able to contact you again.`)) {
      blockUser(activeChatId);
      setActiveChatId(null);
      setShowDropdown(false);
      if (onClearPreselected) onClearPreselected();
    }
  };

  const handleReport = () => {
    const reason = window.prompt(`Please enter the reason for reporting ${activePartner.name}:`);
    if (reason) {
      reportUser(activeChatId, 'Reported from Chat', reason);
      setActiveChatId(null);
      setShowDropdown(false);
      alert('Thank you for submitting the report. The user has been blocked.');
      if (onClearPreselected) onClearPreselected();
    }
  };

  const handleBackToList = () => {
    setActiveChatId(null);
    if (onClearPreselected) onClearPreselected();
  };

  const activeMessagesRaw = activeChatId ? chats[activeChatId] || [] : [];
  const activeMessages = [];
  const seenIds = new Set();
  for (const m of activeMessagesRaw) {
    if (!seenIds.has(m.id)) {
      seenIds.add(m.id);
      activeMessages.push(m);
    }
  }

  return (
    <div className="chat-page page-enter">
      <div className={`chat-layout ${activeChatId ? 'partner-selected' : ''}`}>
        
        {/* Left Side Pane: Connection List */}
        <div className="chat-sidebar-pane">
          <header className="chat-pane-header font-ui">
            <h1 className="chat-title font-display">Conversations</h1>
          </header>

          <div className="chat-partners-list">
            {chatPartners.length > 0 ? (
              chatPartners.map(partner => {
                const partnerChats = chats[partner.id] || [];
                const lastMsg = partnerChats[partnerChats.length - 1];
                const isActive = partner.id === activeChatId;

                return (
                  <button
                    key={partner.id}
                    onClick={() => {
                      setActiveChatId(partner.id);
                      if (onClearPreselected) onClearPreselected();
                    }}
                    className={`partner-list-item ${isActive ? 'active' : ''}`}
                  >
                    <div className="avatar-wrapper">
                      <img src={partner.photo} alt={partner.name} className="partner-item-img" />
                      <span className="online-indicator-dot" />
                    </div>
                    
                    <div className="partner-item-info">
                      <div className="partner-item-name-row">
                        <span className="partner-item-name font-ui">{partner.name}</span>
                        {lastMsg && <span className="partner-item-time font-ui">{lastMsg.timestamp}</span>}
                      </div>
                      <p className="partner-item-preview font-body">
                        {lastMsg ? lastMsg.text : 'Start a warm conversation...'}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <EmptyState
                title="No active chats"
                desc="Conversations will appear here once mutual connections are made."
                icon={<ChatCircleText size={32} />}
                style={{border: "none"}}
              />
            )}
          </div>
        </div>

        {/* Right Side Pane: Message Area */}
        <div className="chat-messages-pane">
          {activePartner ? (
            <div className="active-chat-wrapper" key={activeChatId}>
              {/* Header */}
              <header className="active-chat-header font-ui">
                <button onClick={handleBackToList} className="chat-mobile-back-btn" aria-label="Back to chat list">
                  <ArrowLeft size={20} />
                </button>

                <div className="active-chat-meta">
                  <img src={activePartner.photo} alt={activePartner.name} className="active-header-img" />
                  <div>
                    <h2 className="active-header-name font-display">{activePartner.name}</h2>
                    <span className="active-header-status font-ui">Online</span>
                  </div>
                </div>

                <div className="active-header-options">
                  <button 
                    onClick={() => setShowDropdown(prev => !prev)} 
                    className="options-toggle-btn"
                    aria-label="Chat options"
                  >
                    <DotsThreeVertical size={24} weight="bold" />
                  </button>

                  {showDropdown && (
                    <div className="options-dropdown font-ui" role="menu">
                      <button onClick={handleUnmatch} role="menuitem" className="dropdown-item">
                        <Prohibit size={16} />
                        <span>Remove Connection</span>
                      </button>
                      <button onClick={handleBlock} role="menuitem" className="dropdown-item danger">
                        <ShieldWarning size={16} />
                        <span>Block user</span>
                      </button>
                      <button onClick={handleReport} role="menuitem" className="dropdown-item danger">
                        <ShieldWarning size={16} />
                        <span>Report user</span>
                      </button>
                    </div>
                  )}
                </div>
              </header>

              {/* Chat Log */}
              <div className="chat-log-container">
                <div className="chat-log-scroll">
                  <div className="chat-welcome-indicator font-body">
                    🛡️ Conversations are confidential. Always feel free to block or report from the menu.
                  </div>

                  {activeMessages.map(msg => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div key={msg.id} className={`chat-message-bubble-row ${isUser ? 'user-sent' : 'partner-sent'}`}>
                        {!isUser && (
                          <img src={activePartner.photo} alt={activePartner.name} className="message-bubble-img" />
                        )}
                        <div className="message-bubble-content">
                          <div className="message-bubble-text font-body">{msg.text}</div>
                          <span className="message-bubble-time font-ui">{msg.timestamp}</span>
                        </div>
                      </div>
                    );
                  })}

                  {isTyping && (
                    <div className="chat-message-bubble-row partner-sent page-enter">
                      <img src={activePartner.photo} alt={activePartner.name} className="message-bubble-img" />
                      <div className="typing-bubble">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Footer */}
              <form onSubmit={handleSend} className="chat-input-footer">
                <input
                  type="text"
                  placeholder={`Send a warm message to ${activePartner.name}...`}
                  value={messageText}
                  onChange={handleInputChange}
                  className="chat-text-input font-body"
                />
                <button type="submit" className="chat-send-btn" disabled={!messageText.trim()} aria-label="Send message">
                  <PaperPlaneRight size={20} weight="fill" />
                </button>
              </form>
            </div>
          ) : (
            <EmptyState
              title="The beginning of a story"
              desc="Every meaningful conversation starts with a single hello. Choose a connection on the left to begin your dialogue."
              icon={
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.85 }}>
                  {/* Cozily steaming beverage mug illustration */}
                  <path d="M42 22C42 22 44 14 43 10" stroke="var(--burgundy-400)" strokeWidth="2" strokeLinecap="round" />
                  <path d="M50 24C50 24 52 16 51 12" stroke="var(--burgundy-400)" strokeWidth="2" strokeLinecap="round" />
                  <path d="M58 22C58 22 60 14 59 10" stroke="var(--burgundy-400)" strokeWidth="2" strokeLinecap="round" />
                  <rect x="36" y="32" width="28" height="32" rx="4" fill="var(--burgundy-500)" />
                  <path d="M64 40C68 40 70 42 70 48C70 54 68 56 64 56" stroke="var(--burgundy-500)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M28 64H72" stroke="var(--border-default)" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M50 50C48.5 47 45.5 47.5 45.5 49.5C45.5 51.5 50 54.5 50 54.5C50 54.5 54.5 51.5 54.5 49.5C54.5 47.5 51.5 47 50 50Z" fill="#FFFFFF" />
                </svg>
              }
            />
          )}
        </div>

      </div>

      <style>{`
        .chat-page {
          height: 100vh;
          width: 100%;
          padding: 0;
          background-color: var(--bg-page);
        }

        .chat-layout {
          display: flex;
          height: 100%;
          width: 100%;
          overflow: hidden;
        }

        /* Sidebar list */
        .chat-sidebar-pane {
          width: 100%;
          height: 100%;
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          background-color: var(--bg-surface);
        }

        .chat-pane-header {
          padding: var(--space-6) var(--space-4);
          border-bottom: 1px solid var(--border-subtle);
        }

        .chat-title {
          font-size: var(--text-heading);
          color: var(--burgundy-900);
        }

        [data-theme="dark"] .chat-title {
          color: var(--cream-100);
        }

        .chat-partners-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .partner-list-item {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4);
          border-bottom: 1px solid var(--border-subtle);
          width: 100%;
          text-align: left;
          transition: all var(--duration-fast);
        }

        .partner-list-item:hover {
          background-color: var(--bg-surface-warm);
        }

        .partner-list-item.active {
          background-color: var(--bg-accent-subtle);
        }

        .avatar-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .partner-item-img {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--border-subtle);
        }

        .online-indicator-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: var(--success);
          position: absolute;
          bottom: 2px;
          right: 2px;
          border: 2px solid #FFFFFF;
        }

        .partner-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
        }

        .partner-item-name-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .partner-item-name {
          font-weight: 600;
          color: var(--text-primary);
          font-size: var(--text-body);
        }

        .partner-item-time {
          font-size: 11px;
          color: var(--text-muted);
        }

        .partner-item-preview {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Message Area */
        .chat-messages-pane {
          flex: 1;
          height: 100%;
          display: none;
          background-color: var(--bg-page);
        }

        .active-chat-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
        }

        .active-chat-header {
          display: flex;
          align-items: center;
          padding: var(--space-4) var(--space-6);
          background-color: var(--bg-surface);
          border-bottom: 1px solid var(--border-subtle);
          position: relative;
          z-index: 10;
        }

        .chat-mobile-back-btn {
          display: flex;
          align-items: center;
          margin-right: var(--space-4);
          color: var(--text-secondary);
        }

        .active-chat-meta {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex: 1;
        }

        .active-header-img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .active-header-name {
          font-size: var(--text-subheading);
          color: var(--text-primary);
        }

        .active-header-status {
          font-size: 11px;
          color: var(--success);
          font-weight: bold;
        }

        .active-header-options {
          position: relative;
        }

        .options-toggle-btn {
          color: var(--text-secondary);
          display: flex;
          align-items: center;
        }

        .options-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          width: 180px;
          margin-top: var(--space-2);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          width: 100%;
          text-align: left;
          font-size: var(--text-body-sm);
          color: var(--text-primary);
          transition: background-color var(--duration-fast);
        }

        .dropdown-item:hover {
          background-color: var(--bg-surface-warm);
        }

        .dropdown-item.danger {
          color: var(--error);
        }

        .dropdown-item.danger:hover {
          background-color: var(--error-light);
        }

        /* Log */
        .chat-log-container {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-6);
        }

        .chat-log-scroll {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .chat-welcome-indicator {
          background-color: var(--bg-surface-warm);
          border: 1px solid var(--border-subtle);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          text-align: center;
          max-width: 400px;
          margin: 0 auto var(--space-4);
        }

        .chat-message-bubble-row {
          display: flex;
          gap: var(--space-3);
          width: 100%;
          max-width: 80%;
        }

        .chat-message-bubble-row.user-sent {
          margin-left: auto;
          justify-content: flex-end;
        }

        .message-bubble-img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          align-self: flex-end;
        }

        .message-bubble-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .message-bubble-text {
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-lg);
          font-size: var(--text-body-sm);
          line-height: var(--leading-normal);
        }

        .user-sent .message-bubble-text {
          background-color: var(--burgundy-500);
          color: #FFFFFF;
          border-bottom-right-radius: var(--radius-sm);
        }

        .partner-sent .message-bubble-text {
          background-color: var(--bg-surface);
          color: var(--text-primary);
          border: 1px solid var(--border-subtle);
          border-bottom-left-radius: var(--radius-sm);
        }

        .message-bubble-time {
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 1px;
        }

        .user-sent .message-bubble-time {
          align-self: flex-end;
        }

        /* Typing indicator dots */
        .typing-bubble {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-lg);
          border-bottom-left-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--charcoal-500);
          animation: dotPulse 1.2s infinite;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        /* Footer Input */
        .chat-input-footer {
          padding: var(--space-4) var(--space-6);
          background-color: var(--bg-surface);
          border-top: 1px solid var(--border-subtle);
          display: flex;
          gap: var(--space-4);
          align-items: center;
        }

        .chat-text-input {
          flex: 1;
          border: 1.5px solid var(--border-default);
          border-radius: var(--radius-full);
          padding: var(--space-3) var(--space-5);
          outline: none;
          background-color: var(--bg-input);
          color: var(--text-primary);
          transition: all var(--duration-fast);
        }

        .chat-text-input:focus {
          border-color: var(--border-focus);
           background-color: var(--bg-input);
        }

        .chat-send-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: var(--burgundy-500);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--duration-fast);
        }

        .chat-send-btn:hover {
          background-color: var(--burgundy-400);
          transform: scale(1.05);
        }

        .chat-send-btn:disabled {
          background-color: var(--charcoal-300);
          color: var(--charcoal-500);
          transform: none;
        }

        /* Responsive behavior */
        @media (max-width: 767px) {
          .partner-selected .chat-sidebar-pane {
            display: none;
          }
          .partner-selected .chat-messages-pane {
            display: block;
          }
        }

        @media (min-width: 768px) {
          .chat-sidebar-pane {
            width: 320px;
          }
          .chat-messages-pane {
            display: block;
          }
          .chat-mobile-back-btn {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};