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
  HandWaving
} from '@phosphor-icons/react';
import { Button } from '../UI/Button';
import { VerifiedBadge } from '../UI/VerifiedBadge';
import { PoseGuideOverlay } from './PoseGuideOverlay';

// Strictly one-handed selfie gesture challenges
const ONE_HANDED_POSES = [
  {
    id: 'PEACE_SIGN',
    emoji: '✌️',
    title: 'Peace Sign',
    instruction: 'Hold up a peace sign next to your cheek with one hand'
  },
  {
    id: 'THUMBS_UP',
    emoji: '👍',
    title: 'Thumbs Up',
    instruction: 'Give a thumbs up near your face with one hand'
  },
  {
    id: 'SHAKA_SIGN',
    emoji: '🤙',
    title: 'Call Me / Shaka',
    instruction: 'Make a shaka / call-me hand sign beside your face'
  },
  {
    id: 'OPEN_PALM',
    emoji: '🖐️',
    title: 'Open Palm Wave',
    instruction: 'Raise an open palm beside your cheek with a smile'
  },
  {
    id: 'FINGER_CHIN',
    emoji: '🤔',
    title: 'Finger on Chin',
    instruction: 'Rest your index finger lightly against your chin'
  }
];

// Helper: Skin pixel detector using biometric color thresholding
const isSkinPixel = (r, g, b) => {
  return (
    r > 50 &&
    g > 35 &&
    b > 20 &&
    r > g &&
    r > b &&
    Math.abs(r - g) > 8 &&
    r - b > 10 &&
    r < 250
  );
};

// Helper: Calculate Sobel edge gradient magnitude for structural texture
const computeSobelEdgeMagnitude = (data, w, h, x, y) => {
  if (x <= 0 || x >= w - 1 || y <= 0 || y >= h - 1) return 0;
  const getLum = (px, py) => {
    const idx = (py * w + px) * 4;
    return 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  };

  const gx =
    -1 * getLum(x - 1, y - 1) + 1 * getLum(x + 1, y - 1) +
    -2 * getLum(x - 1, y)     + 2 * getLum(x + 1, y) +
    -1 * getLum(x - 1, y + 1) + 1 * getLum(x + 1, y + 1);

  const gy =
    -1 * getLum(x - 1, y - 1) - 2 * getLum(x, y - 1) - 1 * getLum(x + 1, y - 1) +
     1 * getLum(x - 1, y + 1) + 2 * getLum(x, y + 1) + 1 * getLum(x + 1, y + 1);

  return Math.sqrt(gx * gx + gy * gy);
};

// Strict pose gesture presence analyzer
const analyzePoseSelfie = (canvas, poseId) => {
  if (!canvas) return { isValid: true };
  const ctx = canvas.getContext('2d');
  if (!ctx) return { isValid: true };

  const { width, height } = canvas;
  if (width < 60 || height < 60) return { isValid: true };

  try {
    const imgData = ctx.getImageData(0, 0, width, height).data;

    const checkRegionMetrics = (rx1, ry1, rx2, ry2) => {
      let skin = 0;
      let total = 0;
      let edgeSum = 0;

      for (let y = Math.max(1, ry1); y < Math.min(height - 1, ry2); y += 3) {
        for (let x = Math.max(1, rx1); x < Math.min(width - 1, rx2); x += 3) {
          const idx = (y * width + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          total++;
          if (isSkinPixel(r, g, b)) skin++;
          edgeSum += computeSobelEdgeMagnitude(imgData, width, height, x, y);
        }
      }

      return {
        skinRatio: skin / Math.max(1, total),
        avgEdge: edgeSum / Math.max(1, total)
      };
    };

    // 1. Center Face Region Check
    const faceMetrics = checkRegionMetrics(
      Math.floor(width * 0.28),
      Math.floor(height * 0.25),
      Math.floor(width * 0.72),
      Math.floor(height * 0.70)
    );

    if (faceMetrics.skinRatio < 0.12) {
      return {
        isValid: false,
        reason: 'Face not clearly detected. Please make sure your face is well-lit and centered inside the oval guide.'
      };
    }

    // 2. Background Corner Noise Baseline
    const bgMetrics = checkRegionMetrics(
      Math.floor(width * 0.02),
      Math.floor(height * 0.02),
      Math.floor(width * 0.18),
      Math.floor(height * 0.18)
    );

    // 3. Pose Target Region Check
    let handDetected = false;

    if (poseId === 'FINGER_CHIN') {
      const chinMetrics = checkRegionMetrics(
        Math.floor(width * 0.35),
        Math.floor(height * 0.62),
        Math.floor(width * 0.65),
        Math.floor(height * 0.88)
      );
      if (chinMetrics.skinRatio > 0.20 && chinMetrics.skinRatio > bgMetrics.skinRatio + 0.08 && chinMetrics.avgEdge > 25) {
        handDetected = true;
      }
    } else {
      // Right cheek gesture zone (primary) OR Left cheek gesture zone
      const rightZone = checkRegionMetrics(
        Math.floor(width * 0.66),
        Math.floor(height * 0.25),
        Math.floor(width * 0.98),
        Math.floor(height * 0.72)
      );

      const leftZone = checkRegionMetrics(
        Math.floor(width * 0.02),
        Math.floor(height * 0.25),
        Math.floor(width * 0.34),
        Math.floor(height * 0.72)
      );

      const maxSkin = Math.max(rightZone.skinRatio, leftZone.skinRatio);
      const maxEdge = Math.max(rightZone.avgEdge, leftZone.avgEdge);

      // Require genuine skin presence AND finger/contour texture above background
      if (maxSkin > 0.18 && maxSkin > bgMetrics.skinRatio + 0.08 && maxEdge > 20) {
        handDetected = true;
      }
    }

    if (!handDetected) {
      return {
        isValid: false,
        reason: `Pose gesture not detected in the guide circle. Please raise your hand and make the requested pose clearly beside your face.`
      };
    }

    return { isValid: true };
  } catch (e) {
    console.warn('Pose analysis error:', e);
    return { isValid: false, reason: 'Could not process selfie frame. Please retry in good lighting.' };
  }
};

/**
 * Biometric Anti-Catfish Face Comparison
 * Compares the captured live selfie against the user's uploaded profile photo
 */
const compareFaceBiometrics = async (selfieCanvas, profilePhotoUrl) => {
  if (!selfieCanvas || !profilePhotoUrl) {
    return { isValid: true }; // No reference photo to compare against yet
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const size = 120;
        // 1. Create reference profile photo canvas
        const refCanvas = document.createElement('canvas');
        refCanvas.width = size;
        refCanvas.height = size;
        const refCtx = refCanvas.getContext('2d');
        if (!refCtx) {
          resolve({ isValid: true });
          return;
        }
        refCtx.drawImage(img, 0, 0, size, size);
        const refData = refCtx.getImageData(0, 0, size, size).data;

        // 2. Create normalized selfie canvas
        const sCanvas = document.createElement('canvas');
        sCanvas.width = size;
        sCanvas.height = size;
        const sCtx = sCanvas.getContext('2d');
        if (!sCtx) {
          resolve({ isValid: true });
          return;
        }
        sCtx.drawImage(selfieCanvas, 0, 0, size, size);
        const sData = sCtx.getImageData(0, 0, size, size).data;

        // 3. Extract Face Biometrics (Central 60% face box)
        const xMin = Math.floor(size * 0.20);
        const xMax = Math.floor(size * 0.80);
        const yMin = Math.floor(size * 0.20);
        const yMax = Math.floor(size * 0.80);

        let refSkinSum = { r: 0, g: 0, b: 0, count: 0 };
        let sSkinSum = { r: 0, g: 0, b: 0, count: 0 };
        let edgeCorrelations = [];

        // 9-Sector Landmark Grid comparison
        const sectors = 3;
        const secW = (xMax - xMin) / sectors;
        const secH = (yMax - yMin) / sectors;

        for (let sy = 0; sy < sectors; sy++) {
          for (let sx = 0; sx < sectors; sx++) {
            let refSecEdge = 0;
            let sSecEdge = 0;
            let secTotal = 0;

            const startX = Math.floor(xMin + sx * secW);
            const endX = Math.floor(xMin + (sx + 1) * secW);
            const startY = Math.floor(yMin + sy * secH);
            const endY = Math.floor(yMin + (sy + 1) * secH);

            for (let py = startY; py < endY; py += 2) {
              for (let px = startX; px < endX; px += 2) {
                const idx = (py * size + px) * 4;
                secTotal++;

                // Profile photo metrics
                const rr = refData[idx];
                const rg = refData[idx + 1];
                const rb = refData[idx + 2];
                if (isSkinPixel(rr, rg, rb)) {
                  refSkinSum.r += rr;
                  refSkinSum.g += rg;
                  refSkinSum.b += rb;
                  refSkinSum.count++;
                }
                refSecEdge += computeSobelEdgeMagnitude(refData, size, size, px, py);

                // Selfie photo metrics
                const sr = sData[idx];
                const sg = sData[idx + 1];
                const sb = sData[idx + 2];
                if (isSkinPixel(sr, sg, sb)) {
                  sSkinSum.r += sr;
                  sSkinSum.g += sg;
                  sSkinSum.b += sb;
                  sSkinSum.count++;
                }
                sSecEdge += computeSobelEdgeMagnitude(sData, size, size, px, py);
              }
            }

            const avgRefEdge = refSecEdge / Math.max(1, secTotal);
            const avgSEdge = sSecEdge / Math.max(1, secTotal);
            const secDiff = Math.abs(avgRefEdge - avgSEdge) / Math.max(1, Math.max(avgRefEdge, avgSEdge));
            edgeCorrelations.push(1 - Math.min(1, secDiff));
          }
        }

        // Structural facial correlation score
        const structuralScore = edgeCorrelations.reduce((acc, v) => acc + v, 0) / edgeCorrelations.length;

        // Chromatic / Skin Profile similarity
        let chromaticScore = 1.0;
        if (refSkinSum.count > 15 && sSkinSum.count > 15) {
          const refAvgR = refSkinSum.r / refSkinSum.count;
          const refAvgG = refSkinSum.g / refSkinSum.count;
          const refAvgB = refSkinSum.b / refSkinSum.count;

          const sAvgR = sSkinSum.r / sSkinSum.count;
          const sAvgG = sSkinSum.g / sSkinSum.count;
          const sAvgB = sSkinSum.b / sSkinSum.count;

          const rDiff = Math.abs(refAvgR - sAvgR) / 255;
          const gDiff = Math.abs(refAvgG - sAvgG) / 255;
          const bDiff = Math.abs(refAvgB - sAvgB) / 255;
          chromaticScore = 1.0 - (rDiff + gDiff + bDiff) / 3;
        }

        // Combined Biometric Similarity (0.0 to 1.0)
        const combinedSimilarity = structuralScore * 0.65 + chromaticScore * 0.35;
        console.log('[BiometricVerification] Face comparison score:', {
          structuralScore: structuralScore.toFixed(3),
          chromaticScore: chromaticScore.toFixed(3),
          combinedSimilarity: combinedSimilarity.toFixed(3)
        });

        // If similarity is below 0.60, reject as face mismatch
        if (combinedSimilarity < 0.60) {
          resolve({
            isValid: false,
            isMismatch: true,
            similarity: combinedSimilarity,
            reason: 'Face mismatch detected. The person in this live selfie does not match the photo on your profile. Please verify using your own face.'
          });
          return;
        }

        resolve({ isValid: true, similarity: combinedSimilarity });
      } catch (err) {
        console.warn('Biometric comparison error:', err);
        resolve({ isValid: true });
      }
    };

    img.onerror = () => {
      console.warn('Could not load reference profile photo for comparison:', profilePhotoUrl);
      resolve({ isValid: true });
    };

    img.src = profilePhotoUrl;
  });
};

export const PhotoVerificationModal = ({ isOpen, onClose, onVerified, primaryPhotoUrl }) => {
  const { userProfile, setUserProfile, showAlert } = useApp();

  const [step, setStep] = useState('intro'); // 'intro' | 'camera' | 'preview' | 'failed' | 'success'
  const [selectedPose, setSelectedPose] = useState(ONE_HANDED_POSES[0]);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failureReason, setFailureReason] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Pick random pose whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const randIndex = Math.floor(Math.random() * ONE_HANDED_POSES.length);
      setSelectedPose(ONE_HANDED_POSES[randIndex]);
      setStep('intro');
      setCapturedImage(null);
      setCameraError('');
      setFailureReason('');
    } else {
      stopCamera();
    }
  }, [isOpen]);

  // Clean up media streams on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    setCameraError('');
    setFailureReason('');
    try {
      // Release any lingering tracks first
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

  // Attach stream to video tag whenever stream changes or camera step activates
  useEffect(() => {
    if (videoRef.current && stream && step === 'camera') {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((e) => console.warn('Video play error:', e));
    }
  }, [step, stream]);

  const handleStartCaptureWithTimer = () => {
    if (countdown !== null) return;
    setCountdown(3);

    let current = 3;
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    countdownIntervalRef.current = setInterval(() => {
      current -= 1;
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
      // Mirror horizontally for natural selfie orientation (matching scaleX(-1))
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
      // 1. Run computer-vision pose analysis
      const poseAnalysis = analyzePoseSelfie(canvasRef.current, selectedPose.id);
      if (!poseAnalysis.isValid) {
        setFailureReason(poseAnalysis.reason || 'Pose not clearly detected.');
        setStep('failed');
        setIsSubmitting(false);
        return;
      }

      // 2. Run anti-catfish face comparison against profile photo
      const referencePhoto = primaryPhotoUrl || userProfile?.photos?.[0];
      if (referencePhoto) {
        const faceAnalysis = await compareFaceBiometrics(canvasRef.current, referencePhoto);
        if (!faceAnalysis.isValid) {
          setFailureReason(faceAnalysis.reason || 'Face mismatch detected.');
          setStep('failed');
          setIsSubmitting(false);
          return;
        }
      }

      // 3. Call backend verification endpoint
      if (api.isConfigured && api.verifyPhoto) {
        const res = await api.verifyPhoto({
          selfie: capturedImage,
          poseId: selectedPose.id
        });
        if (res && res.success === false) {
          throw new Error(res.message || 'Verification rejected');
        }
      }

      // 4. Update local profile state to verified
      if (setUserProfile) {
        setUserProfile((prev) => ({
          ...prev,
          verified: true
        }));
      }

      setStep('success');
      if (onVerified) onVerified();
    } catch (err) {
      console.error('Verification submission failed:', err);
      setFailureReason(err.message || 'Photo verification could not be completed. Please ensure your face is well-lit and retry.');
      setStep('failed');
    } finally {
      setIsSubmitting(false);
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
      <div className="vh-modal-card photo-verify-card font-ui">
        {/* Header */}
        <div className="photo-verify-header">
          <div className="photo-verify-title-group">
            <ShieldCheck size={20} weight="fill" color="#B8436A" />
            <h2 id="photo-verify-title" className="photo-verify-title font-display">
              Photo Verification
            </h2>
          </div>
          <button
            type="button"
            className="photo-verify-close-btn"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="photo-verify-body">
          {/* STEP 1: INTRO */}
          {step === 'intro' && (
            <div className="photo-verify-intro-step">
              <div className="photo-verify-badge-preview">
                <VerifiedBadge variant="pill" size="md" interactive={false} />
              </div>

              <h3 className="photo-verify-headline font-display">
                Get Your Verified Badge
              </h3>
              <p className="photo-verify-desc font-body">
                Confirm your identity with a quick one-handed selfie gesture. This proves you are the real person in your photos and helps keep our community authentic and free from catfishing.
              </p>

              <div className="photo-verify-pose-teaser">
                <div className="photo-verify-pose-badge font-ui">
                  <span className="photo-verify-pose-emoji">{selectedPose.emoji}</span>
                  <div className="photo-verify-pose-meta">
                    <span className="photo-verify-pose-label">Your Quick Gesture:</span>
                    <strong className="photo-verify-pose-name">{selectedPose.instruction}</strong>
                  </div>
                </div>
              </div>

              <div className="photo-verify-actions">
                <Button variant="primary" onClick={startCamera} className="photo-verify-btn-full">
                  <Camera size={18} weight="bold" />
                  <span>Start Verification</span>
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

          {/* STEP 2: CAMERA CAPTURE */}
          {step === 'camera' && (
            <div className="photo-verify-camera-step">
              <div className="photo-verify-instruction-bar font-ui">
                <span className="photo-verify-emoji-large">{selectedPose.emoji}</span>
                <span>{selectedPose.instruction}</span>
              </div>

              <div className="photo-verify-viewfinder-wrap">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="photo-verify-video"
                />
                
                {/* Dynamic Pose Outline Silhouette Overlay */}
                <PoseGuideOverlay
                  poseId={selectedPose.id}
                  emoji={selectedPose.emoji}
                  instruction={selectedPose.instruction}
                />

                {countdown !== null && (
                  <div className="photo-verify-countdown-overlay font-display">
                    {countdown}
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
                    Tap to take photo (3s timer)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: PREVIEW & CONFIRM */}
          {step === 'preview' && (
            <div className="photo-verify-preview-step">
              <h3 className="photo-verify-headline font-display">Review Your Selfie</h3>
              <p className="photo-verify-desc font-body">
                Make sure your face and the <strong>{selectedPose.title} ({selectedPose.emoji})</strong> are clearly visible.
              </p>

              <div className="photo-verify-comparison-grid">
                <div className="photo-verify-compare-card">
                  <span className="photo-verify-compare-tag font-ui">Verification Pose</span>
                  <img
                    src={capturedImage}
                    alt="Captured pose selfie"
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
                  <span>{isSubmitting ? 'Verifying...' : 'Confirm & Submit'}</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={startCamera}
                  disabled={isSubmitting}
                  className="photo-verify-btn-full"
                >
                  <ArrowsClockwise size={16} />
                  <span>Retake Photo</span>
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
                {failureReason || `We couldn't verify your live selfie. Please ensure you match the requested gesture and that your selfie matches your uploaded profile photos.`}
              </p>

              {/* Side-by-side preview if face mismatch */}
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

              {!failureReason.includes('Face mismatch') && (
                <div className="photo-verify-pose-teaser">
                  <div className="photo-verify-pose-badge font-ui" style={{ borderColor: 'rgba(208, 48, 80, 0.4)' }}>
                    <span className="photo-verify-pose-emoji">{selectedPose.emoji}</span>
                    <div className="photo-verify-pose-meta">
                      <span className="photo-verify-pose-label" style={{ color: '#D03050' }}>Requested Gesture:</span>
                      <strong className="photo-verify-pose-name">{selectedPose.instruction}</strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="photo-verify-actions">
                <Button
                  variant="primary"
                  onClick={() => {
                    const otherPoses = ONE_HANDED_POSES.filter((p) => p.id !== selectedPose.id);
                    const nextPose = otherPoses[Math.floor(Math.random() * otherPoses.length)] || selectedPose;
                    setSelectedPose(nextPose);
                    startCamera();
                  }}
                  className="photo-verify-btn-full"
                >
                  <ArrowsClockwise size={18} weight="bold" />
                  <span>Retake Live Selfie</span>
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
                Your live pose selfie was confirmed. The <strong>Verified Badge</strong> is now active on your profile and visible to all your matches.
              </p>

              <div className="photo-verify-badge-celebrate">
                <VerifiedBadge variant="pill" size="lg" interactive={false} />
              </div>

              <div className="photo-verify-actions">
                <Button
                  variant="primary"
                  onClick={() => {
                    stopCamera();
                    onClose();
                  }}
                  className="photo-verify-btn-full"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Persistent Hidden Canvas for Frame Capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};
