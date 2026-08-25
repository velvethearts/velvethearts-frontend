import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  BookBookmark,
  Books,
  CaretLeft,
  CaretRight,
  Plus,
  Image as ImageIcon,
  VideoCamera,
  NotePencil,
  Microphone,
  Trash,
  Play,
  Pause,
  CalendarBlank,
  CalendarCheck,
  Sparkle,
  Heart,
  UploadSimple,
  WarningCircle,
  Clock,
  Quotes,
  Stop,
  Check
} from '@phosphor-icons/react';
import { api } from '../../lib/api';
import { useApp } from '../../context/AppContext';
import { ProtectedImage } from '../UI/ProtectedImage';
import { getSocket } from '../../lib/socket';

/**
 * Velvet Hearts — Our Diary Component (Light Palette Edition)
 * Features:
 * - Dual state: 'browse' (Day-card with peel/slide transition) & 'add' (Centered book + Record/Type/Photo)
 * - Bottom persistent Date-Strip navigator (Month navigation, Jump to Today, Mon-Sun columns)
 * - Distinct media treatments: Rotated polaroids, ribbon-waveform audio player, display-font notes
 * - All colors trace to Velvet Hearts CSS custom properties
 */

// Voice Note Player with distinct ribbon style and animated waveform
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
        {isPlaying ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
      </button>

      <div className="diary-voice-waveform-track">
        <div className="diary-voice-wave-bars">
          {[40, 70, 30, 85, 60, 95, 45, 80, 55, 90, 35, 75, 50, 85, 65, 40].map((h, i) => {
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

      <span className="diary-voice-duration font-ui">
        {formatTime(isPlaying ? currentTime : duration || 0)}
      </span>
    </div>
  );
};

// Bottom Slide-Up Date Drawer Navigator (Pinterest-styled pull-up drawer)
const DiaryDateDrawer = ({
  pages = [],
  currentPageIndex = 0,
  onSelectDate,
  viewDate,
  setViewDate
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const touchStartY = useRef(null);

  const safeViewDate = (viewDate && viewDate instanceof Date && !isNaN(viewDate.getTime())) ? viewDate : new Date();
  const year = safeViewDate.getFullYear();
  const month = safeViewDate.getMonth();

  const prevMonth = (e) => {
    e?.stopPropagation?.();
    setViewDate?.(new Date(year, month - 1, 1));
  };

  const nextMonth = (e) => {
    e?.stopPropagation?.();
    setViewDate?.(new Date(year, month + 1, 1));
  };

  const jumpToToday = (e) => {
    e?.stopPropagation?.();
    const today = new Date();
    setViewDate?.(new Date(today.getFullYear(), today.getMonth(), 1));
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const targetPageIdx = (pages || []).findIndex(p => {
      if (!p?.rawDate || !(p.rawDate instanceof Date)) return false;
      const pd = p.rawDate;
      const key = `${pd.getFullYear()}-${String(pd.getMonth() + 1).padStart(2, '0')}-${String(pd.getDate()).padStart(2, '0')}`;
      return key === todayStr;
    });
    if (targetPageIdx !== -1) {
      onSelectDate?.(targetPageIdx);
    }
  };

  const monthName = safeViewDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });

  // Map entries by date key
  const dateToPageMap = useMemo(() => {
    const map = new Map();
    if (!pages || !Array.isArray(pages)) return map;
    pages.forEach((p, idx) => {
      if (p?.rawDate && p.rawDate instanceof Date && !isNaN(p.rawDate.getTime())) {
        const pd = p.rawDate;
        const key = `${pd.getFullYear()}-${String(pd.getMonth() + 1).padStart(2, '0')}-${String(pd.getDate()).padStart(2, '0')}`;
        map.set(key, idx);
      }
    });
    return map;
  }, [pages]);

  // Days in month & First day of week (Monday as index 0)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0, Sun=6
  const prevMonthDaysCount = new Date(year, month, 0).getDate();

  const weekdayHeaders = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];

  // Current page raw date for active highlight
  const activePageDate = pages?.[currentPageIndex]?.rawDate;
  const activeDateKey = (activePageDate && activePageDate instanceof Date && !isNaN(activePageDate.getTime()))
    ? `${activePageDate.getFullYear()}-${String(activePageDate.getMonth() + 1).padStart(2, '0')}-${String(activePageDate.getDate()).padStart(2, '0')}`
    : null;

  // Touch swipe handling for slide-up/down
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY < -35) {
      // Swiped UP -> Expand
      setIsExpanded(true);
    } else if (deltaY > 35) {
      // Swiped DOWN -> Collapse
      setIsExpanded(false);
    }
    touchStartY.current = null;
  };

  // Build calendar matrix (padded with previous and next month dates)
  const calendarCells = useMemo(() => {
    const cells = [];

    // Leading days from previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = prevMonthDaysCount - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const pageIndex = dateToPageMap.get(dateKey);
      cells.push({
        dayNum,
        dateKey,
        isOtherMonth: true,
        pageIndex,
        hasEntries: pageIndex !== undefined,
        isActive: dateKey === activeDateKey,
      });
    }

    // Days in current month
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const pageIndex = dateToPageMap.get(dateKey);
      cells.push({
        dayNum,
        dateKey,
        isOtherMonth: false,
        pageIndex,
        hasEntries: pageIndex !== undefined,
        isActive: dateKey === activeDateKey,
      });
    }

    // Trailing days from next month to complete the row/grid
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateKey = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const pageIndex = dateToPageMap.get(dateKey);
      cells.push({
        dayNum: i,
        dateKey,
        isOtherMonth: true,
        pageIndex,
        hasEntries: pageIndex !== undefined,
        isActive: dateKey === activeDateKey,
      });
    }

    return cells;
  }, [year, month, daysInMonth, firstDayOfMonth, prevMonthDaysCount, dateToPageMap, activeDateKey]);

  // Find active cell's week for collapsed view
  const activeCellIndex = calendarCells.findIndex(c => c.isActive);
  const activeWeekStart = activeCellIndex !== -1 ? Math.floor(activeCellIndex / 7) * 7 : 0;
  const collapsedWeekCells = calendarCells.slice(activeWeekStart, activeWeekStart + 7);

  const displayedCells = isExpanded ? calendarCells : collapsedWeekCells;

  return (
    <div
      className={`diary-date-drawer ${isExpanded ? 'expanded' : 'collapsed'}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slide-Up Pull Handle */}
      <div
        className="diary-drawer-handle-bar"
        onClick={() => setIsExpanded(prev => !prev)}
        title={isExpanded ? 'Slide down to minimize' : 'Slide up to select date'}
      >
        <div className="diary-drawer-pill-handle" />
      </div>

      {/* Top Header: Month Switcher & Target / Today Button */}
      <div className="diary-drawer-header">
        <div className="diary-drawer-month-row">
          <button
            type="button"
            className="diary-drawer-month-btn font-display"
            onClick={() => setIsExpanded(prev => !prev)}
          >
            <span>{monthName}</span>
            <CaretRight size={14} weight="bold" className={`diary-drawer-caret ${isExpanded ? 'rotate-down' : ''}`} />
          </button>

          {isExpanded && (
            <div className="diary-drawer-month-arrows">
              <button type="button" className="diary-drawer-arrow" onClick={prevMonth} aria-label="Previous Month">
                <CaretLeft size={13} weight="bold" />
              </button>
              <button type="button" className="diary-drawer-arrow" onClick={nextMonth} aria-label="Next Month">
                <CaretRight size={13} weight="bold" />
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className="diary-drawer-today-target"
          onClick={jumpToToday}
          title="Jump to Today"
          aria-label="Jump to Today"
        >
          <div className="diary-target-ring">
            <div className="diary-target-center" />
          </div>
        </button>
      </div>

      {/* Weekday Labels (Mon - Sun) */}
      <div className="diary-drawer-weekdays font-ui">
        {weekdayHeaders.map(day => (
          <span key={day} className="diary-drawer-weekday-label">{day}</span>
        ))}
      </div>

      {/* Days Grid / Row */}
      <div className={`diary-drawer-grid ${isExpanded ? 'grid-expanded' : 'grid-single-week'}`}>
        {displayedCells.map((cell) => {
          const { dayNum, dateKey, isOtherMonth, pageIndex, hasEntries, isActive } = cell;

          return (
            <button
              key={dateKey}
              type="button"
              className={`diary-drawer-day-cell ${isActive ? 'active' : ''} ${hasEntries ? 'has-entry' : 'no-entry'} ${isOtherMonth ? 'other-month' : ''}`}
              onClick={() => {
                if (hasEntries && pageIndex !== undefined) {
                  onSelectDate?.(pageIndex);
                }
              }}
              disabled={!hasEntries}
            >
              <span className="diary-drawer-day-num font-display">{dayNum}</span>
              {isActive ? (
                <span className="diary-active-dot" />
              ) : hasEntries ? (
                <span className="diary-has-entry-dot" />
              ) : null}
            </button>
          );
        })}
      </div>
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

  // Dual State: 'browse' (Day card view) or 'add' (Create moment screen)
  const [viewState, setViewState] = useState('browse');
  const [addMode, setAddMode] = useState(null); // 'type' | 'record' | 'photo' | null
  const [isBookOpen, setIsBookOpen] = useState(false);

  // Entries & Pages
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
  const [isVideoFile, setIsVideoFile] = useState(false);
  const [composerError, setComposerError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Audio Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  // Modal Close Transition
  const [isClosingModal, setIsClosingModal] = useState(false);
  const cardTouchStart = useRef(null);

  // Helper function to group entries by local calendar day (oldest to newest)
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
      const dayKey = `${validDate.getFullYear()}-${String(validDate.getMonth() + 1).padStart(2, '0')}-${String(validDate.getDate()).padStart(2, '0')}`;

      if (!dayMap.has(dayKey)) {
        dayMap.set(dayKey, {
          rawDate: validDate,
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
      dayKey: `${dayGroup.rawDate.getFullYear()}-${dayGroup.rawDate.getMonth()}-${dayGroup.rawDate.getDate()}`,
      dateLabel: dayGroup.dateLabel,
      rawDate: dayGroup.rawDate,
      items: dayGroup.items || [],
      pageNumber: index + 1
    }));
  };

  // Group entries by local calendar day (oldest to newest)
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
      setAddMode(null);
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

  // Close handler
  const handleCloseDiary = () => {
    if (isClosingModal) return;
    stopAudioRecording();
    setIsClosingModal(true);
    setTimeout(() => {
      setIsClosingModal(false);
      onClose?.();
    }, 220);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || viewState === 'add') return;

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
  }, [isOpen, viewState, currentPageIndex, totalPages]);

  // Peel/Slide transition to Next Card
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
      }, 360);
    }
  };

  // Peel/Slide transition to Previous Card
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
      }, 360);
    }
  };

  // Jump to specific page index
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
      }, 260);
    }
  };

  // Photo & Video selection
  const handlePhotoSelect = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setComposerError('Please choose a valid photo (JPG, PNG, WebP) or video (MP4, MOV, WebM).');
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

  // Save new entry directly from 'Add' state
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
        await api.addDiaryNote(matchId, noteText.trim(), captionText.trim() || undefined);
        setNoteText('');
        setCaptionText('');
        setAddMode(null);
        setViewState('browse');
        await fetchEntries(true);
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
        await api.uploadDiaryPhoto(matchId, audioFile, captionText.trim() || undefined);
        cancelAudioRecording();
        setCaptionText('');
        setAddMode(null);
        setViewState('browse');
        await fetchEntries(true);
      } catch (err) {
        console.error('Error saving voice note:', err);
        setComposerError(err?.message || 'Failed to upload voice note.');
      } finally {
        setIsSubmitting(false);
      }
    } else if (addMode === 'photo') {
      if (!selectedPhotoFile) {
        setComposerError('Please choose a photo or video to add.');
        return;
      }

      try {
        setIsSubmitting(true);
        await api.uploadDiaryPhoto(matchId, selectedPhotoFile, captionText.trim() || undefined);
        setSelectedPhotoFile(null);
        setPhotoPreviewUrl(null);
        setIsVideoFile(false);
        setCaptionText('');
        setAddMode(null);
        setViewState('browse');
        await fetchEntries(true);
      } catch (err) {
        console.error('Error uploading photo/video:', err);
        setComposerError(err?.message || "That media couldn't be added.");
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
        await fetchEntries(true);
      } catch (err) {
        console.error('Failed to delete entry:', err);
        if (showAlert) showAlert({ title: 'Delete Failed', message: err?.message || 'Failed to delete entry' });
      }
    }
  };

  if (!isOpen) return null;

  const currentDayCard = pages?.[currentPageIndex] || null;

  return (
    <div className={`diary-modal-overlay ${isClosingModal ? 'closing' : ''}`} role="dialog" aria-modal="true" aria-label="Our Diary">
      <div className="diary-modal-backdrop" onClick={handleCloseDiary} />

      <div className="diary-modal-wrapper font-ui">
        {/* ============================================================
           HEADER BAR (Light Velvet Hearts Chrome)
           ============================================================ */}
        <div className="diary-modal-header">
          <div className="diary-header-left">
            <span className="diary-header-badge font-display">
              <Heart size={16} weight="fill" className="diary-header-heart" />
              <span>Our Diary</span>
            </span>
          </div>

          <div className="diary-header-center">
            {viewState === 'browse' ? (
              <span className="diary-header-mode-title font-display">Browse your diary</span>
            ) : (
              <span className="diary-header-mode-title font-display">Add a moment</span>
            )}
          </div>

          <div className="diary-header-right">
            {/* Toggle between Browse and Add */}
            <button
              type="button"
              className={`diary-header-toggle-btn font-ui ${viewState === 'add' ? 'active' : ''}`}
              onClick={() => {
                if (viewState === 'browse') {
                  setIsBookOpen(false);
                  setViewState('add');
                  setAddMode(null);
                } else {
                  setIsBookOpen(true);
                  setViewState('browse');
                  setAddMode(null);
                  cancelAudioRecording();
                }
              }}
              title={viewState === 'browse' ? "Add a new moment directly" : "Back to browse diary"}
              aria-label={viewState === 'browse' ? "Add a new moment directly" : "Back to browse diary"}
            >
              {viewState === 'browse' ? (
                <>
                  <Plus size={14} weight="bold" />
                  <span>Add</span>
                </>
              ) : (
                <>
                  <Books size={14} weight="duotone" />
                  <span>Browse</span>
                </>
              )}
            </button>

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

        {/* ============================================================
           MAIN STAGE (Light Warm Background)
           ============================================================ */}
        <div className="diary-modal-stage">
          {viewState === 'add' ? (
            /* ==========================================================
               STATE A: "ADD AN ENTRY" DEDICATED SCREEN
               ========================================================== */
            <div className="diary-add-screen font-ui">
              {/* 3D Hinged Hardcover Book Object with Resting-State Dimensional Tilt */}
              <div className="diary-3d-scene">
                <div
                  className={`diary-3d-book ${isBookOpen ? 'book-open' : 'book-closed'}`}
                  onClick={() => {
                    if (!addMode) {
                      setIsBookOpen(true);
                      setTimeout(() => {
                        setViewState('browse');
                      }, 420);
                    }
                  }}
                  title="Tap to open diary"
                  role="button"
                  tabIndex={0}
                >
                  {/* Underneath: The First Page revealed as cover swings open */}
                  <div className="diary-book-base-page font-ui">
                    <div className="diary-base-page-header">
                      <span className="diary-base-page-tag font-ui">Volume 1</span>
                      <span className="diary-base-page-date font-display">
                        {pages?.[0]?.dateLabel || 'Today'}
                      </span>
                    </div>
                    <div className="diary-base-page-content font-display">
                      <p className="diary-base-page-quote">
                        {pages?.[0]?.items?.[0]?.content
                          ? `“${pages[0].items[0].content.slice(0, 70)}${pages[0].items[0].content.length > 70 ? '...' : ''}”`
                          : '“A collection of our sweetest memories, shared thoughts, and voice notes.”'}
                      </p>
                    </div>
                    <div className="diary-base-page-footer">
                      <span className="diary-base-page-counter font-ui">Page 1</span>
                    </div>
                  </div>

                  {/* Front Cover: Hinged on the Left Spine Edge */}
                  <div className="diary-book-cover-hinge">
                    {/* Front Face (Closed Book Cover) */}
                    <div className="diary-book-cover-front">
                      <div className="diary-preview-spine" />
                      <div className="diary-preview-body">
                        <div className="diary-preview-emblem">
                          <BookBookmark size={34} weight="duotone" />
                        </div>
                        <h3 className="diary-preview-title font-display">Our Diary</h3>
                        <p className="diary-preview-subtitle font-display">
                          {userName || 'You'} &amp; {partnerName || 'Partner'}
                        </p>
                        <span className="diary-preview-badge font-ui">
                          <Sparkle size={12} weight="fill" />
                          <span>{pages.length} {pages.length === 1 ? 'Day Saved' : 'Days Saved'}</span>
                        </span>
                        {!addMode && (
                          <span className="diary-cover-tap-hint font-ui">
                            <span>Open diary</span>
                            <CaretRight size={12} weight="bold" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Inside Face (Swung Open Lining) */}
                    <div className="diary-book-cover-inside">
                      <div className="diary-book-inside-crease" />
                      <div className="diary-book-inside-emblem">
                        <Heart size={24} weight="duotone" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructional Copy */}
              {!addMode && (
                <div className="diary-add-instruction-wrap">
                  <p className="diary-add-instruction-text font-body">
                    Add a moment by recording a voice note, typing it out, or adding a photo.
                  </p>

                  {/* Three Balanced Action Pill Buttons */}
                  <div className="diary-add-action-pills">
                    <button
                      type="button"
                      className="diary-action-pill-btn record-pill font-ui"
                      onClick={() => {
                        setAddMode('record');
                        startAudioRecording();
                      }}
                    >
                      <Microphone size={18} weight="bold" />
                      <span>Record</span>
                    </button>

                    <button
                      type="button"
                      className="diary-action-pill-btn type-pill font-ui"
                      onClick={() => setAddMode('type')}
                    >
                      <NotePencil size={18} weight="bold" />
                      <span>Type</span>
                    </button>

                    <button
                      type="button"
                      className="diary-action-pill-btn photo-pill font-ui"
                      onClick={() => setAddMode('photo')}
                    >
                      <ImageIcon size={18} weight="bold" />
                      <span>Photo</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Inline Creation Modes when clicked */}
              {addMode === 'record' && (
                <div className="diary-inline-creator-card font-ui">
                  <div className="diary-creator-header">
                    <span className="diary-creator-title font-display">
                      <Microphone size={16} weight="fill" className="text-burgundy" />
                      <span>Record Voice Note</span>
                    </span>
                    <button
                      type="button"
                      className="diary-creator-cancel-btn"
                      onClick={() => {
                        cancelAudioRecording();
                        setAddMode(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>

                  {isRecording ? (
                    <div className="diary-recording-active-box">
                      <div className="diary-recording-pulse-dot" />
                      <span className="diary-recording-timer font-ui">{formatTimer(recordingSeconds)}</span>
                      <p className="diary-recording-status">Recording voice memory...</p>
                      <button
                        type="button"
                        className="diary-stop-record-btn font-ui"
                        onClick={stopAudioRecording}
                      >
                        <Stop size={16} weight="fill" />
                        <span>Done Recording</span>
                      </button>
                    </div>
                  ) : recordedAudioUrl ? (
                    <div className="diary-recording-preview-box">
                      <p className="diary-preview-label">Voice note ready:</p>
                      <DiaryVoiceNotePlayer url={recordedAudioUrl} />
                      <input
                        type="text"
                        placeholder="Add a sweet caption (optional)..."
                        value={captionText}
                        onChange={(e) => setCaptionText(e.target.value)}
                        className="diary-creator-caption-input font-ui"
                        maxLength={120}
                      />
                      <div className="diary-creator-actions">
                        <button
                          type="button"
                          className="diary-creator-retry-btn"
                          onClick={() => {
                            cancelAudioRecording();
                            startAudioRecording();
                          }}
                        >
                          Re-record
                        </button>
                        <button
                          type="button"
                          className="diary-creator-save-btn font-ui"
                          onClick={handleSaveEntry}
                          disabled={isSubmitting}
                        >
                          <Check size={16} weight="bold" />
                          <span>{isSubmitting ? 'Saving...' : 'Save Voice Note'}</span>
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {composerError && <p className="diary-creator-error font-ui">{composerError}</p>}
                </div>
              )}

              {addMode === 'type' && (
                <div className="diary-inline-creator-card font-ui">
                  <div className="diary-creator-header">
                    <span className="diary-creator-title font-display">
                      <NotePencil size={16} weight="bold" className="text-burgundy" />
                      <span>Write Note</span>
                    </span>
                    <button
                      type="button"
                      className="diary-creator-cancel-btn"
                      onClick={() => setAddMode(null)}
                    >
                      Cancel
                    </button>
                  </div>

                  <textarea
                    placeholder="Write a sweet memory, inside joke, or heartfelt thought..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="diary-creator-textarea font-display"
                    rows={4}
                    maxLength={1000}
                    autoFocus
                  />

                  <input
                    type="text"
                    placeholder="Add a caption tag (optional)..."
                    value={captionText}
                    onChange={(e) => setCaptionText(e.target.value)}
                    className="diary-creator-caption-input font-ui"
                    maxLength={120}
                  />

                  {composerError && <p className="diary-creator-error font-ui">{composerError}</p>}

                  <div className="diary-creator-footer">
                    <span className="diary-char-count">{noteText.length}/1000</span>
                    <button
                      type="button"
                      className="diary-creator-save-btn font-ui"
                      onClick={handleSaveEntry}
                      disabled={isSubmitting || !noteText.trim()}
                    >
                      <Check size={16} weight="bold" />
                      <span>{isSubmitting ? 'Saving...' : 'Save to Diary'}</span>
                    </button>
                  </div>
                </div>
              )}

              {addMode === 'photo' && (
                <div className="diary-inline-creator-card font-ui">
                  <div className="diary-creator-header">
                    <span className="diary-creator-title font-display">
                      <ImageIcon size={16} weight="bold" className="text-burgundy" />
                      <span>Add Photo or Video</span>
                    </span>
                    <button
                      type="button"
                      className="diary-creator-cancel-btn"
                      onClick={() => {
                        setSelectedPhotoFile(null);
                        setPhotoPreviewUrl(null);
                        setAddMode(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>

                  {!photoPreviewUrl ? (
                    <label className="diary-photo-dropzone">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                        onChange={handlePhotoSelect}
                        className="diary-file-input-hidden"
                      />
                      <UploadSimple size={28} className="diary-upload-icon text-burgundy" />
                      <span className="diary-dropzone-text">Tap to choose a photo or video</span>
                      <span className="diary-dropzone-hint">Photos up to 15MB • Videos up to 100MB</span>
                    </label>
                  ) : (
                    <div className="diary-photo-preview-wrap">
                      {isVideoFile ? (
                        <video src={photoPreviewUrl} controls playsInline className="diary-preview-media" />
                      ) : (
                        <img src={photoPreviewUrl} alt="Preview" className="diary-preview-media" />
                      )}
                      <button
                        type="button"
                        className="diary-remove-media-btn"
                        onClick={() => {
                          setSelectedPhotoFile(null);
                          setPhotoPreviewUrl(null);
                        }}
                      >
                        Change Media
                      </button>
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder="Add a polaroid caption (optional)..."
                    value={captionText}
                    onChange={(e) => setCaptionText(e.target.value)}
                    className="diary-creator-caption-input font-ui"
                    maxLength={120}
                  />

                  {composerError && <p className="diary-creator-error font-ui">{composerError}</p>}

                  <div className="diary-creator-footer">
                    <button
                      type="button"
                      className="diary-creator-save-btn font-ui"
                      onClick={handleSaveEntry}
                      disabled={isSubmitting || !selectedPhotoFile}
                    >
                      <Check size={16} weight="bold" />
                      <span>{isSubmitting ? 'Uploading...' : 'Save Moment'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ==========================================================
               STATE B: "BROWSE" STATE (DAY-CARD WITH PEEL TRANSITION)
               ========================================================== */
            <div className="diary-browse-canvas">
              {loading ? (
                <div className="diary-loading-state font-ui">
                  <Sparkle size={24} className="spin text-burgundy" />
                  <span>Loading sweet moments...</span>
                </div>
              ) : pages.length === 0 ? (
                /* Empty State Card */
                <div className="diary-day-card empty-card font-ui">
                  <div className="diary-empty-icon-wrap">
                    <Heart size={36} weight="duotone" className="text-burgundy" />
                  </div>
                  <h3 className="diary-empty-title font-display">Our story begins here</h3>
                  <p className="diary-empty-desc font-body">
                    Save special chat messages with the heart icon in your chat, or add moments directly using the <strong>Add</strong> button above.
                  </p>
                  <button
                    type="button"
                    className="diary-first-moment-btn font-ui"
                    onClick={() => {
                      setViewState('add');
                      setAddMode(null);
                    }}
                  >
                    <Plus size={16} weight="bold" />
                    <span>Add First Moment</span>
                  </button>
                </div>
              ) : (
                /* Stacked Day-Card with 3D Peel/Slide Transition */
                <div
                  className="diary-card-stack-viewport"
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
                  {/* Floating Page Flip Buttons (Left/Prev & Right/Next) */}
                  {currentPageIndex > 0 && (
                    <button
                      type="button"
                      className="diary-flip-nav-btn prev font-ui"
                      onClick={handlePrevCard}
                      aria-label="Previous Day"
                      title="Previous Day"
                    >
                      <CaretLeft size={20} weight="bold" />
                    </button>
                  )}

                  {currentPageIndex < totalPages - 1 && (
                    <button
                      type="button"
                      className="diary-flip-nav-btn next font-ui"
                      onClick={handleNextCard}
                      aria-label="Next Day"
                      title="Next Day"
                    >
                      <CaretRight size={20} weight="bold" />
                    </button>
                  )}

                  {/* Underlying stack shadow effect */}
                  <div className="diary-card-stack-underlay" />

                  <div
                    key={currentDayCard?.dayKey || currentPageIndex}
                    className={`diary-day-card ${isPeeling ? `peeling-${peelDirection}` : ''}`}
                  >
                    {/* Top-Left Date Header using --font-display */}
                    <div className="diary-card-top-row">
                      <h2 className="diary-card-date font-display">
                        {currentDayCard?.dateLabel || 'Today'}
                      </h2>
                      <button
                        type="button"
                        className="diary-card-counter font-ui"
                        onClick={handleNextCard}
                        title={currentPageIndex < totalPages - 1 ? 'Click to flip next page' : 'Last page'}
                      >
                        <span>{currentPageIndex + 1} / {totalPages}</span>
                        {currentPageIndex < totalPages - 1 && <CaretRight size={10} weight="bold" />}
                      </button>
                    </div>

                    <div className="diary-card-divider" />

                    {/* Day Entries List */}
                    <div className="diary-card-moments-scroll">
                      {(currentDayCard?.items || []).map((entry) => {
                        if (!entry) return null;
                        const isMine = Boolean(entry.isMine);
                        const timeStr = entry.createdAt
                          ? new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '';

                        const sourceType = (entry.sourceType || 'MESSAGE').toUpperCase();

                        return (
                          <div key={entry.id || Math.random()} className={`diary-moment-item type-${sourceType.toLowerCase()}`}>
                            {/* Moment Header: Saved by & Delete icon */}
                            <div className="diary-moment-meta">
                              <span className="diary-moment-author font-ui">
                                <span className="diary-author-dot" />
                                <span>{isMine ? 'Saved by you' : `Saved by ${entry.savedByName || partnerName || 'Partner'}`}</span>
                                {timeStr && <span className="diary-moment-time">· {timeStr}</span>}
                              </span>

                              {isMine && entry.id && (
                                <button
                                  type="button"
                                  className="diary-moment-del-btn"
                                  onClick={() => handleDeleteEntry(entry.id)}
                                  title="Delete this moment"
                                  aria-label="Delete this moment"
                                >
                                  <Trash size={14} />
                                </button>
                              )}
                            </div>

                            {/* 1. Saved Chat Message (Quote Box) */}
                            {sourceType === 'MESSAGE' && entry.content && (
                              <div className="diary-quote-box">
                                <Quotes size={18} weight="fill" className="diary-quote-mark" />
                                <div className="diary-quote-content">
                                  <p className="diary-quote-text font-body">{entry.content}</p>
                                  {entry.caption && (
                                    <p className="diary-quote-caption font-ui">{entry.caption}</p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* 2. Written Note (Warm Display Font) */}
                            {sourceType === 'NOTE' && entry.content && (
                              <div className="diary-note-box">
                                <p className="diary-note-body font-display">{entry.content}</p>
                                {entry.caption && (
                                  <p className="diary-note-caption font-ui">{entry.caption}</p>
                                )}
                              </div>
                            )}

                            {/* 3. Voice Note (Waveform Ribbon) */}
                            {sourceType === 'VOICE_NOTE' && entry.attachmentUrl && (
                              <div className="diary-voice-moment-box">
                                <DiaryVoiceNotePlayer url={entry.attachmentUrl} />
                                {entry.caption && (
                                  <p className="diary-voice-caption font-ui">{entry.caption}</p>
                                )}
                              </div>
                            )}

                            {/* 4. Polaroid Photo (Rotated Print with Tape) */}
                            {sourceType === 'IMAGE' && entry.attachmentUrl && (
                              <div className="diary-polaroid-moment">
                                <div className="diary-polaroid-tape" />
                                <div className="diary-polaroid-img-frame">
                                  <ProtectedImage
                                    src={entry.attachmentUrl}
                                    alt="Diary Memory"
                                    className="diary-polaroid-photo"
                                  />
                                </div>
                                {entry.caption && (
                                  <p className="diary-polaroid-note font-display">{entry.caption}</p>
                                )}
                              </div>
                            )}

                            {/* 5. HD Video Memory (Reel Print with Playable Video) */}
                            {sourceType === 'VIDEO' && entry.attachmentUrl && (
                              <div className="diary-polaroid-moment diary-video-moment">
                                <div className="diary-polaroid-tape" />
                                <div className="diary-video-player-frame">
                                  <video
                                    src={entry.attachmentUrl}
                                    controls
                                    playsInline
                                    preload="metadata"
                                    className="diary-moment-video-player"
                                  />
                                </div>
                                {entry.caption && (
                                  <p className="diary-polaroid-note font-display">{entry.caption}</p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================================
           PERSISTENT BOTTOM SLIDE-UP DATE DRAWER (In Browse State)
           ============================================================ */}
        {viewState === 'browse' && pages && pages.length > 0 && (
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
