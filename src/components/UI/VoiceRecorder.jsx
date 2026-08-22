import React, { useState, useRef, useEffect } from 'react';
import { Microphone, StopCircle, Play, Pause, Trash, CheckCircle, UploadSimple } from '@phosphor-icons/react';
import { api } from '../../lib/api';

export const VoiceRecorder = ({ initialAudioUrl, onSaveAudio, maxDurationSeconds = 120 }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(initialAudioUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  useEffect(() => {
    setAudioUrl(initialAudioUrl || null);
  }, [initialAudioUrl]);

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

  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg'
    ];
    for (const t of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return '';
  };

  const getAudioStream = async () => {
    // 1. Try standard getUserMedia
    try {
      return await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err1) {
      console.warn('Default getUserMedia failed, attempting fallback constraints...', err1);
    }

    // 2. Fallback: Relaxed constraints (disabling DSP filters which cause Windows driver conflicts)
    try {
      return await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
    } catch (err2) {
      console.warn('Relaxed constraints failed, attempting device picker fallback...', err2);
    }

    // 3. Fallback: Explicit device ID
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(d => d.kind === 'audioinput');
      for (const dev of audioInputs) {
        try {
          if (dev.deviceId) {
            return await navigator.mediaDevices.getUserMedia({
              audio: { deviceId: { exact: dev.deviceId } }
            });
          }
        } catch {
          // continue to next device
        }
      }
    } catch (err3) {
      console.warn('Direct device enumeration failed:', err3);
    }

    // 4. Final attempt to surface the underlying browser error
    return await navigator.mediaDevices.getUserMedia({ audio: true });
  };

  const startRecording = async () => {
    setError('');
    audioChunksRef.current = [];
    setRecordingTime(0);

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Audio recording is not supported in this browser environment.');
      }

      // Stop any existing tracks before acquiring new stream
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        try {
          mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
        } catch {}
      }

      const stream = await getAudioStream();
      const selectedMime = getSupportedMimeType();
      const mediaRecorder = selectedMime
        ? new MediaRecorder(stream, { mimeType: selectedMime })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: selectedMime || 'audio/webm' });
        setIsUploading(true);

        let finalAudioUrl = null;
        if (api.isConfigured) {
          try {
            const ext = selectedMime.includes('mp4') ? 'mp4' : 'webm';
            const audioFile = new File([audioBlob], `voice-intro-${Date.now()}.${ext}`, { type: selectedMime || 'audio/webm' });
            const res = await api.uploadFile(audioFile);
            if (res?.secureUrl) {
              finalAudioUrl = res.secureUrl;
            }
          } catch (uploadErr) {
            console.error('Audio upload failed, falling back to local storage:', uploadErr);
          }
        }

        if (!finalAudioUrl) {
          finalAudioUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(audioBlob);
          });
        }

        setIsUploading(false);
        setAudioUrl(finalAudioUrl);
        if (onSaveAudio) onSaveAudio(finalAudioUrl);

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
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone permission was denied. Please click the lock/settings icon in your browser address bar to allow microphone access.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No microphone device found on your system. Please connect a microphone.');
      } else if (err.name === 'NotReadableError') {
        setError('Microphone hardware error (NotReadableError): Please check Windows Settings > Privacy & security > Microphone, or close other apps/tabs using audio.');
      } else {
        setError(err.message || 'Microphone access is required to record a voice intro.');
      }
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

    if (!audioPlayerRef.current || audioPlayerRef.current.src !== audioUrl) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
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

  const handleAudioFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setIsUploading(true);

    try {
      let finalAudioUrl = null;
      if (api.isConfigured) {
        try {
          const res = await api.uploadFile(file);
          if (res?.secureUrl) {
            finalAudioUrl = res.secureUrl;
          }
        } catch (uploadErr) {
          console.error('Audio upload to cloud failed, using local storage:', uploadErr);
        }
      }

      if (!finalAudioUrl) {
        finalAudioUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      setIsUploading(false);
      setAudioUrl(finalAudioUrl);
      if (onSaveAudio) onSaveAudio(finalAudioUrl);
    } catch (err) {
      console.error('Audio file upload error:', err);
      setError('Could not process the audio file. Please try another audio file.');
      setIsUploading(false);
    } finally {
      if (e.target) e.target.value = '';
    }
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
        <div className="record-actions-container">
          <button
            type="button"
            onClick={startRecording}
            className="start-record-btn font-ui"
          >
            <Microphone size={20} weight="fill" />
            <span>Record Voice Intro (2 Mins)</span>
          </button>

          <div className="upload-audio-divider font-ui">
            <span className="upload-divider-line" />
            <span className="upload-divider-text">OR</span>
            <span className="upload-divider-line" />
          </div>

          <label className="upload-audio-file-btn font-ui">
            <UploadSimple size={18} weight="bold" />
            <span>{isUploading ? 'Uploading Audio...' : 'Upload Audio Memo (.mp3, .m4a, .wav)'}</span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioFileUpload}
              style={{ display: 'none' }}
              disabled={isUploading}
            />
          </label>
        </div>
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

        .record-actions-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
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

        .upload-audio-divider {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin: 2px 0;
        }

        .upload-divider-line {
          flex: 1;
          height: 1px;
          background-color: var(--border-default);
          opacity: 0.6;
        }

        .upload-divider-text {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-muted);
        }

        .upload-audio-file-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          background-color: transparent;
          color: var(--text-secondary);
          border: 1.5px dashed var(--border-default);
          border-radius: var(--radius-full);
          padding: var(--space-2) var(--space-4);
          font-size: var(--text-body-sm);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .upload-audio-file-btn:hover {
          border-color: var(--burgundy-400);
          color: var(--burgundy-500);
          background-color: var(--bg-surface);
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
