import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import {
  ShieldCheck,
  Camera,
  X,
  CheckCircle,
  ArrowsClockwise,
  Sparkle,
  WarningCircle,
  UserFocus,
  SunHorizon,
  Clock,
  HourglassMedium,
  CalendarBlank,
  Info
} from '@phosphor-icons/react';
import { Button } from '../UI/Button';
import { VerifiedBadge } from '../UI/VerifiedBadge';
import { PoseGuideOverlay } from './PoseGuideOverlay';

import {
  isSkinOrFacePixel,
  computeSobelEdgeMagnitude,
  detectFacialOcclusion,
  detectImageBlur,
  detectLightingQuality,
  detectHeadPoseAngle,
  analyzeLiveFaceStructure,
  compareFaceBiometrics,
  evaluateLiveAntiSpoofing
} from '../../utils/faceBiometrics';

export const PhotoVerificationModal = ({ isOpen, onClose, onVerified, primaryPhotoUrl, isReverify = false }) => {
  const { userProfile, setUserProfile, showAlert } = useApp();

  const [isReverifying, setIsReverifying] = useState(isReverify);

  const [step, setStep] = useState(() => {
    if (isReverify) return 'intro';

    const isAlreadyVerified = Boolean(
      userProfile?.verified === true ||
      userProfile?.verified === 'true'
    );
    if (isAlreadyVerified) return 'success';

    const isLocallyPending = Boolean(
      userProfile?.verificationStatus === 'PENDING' ||
      localStorage.getItem('vh_manual_verification_pending') === 'true'
    );
    if (isLocallyPending) return 'under_review';

    if (userProfile?.verificationStatus === 'REJECTED') return 'rejected';

    return 'intro';
  });
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failureReason, setFailureReason] = useState('');
  const [manualReviewSubmitted, setManualReviewSubmitted] = useState(false);
  const [manualReviewLoading, setManualReviewLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(() => {
    if (userProfile?.latestVerificationRequest) return userProfile.latestVerificationRequest;
    if (userProfile?.verificationStatus === 'PENDING' || localStorage.getItem('vh_manual_verification_pending') === 'true') {
      return { status: 'PENDING', createdAt: new Date().toISOString() };
    }
    return null;
  });
  const [statusLoading, setStatusLoading] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const livenessSamplesRef = useRef([]);

  const formatSubmittedDate = (dateVal) => {
    if (!dateVal) return 'Recently';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return 'Recently';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'Recently';
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setCameraError('');
      setFailureReason('');
      setManualReviewSubmitted(false);
      setManualReviewLoading(false);
      livenessSamplesRef.current = [];

      if (isReverify) {
        setIsReverifying(true);
        setStep('intro');
        return;
      }

      setIsReverifying(false);

      // Check if user is already verified
      const isAlreadyVerified = Boolean(
        userProfile?.verified === true ||
        userProfile?.verified === 'true'
      );
      if (isAlreadyVerified) {
        setStep('success');
        return;
      }

      // Fast optimistic check from local storage or context profile
      const isLocallyPending = Boolean(
        userProfile?.verificationStatus === 'PENDING' ||
        localStorage.getItem('vh_manual_verification_pending') === 'true'
      );
      const isLocallyRejected = Boolean(
        userProfile?.verificationStatus === 'REJECTED'
      );

      if (isLocallyPending) {
        setStep('under_review');
      } else if (isLocallyRejected) {
        setStep('rejected');
      } else {
        setStep('intro');
      }

      // Query latest verification status from backend API
      const fetchVerificationStatus = async () => {
        try {
          if (api.isConfigured && api.getVerificationStatus) {
            setStatusLoading(true);
            const data = await api.getVerificationStatus();
            if (data) {
              setVerificationStatus(data);
            }

            if (isReverify || isReverifying) {
              return;
            }

            if (data?.status === 'PENDING') {
              setStep('under_review');
              localStorage.setItem('vh_manual_verification_pending', 'true');
              if (setUserProfile) {
                setUserProfile((prev) => {
                  const updated = {
                    ...prev,
                    verificationStatus: 'PENDING',
                    latestVerificationRequest: data,
                  };
                  try { localStorage.setItem('vh-user-profile', JSON.stringify(updated)); } catch (_) {}
                  return updated;
                });
              }
            } else if (data?.status === 'REJECTED') {
              setStep('rejected');
              localStorage.removeItem('vh_manual_verification_pending');
              if (setUserProfile) {
                setUserProfile((prev) => {
                  const updated = {
                    ...prev,
                    verificationStatus: 'REJECTED',
                    latestVerificationRequest: data,
                  };
                  try { localStorage.setItem('vh-user-profile', JSON.stringify(updated)); } catch (_) {}
                  return updated;
                });
              }
            } else if (data?.status === 'APPROVED' || data?.id === 'verified_profile') {
              setStep('success');
              localStorage.removeItem('vh_manual_verification_pending');
              localStorage.setItem('vh-user-verified', 'true');
              if (setUserProfile) {
                setUserProfile((prev) => {
                  const updated = {
                    ...prev,
                    verified: true,
                    verificationStatus: 'APPROVED',
                    latestVerificationRequest: data,
                  };
                  try { localStorage.setItem('vh-user-profile', JSON.stringify(updated)); } catch (_) {}
                  return updated;
                });
              }
            } else {
              // Only reset to intro if local storage does not confirm pending
              if (!isLocallyPending && localStorage.getItem('vh_manual_verification_pending') !== 'true') {
                localStorage.removeItem('vh_manual_verification_pending');
                setStep((curr) => (curr === 'under_review' ? 'intro' : curr));
              }
            }
          }
        } catch (err) {
          console.warn('[PhotoVerification] Error checking verification status:', err);
        } finally {
          setStatusLoading(false);
        }
      };

      fetchVerificationStatus();
    } else {
      stopCamera();
      setIsReverifying(false);
    }
  }, [isOpen, userProfile?.verificationStatus, userProfile?.verified, isReverify]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    // Strictly forbid camera from opening if manual verification is currently under process
    const isPending = Boolean(
      verificationStatus?.status === 'PENDING' ||
      userProfile?.verificationStatus === 'PENDING' ||
      localStorage.getItem('vh_manual_verification_pending') === 'true'
    );
    if (isPending) {
      setStep('under_review');
      showAlert?.('Manual verification is currently under process. Our team will review your request shortly.', 'info');
      return;
    }

    if (userProfile?.verified && !isReverifying && !isReverify) {
      setStep('success');
      return;
    }

    setCameraError('');
    setFailureReason('');
    livenessSamplesRef.current = [];
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setStep('camera');
    } catch (err) {
      console.error('Camera access denied or unavailable:', err);
      setCameraError(
        'Unable to access camera. Please allow camera permissions in your browser or upload a selfie below.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
  };

  useEffect(() => {
    if (videoRef.current && stream && step === 'camera') {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((e) => console.warn('Video play error:', e));
    }
  }, [step, stream]);

  // Samples frame from video to track live optical micro-motion
  const sampleLivenessFrame = () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      const c = document.createElement('canvas');
      c.width = 80;
      c.height = 80;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, 80, 80);
      livenessSamplesRef.current.push(ctx.getImageData(0, 0, 80, 80).data);
    } catch (e) {
      console.warn('Liveness frame sample error:', e);
    }
  };

  const handleStartCaptureWithTimer = () => {
    if (countdown !== null) return;
    setCountdown(3);
    livenessSamplesRef.current = [];

    // Capture initial frame at t=3s
    sampleLivenessFrame();

    let current = 3;
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    countdownIntervalRef.current = setInterval(() => {
      current -= 1;
      // Capture mid-countdown frames to track live motion
      sampleLivenessFrame();

      if (current <= 0) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        setCountdown(null);
        captureSnapshot();
      } else {
        setCountdown(current);
      }
    }, 1000);
  };

  const captureSnapshot = () => {
    const video = videoRef.current;
    if (!video) {
      console.warn('captureSnapshot: video element missing');
      return;
    }

    // Capture final liveness sample
    sampleLivenessFrame();

    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
    }

    const vw = video.videoWidth || video.clientWidth || 640;
    const vh = video.videoHeight || video.clientHeight || 480;

    const size = Math.min(vw, vh);
    const sx = Math.max(0, (vw - size) / 2);
    const sy = Math.max(0, (vh - size) / 2);

    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      ctx.save();
      // Mirror horizontally for natural selfie orientation
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
      ctx.restore();

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      if (dataUrl && dataUrl.length > 200) {
        setCapturedImage(dataUrl);
        setStep('preview');
      } else {
        console.error('Failed to generate image dataUrl');
      }
    } catch (err) {
      console.error('Error during canvas drawImage/toDataURL:', err);
    } finally {
      setTimeout(() => {
        stopCamera();
      }, 100);
    }
  };

  const handleFileUploadFallback = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result);
      stopCamera();
      setStep('preview');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitVerification = async () => {
    if (!capturedImage || isSubmitting) return;
    setIsSubmitting(true);
    setFailureReason('');

    try {
      // 1. Run 3D Liveness & Anti-Spoofing check (Rejects static screens / held up photos)
      const antiSpoofCheck = await evaluateLiveAntiSpoofing(livenessSamplesRef.current, capturedImage);
      if (!antiSpoofCheck.isValid) {
        setFailureReason(antiSpoofCheck.reason || 'Live presence not confirmed.');
        setStep('failed');
        setIsSubmitting(false);
        return;
      }

      // 2. Run live face framing verification on captured selfie
      const faceStructure = await analyzeLiveFaceStructure(capturedImage);
      if (!faceStructure.isValid) {
        setFailureReason(faceStructure.reason || 'Face structure not clearly detected.');
        setStep('failed');
        setIsSubmitting(false);
        return;
      }

      // 3. Run anti-catfish face comparison against uploaded profile photo
      const rawPhoto = primaryPhotoUrl || userProfile?.photos?.[0];
      const referencePhoto = typeof rawPhoto === 'object' ? (rawPhoto?.secureUrl || rawPhoto?.url || null) : rawPhoto;
      if (referencePhoto) {
        const faceAnalysis = await compareFaceBiometrics(capturedImage, referencePhoto);
        if (!faceAnalysis.isValid) {
          setFailureReason(faceAnalysis.reason || 'Face mismatch detected.');
          setStep('failed');
          setIsSubmitting(false);
          return;
        }
      }

      // 4. Submit verification selfie to backend queue for admin review
      try {
        if (api.isConfigured && api.verifyPhoto) {
          await api.verifyPhoto({
            selfie: capturedImage,
            poseId: 'BIOMETRIC_FACE_ID',
            referenceUrl: referencePhoto,
          });
        } else if (api.isConfigured && api.submitManualVerification) {
          await api.submitManualVerification({
            selfie: capturedImage,
            referenceUrl: referencePhoto,
          });
        }
      } catch (backendErr) {
        console.warn('[PhotoVerification] Primary verifyPhoto failed, attempting manual review fallback:', backendErr);
        try {
          if (api.isConfigured && api.submitManualVerification) {
            await api.submitManualVerification({
              selfie: capturedImage,
              referenceUrl: referencePhoto,
            });
          } else {
            throw backendErr;
          }
        } catch (manualErr) {
          console.error('[PhotoVerification] Both verification submissions failed:', manualErr);
          throw new Error(manualErr?.message || backendErr?.message || 'Failed to submit verification to server. Please try again.');
        }
      }

      // 5. Update local state to pending admin review (Admin Approval Only)
      try {
        localStorage.setItem('vh_manual_verification_pending', 'true');
        localStorage.removeItem('vh-user-verified');
        localStorage.removeItem('vh_verification_snoozed_until');
      } catch (_) {}

      const pendingStatus = {
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      setVerificationStatus(pendingStatus);

      if (setUserProfile) {
        setUserProfile((prev) => {
          const updated = {
            ...prev,
            verified: false,
            verificationStatus: 'PENDING',
            latestVerificationRequest: pendingStatus,
          };
          try {
            localStorage.setItem('vh-user-profile', JSON.stringify(updated));
          } catch (_) {}
          return updated;
        });
      }

      setIsReverifying(false);
      stopCamera();
      setStep('under_review');
      if (onVerified) onVerified({ verified: false, status: 'PENDING' });
    } catch (err) {
      console.error('Verification submission failed:', err);
      setFailureReason(err.message || 'Photo verification could not be completed. Please ensure your face is well-lit and retry.');
      setStep('failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestManualReview = async () => {
    if (!capturedImage || manualReviewLoading) return;
    setManualReviewLoading(true);
    try {
      const rawPhoto = primaryPhotoUrl || userProfile?.photos?.[0];
      const referenceUrl = typeof rawPhoto === 'object' ? (rawPhoto?.secureUrl || rawPhoto?.url || null) : (rawPhoto || null);
      await api.submitManualVerification({
        selfie: capturedImage,
        referenceUrl,
        autoFailReason: failureReason,
      });

      setManualReviewSubmitted(true);
      localStorage.setItem('vh_manual_verification_pending', 'true');
      setVerificationStatus({
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      });
      if (setUserProfile) {
        setUserProfile((prev) => {
          const updated = {
            ...prev,
            verificationStatus: 'PENDING',
            latestVerificationRequest: {
              status: 'PENDING',
              createdAt: new Date().toISOString(),
            },
          };
          try {
            localStorage.setItem('vh-user-profile', JSON.stringify(updated));
          } catch (_) {}
          return updated;
        });
      }
      showAlert?.({
        title: 'Submitted for Review',
        message: 'Your verification has been sent for manual review. Our moderation team is currently reviewing your profile. Please wait.',
      });
      stopCamera();
      setStep('under_review');
    } catch (err) {
      console.error('Manual verification submission failed:', err);
      showAlert?.('Failed to submit manual review request. Please try again.', 'error');
    } finally {
      setManualReviewLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="vh-modal-overlay photo-verify-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-verify-title"
    >
      <div className="photo-verify-card font-ui">
        {/* Header Bar */}
        <div className="photo-verify-header">
          <div className="photo-verify-title-wrap">
            <ShieldCheck size={24} weight="fill" color="#D4AD6A" />
            <h2 id="photo-verify-title" className="photo-verify-modal-title font-display">
              Face ID Verification
            </h2>
          </div>
          <button
            type="button"
            className="photo-verify-close-btn"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            aria-label="Close photo verification"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Dynamic Modal Content by Step */}
        <div className="photo-verify-body">
          {/* STEP 1: INTRO EXPLANATION */}
          {step === 'intro' && (
            <div className="photo-verify-intro-step">
              <div className="photo-verify-shield-badge-hero">
                <VerifiedBadge variant="pill" size="md" interactive={false} />
              </div>

              <h3 className="photo-verify-headline font-display">
                Verify Your Profile Authenticity
              </h3>
              <p className="photo-verify-desc font-body">
                Take a quick 5-second live face scan to confirm your identity against your profile photos. Verified profiles earn the official <strong>Verified Rosette</strong> and receive up to <strong>3x more matches</strong>.
              </p>

              <div className="photo-verify-checklist">
                <div className="photo-verify-check-item">
                  <UserFocus size={20} weight="fill" color="#D4AD6A" />
                  <div>
                    <strong>Face Centered</strong>
                    <span>Position your face naturally in the outline guide</span>
                  </div>
                </div>
                <div className="photo-verify-check-item">
                  <SunHorizon size={20} weight="fill" color="#D4AD6A" />
                  <div>
                    <strong>Good Lighting</strong>
                    <span>Make sure your facial features are clearly visible</span>
                  </div>
                </div>
              </div>

              <div className="photo-verify-actions">
                <Button
                  variant="primary"
                  onClick={startCamera}
                  className="photo-verify-btn-full"
                >
                  <Camera size={18} weight="bold" />
                  <span>Start Face Scan</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={onClose}
                  className="photo-verify-btn-full"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: LIVE CAMERA VIEW */}
          {step === 'camera' && (
            <div className="photo-verify-camera-step">
              <div className="photo-verify-camera-banner">
                <h3 className="photo-verify-scan-title font-display">
                  Live Face Scan
                </h3>
                <p className="photo-verify-scan-subtitle font-body">
                  Align your face within the outline and look straight into the camera
                </p>
              </div>

              {/* Viewfinder Container */}
              <div className="photo-verify-viewfinder-wrap">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  className="photo-verify-video-element"
                />

                {/* Centered Biometric Face Scan Overlay */}
                <PoseGuideOverlay />

                {/* Countdown Overlay (3, 2, 1) */}
                {countdown !== null && (
                  <div className="photo-verify-countdown-overlay">
                    <span className="photo-verify-countdown-number font-display">
                      {countdown}
                    </span>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {cameraError ? (
                <div className="photo-verify-error-box font-ui">
                  <WarningCircle size={16} color="#D03050" />
                  <p>{cameraError}</p>
                  <label className="photo-verify-upload-btn">
                    <span>Upload a Selfie Instead</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleFileUploadFallback}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              ) : (
                <div className="photo-verify-camera-controls">
                  <button
                    type="button"
                    className="photo-verify-shutter-btn"
                    onClick={handleStartCaptureWithTimer}
                    disabled={countdown !== null}
                    aria-label="Take Photo"
                  >
                    <div className="photo-verify-shutter-inner" />
                  </button>
                  <span className="photo-verify-shutter-hint font-ui">
                    Tap shutter to scan face (3s timer)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: PREVIEW & CONFIRM */}
          {step === 'preview' && (
            <div className="photo-verify-preview-step">
              <h3 className="photo-verify-headline font-display">Confirm Your Face Scan</h3>
              <p className="photo-verify-desc font-body">
                Check your selfie below. Make sure your facial features are sharp and well-lit.
              </p>

              <div className="photo-verify-comparison-grid">
                <div className="photo-verify-compare-card">
                  <span className="photo-verify-compare-tag font-ui">Live Face Scan</span>
                  <img
                    src={capturedImage}
                    alt="Captured face scan"
                    className="photo-verify-compare-img"
                  />
                </div>
                {(primaryPhotoUrl || userProfile?.photos?.[0]) && (
                  <div className="photo-verify-compare-card">
                    <span className="photo-verify-compare-tag font-ui">Profile Photo</span>
                    <img
                      src={primaryPhotoUrl || userProfile.photos[0]}
                      alt="Primary profile photo"
                      className="photo-verify-compare-img"
                    />
                  </div>
                )}
              </div>

              <div className="photo-verify-actions">
                <Button
                  variant="primary"
                  onClick={handleSubmitVerification}
                  disabled={isSubmitting}
                  className="photo-verify-btn-full"
                >
                  <CheckCircle size={18} weight="bold" />
                  <span>{isSubmitting ? 'Analyzing Facial Biometrics...' : 'Confirm & Verify'}</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={startCamera}
                  disabled={isSubmitting}
                  className="photo-verify-btn-full"
                >
                  <ArrowsClockwise size={16} />
                  <span>Retake Scan</span>
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3.5: VERIFICATION FAILED / RETRY */}
          {step === 'failed' && (
            <div className="photo-verify-failed-step">
              <div className="photo-verify-failed-icon">
                <WarningCircle size={48} weight="fill" color="#D03050" />
              </div>
              <h3 className="photo-verify-headline font-display" style={{ color: '#D03050' }}>
                {failureReason.includes('Face mismatch') ? 'Face Mismatch Detected' : 'Verification Incomplete'}
              </h3>
              <p className="photo-verify-desc font-body" style={{ color: 'var(--text-primary)' }}>
                {failureReason || `We couldn't verify your live face scan. Please ensure your face is well-lit and matches your uploaded profile photos.`}
              </p>

              {/* Side-by-side comparison on face mismatch */}
              {failureReason.includes('Face mismatch') && (primaryPhotoUrl || userProfile?.photos?.[0]) && capturedImage && (
                <div className="photo-verify-comparison-grid" style={{ margin: '14px 0' }}>
                  <div className="photo-verify-compare-card">
                    <span className="photo-verify-compare-tag font-ui" style={{ color: '#D03050' }}>Your Live Selfie</span>
                    <img
                      src={capturedImage}
                      alt="Captured selfie"
                      className="photo-verify-compare-img"
                      style={{ borderColor: 'rgba(208, 48, 80, 0.5)' }}
                    />
                  </div>
                  <div className="photo-verify-compare-card">
                    <span className="photo-verify-compare-tag font-ui">Profile Photo</span>
                    <img
                      src={primaryPhotoUrl || userProfile?.photos?.[0]}
                      alt="Profile photo"
                      className="photo-verify-compare-img"
                    />
                  </div>
                </div>
              )}

              <div className="photo-verify-actions">
                <Button
                  variant="primary"
                  disabled={manualReviewLoading}
                  className="photo-verify-btn-full"
                  onClick={handleRequestManualReview}
                >
                  <ShieldCheck size={18} weight="bold" />
                  <span>{manualReviewLoading ? 'Submitting Review…' : 'Submit for Manual Review'}</span>
                </Button>

                <Button
                  variant="secondary"
                  onClick={startCamera}
                  className="photo-verify-btn-full"
                >
                  <ArrowsClockwise size={18} weight="bold" />
                  <span>Retake Face Scan</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => {
                    stopCamera();
                    onClose();
                  }}
                  className="photo-verify-btn-full"
                  style={{ fontSize: 'var(--text-body-sm)' }}
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          )}

          {/* STEP: MANUAL REVIEW UNDER PROCESS */}
          {step === 'under_review' && (
            <div className="photo-verify-under-review-step">
              <div className="photo-verify-pulse-icon">
                <HourglassMedium size={38} weight="fill" color="#D4AD6A" />
              </div>

              <div className="photo-verify-status-pill pending font-ui">
                <Clock size={14} weight="bold" />
                <span>Verification Under Review</span>
              </div>

              <h3 className="photo-verify-headline font-display">
                Manual Verification Under Process
              </h3>
              <p className="photo-verify-desc font-body">
                Your photo verification request has been received and is currently being processed by our moderation team. You do not need to take another face scan.
              </p>

              {/* Status Details Card */}
              <div className="photo-verify-info-card font-ui">
                <div className="photo-verify-info-row">
                  <span className="photo-verify-info-label">
                    <Clock size={16} color="#D4AD6A" />
                    <span>Current Status</span>
                  </span>
                  <span className="photo-verify-info-value" style={{ color: '#D4AD6A', fontWeight: 600 }}>
                    In Review by Moderation Team
                  </span>
                </div>

                <div className="photo-verify-info-row">
                  <span className="photo-verify-info-label">
                    <CalendarBlank size={16} color="var(--text-secondary)" />
                    <span>Submitted On</span>
                  </span>
                  <span className="photo-verify-info-value">
                    {formatSubmittedDate(verificationStatus?.createdAt)}
                  </span>
                </div>

                <div className="photo-verify-info-row">
                  <span className="photo-verify-info-label">
                    <ShieldCheck size={16} color="#4ADE80" />
                    <span>Review Window</span>
                  </span>
                  <span className="photo-verify-info-value">
                    Typically within 24 hours
                  </span>
                </div>

                <div className="photo-verify-info-note">
                  <Info size={16} weight="fill" color="#D4AD6A" style={{ flexShrink: 0 }} />
                  <span>
                    Your profile and messaging remain completely active while our team reviews your photos. You'll receive your <strong>Verified Rosette</strong> as soon as your review is approved.
                  </span>
                </div>
              </div>

              <div className="photo-verify-actions" style={{ width: '100%', marginTop: '8px' }}>
                <Button
                  variant="primary"
                  onClick={() => {
                    stopCamera();
                    onClose();
                  }}
                  className="photo-verify-btn-full"
                >
                  <CheckCircle size={18} weight="bold" />
                  <span>Got It</span>
                </Button>
              </div>
            </div>
          )}

          {/* STEP: VERIFICATION NOT APPROVED / REJECTED */}
          {step === 'rejected' && (
            <div className="photo-verify-rejected-step">
              <div className="photo-verify-failed-icon">
                <WarningCircle size={46} weight="fill" color="#D03050" />
              </div>

              <div className="photo-verify-status-pill rejected font-ui">
                <WarningCircle size={14} weight="bold" />
                <span>Verification Not Approved</span>
              </div>

              <h3 className="photo-verify-headline font-display" style={{ color: '#D03050' }}>
                Verification Not Approved
              </h3>

              <p className="photo-verify-desc font-body">
                {verificationStatus?.adminNotes ? (
                  <>
                    <strong>Moderator Note:</strong> &ldquo;{verificationStatus.adminNotes}&rdquo;
                  </>
                ) : (
                  'Your previous verification request could not be approved due to low lighting, blurriness, or an unclear face view.'
                )}
              </p>

              <div className="photo-verify-info-card font-ui" style={{ borderColor: 'rgba(208, 48, 80, 0.25)' }}>
                <div className="photo-verify-info-note" style={{ color: 'var(--text-primary)' }}>
                  <SunHorizon size={18} weight="fill" color="#D03050" style={{ flexShrink: 0 }} />
                  <span>
                    Please ensure you are in a brightly lit room, remove dark glasses or hats, and look straight into the camera for your new scan.
                  </span>
                </div>
              </div>

              <div className="photo-verify-actions" style={{ width: '100%', marginTop: '8px' }}>
                <Button
                  variant="primary"
                  onClick={startCamera}
                  className="photo-verify-btn-full"
                >
                  <Camera size={18} weight="bold" />
                  <span>Retake Face Scan</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => {
                    stopCamera();
                    onClose();
                  }}
                  className="photo-verify-btn-full"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS CELEBRATION */}
          {step === 'success' && (
            <div className="photo-verify-success-step">
              <div className="photo-verify-success-icon">
                <CheckCircle size={48} weight="fill" color="#B8436A" />
              </div>
              <h3 className="photo-verify-headline font-display">
                You’re Verified!
              </h3>
              <p className="photo-verify-desc font-body">
                Your biometric face scan was confirmed. The <strong>Verified Rosette Badge</strong> is now active on your profile and visible to all your connections.
              </p>

              <div className="photo-verify-badge-celebrate">
                <VerifiedBadge variant="pill" size="lg" interactive={false} />
              </div>

              <div className="photo-verify-actions">
                <Button
                  variant="primary"
                  onClick={() => {
                    stopCamera();
                    setIsReverifying(false);
                    onClose();
                  }}
                  className="photo-verify-btn-full"
                >
                  Done
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsReverifying(true);
                    setCapturedImage(null);
                    setStep('intro');
                  }}
                  className="photo-verify-btn-full"
                  style={{ marginTop: '8px' }}
                >
                  <ArrowsClockwise size={16} weight="bold" style={{ marginRight: '6px' }} />
                  Re-verify Face Scan
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden Canvas for Frame Capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};
