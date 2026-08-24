import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  BookBookmark, 
  CaretLeft, 
  CaretRight, 
  Plus, 
  Image as ImageIcon, 
  NotePencil, 
  Trash, 
  Play, 
  Pause, 
  CalendarBlank, 
  Sparkle, 
  Heart,
  UploadSimple,
  WarningCircle,
  Clock,
  Quotes
} from '@phosphor-icons/react';
import { api } from '../../lib/api';
import { useApp } from '../../context/AppContext';
import { ProtectedImage } from '../UI/ProtectedImage';
import { getSocket } from '../../lib/socket';

// In-Diary Voice Note Player
const DiaryAudioPlayer = ({ url }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      document.querySelectorAll('audio').forEach(a => {
        if (a !== audioRef.current) a.pause();
      });
      audioRef.current.play().catch(err => console.error('Audio play error:', err));
    }
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="diary-audio-player" onClick={(e) => e.stopPropagation()}>
      <audio
        ref={audioRef}
        src={url}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current && isFinite(audioRef.current.duration)) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        preload="metadata"
      />
      <button type="button" className="diary-audio-play-btn" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? <Pause size={14} weight="fill" /> : <Play size={14} weight="fill" />}
      </button>
      <div className="diary-audio-waveform">
        <div className="diary-audio-progress-bar">
          <div 
            className="diary-audio-progress-fill" 
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        <div className="diary-audio-times">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export const OurDiaryModal = ({ 
  isOpen, 
  onClose, 
  matchId, 
  partnerName, 
  partnerPhoto, 
  userName,
  userPhoto 
}) => {
  const { showToast, showConfirm } = useApp();
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState('next'); // 'next' | 'prev'

  // Composer states
  const [showComposer, setShowComposer] = useState(false);
  const [composerTab, setComposerTab] = useState('note'); // 'note' | 'photo'
  const [noteText, setNoteText] = useState('');
  const [captionText, setCaptionText] = useState('');
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [composerError, setComposerError] = useState(null);
  const [showDateJump, setShowDateJump] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch diary entries
  const fetchEntries = async (silent = false) => {
    if (!matchId) return;
    try {
      if (!silent) setLoading(true);
      const res = await api.getDiaryEntries(matchId);
      if (res && res.success && Array.isArray(res.data)) {
        setEntries(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch diary entries:', err);
      if (err?.message?.includes('not found') || err?.message?.includes('not part') || err?.message?.includes('active')) {
        showToast('This connection is no longer active.', 'info');
        onClose();
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && matchId) {
      fetchEntries();
      setIsBookOpen(false);
      setCurrentPageIndex(0);
    }
  }, [isOpen, matchId]);

  // Live Sync via Socket.IO
  useEffect(() => {
    if (!isOpen || !matchId) return;
    const socket = getSocket();
    if (!socket) return;

    const handleDiaryAdded = (payload) => {
      if (payload?.matchId === matchId) {
        fetchEntries(true);
      }
    };

    const handleDiaryDeleted = (payload) => {
      if (payload?.matchId === matchId) {
        fetchEntries(true);
      }
    };

    socket.on('diary_entry_added', handleDiaryAdded);
    socket.on('diary_entry_deleted', handleDiaryDeleted);

    return () => {
      socket.off('diary_entry_added', handleDiaryAdded);
      socket.off('diary_entry_deleted', handleDiaryDeleted);
    };
  }, [isOpen, matchId]);

  // Group entries into pages by Date with viewer's local timezone/locale
  const groupEntriesIntoPages = () => {
    if (!entries || entries.length === 0) {
      return [];
    }

    const groupedByDate = {};
    entries.forEach(entry => {
      const dateKey = new Date(entry.createdAt).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(entry);
    });

    const pages = [];
    Object.entries(groupedByDate).forEach(([dateLabel, items]) => {
      for (let i = 0; i < items.length; i += 2) {
        pages.push({
          dateLabel,
          items: items.slice(i, i + 2),
          pageNumber: pages.length + 1
        });
      }
    });

    return pages;
  };

  const pages = groupEntriesIntoPages();
  const totalPages = Math.max(pages.length, 1);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || !isBookOpen || showComposer) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === 'Home') {
        e.preventDefault();
        handleJumpToPage(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        handleJumpToPage(totalPages - 1);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isBookOpen, showComposer, currentPageIndex, totalPages]);

  const handleNextPage = () => {
    if (currentPageIndex < totalPages - 1 && !isFlipping) {
      setFlipDirection('next');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPageIndex(prev => prev + 1);
        setIsFlipping(false);
      }, 300);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0 && !isFlipping) {
      setFlipDirection('prev');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPageIndex(prev => prev - 1);
        setIsFlipping(false);
      }, 300);
    }
  };

  const handleJumpToPage = (index) => {
    if (index >= 0 && index < totalPages && index !== currentPageIndex && !isFlipping) {
      setFlipDirection(index > currentPageIndex ? 'next' : 'prev');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPageIndex(index);
        setIsFlipping(false);
        setShowDateJump(false);
      }, 250);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setComposerError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setComposerError('Photo must be 10MB or smaller.');
      return;
    }

    setSelectedPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
    setComposerError(null);
  };

  const handleSaveMoment = async (e) => {
    e.preventDefault();
    setComposerError(null);

    if (composerTab === 'note') {
      if (!noteText.trim()) {
        setComposerError('Please write your note before saving.');
        return;
      }

      try {
        setIsSubmitting(true);
        const res = await api.addDiaryNote(matchId, noteText.trim(), captionText.trim() || undefined);
        if (res && res.success) {
          showToast('Sweet moment added to Our Diary ✨', 'success');
          setNoteText('');
          setCaptionText('');
          setShowComposer(false);
          await fetchEntries();
          // Jump to the latest page
          setCurrentPageIndex(Math.max(groupEntriesIntoPages().length - 1, 0));
        } else {
          setComposerError(res?.message || 'Failed to save moment.');
        }
      } catch (err) {
        console.error('Error adding note:', err);
        setComposerError(err?.message || 'Failed to save note.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Photo upload
      if (!selectedPhotoFile) {
        setComposerError('Please choose a photo to upload.');
        return;
      }

      try {
        setIsSubmitting(true);
        const res = await api.uploadDiaryPhoto(matchId, selectedPhotoFile, captionText.trim() || undefined);
        if (res && res.success) {
          showToast('Photo added to Our Diary 📷', 'success');
          setSelectedPhotoFile(null);
          setPhotoPreviewUrl(null);
          setCaptionText('');
          setShowComposer(false);
          await fetchEntries();
          setCurrentPageIndex(Math.max(groupEntriesIntoPages().length - 1, 0));
        } else {
          // Moderation rejection handling
          if (res?.moderationRejected) {
            setComposerError("That image couldn't be added.");
          } else {
            setComposerError(res?.message || "That image couldn't be added.");
          }
        }
      } catch (err) {
        console.error('Error uploading diary photo:', err);
        setComposerError("That image couldn't be added.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteEntry = (entryId) => {
    showConfirm({
      title: 'Delete from Our Diary?',
      message: 'This moment will be removed from your shared diary.',
      confirmText: 'Delete',
      cancelText: 'Keep',
      onConfirm: async () => {
        try {
          const res = await api.deleteDiaryEntry(matchId, entryId);
          if (res && res.success) {
            showToast('Moment removed from diary', 'info');
            await fetchEntries();
          }
        } catch (err) {
          console.error('Failed to delete entry:', err);
          showToast(err?.message || 'Failed to delete entry', 'error');
        }
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="our-diary-overlay" role="dialog" aria-modal="true" aria-label="Our Diary">
      {/* Background backdrop blur */}
      <div className="our-diary-backdrop" onClick={onClose} />

      <div className="our-diary-container">
        {/* Header Controls */}
        <div className="our-diary-top-bar">
          <div className="our-diary-top-left">
            <span className="our-diary-header-badge">
              <Sparkle size={14} weight="fill" />
              <span>Sweet Moments</span>
            </span>
          </div>

          <div className="our-diary-top-right">
            {isBookOpen && (
              <>
                {pages.length > 1 && (
                  <button 
                    type="button" 
                    className="diary-top-action-btn"
                    onClick={() => setShowDateJump(!showDateJump)}
                    title="Jump to date"
                  >
                    <CalendarBlank size={18} />
                    <span className="diary-btn-label">Dates</span>
                  </button>
                )}
                <button 
                  type="button" 
                  className="diary-top-action-btn primary"
                  onClick={() => {
                    setComposerError(null);
                    setShowComposer(true);
                  }}
                  title="Add a Moment"
                >
                  <Plus size={16} weight="bold" />
                  <span>Add Moment</span>
                </button>
              </>
            )}

            <button 
              type="button" 
              className="our-diary-close-btn" 
              onClick={onClose}
              aria-label="Close Diary"
              title="Close Diary"
            >
              <X size={20} weight="bold" />
            </button>
          </div>
        </div>

        {/* Date Jump Menu Popover */}
        {showDateJump && pages.length > 0 && (
          <div className="diary-date-jump-popover">
            <div className="diary-date-jump-title">Jump to Date</div>
            <div className="diary-date-jump-list">
              {pages.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`diary-date-jump-item ${currentPageIndex === idx ? 'active' : ''}`}
                  onClick={() => handleJumpToPage(idx)}
                >
                  <span>{p.dateLabel}</span>
                  <span className="diary-date-page-badge">Page {idx + 1}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- BOOK STAGE --- */}
        <div className="our-diary-stage">
          {!isBookOpen ? (
            /* CLOSED BOOK COVER */
            <div 
              className="diary-book-cover"
              onClick={() => setIsBookOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsBookOpen(true); }}
            >
              <div className="diary-cover-spine" />
              <div className="diary-cover-texture">
                <div className="diary-cover-gold-border">
                  <div className="diary-cover-corner tl" />
                  <div className="diary-cover-corner tr" />
                  <div className="diary-cover-corner bl" />
                  <div className="diary-cover-corner br" />

                  <div className="diary-cover-emblem">
                    <BookBookmark size={36} weight="duotone" />
                  </div>

                  <h1 className="diary-cover-title font-display">Our Diary</h1>
                  <div className="diary-cover-divider" />
                  <p className="diary-cover-subtitle font-display">
                    {userName || 'You'} &amp; {partnerName || 'Partner'}
                  </p>

                  <div className="diary-cover-open-prompt">
                    <span className="diary-open-sparkle">✨</span>
                    <span>Tap to Open</span>
                    <span className="diary-open-sparkle">✨</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* OPEN BOOK SPREAD */
            <div className="diary-open-book-spread">
              <div className="diary-book-spine-center" />

              {/* Physical Journal Page Frame */}
              <div className={`diary-paper-page ${isFlipping ? `flipping-${flipDirection}` : ''}`}>
                {loading ? (
                  <div className="diary-page-loading font-ui">
                    <Sparkle size={24} className="spin" />
                    <span>Opening diary pages...</span>
                  </div>
                ) : pages.length === 0 ? (
                  /* EMPTY DIARY WELCOME SPREAD */
                  <div className="diary-empty-page">
                    <div className="diary-empty-heart">
                      <Heart size={36} weight="duotone" />
                    </div>
                    <h2 className="diary-empty-title font-display">Our Shared Story Begins Here</h2>
                    <p className="diary-empty-text font-body">
                      Whenever a message makes you smile, save it from the chat. You can also capture real-life memories with notes and photos right here.
                    </p>
                    <button
                      type="button"
                      className="diary-empty-add-btn"
                      onClick={() => setShowComposer(true)}
                    >
                      <Plus size={16} weight="bold" />
                      <span>Write First Moment</span>
                    </button>
                  </div>
                ) : (
                  /* DATED JOURNAL PAGE CONTENT */
                  <div className="diary-page-content">
                    {/* Header with handcrafted date treatment */}
                    <div className="diary-page-date-header">
                      <div className="diary-date-line" />
                      <h2 className="diary-page-date-text font-display">
                        {pages[currentPageIndex]?.dateLabel}
                      </h2>
                      <div className="diary-date-line" />
                    </div>

                    {/* Moments list for this page */}
                    <div className="diary-moments-list">
                      {pages[currentPageIndex]?.items.map((entry) => {
                        const isUserSaved = entry.isMine;
                        const timeStr = new Date(entry.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        });

                        return (
                          <div 
                            key={entry.id} 
                            className={`diary-moment-card type-${entry.sourceType.toLowerCase()}`}
                          >
                            {/* Saved By badge & Delete control */}
                            <div className="diary-moment-header">
                              <span className="diary-saved-by-badge">
                                <span className="diary-saved-dot" />
                                <span>{isUserSaved ? 'Saved by you' : `Saved by ${entry.savedByName || partnerName}`}</span>
                                <span className="diary-moment-time">• {timeStr}</span>
                              </span>

                              {isUserSaved && (
                                <button
                                  type="button"
                                  className="diary-moment-delete-btn"
                                  onClick={() => handleDeleteEntry(entry.id)}
                                  title="Delete this moment"
                                  aria-label="Delete this moment"
                                >
                                  <Trash size={14} />
                                </button>
                              )}
                            </div>

                            {/* Moment Content Renderer */}
                            <div className="diary-moment-body">
                              {/* 1. MESSAGE */}
                              {entry.sourceType === 'MESSAGE' && (
                                <div className="diary-entry-quote-box font-body">
                                  <Quotes size={18} weight="fill" className="diary-quote-icon" />
                                  <p className="diary-quote-text">{entry.content}</p>
                                </div>
                              )}

                              {/* 2. VOICE NOTE */}
                              {entry.sourceType === 'VOICE_NOTE' && (
                                <div className="diary-entry-voice-box">
                                  <div className="diary-voice-label font-ui">
                                    <span>Voice Message</span>
                                  </div>
                                  <DiaryAudioPlayer url={entry.attachmentUrl} />
                                </div>
                              )}

                              {/* 3. FREEFORM NOTE */}
                              {entry.sourceType === 'NOTE' && (
                                <div className="diary-entry-note-box font-body">
                                  <p className="diary-note-text">{entry.content}</p>
                                </div>
                              )}

                              {/* 4. PHOTO (Placed Polaroid/Print style) */}
                              {entry.sourceType === 'IMAGE' && (
                                <div className="diary-polaroid-frame">
                                  <div className="diary-polaroid-tape" />
                                  <ProtectedImage
                                    src={entry.attachmentUrl}
                                    alt={entry.caption || 'Diary memory'}
                                    className="diary-polaroid-img-wrap"
                                    imgClassName="diary-polaroid-img"
                                  />
                                </div>
                              )}

                              {/* Optional Caption */}
                              {entry.caption && (
                                <div className="diary-moment-caption font-display">
                                  &ldquo;{entry.caption}&rdquo;
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Page Footer Navigation */}
                    <div className="diary-page-footer">
                      <button
                        type="button"
                        className="diary-nav-arrow-btn"
                        onClick={handlePrevPage}
                        disabled={currentPageIndex === 0 || isFlipping}
                        aria-label="Previous page"
                      >
                        <CaretLeft size={16} weight="bold" />
                        <span>Prev</span>
                      </button>

                      <span className="diary-page-indicator font-display">
                        Page {currentPageIndex + 1} of {totalPages}
                      </span>

                      <button
                        type="button"
                        className="diary-nav-arrow-btn"
                        onClick={handleNextPage}
                        disabled={currentPageIndex >= totalPages - 1 || isFlipping}
                        aria-label="Next page"
                      >
                        <span>Next</span>
                        <CaretRight size={16} weight="bold" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* --- IN-DIARY COMPOSER MODAL --- */}
        {showComposer && (
          <div className="diary-composer-backdrop" onClick={() => !isSubmitting && setShowComposer(false)}>
            <div className="diary-composer-sheet font-ui" onClick={(e) => e.stopPropagation()}>
              <div className="diary-composer-header">
                <div className="diary-composer-title font-display">
                  <Sparkle size={18} weight="fill" className="diary-sparkle-pink" />
                  <span>Add to Our Diary</span>
                </div>
                <button
                  type="button"
                  className="diary-composer-close"
                  onClick={() => !isSubmitting && setShowComposer(false)}
                  disabled={isSubmitting}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tabs: Note vs Photo */}
              <div className="diary-composer-tabs">
                <button
                  type="button"
                  className={`diary-composer-tab ${composerTab === 'note' ? 'active' : ''}`}
                  onClick={() => {
                    setComposerTab('note');
                    setComposerError(null);
                  }}
                  disabled={isSubmitting}
                >
                  <NotePencil size={16} />
                  <span>Freeform Note</span>
                </button>
                <button
                  type="button"
                  className={`diary-composer-tab ${composerTab === 'photo' ? 'active' : ''}`}
                  onClick={() => {
                    setComposerTab('photo');
                    setComposerError(null);
                  }}
                  disabled={isSubmitting}
                >
                  <ImageIcon size={16} />
                  <span>Photo Memory</span>
                </button>
              </div>

              <form onSubmit={handleSaveMoment} className="diary-composer-form">
                {/* Note Tab Inputs */}
                {composerTab === 'note' && (
                  <div className="diary-input-group">
                    <label className="diary-input-label">Your Note</label>
                    <textarea
                      className="diary-textarea font-body"
                      placeholder="Write a sweet thought, memory from a call, or inside joke..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      maxLength={2000}
                      rows={4}
                      required
                      autoFocus
                      disabled={isSubmitting}
                    />
                  </div>
                )}

                {/* Photo Tab Inputs */}
                {composerTab === 'photo' && (
                  <div className="diary-input-group">
                    <label className="diary-input-label">Select Photo</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      style={{ display: 'none' }}
                      disabled={isSubmitting}
                    />

                    {photoPreviewUrl ? (
                      <div className="diary-photo-preview-wrap">
                        <img src={photoPreviewUrl} alt="Preview" className="diary-photo-preview" />
                        <button
                          type="button"
                          className="diary-change-photo-btn"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isSubmitting}
                        >
                          Change Photo
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="diary-upload-dropzone"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <UploadSimple size={28} />
                        <span className="diary-dropzone-text">Choose a photo from library or camera</span>
                        <span className="diary-dropzone-sub">JPG, PNG, WebP up to 10MB</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Optional Caption for both */}
                <div className="diary-input-group">
                  <label className="diary-input-label">Optional Caption (Handwritten note)</label>
                  <input
                    type="text"
                    className="diary-text-input font-body"
                    placeholder="e.g. 'This made my whole week'"
                    value={captionText}
                    onChange={(e) => setCaptionText(e.target.value)}
                    maxLength={500}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Error Banner */}
                {composerError && (
                  <div className="diary-composer-error page-enter">
                    <WarningCircle size={16} />
                    <span>{composerError}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="diary-composer-actions">
                  <button
                    type="button"
                    className="diary-cancel-btn"
                    onClick={() => setShowComposer(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="diary-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Sparkle size={15} className="spin" />
                        <span>{composerTab === 'photo' ? 'Scanning & Adding...' : 'Saving Moment...'}</span>
                      </>
                    ) : (
                      <>
                        <BookBookmark size={16} weight="bold" />
                        <span>Save to Diary</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
