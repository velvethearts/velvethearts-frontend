import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  BookBookmark,
  Books,
  SquaresFour,
  CaretLeft,
  CaretRight,
  Plus,
  Image as ImageIcon,
  VideoCamera,
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

// Interactive Mini Calendar Popover with Moment Markings
const DiaryCalendarPopover = ({
  pages,
  currentPageIndex,
  onSelectPage,
  onClose
}) => {
  const currentPageDate = pages[currentPageIndex]?.rawDate || new Date();
  const [viewDate, setViewDate] = useState(() => new Date(currentPageDate.getFullYear(), currentPageDate.getMonth(), 1));

  // Map each date ('YYYY-MM-DD') to its page index and item count
  const dateMap = useMemo(() => {
    const map = new Map();
    pages.forEach((p, idx) => {
      if (p.rawDate) {
        const d = p.rawDate;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        map.set(key, { pageIndex: idx, count: p.items.length, dateLabel: p.dateLabel });
      }
    });
    return map;
  }, [pages]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  const monthLabel = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // Compute days in month
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push({ key: `blank-${i}`, isBlank: true });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const entryData = dateMap.get(key);
    const isSelected = entryData && entryData.pageIndex === currentPageIndex;
    calendarCells.push({
      key,
      day,
      hasEntries: Boolean(entryData),
      pageIndex: entryData?.pageIndex,
      count: entryData?.count || 0,
      isSelected,
    });
  }

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="diary-calendar-popover font-ui" onClick={(e) => e.stopPropagation()}>
      <div className="diary-calendar-header">
        <button type="button" className="diary-cal-nav-btn" onClick={prevMonth} aria-label="Previous month">
          <CaretLeft size={14} weight="bold" />
        </button>
        <span className="diary-calendar-month-title font-display">{monthLabel}</span>
        <button type="button" className="diary-cal-nav-btn" onClick={nextMonth} aria-label="Next month">
          <CaretRight size={14} weight="bold" />
        </button>
      </div>

      <div className="diary-calendar-weekdays">
        {daysOfWeek.map((d, i) => (
          <span key={i} className="diary-cal-weekday">{d}</span>
        ))}
      </div>

      <div className="diary-calendar-grid">
        {calendarCells.map((cell) => {
          if (cell.isBlank) {
            return <div key={cell.key} className="diary-cal-cell blank" />;
          }

          return (
            <button
              key={cell.key}
              type="button"
              className={`diary-cal-cell ${cell.hasEntries ? 'has-moments' : 'empty-day'} ${cell.isSelected ? 'selected' : ''}`}
              disabled={!cell.hasEntries}
              onClick={() => {
                if (cell.hasEntries && cell.pageIndex !== undefined) {
                  onSelectPage(cell.pageIndex);
                }
              }}
              title={cell.hasEntries ? `${cell.count} moment${cell.count > 1 ? 's' : ''} on this date` : 'No moments'}
            >
              <span>{cell.day}</span>
              {cell.hasEntries && <span className="diary-cal-dot" />}
            </button>
          );
        })}
      </div>

      <div className="diary-calendar-footer">
        <div className="diary-cal-legend">
          <span className="diary-cal-dot-sample" />
          <span>Marked dates have moments</span>
        </div>
      </div>
    </div>
  );
};

// Full waveform Voice Note Player (matching ChatView)
const DiaryVoiceNotePlayer = ({ url, isUser }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef(null);
  const waveformRef = useRef(null);
  const isDraggingRef = useRef(false);

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
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
        console.warn('WebM duration fallback:', err);
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
    e.stopPropagation();
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
    <div className={`voice-note-player font-ui ${isUser ? 'user-voice' : 'partner-voice'}`} onClick={(e) => e.stopPropagation()}>
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

export const OurDiaryModal = ({ 
  isOpen, 
  onClose, 
  matchId, 
  partnerName, 
  partnerPhoto, 
  userName,
  userPhoto 
}) => {
  const { showAlert, showConfirm } = useApp();
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isOpeningCover, setIsOpeningCover] = useState(false);
  const [isClosingToCover, setIsClosingToCover] = useState(false);
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
  const [isVideoFile, setIsVideoFile] = useState(false);
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
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setEntries(list);
    } catch (err) {
      console.error('Failed to fetch diary entries:', err);
      if (err?.message?.includes('not found') || err?.message?.includes('not part') || err?.message?.includes('active')) {
        if (showAlert) showAlert({ title: 'Notice', message: 'This connection is no longer active.' });
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
      setIsOpeningCover(false);
      setIsClosingToCover(false);
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

  // Group entries into pages: Exactly 1 page per calendar day that has at least one entry
  const groupEntriesIntoPages = () => {
    if (!entries || entries.length === 0) {
      return [];
    }

    const groupedByDate = new Map();

    entries.forEach(entry => {
      const dateObj = new Date(entry.createdAt);
      const dateLabel = dateObj.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      const dateSortKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

      if (!groupedByDate.has(dateSortKey)) {
        groupedByDate.set(dateSortKey, {
          dateLabel,
          rawDate: dateObj,
          items: []
        });
      }
      groupedByDate.get(dateSortKey).items.push(entry);
    });

    // Sort calendar days in ascending chronological order (Oldest day = Page 1, Most Recent day = Last Page)
    const sortedDays = Array.from(groupedByDate.values()).sort(
      (a, b) => a.rawDate.getTime() - b.rawDate.getTime()
    );

    return sortedDays.map((dayGroup, index) => ({
      dateLabel: dayGroup.dateLabel,
      rawDate: dayGroup.rawDate,
      items: dayGroup.items, // All entries on this calendar day stacked together in order
      pageNumber: index + 1
    }));
  };

  const pages = groupEntriesIntoPages();
  const totalPages = Math.max(pages.length, 1);

  const [isClosingModal, setIsClosingModal] = useState(false);

  const handleCloseDiary = () => {
    if (isClosingModal || isClosingToCover || isOpeningCover) return;

    if (isBookOpen) {
      // 1. Swing the front cover shut over the pages first
      setIsClosingToCover(true);
      setShowDateJump(false);
      setShowComposer(false);

      setTimeout(() => {
        setIsBookOpen(false);
        setIsClosingToCover(false);
        setIsClosingModal(true);
        setTimeout(() => {
          setIsClosingModal(false);
          onClose();
        }, 220);
      }, 420);
    } else {
      // Already on closed cover, smoothly fade out modal
      setIsClosingModal(true);
      setTimeout(() => {
        setIsClosingModal(false);
        onClose();
      }, 220);
    }
  };

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
        handleCloseDiary();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isBookOpen, showComposer, currentPageIndex, totalPages]);

  const handleOpenBook = () => {
    if (isOpeningCover || isFlipping) return;
    setIsOpeningCover(true);
    setTimeout(() => {
      setIsBookOpen(true);
      setIsOpeningCover(false);
      // Jump straight to the most recent page (like a bookmark placed at the end)
      const currentPages = groupEntriesIntoPages();
      setCurrentPageIndex(Math.max(0, currentPages.length - 1));
    }, 420);
  };

  const handleNextPage = () => {
    if (currentPageIndex < totalPages - 1 && !isFlipping && !isClosingToCover) {
      setFlipDirection('next');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPageIndex(prev => prev + 1);
        setIsFlipping(false);
      }, 420);
    }
  };

  const handlePrevPage = () => {
    if (isFlipping || isClosingToCover) return;
    if (currentPageIndex === 0) {
      // Flip back to Cover
      setIsClosingToCover(true);
      setTimeout(() => {
        setIsBookOpen(false);
        setIsClosingToCover(false);
      }, 420);
    } else {
      setFlipDirection('prev');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPageIndex(prev => prev - 1);
        setIsFlipping(false);
      }, 420);
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

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setComposerError('Please select a valid image (JPG, PNG, WebP) or video (MP4, MOV, WebM).');
      return;
    }

    const maxSize = isVideo ? 100 * 1024 * 1024 : 15 * 1024 * 1024;
    if (file.size > maxSize) {
      setComposerError(`${isVideo ? 'Video' : 'Photo'} must be ${isVideo ? '100MB (approx. 1–2 minutes)' : '15MB'} or smaller.`);
      return;
    }

    setSelectedPhotoFile(file);
    setIsVideoFile(isVideo);
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
        await api.addDiaryNote(matchId, noteText.trim(), captionText.trim() || undefined);
        setNoteText('');
        setCaptionText('');
        setShowComposer(false);
        await fetchEntries(true);
      } catch (err) {
        console.error('Error adding note:', err);
        setComposerError(err?.message || 'Failed to save note.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Photo / Video upload
      if (!selectedPhotoFile) {
        setComposerError('Please choose a photo or video to upload.');
        return;
      }

      try {
        setIsSubmitting(true);
        await api.uploadDiaryPhoto(matchId, selectedPhotoFile, captionText.trim() || undefined);
        setSelectedPhotoFile(null);
        setPhotoPreviewUrl(null);
        setIsVideoFile(false);
        setCaptionText('');
        setShowComposer(false);
        await fetchEntries(true);
      } catch (err) {
        console.error('Error uploading diary media:', err);
        setComposerError(err?.message || "That media couldn't be added.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteEntry = async (entryId) => {
    const confirmed = await showConfirm({
      title: 'Delete from Our Diary?',
      message: 'This moment will be removed from your shared diary.',
      okText: 'Delete',
      cancelText: 'Keep',
      variant: 'danger'
    });

    if (confirmed) {
      try {
        await api.deleteDiaryEntry(matchId, entryId);
        await fetchEntries(true);
      } catch (err) {
        console.error('Failed to delete entry:', err);
        if (showAlert) showAlert({ title: 'Delete Failed', message: err?.message || 'Failed to delete entry' });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`our-diary-overlay ${isClosingModal ? 'closing' : ''}`} role="dialog" aria-modal="true" aria-label="Our Diary">
      {/* Background backdrop blur */}
      <div className="our-diary-backdrop" onClick={handleCloseDiary} />

      <div className="our-diary-container">
        {/* Header Controls (Pinterest Journal layout) */}
        <div className="our-diary-top-bar">
          <div className="our-diary-top-left">
            <button
              type="button"
              className="diary-header-icon-btn"
              title="Bookshelf"
              aria-label="Bookshelf"
              onClick={() => {
                if (isBookOpen) {
                  setIsClosingToCover(true);
                  setTimeout(() => {
                    setIsBookOpen(false);
                    setIsClosingToCover(false);
                  }, 420);
                }
              }}
            >
              <Books size={18} weight="duotone" />
            </button>

            {isBookOpen && (
              <button
                type="button"
                className={`diary-header-icon-btn ${showDateJump ? 'active' : ''}`}
                onClick={() => setShowDateJump(prev => !prev)}
                title="Calendar Dates"
                aria-label="Calendar Dates"
              >
                <SquaresFour size={17} weight="bold" />
              </button>
            )}
          </div>

          <div className="our-diary-top-center">
            <h2 className="diary-header-title font-display">
              <span>Our Diary</span>
            </h2>
            <span className="diary-header-pages-sub font-ui">
              <NotePencil size={11} weight="bold" />
              <span>{pages.length} {pages.length === 1 ? 'Page' : 'Pages'}</span>
            </span>
          </div>

          <div className="our-diary-top-right">
            {isBookOpen && (
              <button
                type="button"
                className="diary-top-action-btn primary font-ui"
                onClick={() => {
                  setShowComposer(true);
                  setComposerError(null);
                }}
                title="Add Memory"
              >
                <Plus size={14} weight="bold" />
                <span className="diary-add-btn-text">Add</span>
              </button>
            )}

            <button
              type="button"
              className="our-diary-close-btn"
              onClick={handleCloseDiary}
              aria-label="Close Our Diary"
            >
              <X size={15} weight="bold" />
            </button>
          </div>
        </div>

        {/* Interactive Mini Calendar Popover */}
        {showDateJump && (
          <>
            <div
              className="diary-calendar-dismiss-layer"
              onClick={() => setShowDateJump(false)}
            />
            <DiaryCalendarPopover
              pages={pages}
              currentPageIndex={currentPageIndex}
              onSelectPage={(idx) => {
                handleJumpToPage(idx);
                setShowDateJump(false);
              }}
              onClose={() => setShowDateJump(false)}
            />
          </>
        )}

        {/* --- BOOK STAGE --- */}
        <div className="our-diary-stage">
          {/* Always render the Open Book Spread when open or during open/close transitions */}
          {(isBookOpen || isOpeningCover || isClosingToCover) && (
            <div className="diary-open-book-spread">
              <div className="diary-book-spine-center" />

              {/* Physical Journal Page Frame */}
              <div className={`diary-paper-page ${isFlipping && !isClosingToCover ? `flipping-${flipDirection}` : ''}`}>
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
                                  <DiaryVoiceNotePlayer url={entry.attachmentUrl} isUser={isUserSaved} />
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
                                  {entry.caption && (
                                    <p className="diary-polaroid-caption font-body">
                                      {entry.caption}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* 5. VIDEO MEMORY (Placed Vintage Reel style) */}
                              {entry.sourceType === 'VIDEO' && (
                                <div className="diary-polaroid-frame diary-video-frame">
                                  <div className="diary-polaroid-tape" />
                                  <div className="diary-video-wrap">
                                    <video
                                      src={entry.attachmentUrl}
                                      controls
                                      playsInline
                                      preload="metadata"
                                      className="diary-moment-video"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                  {entry.caption && (
                                    <p className="diary-polaroid-caption font-body">
                                      {entry.caption}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Optional user-added caption for text/voice items */}
                              {entry.sourceType !== 'IMAGE' && entry.sourceType !== 'VIDEO' && entry.caption && (
                                <div className="diary-entry-caption font-body">
                                  <span>{entry.caption}</span>
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
                        disabled={isFlipping || isClosingToCover}
                        aria-label={currentPageIndex === 0 ? "Back to cover" : "Previous page"}
                      >
                        <CaretLeft size={16} weight="bold" />
                        <span>{currentPageIndex === 0 ? 'Cover' : 'Prev'}</span>
                      </button>

                      <span className="diary-page-indicator font-display">
                        Page {currentPageIndex + 1} of {totalPages}
                      </span>

                      <button
                        type="button"
                        className="diary-nav-arrow-btn"
                        onClick={handleNextPage}
                        disabled={currentPageIndex >= totalPages - 1 || isFlipping || isClosingToCover}
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

          {/* Peeking adjacent book on left for bookshelf feel */}
          {(!isBookOpen || isOpeningCover || isClosingToCover) && (
            <div className="diary-peeking-book left" aria-hidden="true">
              <div className="diary-peeking-spine" />
            </div>
          )}

          {/* Render the Book Cover when closed, opening, or closing */}
          {(!isBookOpen || isOpeningCover || isClosingToCover) && (
            <div
              className={`diary-book-cover ${isOpeningCover ? 'opening-cover' : ''} ${isClosingToCover ? 'closing-cover' : ''}`}
              onClick={handleOpenBook}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenBook(); }}
            >
              <div className="diary-cover-spine" />
              <div className="diary-cover-texture">
                <div className="diary-cover-cute-body">
                  <div className="diary-cover-emblem">
                    <BookBookmark size={36} weight="duotone" />
                  </div>

                  <h1 className="diary-cover-title font-display">Our Diary</h1>
                  
                  <div className="diary-cover-pages-pill font-ui">
                    <NotePencil size={13} weight="bold" />
                    <span>{pages.length} {pages.length === 1 ? 'Page' : 'Pages'}</span>
                  </div>

                  <p className="diary-cover-subtitle font-display">
                    {userName || 'You'} &amp; {partnerName || 'Partner'}
                  </p>

                  <div className="diary-cover-open-prompt font-ui">
                    <span>Tap to Open</span>
                    <span className="diary-open-sparkle">✨</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Action Dock (Pinterest video style) when book is open */}
        {isBookOpen && !isClosingToCover && (
          <div className="diary-floating-dock font-ui">
            <button
              type="button"
              className={`diary-dock-btn ${showDateJump ? 'active' : ''}`}
              onClick={() => setShowDateJump(prev => !prev)}
              title="Jump by Dates"
              aria-label="Jump by Dates"
            >
              <CalendarBlank size={17} weight="bold" />
            </button>

            <button
              type="button"
              className="diary-dock-btn"
              onClick={handlePrevPage}
              disabled={isFlipping}
              title={currentPageIndex === 0 ? "Close to Cover" : "Previous Page"}
              aria-label={currentPageIndex === 0 ? "Close to Cover" : "Previous Page"}
            >
              <CaretLeft size={17} weight="bold" />
            </button>

            <button
              type="button"
              className="diary-dock-btn"
              onClick={handleNextPage}
              disabled={currentPageIndex >= totalPages - 1 || isFlipping}
              title="Next Page"
              aria-label="Next Page"
            >
              <CaretRight size={17} weight="bold" />
            </button>

            <button
              type="button"
              className="diary-dock-btn primary-add"
              onClick={() => {
                setShowComposer(true);
                setComposerError(null);
              }}
              title="Add Moment (Photo, Video, Note)"
              aria-label="Add Moment"
            >
              <Plus size={19} weight="bold" />
            </button>
          </div>
        )}

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

              {/* Tabs: Note vs Media */}
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
                  <VideoCamera size={16} />
                  <span>Photo / Video</span>
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

                {/* Photo / Video Tab Inputs */}
                {composerTab === 'photo' && (
                  <div className="diary-input-group">
                    <label className="diary-input-label">Select Photo or Video</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
                      style={{ display: 'none' }}
                      disabled={isSubmitting}
                    />

                    {photoPreviewUrl ? (
                      <div className="diary-photo-preview-wrap">
                        {isVideoFile ? (
                          <video src={photoPreviewUrl} controls className="diary-photo-preview" />
                        ) : (
                          <img src={photoPreviewUrl} alt="Preview" className="diary-photo-preview" />
                        )}
                        <button
                          type="button"
                          className="diary-change-photo-btn"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isSubmitting}
                        >
                          Change Media
                        </button>
                      </div>
                    ) : (
                      <div
                        className="diary-upload-dropzone"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <UploadSimple size={28} />
                        <span className="diary-dropzone-text">Choose a photo or video</span>
                        <span className="diary-dropzone-sub">Photos up to 15MB • Videos up to 100MB (1–2 mins, MP4, MOV, WebM)</span>
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
                        <span>{composerTab === 'photo' ? 'Adding to Diary...' : 'Saving Moment...'}</span>
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
