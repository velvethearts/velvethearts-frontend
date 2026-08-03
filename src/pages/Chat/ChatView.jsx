import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { 
  PaperPlaneRight, 
  ArrowLeft, 
  DotsThreeVertical, 
  ShieldWarning, 
  Prohibit, 
  ChatCircleText, 
  Trash,
  Paperclip,
  Image as ImageIcon,
  FileText,
  DownloadSimple,
  X,
  Spinner
} from '@phosphor-icons/react';
import { EmptyState } from '../../components/UI/EmptyState';
import { getSocket, joinConversation, leaveConversation, emitStartTyping, emitStopTyping } from '../../lib/socket';

const formatFileSize = (bytes) => {
  if (!bytes) return 'File';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const ChatView = ({ preselectedConnectionId, onClearPreselected }) => {
  const { connections, conversations, chats, sendMessage, deleteMessage, deleteConversationMessages, unmatchConnection, blockUser, reportUser, showConfirm, showAlert, onlineUserIds } = useApp();
  
  const isUserOnline = (partner) => {
    if (!partner) return false;
    return Boolean(onlineUserIds && (onlineUserIds.has(partner.userId) || onlineUserIds.has(partner.id)));
  };
  const [activeChatId, setActiveChatId] = useState(preselectedConnectionId || null);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [localIsTyping, setLocalIsTyping] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingAttachment(true);
    try {
      for (const file of files) {
        const isImg = file.type.startsWith('image/');
        const isVid = file.type.startsWith('video/');
        const fileType = isImg ? 'IMAGE' : isVid ? 'VIDEO' : 'DOCUMENT';
        const previewUrl = URL.createObjectURL(file);

        let uploadRes = null;
        if (api.isConfigured) {
          try {
            const res = await api.uploadFile(file);
            uploadRes = res?.data || res;
          } catch (uploadErr) {
            console.error('File upload error, using local fallback:', uploadErr);
          }
        }

        const attachmentObj = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          cloudinaryPublicId: uploadRes?.publicId || `local_${Date.now()}`,
          secureUrl: uploadRes?.secureUrl || previewUrl,
          fileType,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          localPreview: previewUrl
        };

        setSelectedAttachments(prev => [...prev, attachmentObj]);
      }
    } catch (err) {
      await showAlert({ title: 'Upload Failed', message: 'Could not process attachment. Please try again.' });
    } finally {
      setIsUploadingAttachment(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveAttachment = (attId) => {
    setSelectedAttachments(prev => prev.filter(a => a.id !== attId));
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if ((!messageText.trim() && selectedAttachments.length === 0) || !activeChatId) return;

    const textToSend = messageText.trim();
    const attachmentsToSend = [...selectedAttachments];

    setMessageText('');
    setSelectedAttachments([]);

    await sendMessage(activeChatId, textToSend, attachmentsToSend);

    if (conversationId) {
      setLocalIsTyping(false);
      emitStopTyping(conversationId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  // Synchronize preselected chat from matches tab or select first connection on desktop
  useEffect(() => {
    if (preselectedConnectionId) {
      setActiveChatId(preselectedConnectionId);
    } else if (!activeChatId && connections.length > 0 && window.innerWidth >= 768) {
      setActiveChatId(connections[0].id);
    }
  }, [preselectedConnectionId, connections]);

  // All connections are valid chat partners
  const chatPartners = connections;

  // Find active chat partner details
  const activePartner = connections.find(c => c.id === activeChatId || c.matchId === activeChatId || c.userId === activeChatId);

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

  const handleUnmatch = async () => {
    const confirmed = await showConfirm({
      title: 'Remove Connection',
      message: `Remove ${activePartner.name} from your connections? You can rediscover each other later — this doesn't block them.`,
      okText: 'Remove',
      cancelText: 'Cancel'
    });
    if (confirmed) {
      unmatchConnection(activePartner.matchId, activeChatId);
      setActiveChatId(null);
      setShowDropdown(false);
      if (onClearPreselected) onClearPreselected();
    }
  };

  const handleBlock = async () => {
    if (!activePartner) return;
    const confirmed = await showConfirm({
      title: 'Block User',
      message: `Block ${activePartner.name}? They will be permanently removed from your connections and won't be able to contact you again.`,
      okText: 'Block',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      const targetId = activePartner.userId || activePartner.id || activeChatId;
      await blockUser(targetId);
      setActiveChatId(null);
      setShowDropdown(false);
      if (onClearPreselected) onClearPreselected();
    }
  };

  const handleReport = async () => {
    if (!activePartner) return;
    const confirmed = await showConfirm({
      title: `Report & Block ${activePartner.name}`,
      message: `Are you sure you want to report ${activePartner.name}? They will be blocked and removed from your connections.`,
      okText: 'Report & Block',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      const targetId = activePartner.userId || activePartner.id || activeChatId;
      await reportUser(targetId, 'Reported from Chat', 'User reported via chat menu');
      setActiveChatId(null);
      setShowDropdown(false);
      await showAlert({ title: 'Report Submitted', message: 'Thank you for submitting the report. The user has been blocked.' });
      if (onClearPreselected) onClearPreselected();
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!activeChatId) return;
    const confirmed = await showConfirm({
      title: 'Delete Message',
      message: 'Delete this message for everyone?',
      okText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (!confirmed) return;

    try {
      if (lightboxImage) setLightboxImage(null);
      await deleteMessage(activeChatId, messageId);
    } catch (err) {
      console.warn('handleDeleteMessage warning:', err);
    }
  };

  const handleDeleteChat = async () => {
    if (!activeChatId || !activePartner) return;
    const confirmed = await showConfirm({
      title: 'Clear Chat Messages',
      message: `Delete all messages you sent to ${activePartner.name}? Their messages will stay in the chat.`,
      okText: 'Delete Messages',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (!confirmed) return;

    try {
      await deleteConversationMessages(activeChatId);
      setShowDropdown(false);
    } catch (err) {
      console.warn('handleDeleteChat warning:', err);
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
                      {isUserOnline(partner) && <span className="online-indicator-dot" />}
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
                    <span className={`active-header-status font-ui ${isUserOnline(activePartner) ? 'online' : 'offline'}`}>
                      {isUserOnline(activePartner) ? 'Online' : 'Offline'}
                    </span>
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
                      <button onClick={handleDeleteChat} role="menuitem" className="dropdown-item danger">
                        <Trash size={16} />
                        <span>Delete my chat</span>
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
                    const hasAttachments = !msg.isDeleted && Array.isArray(msg.attachments) && msg.attachments.length > 0;

                    return (
                      <div key={msg.id} className={`chat-message-bubble-row ${isUser ? 'user-sent' : 'partner-sent'}`}>
                        {!isUser && (
                          <img src={activePartner.photo} alt={activePartner.name} className="message-bubble-img" />
                        )}
                        <div className="message-bubble-content">
                          {/* Attachments rendering */}
                          {hasAttachments && (
                            <div className="message-attachments-container">
                              {msg.attachments.map((att, idx) => {
                                const url = att.secureUrl || att.localPreview;
                                const isImg = att.fileType === 'IMAGE' || (att.mimeType && att.mimeType.startsWith('image/')) || (typeof url === 'string' && url.match(/\.(jpeg|jpg|gif|png|webp)/i));

                                if (isImg) {
                                  return (
                                    <div 
                                      key={att.id || idx} 
                                      className="message-image-attachment"
                                      onClick={() => setLightboxImage({ url, name: att.fileName || 'Image', messageId: msg.id, isUser })}
                                    >
                                      <img src={url} alt={att.fileName || 'Attachment'} className="chat-attached-img" />
                                      {isUser && !msg.isDeleted && (
                                        <button
                                          type="button"
                                          className="attachment-delete-overlay-btn"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteMessage(msg.id);
                                          }}
                                          aria-label="Delete photo"
                                          title="Delete photo"
                                        >
                                          <Trash size={16} />
                                        </button>
                                      )}
                                    </div>
                                  );
                                }

                                return (
                                  <div key={att.id || idx} className="message-file-attachment-wrapper">
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download={att.fileName || 'download'}
                                      className="message-file-attachment font-ui"
                                    >
                                      <div className="file-att-icon">
                                        <FileText size={24} weight="duotone" />
                                      </div>
                                      <div className="file-att-details">
                                        <span className="file-att-name">{att.fileName || 'Attachment File'}</span>
                                        <span className="file-att-size">{formatFileSize(att.fileSize)}</span>
                                      </div>
                                      <div className="file-att-download">
                                        <DownloadSimple size={18} />
                                      </div>
                                    </a>
                                    {isUser && !msg.isDeleted && (
                                      <button
                                        type="button"
                                        className="file-att-delete-btn"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleDeleteMessage(msg.id);
                                        }}
                                        aria-label="Delete file"
                                        title="Delete file"
                                      >
                                        <Trash size={16} />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Message text */}
                          {(msg.text || msg.isDeleted) && (
                            <div className={`message-bubble-text font-body ${msg.isDeleted ? 'deleted' : ''}`}>
                              {msg.isDeleted ? 'This message was deleted' : msg.text}
                            </div>
                          )}

                          {isUser && !msg.isDeleted && (
                            <button
                              type="button"
                              className="message-delete-btn"
                              onClick={() => handleDeleteMessage(msg.id)}
                              aria-label="Delete message"
                              title="Delete message"
                            >
                              <Trash size={14} />
                            </button>
                          )}
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

              {/* Pending Attachments Preview Bar */}
              {(selectedAttachments.length > 0 || isUploadingAttachment) && (
                <div className="chat-pending-attachments-bar font-ui">
                  {selectedAttachments.map(att => {
                    const url = att.secureUrl || att.localPreview;
                    const isImg = att.fileType === 'IMAGE';

                    return (
                      <div key={att.id} className="pending-att-item">
                        {isImg ? (
                          <img src={url} alt={att.fileName} className="pending-att-thumb" />
                        ) : (
                          <div className="pending-att-file-badge">
                            <FileText size={16} />
                            <span className="pending-file-name">{att.fileName}</span>
                            <span className="pending-file-size">({formatFileSize(att.fileSize)})</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="pending-att-remove-btn"
                          aria-label="Remove attachment"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}

                  {isUploadingAttachment && (
                    <div className="pending-att-uploading">
                      <Spinner size={16} className="spin-animation" />
                      <span>Processing file...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Input Footer */}
              <form onSubmit={handleSend} className="chat-input-footer">
                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,video/*"
                  multiple
                  style={{ display: 'none' }}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="*/*"
                  multiple
                  style={{ display: 'none' }}
                />

                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="chat-attach-btn"
                  title="Attach Photo or Video"
                  aria-label="Attach Photo or Video"
                >
                  <ImageIcon size={22} />
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="chat-attach-btn"
                  title="Attach File or Document"
                  aria-label="Attach File or Document"
                >
                  <Paperclip size={22} />
                </button>

                <input
                  type="text"
                  placeholder={`Send a warm message to ${activePartner.name}...`}
                  value={messageText}
                  onChange={handleInputChange}
                  className="chat-text-input font-body"
                />
                
                <button 
                  type="submit" 
                  className="chat-send-btn" 
                  disabled={!messageText.trim() && selectedAttachments.length === 0} 
                  aria-label="Send message"
                >
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

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="chat-lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <div className="chat-lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="chat-lightbox-close" onClick={() => setLightboxImage(null)}>
              <X size={24} />
            </button>
            <img src={lightboxImage.url} alt={lightboxImage.name} className="chat-lightbox-img" />
            <div className="chat-lightbox-footer font-ui">
              <span>{lightboxImage.name}</span>
              <div className="chat-lightbox-actions">
                {lightboxImage.isUser && (
                  <button
                    type="button"
                    className="chat-lightbox-delete-btn"
                    onClick={() => handleDeleteMessage(lightboxImage.messageId)}
                    title="Delete photo"
                    aria-label="Delete photo"
                  >
                    <Trash size={20} />
                  </button>
                )}
                <a href={lightboxImage.url} target="_blank" rel="noopener noreferrer" download className="chat-lightbox-download">
                  <DownloadSimple size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .chat-page {
          height: 100vh;
          width: 100%;
          padding: 0;
          background-color: var(--bg-page);
          overflow: hidden;
        }

        .chat-layout {
          display: flex;
          height: 100%;
          width: 100%;
          overflow: hidden;
        }

        /* Sidebar list */
        .chat-sidebar-pane {
          width: 320px;
          min-width: 320px;
          height: 100%;
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          background-color: var(--bg-surface);
          flex-shrink: 0;
        }

        .chat-pane-header {
          padding: var(--space-4) var(--space-6);
          border-bottom: 1px solid var(--border-subtle);
        }

        .chat-title {
          font-size: var(--text-heading);
          color: var(--burgundy-900);
          margin: 0;
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
          background: none;
          border-left: 3px solid transparent;
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .partner-list-item:hover {
          background-color: var(--bg-surface-warm);
        }

        .partner-list-item.active {
          background-color: var(--bg-accent-subtle);
          border-left-color: var(--burgundy-500);
        }

        .avatar-wrapper {
          position: relative;
          width: 48px;
          height: 48px;
          min-width: 48px;
          min-height: 48px;
          flex-shrink: 0;
        }

        .partner-item-img {
          width: 48px;
          height: 48px;
          min-width: 48px;
          min-height: 48px;
          max-width: 48px;
          max-height: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--border-subtle);
          display: block;
        }

        .online-indicator-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: var(--success);
          position: absolute;
          bottom: 0;
          right: 0;
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
          margin: 0;
        }

        /* Message Area */
        .chat-messages-pane {
          flex: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-page);
          overflow: hidden;
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
          display: none;
          align-items: center;
          margin-right: var(--space-4);
          color: var(--text-secondary);
          background: none;
          border: none;
          cursor: pointer;
        }

        .active-chat-meta {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex: 1;
        }

        .active-header-img {
          width: 44px;
          height: 44px;
          min-width: 44px;
          min-height: 44px;
          max-width: 44px;
          max-height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }

        .active-header-name {
          font-size: var(--text-subheading);
          color: var(--text-primary);
          margin: 0;
        }

        .active-header-status {
          font-size: 12px;
          font-weight: 500;
        }

        .active-header-status.online {
          color: var(--success);
        }

        .active-header-status.offline {
          color: var(--text-muted);
        }

        .active-header-options {
          position: relative;
        }

        .options-toggle-btn {
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
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
          z-index: 100;
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
          background: none;
          border: none;
          cursor: pointer;
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
          min-width: 32px;
          min-height: 32px;
          max-width: 32px;
          max-height: 32px;
          border-radius: 50%;
          object-fit: cover;
          align-self: flex-end;
          flex-shrink: 0;
        }

        .message-bubble-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          position: relative;
        }

        .message-bubble-text {
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-lg);
          font-size: 15px;
          line-height: 1.45;
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

        .message-bubble-text.deleted {
          font-style: italic;
          opacity: 0.72;
        }

        .message-delete-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          top: 50%;
          right: calc(100% + var(--space-2));
          transform: translateY(-50%);
          color: var(--text-muted);
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          opacity: 0;
          pointer-events: none;
          transition: opacity var(--duration-fast), color var(--duration-fast), background-color var(--duration-fast);
        }

        .chat-message-bubble-row.user-sent:hover .message-delete-btn,
        .message-delete-btn:focus-visible {
          opacity: 1;
          pointer-events: auto;
        }

        .message-delete-btn:hover {
          color: var(--error);
          background-color: var(--error-light);
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
          gap: var(--space-3);
          align-items: center;
        }

        .chat-text-input {
          flex: 1;
          border: 1.5px solid var(--border-default);
          border-radius: var(--radius-full);
          padding: 10px 18px;
          outline: none;
          background-color: var(--bg-input);
          color: var(--text-primary);
          font-size: 15px;
          transition: all var(--duration-fast);
        }

        .chat-text-input:focus {
          border-color: var(--border-focus);
          background-color: var(--bg-input);
        }

        .chat-send-btn {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: 50%;
          background-color: var(--burgundy-500);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
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
          cursor: not-allowed;
        }

        /* Attachments in messages */
        .message-attachments-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 4px;
        }

        .message-image-attachment {
          border-radius: var(--radius-md);
          overflow: hidden;
          cursor: pointer;
          max-width: 260px;
          max-height: 260px;
          border: 1px solid var(--border-subtle);
          transition: transform var(--duration-fast);
        }

        .message-image-attachment:hover {
          transform: scale(1.02);
        }

        .chat-attached-img {
          width: 100%;
          height: 100%;
          max-height: 260px;
          object-fit: cover;
          display: block;
        }

        .message-file-attachment {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background-color: rgba(0, 0, 0, 0.05);
          border-radius: var(--radius-md);
          text-decoration: none;
          color: inherit;
          border: 1px solid var(--border-subtle);
          transition: background-color var(--duration-fast);
          max-width: 280px;
        }

        [data-theme="dark"] .message-file-attachment {
          background-color: rgba(255, 255, 255, 0.08);
        }

        .user-sent .message-file-attachment {
          background-color: rgba(255, 255, 255, 0.18);
          color: #FFFFFF;
        }

        .message-file-attachment:hover {
          opacity: 0.9;
        }

        .file-att-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .file-att-details {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }

        .file-att-name {
          font-weight: var(--weight-medium);
          font-size: var(--text-body-sm);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-att-size {
          font-size: 11px;
          opacity: 0.8;
        }

        .file-att-download {
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.85;
        }

        /* Pending Attachments Preview Bar */
        .chat-pending-attachments-bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-6);
          background-color: var(--bg-surface);
          border-top: 1px solid var(--border-subtle);
          overflow-x: auto;
        }

        .pending-att-item {
          position: relative;
          display: flex;
          align-items: center;
        }

        .pending-att-thumb {
          width: 54px;
          height: 54px;
          border-radius: var(--radius-md);
          object-fit: cover;
          border: 1px solid var(--border-subtle);
        }

        .pending-att-file-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background-color: var(--bg-page);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          font-size: 12px;
        }

        .pending-file-name {
          max-width: 120px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pending-file-size {
          color: var(--text-muted);
        }

        .pending-att-remove-btn {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: var(--burgundy-500);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid var(--bg-surface);
          cursor: pointer;
        }

        .pending-att-uploading {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .spin-animation {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        .chat-attach-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--duration-fast);
        }

        .chat-attach-btn:hover {
          color: var(--burgundy-500);
          background-color: var(--bg-page);
        }

        /* Lightbox Modal */
        .chat-lightbox-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background-color: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-6);
        }

        .chat-lightbox-content {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .chat-lightbox-close {
          position: absolute;
          top: -40px;
          right: 0;
          background: none;
          border: none;
          color: #FFFFFF;
          cursor: pointer;
        }

        .chat-lightbox-img {
          max-width: 100%;
          max-height: 80vh;
          border-radius: var(--radius-md);
          object-fit: contain;
          box-shadow: var(--shadow-xl);
        }

        .chat-lightbox-footer {
          margin-top: var(--space-4);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          gap: var(--space-4);
          font-size: var(--text-body-sm);
        }

        .message-image-attachment {
          position: relative;
        }

        .attachment-delete-overlay-btn {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.65);
          color: #FFFFFF;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s ease;
          z-index: 10;
        }

        .attachment-delete-overlay-btn:hover {
          background: rgba(220, 38, 38, 0.9);
        }

        .message-file-attachment-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .file-att-delete-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-surface-elevated);
          color: var(--burgundy-400);
          border: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .file-att-delete-btn:hover {
          background: rgba(220, 38, 38, 0.15);
          color: #EF4444;
        }

        .chat-lightbox-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-left: auto;
        }

        .chat-lightbox-delete-btn {
          background: rgba(220, 38, 38, 0.8);
          color: #FFFFFF;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .chat-lightbox-delete-btn:hover {
          background: rgba(220, 38, 38, 1);
        }

        .chat-lightbox-download {
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Responsive behavior */
        @media (max-width: 767px) {
          .chat-page {
            height: 100%;
          }
          .chat-sidebar-pane {
            width: 100%;
            min-width: 100%;
          }
          .chat-messages-pane {
            display: none;
            height: 100%;
            overflow: hidden;
          }
          .partner-selected .chat-sidebar-pane {
            display: none;
          }
          .partner-selected .chat-messages-pane {
            display: flex;
            flex-direction: column;
            height: 100%;
            flex: 1;
            overflow: hidden;
          }
          .active-chat-wrapper {
            display: flex;
            flex-direction: column;
            height: 100%;
            flex: 1;
            overflow: hidden;
          }
          .active-chat-header {
            flex-shrink: 0;
            padding: var(--space-3) var(--space-4);
          }
          .chat-mobile-back-btn {
            display: flex;
          }
          .chat-log-container {
            flex: 1;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            padding: var(--space-3) var(--space-4);
          }
          .chat-pending-attachments-bar {
            flex-shrink: 0;
            padding: var(--space-2) var(--space-4);
          }
          .chat-input-footer {
            flex-shrink: 0;
            padding: var(--space-2) var(--space-3);
            gap: var(--space-2);
            background-color: var(--bg-surface);
            border-top: 1px solid var(--border-subtle);
          }
          .chat-text-input {
            font-size: 14px;
            padding: 8px 14px;
          }
          .chat-send-btn {
            width: 36px;
            height: 36px;
            min-width: 36px;
          }
          .chat-attach-btn {
            padding: 4px;
          }
        }
      `}</style>
    </div>
  );
};
