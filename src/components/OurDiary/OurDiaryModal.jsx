import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  BookBookmark,
  BookOpen,
  CaretLeft,
  CaretRight,
  Plus,
  Image as ImageIcon,
  NotePencil,
  Microphone,
  Trash,
  Play,
  Pause,
  CalendarCheck,
  Sparkle,
  Heart,
  UploadSimple,
  Quotes,
  Stop,
  Check
} from '@phosphor-icons/react';
import { api } from '../../lib/api';
import { useApp } from '../../context/AppContext';
import { getSocket } from '../../lib/socket';

/**
 * Velvet Hearts — Our Diary Modal
 * Light Theme Aesthetic with Physical 3D Book & Live Preview Composer
 */

// Voice Note Ribbon Player
const DiaryVoiceNotePlayer = ({ url }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = (e) => {
    e?.stopPropagation?.();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime || 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="diary-voice-ribbon font-ui">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
      <button
        type="button"
        className="diary-voice-play-btn"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause voice note' : 'Play voice note'}
      >
        {isPlaying ? <Pause size={15} weight="fill" /> : <Play size={15} weight="fill" />}
      </button>

      <div className="diary-voice-waveform-track">
        <div className="diary-voice-wave-bars">
          {[35, 65, 30, 80, 55, 95, 40, 75, 50, 90, 35, 70, 45, 85, 60, 35].map((h, i) => {
            const barPct = (i / 16) * 100;
            const isFilled = progressPct >= barPct;
            return (
              <span
                key={i}
                className={`diary-wave-bar ${isFilled ? 'filled' : ''} ${isPlaying ? 'playing' : ''}`}
                style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}
              />
            );
          })}
        </div>
      </div>

      <span className="diary-voice-time font-ui">
        {isPlaying ? formatTime(currentTime) : formatTime(duration || 0)}
      </span>
    </div>
  );
};

// Bottom Date-Strip Navigation Drawer
const DiaryDateDrawer = ({
  pages = [],
  currentPageIndex = 0,
  onSelectDate,
  viewDate,
  setViewDate
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const curYear = viewDate.getFullYear();
  const curMonth = viewDate.getMonth();

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(curYear, curMonth - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(curYear, curMonth + 1, 1));
  };

  const handleJumpToToday = (e) => {
    e.stopPropagation();
    const today = new Date();
    setViewDate(today);
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const pageIdx = pages.findIndex(p => p.dayKey === todayKey);
    if (pageIdx !== -1) {
      onSelectDate(pageIdx);
    }
  };

  const daysInMonth = useMemo(() => {
    const totalDays = new Date(curYear, curMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(curYear, curMonth, 1).getDay();
    const leadingBlanks = (firstDayOfWeek + 6) % 7;

    const days = [];
    for (let i = 0; i < leadingBlanks; i++) {
      days.push({ dayNumber: null, key: `blank-${i}`, isBlank: true });
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(curYear, curMonth, d);
      const dayKey = `${curYear}-${curMonth}-${d}`;
      const pageIndex = pages.findIndex(p => p.dayKey === dayKey);
      const hasEntries = pageIndex !== -1;
      const isSelected = pageIndex === currentPageIndex;

      days.push({
        dayNumber: d,
        dateObj,
        dayKey,
        pageIndex,
        hasEntries,
        isSelected,
        key: `day-${d}`
      });
    }

    return days;
  }, [curYear, curMonth, pages, currentPageIndex]);

  const activePage = pages[currentPageIndex];
  const activeDate = activePage?.rawDate ? new Date(activePage.rawDate) : new Date();

  return (
    <div className={`diary-date-strip-drawer font-ui ${isExpanded ? 'expanded' : ''}`}>
      {/* Month Bar & Jump to Today */}
      <div className="diary-strip-header" onClick={() => setIsExpanded(prev => !prev)}>
        <div className="diary-strip-header-left">
          <span className="diary-strip-month-label font-display">
            {monthNames[curMonth]} {curYear}
          </span>
          <CaretRight size={14} weight="bold" className={`diary-strip-caret ${isExpanded ? 'rotated' : ''}`} />
        </div>

        <button
          type="button"
          className="diary-strip-today-pill font-ui"
          onClick={handleJumpToToday}
          title="Jump to Today's Page"
        >
          <CalendarCheck size={14} weight="bold" />
          <span>Today</span>
        </button>
      </div>

      {/* Weekday Strip (Always Visible) */}
      <div className="diary-strip-week-row">
        {dayNames.map((dName, idx) => {
          const currentDayNum = activeDate.getDate();
          const targetDayNum = currentDayNum - ((activeDate.getDay() + 6) % 7) + idx;
          const isValidDay = targetDayNum > 0 && targetDayNum <= new Date(curYear, curMonth + 1, 0).getDate();
          const dayKey = `${curYear}-${curMonth}-${targetDayNum}`;
          const pageIdx = pages.findIndex(p => p.dayKey === dayKey);
          const hasEntries = pageIdx !== -1;
          const isSelected = isValidDay && targetDayNum === activeDate.getDate() && curMonth === activeDate.getMonth();

          return (
            <button
              key={idx}
              type="button"
              className={`diary-strip-day-col ${isSelected ? 'selected' : ''} ${hasEntries ? 'has-moments' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (hasEntries) onSelectDate(pageIdx);
              }}
              disabled={!isValidDay || !hasEntries}
            >
              <span className="diary-strip-col-day font-ui">{dName}</span>
              <span className="diary-strip-col-num font-display">{isValidDay ? targetDayNum : '·'}</span>
              {hasEntries && <span className="diary-strip-col-dot" />}
            </button>
          );
        })}
      </div>

      {/* Full Month Calendar View (when expanded) */}
      {isExpanded && (
        <div className="diary-calendar-expanded-view">
          <div className="diary-cal-month-nav">
            <button type="button" className="diary-cal-nav-btn" onClick={handlePrevMonth}>
              <CaretLeft size={16} weight="bold" />
            </button>
            <span className="diary-cal-nav-title font-display">
              {monthNames[curMonth]} {curYear}
            </span>
            <button type="button" className="diary-cal-nav-btn" onClick={handleNextMonth}>
              <CaretRight size={16} weight="bold" />
            </button>
          </div>

          <div className="diary-cal-grid-headers">
            {dayNames.map((d, i) => (
              <span key={i} className="diary-cal-header-cell font-ui">{d}</span>
            ))}
          </div>

          <div className="diary-cal-grid-cells">
            {daysInMonth.map((dObj) => {
              if (dObj.isBlank) {
                return <div key={dObj.key} className="diary-cal-cell empty" />;
              }
              return (
                <button
                  key={dObj.key}
                  type="button"
                  className={`diary-cal-cell ${dObj.isSelected ? 'active' : ''} ${dObj.hasEntries ? 'with-entry' : 'no-entry'}`}
                  onClick={() => {
                    if (dObj.hasEntries) {
                      onSelectDate(dObj.pageIndex);
                      setIsExpanded(false);
                    }
                  }}
                  disabled={!dObj.hasEntries}
                >
                  <span className="diary-cal-cell-number font-display">{dObj.dayNumber}</span>
                  {dObj.hasEntries && <span className="diary-cal-cell-dot" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const OurDiaryModal = ({
  isOpen = false,
  onClose,
  matchId,
  partnerName = 'Partner',
  userName = 'You',
  initialEntryId,
}) => {
  const { showAlert, showConfirm } = useApp();

  // Navigation: 'browse' (3D Book Cover & Flippable Day-Pages) vs 'add' (Live Preview & Composer)
  const [viewState, setViewState] = useState('browse');
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isOpeningAnim, setIsOpeningAnim] = useState(false);
  const [addMode, setAddMode] = useState('type'); // 'type' | 'record' | 'photo'

  // Entries & Grouped Day Pages
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isPeeling, setIsPeeling] = useState(false);
  const [peelDirection, setPeelDirection] = useState('next'); // 'next' | 'prev'

  // Date Strip View Date
  const [viewDate, setViewDate] = useState(() => new Date());

  // Form / Composer State
  const [noteText, setNoteText] = useState('');
  const [captionText, setCaptionText] = useState('');
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const [composerError, setComposerError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Audio Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  // Close Transition
  const [isClosingModal, setIsClosingModal] = useState(false);
  const cardTouchStart = useRef(null);

  // Group entries chronologically by local calendar day (oldest to newest)
  const groupEntriesList = (entriesList) => {
    if (!entriesList || !Array.isArray(entriesList) || entriesList.length === 0) return [];

    const sorted = [...entriesList].sort((a, b) => {
      const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeA - timeB;
    });

    const dayMap = new Map();

    sorted.forEach((entry) => {
      if (!entry) return;
      const date = entry.createdAt ? new Date(entry.createdAt) : new Date();
      const validDate = isNaN(date.getTime()) ? new Date() : date;
      const dayKey = `${validDate.getFullYear()}-${validDate.getMonth()}-${validDate.getDate()}`;

      if (!dayMap.has(dayKey)) {
        dayMap.set(dayKey, {
          rawDate: validDate,
          dayKey,
          dateLabel: validDate.toLocaleDateString(undefined, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          items: []
        });
      }
      dayMap.get(dayKey).items.push(entry);
    });

    return Array.from(dayMap.values()).map((dayGroup, index) => ({
      dayKey: dayGroup.dayKey,
      dateLabel: dayGroup.dateLabel,
      rawDate: dayGroup.rawDate,
      items: dayGroup.items || [],
      pageNumber: index + 1
    }));
  };

  const pages = useMemo(() => groupEntriesList(entries), [entries]);
  const totalPages = Math.max(pages.length, 1);

  // Fetch diary entries
  const fetchEntries = async (isBackground = false) => {
    if (!matchId) return;
    try {
      if (!isBackground) setLoading(true);
      const data = await api.getDiaryEntries(matchId);
      const list = Array.isArray(data) ? data : (Array.isArray(data?.entries) ? data.entries : []);
      setEntries(list);

      const computedPages = groupEntriesList(list);

      if (initialEntryId) {
        const foundPageIdx = computedPages.findIndex(p => (p?.items || []).some(it => it?.id === initialEntryId));
        if (foundPageIdx !== -1) {
          setCurrentPageIndex(foundPageIdx);
          setIsBookOpen(true);
          if (computedPages[foundPageIdx]?.rawDate) {
            setViewDate(new Date(computedPages[foundPageIdx].rawDate));
          }
          return;
        }
      }

      // Default to most recent day
      if (computedPages.length > 0) {
        const latestIdx = computedPages.length - 1;
        setCurrentPageIndex(latestIdx);
        if (computedPages[latestIdx]?.rawDate) {
          setViewDate(new Date(computedPages[latestIdx].rawDate));
        }
      }
    } catch (err) {
      console.error('Failed to load diary entries:', err);
      if (!isBackground) setEntries([]);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && matchId) {
      fetchEntries();
      setViewState('browse');
      setIsBookOpen(false);
      setIsOpeningAnim(false);
      setAddMode('type');
    }
  }, [isOpen, matchId]);

  // Real-time socket sync
  useEffect(() => {
    if (!isOpen || !matchId) return;
    const socket = getSocket();
    if (!socket) return;

    const handleNewEntry = (data) => {
      if (data?.matchId === matchId) {
        fetchEntries(true);
      }
    };

    const handleDeletedEntry = (data) => {
      if (data?.matchId === matchId) {
        fetchEntries(true);
      }
    };

    socket.on('diary_entry_added', handleNewEntry);
    socket.on('diary_entry_deleted', handleDeletedEntry);

    return () => {
      socket.off('diary_entry_added', handleNewEntry);
      socket.off('diary_entry_deleted', handleDeletedEntry);
    };
  }, [isOpen, matchId]);

  // Open Book with spine hinge animation
  const handleOpenBook = () => {
    if (isOpeningAnim || isBookOpen) return;
    setIsOpeningAnim(true);
    setTimeout(() => {
      setIsBookOpen(true);
      setIsOpeningAnim(false);
    }, 600);
  };

  // Close handler
  const handleCloseDiary = () => {
    if (isClosingModal) return;
    stopAudioRecording();
    setIsClosingModal(true);
    setTimeout(() => {
      setIsClosingModal(false);
      onClose?.();
    }, 200);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || viewState === 'add' || !isBookOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseDiary();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, viewState, isBookOpen, currentPageIndex, totalPages]);

  // Page Turn / Peel Transitions
  const handleNextCard = () => {
    if (currentPageIndex < totalPages - 1 && !isPeeling) {
      setPeelDirection('next');
      setIsPeeling(true);
      setTimeout(() => {
        setCurrentPageIndex(prev => {
          const nextIdx = prev + 1;
          if (pages?.[nextIdx]?.rawDate) {
            setViewDate(new Date(pages[nextIdx].rawDate));
          }
          return nextIdx;
        });
        setIsPeeling(false);
      }, 350);
    }
  };

  const handlePrevCard = () => {
    if (currentPageIndex > 0 && !isPeeling) {
      setPeelDirection('prev');
      setIsPeeling(true);
      setTimeout(() => {
        setCurrentPageIndex(prev => {
          const prevIdx = prev - 1;
          if (pages?.[prevIdx]?.rawDate) {
            setViewDate(new Date(pages[prevIdx].rawDate));
          }
          return prevIdx;
        });
        setIsPeeling(false);
      }, 350);
    }
  };

  const handleJumpToPageIndex = (index) => {
    if (index >= 0 && index < totalPages && index !== currentPageIndex && !isPeeling) {
      setPeelDirection(index > currentPageIndex ? 'next' : 'prev');
      setIsPeeling(true);
      setTimeout(() => {
        setCurrentPageIndex(index);
        if (pages?.[index]?.rawDate) {
          setViewDate(new Date(pages[index].rawDate));
        }
        setIsPeeling(false);
      }, 250);
    }
  };

  // Photo selection (Images only as per spec)
  const handlePhotoSelect = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setComposerError('Please choose a valid photo (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setComposerError('Photo must be 15MB or smaller.');
      return;
    }

    setSelectedPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
    setComposerError(null);
  };

  // Voice Note Recording
  const startAudioRecording = async () => {
    try {
      setComposerError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunks, { type: mimeType });
        setRecordedAudioBlob(blob);
        setRecordedAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      setComposerError('Microphone access is required to record voice notes.');
    }
  };

  const stopAudioRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cancelAudioRecording = () => {
    stopAudioRecording();
    setRecordedAudioBlob(null);
    setRecordedAudioUrl(null);
    setRecordingSeconds(0);
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Save new entry
  const handleSaveEntry = async (e) => {
    e?.preventDefault?.();
    setComposerError(null);

    if (addMode === 'type') {
      if (!noteText.trim()) {
        setComposerError('Please write your note before saving.');
        return;
      }

      try {
        setIsSubmitting(true);
        const res = await api.addDiaryNote(matchId, noteText.trim(), captionText.trim() || undefined);
        const createdEntry = res?.data || res;
        if (createdEntry) {
          setEntries(prev => [...prev, createdEntry]);
        }
        setNoteText('');
        setCaptionText('');
      } catch (err) {
        console.error('Error saving note:', err);
        setComposerError(err?.message || 'Failed to save note.');
      } finally {
        setIsSubmitting(false);
      }
    } else if (addMode === 'record') {
      if (!recordedAudioBlob) {
        setComposerError('Please record your voice note before saving.');
        return;
      }

      try {
        setIsSubmitting(true);
        const audioFile = new File([recordedAudioBlob], `voice_note_${Date.now()}.webm`, { type: recordedAudioBlob.type || 'audio/webm' });
        const res = await api.uploadDiaryPhoto(matchId, audioFile, captionText.trim() || undefined);
        const createdEntry = res?.data || res;
        if (createdEntry) {
          setEntries(prev => [...prev, createdEntry]);
        }
        cancelAudioRecording();
        setCaptionText('');
      } catch (err) {
        console.error('Error saving voice note:', err);
        setComposerError(err?.message || 'Failed to upload voice note.');
      } finally {
        setIsSubmitting(false);
      }
    } else if (addMode === 'photo') {
      if (!selectedPhotoFile) {
        setComposerError('Please choose a photo to add.');
        return;
      }

      try {
        setIsSubmitting(true);
        const res = await api.uploadDiaryPhoto(matchId, selectedPhotoFile, captionText.trim() || undefined);
        const createdEntry = res?.data || res;
        if (createdEntry) {
          setEntries(prev => [...prev, createdEntry]);
        }
        setSelectedPhotoFile(null);
        setPhotoPreviewUrl(null);
        setCaptionText('');
      } catch (err) {
        console.error('Error uploading photo:', err);
        setComposerError(err?.message || "That photo couldn't be added.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Delete moment
  const handleDeleteEntry = async (entryId) => {
    const confirmed = await showConfirm?.({
      title: 'Delete Moment?',
      message: 'This moment will be removed from your shared diary.',
      okText: 'Delete',
      cancelText: 'Keep',
      variant: 'danger'
    });

    if (confirmed) {
      try {
        await api.deleteDiaryEntry(matchId, entryId);
        setEntries(prev => prev.filter(e => e.id !== entryId));
      } catch (err) {
        console.error('Failed to delete entry:', err);
        if (showAlert) showAlert({ title: 'Delete Failed', message: err?.message || 'Failed to delete entry' });
      }
    }
  };

  if (!isOpen) return null;

  const currentDayCard = pages?.[currentPageIndex] || null;

  // Compute Today's Page data for Add Page Live Preview
  const todayRaw = new Date();
  const todayKey = `${todayRaw.getFullYear()}-${todayRaw.getMonth()}-${todayRaw.getDate()}`;
  const todayDateLabel = todayRaw.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const todayExistingPage = pages.find(p => p.dayKey === todayKey);
  const todaySavedItems = todayExistingPage?.items || [];

  return (
    <div className={`diary-modal-overlay ${isClosingModal ? 'closing' : ''}`} role="dialog" aria-modal="true" aria-label="Our Diary">
      <div className="diary-modal-backdrop" onClick={handleCloseDiary} />

      <div className="diary-modal-wrapper font-ui">
        {/* Top Light Chrome Header Bar */}
        <div className="diary-modal-header">
          <div className="diary-header-left">
            <span className="diary-header-badge font-display">
              <Heart size={16} weight="fill" className="diary-header-heart" />
              <span>Our Diary</span>
            </span>
          </div>

          <div className="diary-header-center">
            <span className="diary-header-mode-title font-display">
              {viewState === 'browse'
                ? (!isBookOpen ? 'Our Shared Memories' : 'Browsing Memories')
                : 'Add a Moment'}
            </span>
          </div>

          <div className="diary-header-right">
            {viewState === 'browse' ? (
              <>
                {isBookOpen && (
                  <button
                    type="button"
                    className="diary-header-btn secondary font-ui"
                    onClick={() => setIsBookOpen(false)}
                    title="Close book to cover"
                  >
                    <BookBookmark size={14} weight="bold" />
                    <span>Close Cover</span>
                  </button>
                )}

                <button
                  type="button"
                  className="diary-header-btn primary font-ui"
                  onClick={() => {
                    setViewState('add');
                    setAddMode('type');
                  }}
                  title="Add a new moment to today's page"
                >
                  <Plus size={14} weight="bold" />
                  <span>Add Moment</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                className="diary-header-btn primary font-ui"
                onClick={() => {
                  setViewState('browse');
                  setIsBookOpen(true);
                }}
                title="View your diary book"
              >
                <BookOpen size={14} weight="bold" />
                <span>View Book</span>
              </button>
            )}

            <button
              type="button"
              className="diary-modal-close-btn"
              onClick={handleCloseDiary}
              aria-label="Close Our Diary"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        </div>

        {/* Main Stage */}
        <div className="diary-modal-stage">
          {viewState === 'browse' ? (
            /* ==========================================================
               SCREEN 1: BOOK PAGE — BROWSING
               ========================================================== */
            !isBookOpen ? (
              /* Self-Contained 3D Book Graphic at Rest */
              <div className="diary-cover-container font-ui">
                <div className="diary-book-3d-scene">
                  <div
                    className={`diary-physical-book ${isOpeningAnim ? 'opening' : ''}`}
                    onClick={handleOpenBook}
                    title="Click to open your diary"
                    role="button"
                    tabIndex={0}
                  >
                    {/* Spine Edge on the Left */}
                    <div className="diary-book-spine-edge" />

                    {/* Book Front Hardcover */}
                    <div className="diary-book-front-cover">
                      <div className="diary-book-cover-inner-border">
                        <div className="diary-book-gold-emblem">
                          <Heart size={36} weight="duotone" />
                        </div>

                        <h2 className="diary-book-title font-display">Our Diary</h2>

                        <p className="diary-book-subtitle font-display">
                          {userName || 'You'} &amp; {partnerName || 'Partner'}
                        </p>

                        <div className="diary-book-saved-badge font-ui">
                          <Sparkle size={12} weight="fill" />
                          <span>{pages.length} {pages.length === 1 ? 'Day Saved' : 'Days Saved'}</span>
                        </div>

                        <div className="diary-book-open-prompt font-ui">
                          <span>Tap to Open</span>
                          <CaretRight size={13} weight="bold" />
                        </div>
                      </div>
                    </div>

                    {/* Physical Paper Pages Edge (Right & Bottom Depth) */}
                    <div className="diary-book-pages-edge" />
                  </div>
                </div>
              </div>
            ) : (
              /* Open Book: Single Flippable Day-Page Card */
              <div className="diary-open-page-container font-ui">
                <div
                  className="diary-day-page-wrapper"
                  onTouchStart={(e) => {
                    cardTouchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                  }}
                  onTouchEnd={(e) => {
                    if (!cardTouchStart.current) return;
                    const deltaX = e.changedTouches[0].clientX - cardTouchStart.current.x;
                    const deltaY = e.changedTouches[0].clientY - cardTouchStart.current.y;
                    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 35) {
                      if (deltaX < 0) {
                        handleNextCard();
                      } else {
                        handlePrevCard();
                      }
                    }
                    cardTouchStart.current = null;
                  }}
                >
                  {/* Floating Page Flip Nav (Prev) */}
                  {currentPageIndex > 0 && (
                    <button
                      type="button"
                      className="diary-page-nav-arrow prev font-ui"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevCard();
                      }}
                      aria-label="Previous Page"
                      title="Previous Page"
                    >
                      <CaretLeft size={20} weight="bold" />
                    </button>
                  )}

                  {/* Floating Page Flip Nav (Next) */}
                  {currentPageIndex < totalPages - 1 && (
                    <button
                      type="button"
                      className="diary-page-nav-arrow next font-ui"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextCard();
                      }}
                      aria-label="Next Page"
                      title="Next Page"
                    >
                      <CaretRight size={20} weight="bold" />
                    </button>
                  )}

                  {/* Clean White Day-Page Card */}
                  <div
                    key={currentDayCard?.dayKey || currentPageIndex}
                    className={`diary-white-day-card ${isPeeling ? `peeling-${peelDirection}` : ''}`}
                  >
                    {/* Top Row: Date Header and Page Indicator */}
                    <div className="diary-day-page-top">
                      <h2 className="diary-day-page-date font-display">
                        {currentDayCard?.dateLabel || 'Today'}
                      </h2>

                      <button
                        type="button"
                        className="diary-day-page-counter font-ui"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentPageIndex < totalPages - 1) handleNextCard();
                        }}
                        title={currentPageIndex < totalPages - 1 ? 'Flip to next day' : 'Last page'}
                      >
                        <span>Page {currentPageIndex + 1} of {totalPages}</span>
                        {currentPageIndex < totalPages - 1 && <CaretRight size={11} weight="bold" />}
                      </button>
                    </div>

                    <div className="diary-day-page-divider" />

                    {/* Scrapbook Entries Area */}
                    <div className="diary-day-page-entries-scroll">
                      {loading ? (
                        <div className="diary-empty-state font-ui">
                          <Sparkle size={24} className="spin text-burgundy" />
                          <span>Loading moments...</span>
                        </div>
                      ) : (!currentDayCard?.items || currentDayCard.items.length === 0) ? (
                        <div className="diary-empty-state font-ui">
                          <Heart size={32} weight="duotone" className="text-burgundy" />
                          <h4 className="diary-empty-heading font-display">No moments on this day</h4>
                          <p className="diary-empty-text font-body">
                            Tap "+ Add Moment" above to write a note, record a voice clip, or save a photo.
                          </p>
                        </div>
                      ) : (
                        currentDayCard.items.map((entry) => {
                          if (!entry) return null;
                          const isMine = Boolean(entry.isMine);
                          const timeStr = entry.createdAt
                            ? new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '';
                          const sourceType = (entry.sourceType || 'MESSAGE').toUpperCase();

                          return (
                            <div key={entry.id || Math.random()} className={`diary-scrapbook-entry type-${sourceType.toLowerCase()}`}>
                              <div className="diary-entry-meta-row">
                                <span className="diary-entry-author font-ui">
                                  <span className="diary-entry-author-dot" />
                                  <span>{isMine ? 'Saved by you' : `Saved by ${entry.savedByName || partnerName || 'Partner'}`}</span>
                                  {timeStr && <span className="diary-entry-time">· {timeStr}</span>}
                                </span>

                                {isMine && entry.id && (
                                  <button
                                    type="button"
                                    className="diary-entry-del-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteEntry(entry.id);
                                    }}
                                    title="Delete this moment"
                                    aria-label="Delete this moment"
                                  >
                                    <Trash size={13} />
                                  </button>
                                )}
                              </div>

                              {/* 1. Saved Chat Message (Handwritten Quote with Quotation mark) */}
                              {sourceType === 'MESSAGE' && entry.content && (
                                <div className="diary-scrapbook-quote font-display">
                                  <Quotes size={18} weight="fill" className="diary-quote-symbol" />
                                  <div className="diary-quote-body">
                                    <p className="diary-quote-main font-body">{entry.content}</p>
                                    {entry.caption && (
                                      <p className="diary-quote-sub font-ui">{entry.caption}</p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* 2. Written Note (Warm Handwriting on Paper) */}
                              {sourceType === 'NOTE' && entry.content && (
                                <div className="diary-scrapbook-note">
                                  <p className="diary-note-text font-display">{entry.content}</p>
                                  {entry.caption && (
                                    <p className="diary-note-sub font-ui">{entry.caption}</p>
                                  )}
                                </div>
                              )}

                              {/* 3. Voice Note (Blush Ribbon Waveform Player) */}
                              {sourceType === 'VOICE_NOTE' && entry.attachmentUrl && (
                                <div className="diary-scrapbook-voice">
                                  <DiaryVoiceNotePlayer url={entry.attachmentUrl} />
                                  {entry.caption && (
                                    <p className="diary-voice-sub font-ui">{entry.caption}</p>
                                  )}
                                </div>
                              )}

                              {/* 4. Physical Polaroid Photo (No DRM wrapper, clean img) */}
                              {sourceType === 'IMAGE' && entry.attachmentUrl && (
                                <div className="diary-scrapbook-polaroid">
                                  <div className="diary-polaroid-washi-tape" />
                                  <div className="diary-polaroid-photo-frame">
                                    <img
                                      src={entry.attachmentUrl}
                                      alt="Diary Memory"
                                      className="diary-polaroid-img"
                                      loading="lazy"
                                    />
                                  </div>
                                  {entry.caption && (
                                    <p className="diary-polaroid-caption font-display">{entry.caption}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* ==========================================================
               SCREEN 2: ADD PAGE — COMPOSING WITH LIVE PREVIEW
               ========================================================== */
            <div className="diary-add-composer-screen font-ui">
              {/* Top: Live Preview of Today's Page */}
              <div className="diary-live-preview-box">
                <div className="diary-live-preview-tag">
                  <Sparkle size={13} weight="fill" className="text-burgundy" />
                  <span>Live Preview: Today's Page</span>
                </div>

                <div className="diary-live-preview-page-mock">
                  <div className="diary-day-page-top">
                    <h3 className="diary-day-page-date font-display">{todayDateLabel}</h3>
                    <span className="diary-live-draft-badge font-ui">Today</span>
                  </div>

                  <div className="diary-day-page-divider" />

                  {/* Pre-populated saved items for today + Live composing draft */}
                  <div className="diary-day-page-entries-scroll preview-scroll">
                    {todaySavedItems.length === 0 && !noteText.trim() && !recordedAudioUrl && !photoPreviewUrl ? (
                      <div className="diary-empty-state mini font-ui">
                        <Heart size={22} weight="duotone" className="text-burgundy" />
                        <p className="diary-empty-text font-body">
                          Today's page is blank. Choose an option below to see it appear live!
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Saved items on today's page */}
                        {todaySavedItems.map((entry) => {
                          const sourceType = (entry.sourceType || 'MESSAGE').toUpperCase();
                          return (
                            <div key={entry.id || Math.random()} className={`diary-scrapbook-entry type-${sourceType.toLowerCase()}`}>
                              <div className="diary-entry-meta-row">
                                <span className="diary-entry-author font-ui">
                                  <span className="diary-entry-author-dot" />
                                  <span>Saved on today's page</span>
                                </span>
                              </div>

                              {sourceType === 'MESSAGE' && entry.content && (
                                <div className="diary-scrapbook-quote font-display">
                                  <Quotes size={16} weight="fill" className="diary-quote-symbol" />
                                  <div className="diary-quote-body">
                                    <p className="diary-quote-main font-body">{entry.content}</p>
                                    {entry.caption && <p className="diary-quote-sub font-ui">{entry.caption}</p>}
                                  </div>
                                </div>
                              )}

                              {sourceType === 'NOTE' && entry.content && (
                                <div className="diary-scrapbook-note">
                                  <p className="diary-note-text font-display">{entry.content}</p>
                                  {entry.caption && <p className="diary-note-sub font-ui">{entry.caption}</p>}
                                </div>
                              )}

                              {sourceType === 'VOICE_NOTE' && entry.attachmentUrl && (
                                <div className="diary-scrapbook-voice">
                                  <DiaryVoiceNotePlayer url={entry.attachmentUrl} />
                                  {entry.caption && <p className="diary-voice-sub font-ui">{entry.caption}</p>}
                                </div>
                              )}

                              {sourceType === 'IMAGE' && entry.attachmentUrl && (
                                <div className="diary-scrapbook-polaroid">
                                  <div className="diary-polaroid-washi-tape" />
                                  <div className="diary-polaroid-photo-frame">
                                    <img src={entry.attachmentUrl} alt="Memory" className="diary-polaroid-img" />
                                  </div>
                                  {entry.caption && <p className="diary-polaroid-caption font-display">{entry.caption}</p>}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* LIVE DRAFT: Renders immediately as user composes */}
                        {addMode === 'type' && noteText.trim().length > 0 && (
                          <div className="diary-scrapbook-entry type-note live-draft">
                            <div className="diary-entry-meta-row">
                              <span className="diary-entry-author font-ui">
                                <span className="diary-entry-author-dot draft-pulse" />
                                <span>Composing note live...</span>
                              </span>
                            </div>
                            <div className="diary-scrapbook-note draft-box">
                              <p className="diary-note-text font-display">{noteText.trim()}</p>
                              {captionText.trim() && (
                                <p className="diary-note-sub font-ui">{captionText.trim()}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {addMode === 'record' && recordedAudioUrl && (
                          <div className="diary-scrapbook-entry type-voice live-draft">
                            <div className="diary-entry-meta-row">
                              <span className="diary-entry-author font-ui">
                                <span className="diary-entry-author-dot draft-pulse" />
                                <span>Voice note recorded</span>
                              </span>
                            </div>
                            <div className="diary-scrapbook-voice draft-box">
                              <DiaryVoiceNotePlayer url={recordedAudioUrl} />
                              {captionText.trim() && (
                                <p className="diary-voice-sub font-ui">{captionText.trim()}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {addMode === 'photo' && photoPreviewUrl && (
                          <div className="diary-scrapbook-entry type-photo live-draft">
                            <div className="diary-entry-meta-row">
                              <span className="diary-entry-author font-ui">
                                <span className="diary-entry-author-dot draft-pulse" />
                                <span>Selected photo</span>
                              </span>
                            </div>
                            <div className="diary-scrapbook-polaroid draft-box">
                              <div className="diary-polaroid-washi-tape" />
                              <div className="diary-polaroid-photo-frame">
                                <img src={photoPreviewUrl} alt="Draft" className="diary-polaroid-img" />
                              </div>
                              {captionText.trim() && (
                                <p className="diary-polaroid-caption font-display">{captionText.trim()}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom: 3 Mode Tabs & Active Composer Form */}
              <div className="diary-composer-card font-ui">
                <div className="diary-composer-tabs-row">
                  <button
                    type="button"
                    className={`diary-tab-btn ${addMode === 'type' ? 'active' : ''}`}
                    onClick={() => {
                      setAddMode('type');
                      setComposerError(null);
                    }}
                  >
                    <NotePencil size={16} weight="bold" />
                    <span>Type Note</span>
                  </button>

                  <button
                    type="button"
                    className={`diary-tab-btn ${addMode === 'record' ? 'active' : ''}`}
                    onClick={() => {
                      setAddMode('record');
                      setComposerError(null);
                    }}
                  >
                    <Microphone size={16} weight="bold" />
                    <span>Record Voice</span>
                  </button>

                  <button
                    type="button"
                    className={`diary-tab-btn ${addMode === 'photo' ? 'active' : ''}`}
                    onClick={() => {
                      setAddMode('photo');
                      setComposerError(null);
                    }}
                  >
                    <ImageIcon size={16} weight="bold" />
                    <span>Add Photo</span>
                  </button>
                </div>

                {/* 1. TYPE NOTE */}
                {addMode === 'type' && (
                  <form className="diary-composer-form" onSubmit={handleSaveEntry}>
                    <textarea
                      className="diary-form-textarea font-display"
                      placeholder="Write a sweet thought, memory, or love note..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      maxLength={2000}
                      rows={3}
                      autoFocus
                    />

                    <input
                      type="text"
                      className="diary-form-caption font-ui"
                      placeholder="Optional caption (e.g. 'Thinking of you...')"
                      value={captionText}
                      onChange={(e) => setCaptionText(e.target.value)}
                      maxLength={500}
                    />

                    {composerError && <p className="diary-form-error font-ui">{composerError}</p>}

                    <div className="diary-form-actions">
                      <button
                        type="submit"
                        className="diary-form-submit-btn font-ui"
                        disabled={isSubmitting || !noteText.trim()}
                      >
                        <Check size={16} weight="bold" />
                        <span>{isSubmitting ? 'Saving...' : 'Save to Today’s Page'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* 2. RECORD VOICE */}
                {addMode === 'record' && (
                  <div className="diary-composer-form">
                    {!isRecording && !recordedAudioBlob ? (
                      <div className="diary-mic-start-area">
                        <button
                          type="button"
                          className="diary-mic-record-btn"
                          onClick={startAudioRecording}
                        >
                          <Microphone size={24} weight="fill" />
                        </button>
                        <span className="diary-mic-prompt font-ui">Tap mic to record your voice note</span>
                      </div>
                    ) : isRecording ? (
                      <div className="diary-mic-recording-active">
                        <div className="diary-mic-pulse-circle" />
                        <span className="diary-mic-timer font-ui">{formatTimer(recordingSeconds)}</span>
                        <button
                          type="button"
                          className="diary-mic-stop-btn font-ui"
                          onClick={stopAudioRecording}
                        >
                          <Stop size={15} weight="fill" />
                          <span>Stop Recording</span>
                        </button>
                      </div>
                    ) : (
                      <div className="diary-mic-finished-preview">
                        <DiaryVoiceNotePlayer url={recordedAudioUrl} />
                        <button
                          type="button"
                          className="diary-mic-redo-btn font-ui"
                          onClick={cancelAudioRecording}
                        >
                          Redo Recording
                        </button>
                      </div>
                    )}

                    <input
                      type="text"
                      className="diary-form-caption font-ui"
                      placeholder="Optional caption for this voice note..."
                      value={captionText}
                      onChange={(e) => setCaptionText(e.target.value)}
                      maxLength={500}
                    />

                    {composerError && <p className="diary-form-error font-ui">{composerError}</p>}

                    <div className="diary-form-actions">
                      <button
                        type="button"
                        className="diary-form-submit-btn font-ui"
                        onClick={handleSaveEntry}
                        disabled={isSubmitting || !recordedAudioBlob}
                      >
                        <Check size={16} weight="bold" />
                        <span>{isSubmitting ? 'Saving...' : 'Save Voice Note'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. ADD PHOTO */}
                {addMode === 'photo' && (
                  <div className="diary-composer-form">
                    {!selectedPhotoFile ? (
                      <label className="diary-photo-upload-zone">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="diary-hidden-file-input"
                          onChange={handlePhotoSelect}
                        />
                        <UploadSimple size={26} weight="bold" className="text-burgundy" />
                        <span className="diary-photo-upload-title font-ui">Choose a photo</span>
                        <span className="diary-photo-upload-sub font-ui">JPG, PNG, WebP up to 15MB</span>
                      </label>
                    ) : (
                      <div className="diary-photo-thumb-container">
                        <div className="diary-photo-thumb-frame">
                          <img src={photoPreviewUrl} alt="Selected" className="diary-photo-thumb-img" />
                          <button
                            type="button"
                            className="diary-photo-thumb-remove"
                            onClick={() => {
                              setSelectedPhotoFile(null);
                              setPhotoPreviewUrl(null);
                            }}
                          >
                            <X size={14} weight="bold" />
                          </button>
                        </div>
                      </div>
                    )}

                    <input
                      type="text"
                      className="diary-form-caption font-ui"
                      placeholder="Optional caption for this photo..."
                      value={captionText}
                      onChange={(e) => setCaptionText(e.target.value)}
                      maxLength={500}
                    />

                    {composerError && <p className="diary-form-error font-ui">{composerError}</p>}

                    <div className="diary-form-actions">
                      <button
                        type="button"
                        className="diary-form-submit-btn font-ui"
                        onClick={handleSaveEntry}
                        disabled={isSubmitting || !selectedPhotoFile}
                      >
                        <Check size={16} weight="bold" />
                        <span>{isSubmitting ? 'Uploading...' : 'Save Photo'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Date-Strip Navigation (Browsing Mode & Book is Open) */}
        {viewState === 'browse' && isBookOpen && pages && pages.length > 0 && (
          <DiaryDateDrawer
            pages={pages}
            currentPageIndex={currentPageIndex}
            onSelectDate={(idx) => handleJumpToPageIndex(idx)}
            viewDate={viewDate}
            setViewDate={setViewDate}
          />
        )}
      </div>
    </div>
  );
};

export default OurDiaryModal;
