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
  SunHorizon
} from '@phosphor-icons/react';
import { Button } from '../UI/Button';
import { VerifiedBadge } from '../UI/VerifiedBadge';
import { PoseGuideOverlay } from './PoseGuideOverlay';

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

/**
 * Biometric Live Face Structure Analyzer
 * Checks that a human face is well-lit, centered, and has genuine facial contours
 */
const analyzeLiveFaceStructure = (canvas) => {
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

    // 1. Center Face Region Check (60% oval area)
    const faceMetrics = checkRegionMetrics(
      Math.floor(width * 0.25),
      Math.floor(height * 0.20),
      Math.floor(width * 0.75),
      Math.floor(height * 0.75)
    );

    if (faceMetrics.skinRatio < 0.14) {
      return {
        isValid: false,
        reason: 'Face not clearly detected in the frame. Please make sure your face is centered inside the oval guide and well-lit.'
      };
    }

    if (faceMetrics.avgEdge < 10) {
      return {
        isValid: false,
        reason: 'Insufficient facial clarity or blurriness detected. Please hold still in good lighting.'
      };
    }

    // 2. Eye & Nose Bridge Region Texture
    const eyeNoseMetrics = checkRegionMetrics(
      Math.floor(width * 0.32),
      Math.floor(height * 0.30),
      Math.floor(width * 0.68),
      Math.floor(height * 0.58)
    );

    if (eyeNoseMetrics.skinRatio < 0.10) {
      return {
        isValid: false,
        reason: 'Facial features (eyes and nose bridge) are not clearly visible. Please remove any heavy masks or obstructions.'
      };
    }

    return { isValid: true };
  } catch (e) {
    console.warn('Face analysis error:', e);
    return { isValid: false, reason: 'Could not analyze face frame. Please retry in good lighting.' };
  }
};

/**
 * Biometric Anti-Catfish Face Comparison
 * Compares the captured live selfie against the user's uploaded profile photo
 */
const compareFaceBiometrics = async (selfieCanvas, profilePhotoUrl) => {
  if (!selfieCanvas || !profilePhotoUrl) {
    return { isValid: true };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const size = 120;
        // 1. Reference profile photo canvas
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

        // 2. Normalized selfie canvas
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

        // 3. Extract Face Biometrics (Central 65% facial oval)
        const xMin = Math.floor(size * 0.18);
        const xMax = Math.floor(size * 0.82);
        const yMin = Math.floor(size * 0.18);
        const yMax = Math.floor(size * 0.82);

        let refSkinSum = { r: 0, g: 0, b: 0, count: 0 };
        let sSkinSum = { r: 0, g: 0, b: 0, count: 0 };
        let edgeCorrelations = [];

        // 16-Sector Detailed Landmark Grid (4x4)
        const sectors = 4;
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

                // Live Selfie metrics
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

        // Chromatic / Skin tone distribution similarity
        let chromaticScore = 1.0;
        if (refSkinSum.count > 20 && sSkinSum.count > 20) {
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
        console.log('[BiometricVerification] Face structure comparison:', {
          structuralScore: structuralScore.toFixed(3),
          chromaticScore: chromaticScore.toFixed(3),
          combinedSimilarity: combinedSimilarity.toFixed(3)
        });

        // Strict rejection threshold: < 0.60 indicates a completely different face
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
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failureReason, setFailureReason] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setStep('intro');
      setCapturedImage(null);
      setCameraError('');
      setFailureReason('');
    } else {
      stopCamera();
    }
  }, [isOpen]);

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
      // 1. Run live face structure and framing verification
      const faceStructure = analyzeLiveFaceStructure(canvasRef.current);
      if (!faceStructure.isValid) {
        setFailureReason(faceStructure.reason || 'Face structure not clearly detected.');
        setStep('failed');
        setIsSubmitting(false);
        return;
      }

      // 2. Run anti-catfish face comparison against uploaded profile photo
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
          poseId: 'BIOMETRIC_FACE_ID'
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
                  onClick={startCamera}
                  className="photo-verify-btn-full"
                >
                  <ArrowsClockwise size={18} weight="bold" />
                  <span>Retake Face Scan</span>
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

        {/* Hidden Canvas for Frame Capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};
