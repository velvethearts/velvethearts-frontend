import React, { useState, useRef, useEffect } from 'react';
import { Microphone, StopCircle, Play, Pause, Trash, CheckCircle } from '@phosphor-icons/react';

export const VoiceRecorder = ({ initialAudioUrl, onSaveAudio, maxDurationSeconds = 120 }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(initialAudioUrl || null);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, []);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const startRecording = async () => {
    setError('');
    audioChunksRef.current = [];
    setRecordingTime(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result;
          setAudioUrl(base64Audio);
          if (onSaveAudio) onSaveAudio(base64Audio);
        };

        // Stop microphone tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDurationSeconds - 1) {
            stopRecording();
            return maxDurationSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Microphone access error:', err);
      setError('Microphone access is required to record a voice intro.');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const togglePlayback = () => {
    if (!audioUrl) return;

    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDelete = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setRecordingTime(0);
    if (onSaveAudio) onSaveAudio(null);
  };

  return (
    <div className="voice-recorder-box font-ui">
      <div className="voice-recorder-header">
        <span className="voice-recorder-title font-ui">🎙️ 2-Min Voice Intro Snippet</span>
        <span className="voice-recorder-duration font-ui">
          {isRecording ? `${formatTime(recordingTime)} / ${formatTime(maxDurationSeconds)}` : audioUrl ? 'Voice Intro Saved' : 'Up to 2 minutes'}
        </span>
      </div>

      {error && <p className="vh-input-error">{error}</p>}

      {!audioUrl && !isRecording && (
        <button
          type="button"
          onClick={startRecording}
          className="start-record-btn font-ui"
        >
          <Microphone size={20} weight="fill" />
          <span>Record Voice Intro (2 Mins)</span>
        </button>
      )}

      {isRecording && (
        <div className="recording-status-row">
          <div className="recording-wave-bars">
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="stop-record-btn font-ui"
          >
            <StopCircle size={22} weight="fill" />
            <span>Stop Recording ({formatTime(recordingTime)})</span>
          </button>
        </div>
      )}

      {audioUrl && !isRecording && (
        <div className="audio-preview-row">
          <button
            type="button"
            onClick={togglePlayback}
            className={`play-preview-btn font-ui ${isPlaying ? 'playing' : ''}`}
          >
            {isPlaying ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
            <span>{isPlaying ? 'Pause Intro' : 'Listen to Voice Intro'}</span>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="delete-voice-btn font-ui"
            title="Delete & Re-record"
          >
            <Trash size={18} />
          </button>
        </div>
      )}

      <style>{`
        .voice-recorder-box {
          background-color: var(--bg-surface-warm);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .voice-recorder-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .voice-recorder-title {
          font-size: var(--text-body-sm);
          font-weight: 600;
          color: var(--text-primary);
        }

        .voice-recorder-duration {
          font-size: var(--text-caption);
          color: var(--text-secondary);
        }

        .start-record-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          background-color: var(--burgundy-500);
          color: #FFFFFF;
          border: none;
          border-radius: var(--radius-full);
          padding: var(--space-3) var(--space-5);
          font-size: var(--text-body-sm);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .start-record-btn:hover {
          background-color: var(--burgundy-600);
        }

        .recording-status-row {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .recording-wave-bars {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 24px;
        }

        .recording-wave-bars .bar {
          width: 3px;
          background-color: var(--burgundy-500);
          border-radius: 2px;
          animation: wavePulse 0.8s ease-in-out infinite alternate;
        }

        .recording-wave-bars .bar:nth-child(1) { height: 8px; animation-delay: 0.1s; }
        .recording-wave-bars .bar:nth-child(2) { height: 18px; animation-delay: 0.3s; }
        .recording-wave-bars .bar:nth-child(3) { height: 12px; animation-delay: 0.2s; }
        .recording-wave-bars .bar:nth-child(4) { height: 22px; animation-delay: 0.4s; }
        .recording-wave-bars .bar:nth-child(5) { height: 10px; animation-delay: 0.15s; }

        @keyframes wavePulse {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1.2); }
        }

        .stop-record-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          background-color: var(--warning);
          color: #FFFFFF;
          border: none;
          border-radius: var(--radius-full);
          padding: var(--space-2) var(--space-4);
          font-size: var(--text-body-sm);
          font-weight: 600;
          cursor: pointer;
        }

        .audio-preview-row {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .play-preview-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          background-color: var(--gold-400);
          color: var(--charcoal-900);
          border: none;
          border-radius: var(--radius-full);
          padding: var(--space-2) var(--space-4);
          font-size: var(--text-body-sm);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .play-preview-btn.playing {
          background-color: var(--burgundy-500);
          color: #FFFFFF;
        }

        .delete-voice-btn {
          background: transparent;
          border: 1px solid var(--border-default);
          color: var(--text-secondary);
          padding: var(--space-2);
          border-radius: 50%;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all var(--duration-fast);
        }

        .delete-voice-btn:hover {
          color: var(--warning);
          border-color: var(--warning);
        }
      `}</style>
    </div>
  );
};
