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
  PencilSimple,
  Check,
  Paperclip,
  Image as ImageIcon,
  FileText,
  DownloadSimple,
  X,
  Spinner,
  Microphone,
  Play,
  Pause
} from '@phosphor-icons/react';
import { EmptyState } from '../../components/UI/EmptyState';
import { getSocket, joinConversation, leaveConversation, emitStartTyping, emitStopTyping } from '../../lib/socket';

const formatFileSize = (bytes) => {
  if (!bytes) return 'File';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const VoiceNotePlayer = ({ url, isUser }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef(null);
  const waveformRef = useRef(null);
  const isDraggingRef = useRef(false);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      document.querySelectorAll('audio').forEach(a => {
        if (a !== audioRef.current) a.pause();
      });
      audioRef.current.play().catch(e => console.error('Audio play error:', e));
    }
  };

  const toggleSpeed = (e) => {
    e.stopPropagation();
    const nextRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDraggingRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && isFinite(audioRef.current.duration) && audioRef.current.duration > 0) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = playbackRate;
    const d = audioRef.current.duration;
    if (d && isFinite(d) && d > 0) {
      setDuration(d);
    } else {
      // Force WebM audio streams without duration header to calculate real duration
      try {
        audioRef.current.currentTime = 1e101;
        audioRef.current.ontimeupdate = function () {
          this.ontimeupdate = handleTimeUpdate;
          const realDur = this.currentTime;
          this.currentTime = 0;
          if (realDur && isFinite(realDur) && realDur > 0) {
            setDuration(realDur);
          }
        };
      } catch (err) {
        console.warn('WebM duration resolution fallback:', err);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const seekFromPointer = (e) => {
    if (!waveformRef.current || !audioRef.current) return;
    
    let validDuration = duration;
    if (!validDuration || !isFinite(validDuration) || validDuration <= 0) {
      if (audioRef.current.duration && isFinite(audioRef.current.duration) && audioRef.current.duration > 0) {
        validDuration = audioRef.current.duration;
      }
    }

    const rect = waveformRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = clickX / rect.width;
    
    if (validDuration && isFinite(validDuration) && validDuration > 0) {
      const newTime = pct * validDuration;
      setCurrentTime(newTime);
      try {
        audioRef.current.currentTime = newTime;
      } catch (err) {
        console.warn('Audio seek error:', err);
      }
    }
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    seekFromPointer(e);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = (e) => {
    if (isDraggingRef.current) {
      seekFromPointer(e);
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };

  const formatAudioTime = (sec) => {
    if (isNaN(sec) || !isFinite(sec)) return '0:00';
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const waveformHeights = [35, 55, 85, 45, 95, 65, 35, 75, 100, 55, 85, 40, 70, 90, 45, 60, 80, 35, 95, 50, 75, 30, 65, 40, 75, 45];

  return (
    <div className={`voice-note-player font-ui ${isUser ? 'user-voice' : 'partner-voice'}`}>
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => {
          setIsPlaying(true);
          if (audioRef.current) audioRef.current.playbackRate = playbackRate;
        }}
        onPause={() => setIsPlaying(false)}
        preload="metadata"
      />
      <button
        type="button"
        onClick={togglePlay}
        className="voice-play-btn"
        aria-label={isPlaying ? 'Pause Voice Note' : 'Play Voice Note'}
      >
        {isPlaying ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
      </button>

      <div className="voice-player-track">
        <div
          ref={waveformRef}
          onPointerDown={handlePointerDown}
          className="voice-waveform-visual"
          title="Click or drag to seek"
        >
          {waveformHeights.map((heightPct, idx) => {
            const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
            const barPct = (idx / waveformHeights.length) * 100;
            const isPlayed = barPct <= progressPct;

            return (
              <span
                key={idx}
                className={`waveform-bar ${isPlayed ? 'played' : ''}`}
                style={{ height: `${heightPct}%` }}
              />
            );
          })}
        </div>

        <div className="voice-timer-row font-ui">
          <span>{isPlaying || currentTime > 0 ? formatAudioTime(currentTime) : (duration ? formatAudioTime(duration) : '0:00')}</span>
          <button
            type="button"
            onClick={toggleSpeed}
            className={`voice-speed-btn ${playbackRate > 1 ? 'active-speed' : ''}`}
            title="Toggle playback speed (1x, 1.5x, 2x)"
          >
            {playbackRate}x
          </button>
        </div>
      </div>
    </div>
  );
};

export const ChatView = ({ preselectedConnectionId, onClearPreselected }) => {
  const { connections, conversations, chats, sendMessage, editMessage, deleteMessage, deleteConversationMessages, markConversationSeen, unmatchConnection, blockUser, reportUser, showConfirm, showAlert, onlineUserIds, fetchConversationMessages } = useApp();
  
  const isUserOnline = (partner) => {
    if (!partner) return false;
    return Boolean(onlineUserIds && (onlineUserIds.has(partner.userId) || onlineUserIds.has(partner.id)));
  };
  const [activeChatId, setActiveChatIdState] = useState(() => {
    return preselectedConnectionId || null;
  });

  const setActiveChatId = (id) => {
    setActiveChatIdState(id || null);
  };
  const [messageText, setMessageText] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const canEditMessage = (msg) => {
    if (!msg || msg.isDeleted || !msg.text) return false;
    const createdTime = msg.createdAt ? new Date(msg.createdAt).getTime() : 0;
    if (!createdTime || isNaN(createdTime)) return true;
    const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
    return Date.now() - createdTime <= FIFTEEN_MINUTES_MS;
  };

  const handleStartEdit = (msg) => {
    if (!canEditMessage(msg)) {
      showAlert({ title: 'Cannot Edit', message: 'Messages can only be edited within 15 minutes of sending.' });
      return;
    }
    setEditingMessageId(msg.id);
    setEditingText(msg.text || '');
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleSaveEdit = async (messageId) => {
    if (!editingText.trim() || !activeChatId) return;
    const newText = editingText.trim();
    setEditingMessageId(null);
    setEditingText('');

    try {
      await editMessage(activeChatId, messageId, newText);
    } catch (err) {
      await showAlert({ title: 'Edit Failed', message: err?.message || 'Could not update message. Messages can only be edited within 15 minutes of sending.' });
    }
  };
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

  // Voice note recording hooks
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const audioStreamRef = useRef(null);

  // Clean up microphone stream on unmount
  useEffect(() => {
    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
        audioStreamRef.current = null;
      }
    };
  }, []);

  const getAudioStream = async () => {
    if (audioStreamRef.current && audioStreamRef.current.active) {
      const liveTracks = audioStreamRef.current.getAudioTracks().filter(t => t.readyState === 'live');
      if (liveTracks.length > 0) {
        return audioStreamRef.current;
      }
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioStreamRef.current = stream;
    return stream;
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        await showAlert({
          title: 'Not Supported',
          message: 'Audio recording is not supported on your current browser.'
        });
        return;
      }
      const stream = await getAudioStream();
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone permission error:', err);
      await showAlert({
        title: 'Microphone Access Denied',
        message: 'Please allow microphone access in your browser settings to record voice notes.'
      });
    }
  };

  const stopAndSendRecording = async () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setIsUploadingVoice(true);

    const mediaRecorder = mediaRecorderRef.current;
    
    mediaRecorder.onstop = async () => {
      const mimeType = mediaRecorder.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      const ext = mimeType.includes('mp4') || mimeType.includes('aac') ? 'm4a' : 'webm';
      const audioFile = new File([audioBlob], `voice-note-${Date.now()}.${ext}`, { type: mimeType });

      const localPreview = URL.createObjectURL(audioBlob);

      try {
        let uploadRes = null;
        if (api.isConfigured) {
          uploadRes = await api.uploadFile(audioFile);
        }

        if (!uploadRes?.secureUrl) {
          uploadRes = {
            publicId: `voice-${Date.now()}`,
            secureUrl: localPreview,
          };
        }

        const attachmentObj = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          cloudinaryPublicId: uploadRes.publicId,
          secureUrl: uploadRes.secureUrl,
          fileType: 'AUDIO',
          fileName: audioFile.name,
          fileSize: audioFile.size,
          mimeType: audioFile.type,
          localPreview,
        };

        const textToSend = '';
        const attachmentsToSend = [{
          cloudinaryPublicId: attachmentObj.cloudinaryPublicId,
          secureUrl: attachmentObj.secureUrl,
          fileType: 'AUDIO',
          fileName: attachmentObj.fileName,
          fileSize: attachmentObj.fileSize,
        }];

        await sendMessage(activeChatId, textToSend, attachmentsToSend, [attachmentObj]);
      } catch (err) {
        console.error('Voice note send failure:', err);
        await showAlert({ title: 'Recording Failed', message: 'Could not upload voice note. Please try again.' });
      } finally {
        setIsUploadingVoice(false);
        setRecordingTime(0);
      }
    };

    mediaRecorder.stop();
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      clearInterval(recordingTimerRef.current);
      mediaRecorderRef.current.onstop = () => {
        audioChunksRef.current = [];
      };
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingTime(0);
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingAttachment(true);
    const failedFiles = [];
    try {
      for (const file of files) {
        const isImg = file.type.startsWith('image/');
        const isVid = file.type.startsWith('video/');
        const fileType = isImg ? 'IMAGE' : isVid ? 'VIDEO' : 'DOCUMENT';
        // localPreview is only used for the pending-attachments thumbnail
        // before the message is sent. It is NEVER stored in the DB or sent
        // to the other user — only the Cloudinary secureUrl is.
        const localPreview = URL.createObjectURL(file);

        let uploadRes = null;
        if (api.isConfigured) {
          try {
            const res = await api.uploadFile(file);
            // api.js already unwraps payload.data, so res IS the data object
            uploadRes = res;
          } catch (uploadErr) {
            console.error('File upload error:', uploadErr);
            failedFiles.push(file.name);
            URL.revokeObjectURL(localPreview);
            continue; // skip this file — do NOT fall back to blob URL
          }
        }

        if (!uploadRes?.secureUrl) {
          // Backend not configured or upload returned no URL — skip
          failedFiles.push(file.name);
          URL.revokeObjectURL(localPreview);
          continue;
        }

        const attachmentObj = {
          // Internal client-side id (used for React key and removal)
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          // Fields persisted to DB and sent to other user:
          cloudinaryPublicId: uploadRes.publicId,
          secureUrl: uploadRes.secureUrl,  // real Cloudinary HTTPS URL
          fileType,
          fileName: file.name,
          fileSize: file.size,
          // Client-only fields (used for local preview thumbnail, NOT sent to API):
          mimeType: file.type,
          localPreview,
        };

        setSelectedAttachments(prev => [...prev, attachmentObj]);
      }
    } catch (err) {
      await showAlert({ title: 'Upload Failed', message: 'Could not process attachment. Please try again.' });
    } finally {
      setIsUploadingAttachment(false);
      if (e.target) e.target.value = '';
    }

    if (failedFiles.length > 0) {
      await showAlert({
        title: 'Upload Failed',
        message: `Could not upload: ${failedFiles.join(', ')}. Please check your connection and try again.`
      });
    }
  };

  const handleRemoveAttachment = (attId) => {
    setSelectedAttachments(prev => prev.filter(a => a.id !== attId));
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if ((!messageText.trim() && selectedAttachments.length === 0) || !activeChatId) return;

    const textToSend = messageText.trim();
    // Strip client-only fields before sending to the API so only
    // backend-compatible fields (cloudinaryPublicId, secureUrl, fileType,
    // fileName, fileSize) reach the server and are stored in the DB.
    const attachmentsToSend = selectedAttachments.map(({ cloudinaryPublicId, secureUrl, fileType, fileName, fileSize }) => ({
      cloudinaryPublicId,
      secureUrl,
      fileType,
      fileName,
      fileSize,
    }));
    // Keep the full objects (with localPreview) for the optimistic UI update
    const attachmentsForOptimistic = [...selectedAttachments];

    setMessageText('');
    setSelectedAttachments([]);

    await sendMessage(activeChatId, textToSend, attachmentsToSend, attachmentsForOptimistic);

    if (conversationId) {
      setLocalIsTyping(false);
      emitStopTyping(conversationId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  // Synchronize preselected chat from matches tab or notification deep links
  useEffect(() => {
    if (preselectedConnectionId) {
      setActiveChatId(preselectedConnectionId);
    }
  }, [preselectedConnectionId]);

  // All connections are valid chat partners
  const chatPartners = connections;

  // Find active chat partner details
  const activePartner = connections.find(c => c.id === activeChatId || c.matchId === activeChatId || c.userId === activeChatId);

  const conversation = conversations.find(c => 
    c.id === activeChatId || 
    c.partnerId === activeChatId || 
    (activePartner && (c.partnerId === activePartner.userId || c.partnerId === activePartner.id))
  );
  const conversationId = conversation?.id;

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, activeChatId, isTyping]);

  // Join/Leave conversation rooms & Mark conversation as seen
  useEffect(() => {
    if (conversationId) {
      joinConversation(conversationId);
      markConversationSeen(conversationId);
      return () => {
        leaveConversation(conversationId);
      };
    } else if (activeChatId) {
      markConversationSeen(activeChatId);
    }
  }, [conversationId, activeChatId, markConversationSeen]);

  // Fetch fresh messages (including attachments) whenever the active conversation changes.
  // This ensures messages are never stale after a page refresh or re-entering a chat.
  useEffect(() => {
    if (conversationId && activePartner) {
      fetchConversationMessages(conversationId, activePartner.id);
    }
  }, [conversationId, activePartner?.id]);

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

  const activeMessagesRaw = activeChatId ? (
    chats[activeChatId] || 
    (activePartner?.userId ? chats[activePartner.userId] : null) || 
    (conversationId ? chats[conversationId] : null) || 
    (activePartner?.id ? chats[activePartner.id] : null) || 
    []
  ) : [];
  const activeMessages = [];
  const seenIds = new Set();
  for (const m of activeMessagesRaw) {
    if (!seenIds.has(m.id) && !m.isDeleted) {
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
                const partnerConv = conversations.find(c => c.partnerId === partner.id || c.id === partner.id);
                const unreadCount = partnerConv?.unreadCount || 0;

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
                      <div className="partner-item-preview-row">
                        <p className="partner-item-preview font-body">
                          {lastMsg ? (lastMsg.text || 'Sent an attachment') : 'Start a warm conversation...'}
                        </p>
                        {unreadCount > 0 && !isActive && (
                          <span className="partner-unread-badge font-ui">{unreadCount > 99 ? '99+' : unreadCount}</span>
                        )}
                      </div>
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
                                const isAud = att.fileType === 'AUDIO' ||
                                              (att.mimeType && att.mimeType.startsWith('audio/')) ||
                                              (att.fileName && att.fileName.includes('voice-note')) ||
                                              (typeof url === 'string' && (Boolean(url.match(/\.(mp3|wav|ogg|m4a|aac)/i)) || url.includes('voice-note') || url.includes('/raw/upload/')));

                                const isImg = !isAud && (
                                              att.fileType === 'IMAGE' ||
                                              (att.mimeType && att.mimeType.startsWith('image/')) ||
                                              (typeof url === 'string' && (Boolean(url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i)) || url.includes('/image/upload/')))
                                            );

                                const isVid = !isAud && !isImg && (
                                              att.fileType === 'VIDEO' ||
                                              (att.mimeType && att.mimeType.startsWith('video/')) ||
                                              (typeof url === 'string' && (Boolean(url.match(/\.(mp4|mov|m4v)/i)) || url.includes('/video/upload/')))
                                            );

                                if (isAud) {
                                  return (
                                    <div key={att.id || idx} className="message-audio-attachment-wrapper">
                                      <VoiceNotePlayer url={url} isUser={isUser} />
                                      {isUser && !msg.isDeleted && (
                                        <button
                                          type="button"
                                          className="attachment-delete-overlay-btn audio-del"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteMessage(msg.id);
                                          }}
                                          aria-label="Delete voice note"
                                          title="Delete voice note"
                                        >
                                          <Trash size={16} />
                                        </button>
                                      )}
                                    </div>
                                  );
                                }

                                if (isImg) {
                                  return (
                                    <div 
                                      key={att.id || idx} 
                                      className="message-image-attachment"
                                      onClick={() => setLightboxImage({ type: 'image', url, name: att.fileName || 'Image', messageId: msg.id, isUser })}
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

                                if (isVid) {
                                  return (
                                    <div key={att.id || idx} className="message-video-attachment-wrapper">
                                      <video
                                        src={url}
                                        controls
                                        preload="metadata"
                                        className="chat-attached-video"
                                      />
                                      {isUser && !msg.isDeleted && (
                                        <button
                                          type="button"
                                          className="attachment-delete-overlay-btn"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteMessage(msg.id);
                                          }}
                                          aria-label="Delete video"
                                          title="Delete video"
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

                          {/* Message text / inline edit field */}
                          {(msg.text || msg.isDeleted) && (
                            editingMessageId === msg.id ? (
                              <div className="message-inline-edit-box font-body">
                                <input
                                  type="text"
                                  className="message-edit-input font-body"
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleSaveEdit(msg.id);
                                    } else if (e.key === 'Escape') {
                                      e.preventDefault();
                                      handleCancelEdit();
                                    }
                                  }}
                                  autoFocus
                                />
                                <div className="message-edit-btns font-ui">
                                  <button type="button" className="edit-btn save" onClick={() => handleSaveEdit(msg.id)} title="Save (Enter)">
                                    <Check size={14} weight="bold" />
                                    <span>Save</span>
                                  </button>
                                  <button type="button" className="edit-btn cancel" onClick={handleCancelEdit} title="Cancel (Esc)">
                                    <X size={14} weight="bold" />
                                    <span>Cancel</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className={`message-bubble-text font-body ${msg.isDeleted ? 'deleted' : ''}`}>
                                {msg.isDeleted ? 'This message was deleted' : msg.text}
                              </div>
                            )
                          )}

                          {isUser && !msg.isDeleted && editingMessageId !== msg.id && (
                            <div className="message-bubble-actions">
                              {canEditMessage(msg) && (
                                <button
                                  type="button"
                                  className="message-action-btn edit"
                                  onClick={() => handleStartEdit(msg)}
                                  aria-label="Edit message"
                                  title="Edit message (available for 15 mins)"
                                >
                                  <PencilSimple size={14} />
                                </button>
                              )}
                              <button
                                type="button"
                                className="message-action-btn delete"
                                onClick={() => handleDeleteMessage(msg.id)}
                                aria-label="Delete message"
                                title="Delete message"
                              >
                                <Trash size={14} />
                              </button>
                            </div>
                          )}
                          <div className="message-bubble-footer font-ui">
                            <span className="message-bubble-time">{msg.timestamp}</span>
                            {msg.isEdited && !msg.isDeleted && (
                              <span className="edited-status-text">• Edited</span>
                            )}
                            {isUser && !msg.isDeleted && msg.seen && (
                              <span className="seen-status-text page-enter">• Seen</span>
                            )}
                          </div>
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

              {/* Input Footer or Recording Bar */}
              {isRecording ? (
                <div className="chat-recording-footer font-ui page-enter">
                  <div className="recording-indicator">
                    <span className="recording-dot-pulse" />
                    <span className="recording-timer">{formatTimer(recordingTime)}</span>
                  </div>
                  <div className="recording-wave-visual">
                    <span className="rec-bar" />
                    <span className="rec-bar" />
                    <span className="rec-bar" />
                    <span className="rec-bar" />
                  </div>
                  <div className="recording-actions">
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="recording-cancel-btn"
                      title="Cancel recording"
                      aria-label="Cancel recording"
                    >
                      <Trash size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={stopAndSendRecording}
                      className="recording-send-btn"
                      title="Send voice note"
                      aria-label="Send voice note"
                      disabled={isUploadingVoice}
                    >
                      {isUploadingVoice ? <Spinner size={20} className="spin-animation" /> : <PaperPlaneRight size={20} weight="fill" />}
                    </button>
                  </div>
                </div>
              ) : (
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

                  <button
                    type="button"
                    onClick={startRecording}
                    className="chat-attach-btn voice-mic-btn"
                    title="Record Voice Note"
                    aria-label="Record Voice Note"
                  >
                    <Microphone size={22} />
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
              )}
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

        .partner-item-preview-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-2);
          width: 100%;
        }

        .partner-item-preview {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
          flex: 1;
        }

        .partner-unread-badge {
          background-color: var(--burgundy-500);
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          padding: 0 6px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          flex-shrink: 0;
        }

        /* Message Area */
        .chat-messages-pane {
          flex: 1;
          min-width: 0;
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

        .message-bubble-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          position: absolute;
          top: 50%;
          right: calc(100% + var(--space-2));
          transform: translateY(-50%);
          opacity: 0;
          pointer-events: none;
          transition: opacity var(--duration-fast);
        }

        .chat-message-bubble-row.user-sent:hover .message-bubble-actions,
        .message-bubble-actions:focus-within {
          opacity: 1;
          pointer-events: auto;
        }

        .message-action-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          cursor: pointer;
          transition: all var(--duration-fast);
          box-shadow: var(--shadow-sm);
        }

        .message-action-btn.edit:hover {
          color: var(--burgundy-500);
          background-color: var(--bg-accent-subtle);
          border-color: var(--burgundy-300);
        }

        .message-action-btn.delete:hover {
          color: var(--error);
          background-color: var(--error-light);
          border-color: var(--error);
        }

        /* Inline edit mode */
        .message-inline-edit-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 220px;
          max-width: 100%;
        }

        .message-edit-input {
          width: 100%;
          padding: 8px 12px;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--burgundy-400);
          background-color: var(--bg-surface);
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          box-shadow: 0 0 0 2px var(--bg-accent-subtle);
        }

        .message-edit-btns {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
        }

        .edit-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: background-color var(--duration-fast);
        }

        .edit-btn.save {
          background-color: var(--burgundy-500);
          color: #FFFFFF;
        }

        .edit-btn.save:hover {
          background-color: var(--burgundy-600);
        }

        .edit-btn.cancel {
          background-color: var(--bg-surface-warm);
          color: var(--text-secondary);
          border: 1px solid var(--border-subtle);
        }

        .edit-btn.cancel:hover {
          background-color: var(--border-subtle);
        }

        .message-bubble-footer {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 1px;
        }

        .user-sent .message-bubble-footer {
          align-self: flex-end;
        }

        .edited-status-text {
          font-style: italic;
          opacity: 0.8;
        }

        .seen-status-text {
          color: var(--burgundy-400);
          font-weight: 600;
        }

        [data-theme="dark"] .seen-status-text {
          color: var(--burgundy-300);
        }

        .delivered-status-text {
          color: var(--text-tertiary);
          font-weight: 500;
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

        .message-video-attachment-wrapper {
          position: relative;
          border-radius: var(--radius-md);
          overflow: hidden;
          max-width: 280px;
          max-height: 280px;
          border: 1px solid var(--border-subtle);
          background-color: #000000;
        }

        .chat-attached-video {
          width: 100%;
          max-height: 280px;
          display: block;
          border-radius: var(--radius-md);
          outline: none;
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

        /* Attachment buttons in footer */
        .chat-attach-btn {
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .chat-attach-btn:hover {
          color: var(--burgundy-400);
          background: rgba(184, 67, 106, 0.12);
          transform: scale(1.08);
          filter: drop-shadow(0 0 6px rgba(184, 67, 106, 0.5));
        }

        .chat-recording-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          background: var(--bg-surface-elevated);
          border-top: 1px solid var(--border-subtle);
          gap: var(--space-3);
          min-height: 54px;
        }

        .recording-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 80px;
        }

        .recording-dot-pulse {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #EF4444;
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          animation: pulseRed 1.2s infinite;
        }

        @keyframes pulseRed {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            transform: scale(1.15);
            box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }

        .recording-timer {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
          font-variant-numeric: tabular-nums;
        }

        .recording-wave-visual {
          display: flex;
          align-items: center;
          gap: 4px;
          height: 20px;
          flex: 1;
          justify-content: center;
        }

        .rec-bar {
          width: 3px;
          height: 100%;
          background: var(--burgundy-400);
          border-radius: 2px;
          animation: soundWave 0.8s ease-in-out infinite alternate;
        }

        .rec-bar:nth-child(1) { animation-delay: 0.1s; }
        .rec-bar:nth-child(2) { animation-delay: 0.3s; }
        .rec-bar:nth-child(3) { animation-delay: 0.2s; }
        .rec-bar:nth-child(4) { animation-delay: 0.4s; }

        @keyframes soundWave {
          0% { height: 4px; opacity: 0.4; }
          100% { height: 20px; opacity: 1; }
        }

        .recording-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .recording-cancel-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.12);
          color: #EF4444;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .recording-cancel-btn:hover {
          background: rgba(239, 68, 68, 0.25);
        }

        .recording-send-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--burgundy-600) 0%, var(--burgundy-700) 100%);
          color: #FFFFFF;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(184, 67, 106, 0.3);
          transition: transform 0.15s ease;
        }

        .recording-send-btn:hover:not(:disabled) {
          transform: scale(1.05);
        }

        /* Message Voice Note Player */
        .message-audio-attachment-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 210px;
          max-width: 280px;
        }

        .attachment-delete-overlay-btn.audio-del {
          position: static;
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          background: rgba(239, 68, 68, 0.15);
          color: #EF4444;
        }

        .attachment-delete-overlay-btn.audio-del:hover {
          background: rgba(239, 68, 68, 0.3);
        }

        .voice-note-player {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 18px;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          width: 100%;
        }

        .user-sent .voice-note-player {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.2);
          color: #FFFFFF;
        }

        .voice-play-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--burgundy-500);
          color: #FFFFFF;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: transform 0.15s ease, background 0.15s ease;
        }

        .voice-play-btn:hover {
          transform: scale(1.06);
          background: var(--burgundy-600);
        }

        .user-sent .voice-play-btn {
          background: #FFFFFF;
          color: var(--burgundy-700);
        }

        .user-sent .voice-play-btn:hover {
          background: rgba(255, 255, 255, 0.9);
        }

        .voice-player-track {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
          position: relative;
        }

        .voice-waveform-visual {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 24px;
          width: 100%;
          cursor: pointer;
          padding: 2px 0;
          touch-action: none;
          user-select: none;
        }

        .waveform-bar {
          flex: 1;
          background: var(--border-default);
          border-radius: 2px;
          transition: background 0.15s ease;
          pointer-events: none;
        }

        .user-sent .waveform-bar {
          background: rgba(255, 255, 255, 0.35);
        }

        .waveform-bar.played {
          background: var(--burgundy-500);
        }

        .user-sent .waveform-bar.played {
          background: #FFFFFF;
        }

        .voice-timer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          opacity: 0.9;
          font-weight: 500;
          margin-top: 2px;
        }

        .voice-speed-btn {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 10px;
          background: var(--bg-surface);
          color: var(--text-secondary);
          border: 1px solid var(--border-subtle);
          cursor: pointer;
          transition: all 0.15s ease;
          line-height: 1;
        }

        .user-sent .voice-speed-btn {
          background: rgba(255, 255, 255, 0.2);
          color: #FFFFFF;
          border-color: rgba(255, 255, 255, 0.3);
        }

        .voice-speed-btn:hover {
          transform: scale(1.08);
          background: var(--burgundy-500);
          color: #FFFFFF;
          border-color: var(--burgundy-500);
        }

        .user-sent .voice-speed-btn:hover {
          background: #FFFFFF;
          color: var(--burgundy-700);
          border-color: #FFFFFF;
        }

        .voice-speed-btn.active-speed {
          background: var(--burgundy-500);
          color: #FFFFFF;
          border-color: var(--burgundy-500);
        }

        .user-sent .voice-speed-btn.active-speed {
          background: #FFFFFF;
          color: var(--burgundy-700);
          border-color: #FFFFFF;
        }

        /* Responsive behavior */
        @media (max-width: 1024px) {
          .chat-sidebar-pane {
            width: 250px;
            min-width: 230px;
          }
          .chat-mobile-back-btn {
            display: flex;
          }
        }

        @media (max-width: 850px) {
          .partner-selected .chat-sidebar-pane {
            display: none;
          }
          .chat-sidebar-pane {
            width: 100%;
            min-width: 100%;
          }
          .chat-messages-pane {
            display: none;
          }
          .partner-selected .chat-messages-pane {
            display: flex;
            flex-direction: column;
            height: 100%;
            flex: 1;
            overflow: hidden;
          }
        }

        @media (max-width: 767px) {
          .chat-page {
            height: 100%;
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
          .message-status-receipt {
            display: flex;
            justify-content: flex-end;
            margin-top: 2px;
            padding-right: 4px;
            font-size: 11px;
            font-weight: 500;
            user-select: none;
          }
          .seen-text {
            color: var(--burgundy-500);
          }
          [data-theme="dark"] .seen-text {
            color: var(--burgundy-300);
          }
          .delivered-text {
            color: var(--text-tertiary);
          }
        }
      `}</style>
    </div>
  );
};
