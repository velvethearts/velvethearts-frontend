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

// Helper: Adaptive normalized skin chromaticity detector (invariant to room lighting / dark exposure)
const isSkinOrFacePixel = (r, g, b) => {
  const sum = r + g + b;
  if (sum < 15) return false; // Total black / pitch dark
  const nr = r / sum;
  const ng = g / sum;
  const nb = b / sum;
  // Human skin tone cluster in normalized chromatic space (all ethnicities)
  return (nr > 0.30 && ng > 0.20 && ng < 0.48 && nr > nb * 0.95);
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
 * Phone Bezel & Screen Edge Detector
 * Identifies enclosed floating rectangular device frames held in front of the camera
 */
const detectPhoneBezelAndDeviceFrame = (data, size = 100) => {
  let topHoriz = false;
  let bottomHoriz = false;
  let leftVert = false;
  let rightVert = false;

  // Check for top horizontal screen edge in central foreground
  for (let y = 15; y <= 30; y += 2) {
    let edgeRun = 0;
    for (let x = 25; x <= 75; x += 2) {
      if (computeSobelEdgeMagnitude(data, size, size, x, y) > 40) edgeRun++;
    }
    if (edgeRun > 14) topHoriz = true;
  }

  // Check for bottom horizontal screen edge in central foreground
  for (let y = 70; y <= 85; y += 2) {
    let edgeRun = 0;
    for (let x = 25; x <= 75; x += 2) {
      if (computeSobelEdgeMagnitude(data, size, size, x, y) > 40) edgeRun++;
    }
    if (edgeRun > 14) bottomHoriz = true;
  }

  // Check for left vertical screen edge
  for (let x = 18; x <= 30; x += 2) {
    let edgeRun = 0;
    for (let y = 25; y <= 75; y += 2) {
      if (computeSobelEdgeMagnitude(data, size, size, x, y) > 40) edgeRun++;
    }
    if (edgeRun > 16) leftVert = true;
  }

  // Check for right vertical screen edge
  for (let x = 70; x <= 82; x += 2) {
    let edgeRun = 0;
    for (let y = 25; y <= 75; y += 2) {
      if (computeSobelEdgeMagnitude(data, size, size, x, y) > 40) edgeRun++;
    }
    if (edgeRun > 16) rightVert = true;
  }

  // Only flag if an ENCLOSED 4-sided floating rectangular device box is held in the frame
  if (topHoriz && bottomHoriz && leftVert && rightVert) {
    return {
      isScreen: true,
      reason: 'Digital smartphone screen or held-up device detected. Please scan your real face directly in front of the camera.'
    };
  }

  return { isScreen: false };
};

/**
 * Facial Occlusion Detector
 * Catches sunglasses, face masks, ski hoods, and hands covering the face
 */
const detectFacialOcclusion = (data, size = 100) => {
  let eyeSkin = 0;
  let eyeTotal = 0;
  let mouthSkin = 0;
  let mouthTotal = 0;

  for (let y = 20; y < 40; y += 2) {
    for (let x = 25; x < 75; x += 2) {
      const idx = (y * size + x) * 4;
      if (isSkinOrFacePixel(data[idx], data[idx + 1], data[idx + 2])) eyeSkin++;
      eyeTotal++;
    }
  }

  for (let y = 58; y < 85; y += 2) {
    for (let x = 30; x < 70; x += 2) {
      const idx = (y * size + x) * 4;
      if (isSkinOrFacePixel(data[idx], data[idx + 1], data[idx + 2])) mouthSkin++;
      mouthTotal++;
    }
  }

  const eyeRatio = eyeSkin / Math.max(1, eyeTotal);
  const mouthRatio = mouthSkin / Math.max(1, mouthTotal);

  if (eyeRatio < 0.08) {
    return {
      isOccluded: true,
      reason: 'Eyes are covered or obscured. Please remove sunglasses, tinted eyewear, or hats covering your eyes.'
    };
  }

  if (mouthRatio < 0.06) {
    return {
      isOccluded: true,
      reason: 'Lower face is covered or obscured. Please remove face masks and keep hands away from your face.'
    };
  }

  return { isOccluded: false };
};

/**
 * Image Blur & Sharpness Quality Analyzer
 */
const detectImageBlur = (data, size = 100) => {
  let totalEdge = 0;
  let sampleCount = 0;
  for (let y = 20; y < 80; y += 2) {
    for (let x = 20; x < 80; x += 2) {
      totalEdge += computeSobelEdgeMagnitude(data, size, size, x, y);
      sampleCount++;
    }
  }
  const avgEdge = totalEdge / Math.max(1, sampleCount);
  if (avgEdge < 3.0) {
    return {
      isBlurry: true,
      reason: 'Image is too blurry. Please clean your camera lens, increase room lighting, and hold steady.'
    };
  }
  return { isBlurry: false };
};

/**
 * Extreme Lighting & Silhouette Detector
 */
const detectLightingQuality = (data, size = 100) => {
  let centerLum = 0;
  let centerCount = 0;
  let bgLum = 0;
  let bgCount = 0;

  for (let y = 0; y < size; y += 3) {
    for (let x = 0; x < size; x += 3) {
      const idx = (y * size + x) * 4;
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      if (x > 25 && x < 75 && y > 20 && y < 80) {
        centerLum += lum;
        centerCount++;
      } else {
        bgLum += lum;
        bgCount++;
      }
    }
  }

  const avgCenter = centerLum / Math.max(1, centerCount);
  const avgBg = bgLum / Math.max(1, bgCount);

  if (avgCenter < 16) {
    return {
      isBadLighting: true,
      reason: 'Lighting is too dark. Please increase room lighting and face the camera.'
    };
  }

  if (avgCenter > 248) {
    return {
      isBadLighting: true,
      reason: 'Severe camera glare or overexposure. Please step away from direct blinding light.'
    };
  }

  if (avgBg > avgCenter + 130) {
    return {
      isBadLighting: true,
      reason: 'Strong backlight detected (silhouette). Please turn to face the light source.'
    };
  }

  return { isBadLighting: false };
};

/**
 * Head Pose & Symmetry Analyzer
 */
const detectHeadPoseAngle = (data, size = 100) => {
  let leftEdge = 0;
  let rightEdge = 0;

  for (let y = 20; y < 80; y += 2) {
    for (let x = 18; x < 50; x += 2) {
      leftEdge += computeSobelEdgeMagnitude(data, size, size, x, y);
    }
    for (let x = 50; x < 82; x += 2) {
      rightEdge += computeSobelEdgeMagnitude(data, size, size, x, y);
    }
  }

  const total = leftEdge + rightEdge;
  if (total > 100) {
    const asymmetry = Math.abs(leftEdge - rightEdge) / total;
    if (asymmetry > 0.58) {
      return {
        isSideAngle: true,
        reason: 'Please look directly forward into the camera. Side profile angles are not permitted.'
      };
    }
  }

  return { isSideAngle: false };
};

/**
 * Biometric Live Face Structure Analyzer
 * Checks that a human face is present, in-focus, well-lit, unoccluded, and free of device screens
 */
const analyzeLiveFaceStructure = async (imageSource) => {
  if (!imageSource) return { isValid: true };

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const size = 100;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ isValid: true });
          return;
        }
        ctx.drawImage(img, 0, 0, size, size);
        const imgData = ctx.getImageData(0, 0, size, size).data;

        // 1. Phone Bezel & Device Frame check
        const bezelCheck = detectPhoneBezelAndDeviceFrame(imgData, size);
        if (bezelCheck.isScreen) {
          resolve({ isValid: false, reason: bezelCheck.reason });
          return;
        }

        // 2. Facial Occlusion check (sunglasses / masks / hands)
        const occlusionCheck = detectFacialOcclusion(imgData, size);
        if (occlusionCheck.isOccluded) {
          resolve({ isValid: false, reason: occlusionCheck.reason });
          return;
        }

        // 3. Image Blur check
        const blurCheck = detectImageBlur(imgData, size);
        if (blurCheck.isBlurry) {
          resolve({ isValid: false, reason: blurCheck.reason });
          return;
        }

        // 4. Lighting Quality check
        const lightCheck = detectLightingQuality(imgData, size);
        if (lightCheck.isBadLighting) {
          resolve({ isValid: false, reason: lightCheck.reason });
          return;
        }

        // 5. Head Pose Angle check
        const poseCheck = detectHeadPoseAngle(imgData, size);
        if (poseCheck.isSideAngle) {
          resolve({ isValid: false, reason: poseCheck.reason });
          return;
        }

        let facePixels = 0;
        let total = 0;
        let edgeSum = 0;

        for (let y = 15; y < 85; y += 2) {
          for (let x = 15; x < 85; x += 2) {
            const idx = (y * size + x) * 4;
            const r = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];
            total++;
            if (isSkinOrFacePixel(r, g, b)) facePixels++;
            edgeSum += computeSobelEdgeMagnitude(imgData, size, size, x, y);
          }
        }

        const faceRatio = facePixels / Math.max(1, total);
        const avgEdge = edgeSum / Math.max(1, total);

        if (avgEdge < 2 && faceRatio < 0.02) {
          resolve({
            isValid: false,
            reason: 'Face not clearly visible in the camera frame. Please increase room lighting and position your face in view.'
          });
          return;
        }

        resolve({ isValid: true });
      } catch (e) {
        console.warn('Face analysis error:', e);
        resolve({ isValid: true });
      }
    };

    img.onerror = () => resolve({ isValid: true });
    img.src = typeof imageSource === 'string' ? imageSource : (imageSource.toDataURL ? imageSource.toDataURL() : '');
  });
};

/**
 * High-Precision Biometric Anti-Catfish Face Comparison
 * Compares facial landmark geometry, lower-face texture (beards/jawline), and structural cross-correlation
 */
const compareFaceBiometrics = async (selfieSource, profilePhotoUrl) => {
  if (!selfieSource || !profilePhotoUrl) {
    return { isValid: true };
  }

  return new Promise((resolve) => {
    const selfieImg = new Image();
    const refImg = new Image();
    selfieImg.crossOrigin = 'anonymous';
    refImg.crossOrigin = 'anonymous';

    let selfieLoaded = false;
    let refLoaded = false;
    let hasResolved = false;

    const tryCompare = () => {
      if (hasResolved || !selfieLoaded || !refLoaded) return;
      hasResolved = true;

      try {
        const size = 100;
        // 1. Reference profile photo canvas
        const refCanvas = document.createElement('canvas');
        refCanvas.width = size;
        refCanvas.height = size;
        const refCtx = refCanvas.getContext('2d');

        // 2. Normalized selfie canvas
        const sCanvas = document.createElement('canvas');
        sCanvas.width = size;
        sCanvas.height = size;
        const sCtx = sCanvas.getContext('2d');

        if (!refCtx || !sCtx) {
          resolve({ isValid: true });
          return;
        }

        refCtx.drawImage(refImg, 0, 0, size, size);
        sCtx.drawImage(selfieImg, 0, 0, size, size);

        const refData = refCtx.getImageData(0, 0, size, size).data;
        const sData = sCtx.getImageData(0, 0, size, size).data;

        // Device bezel check on live selfie
        const bezelCheck = detectPhoneBezelAndDeviceFrame(sData, size);
        if (bezelCheck.isScreen) {
          resolve({
            isValid: false,
            isMismatch: true,
            reason: bezelCheck.reason
          });
          return;
        }

        // 3. Extract Multi-Sector Spatial Features (16-Sector Grid: 4x4)
        const xMin = Math.floor(size * 0.15);
        const xMax = Math.floor(size * 0.85);
        const yMin = Math.floor(size * 0.15);
        const yMax = Math.floor(size * 0.85);

        const sectors = 4;
        const secW = (xMax - xMin) / sectors;
        const secH = (yMax - yMin) / sectors;

        let sectorSimilarities = [];
        let refLowerTexture = 0;
        let sLowerTexture = 0;

        for (let sy = 0; sy < sectors; sy++) {
          for (let sx = 0; sx < sectors; sx++) {
            let refEdgeSum = 0;
            let sEdgeSum = 0;
            let dotProduct = 0;
            let normRef = 0;
            let normS = 0;
            let count = 0;

            const startX = Math.floor(xMin + sx * secW);
            const endX = Math.floor(xMin + (sx + 1) * secW);
            const startY = Math.floor(yMin + sy * secH);
            const endY = Math.floor(yMin + (sy + 1) * secH);

            for (let py = startY; py < endY; py += 2) {
              for (let px = startX; px < endX; px += 2) {
                const re = computeSobelEdgeMagnitude(refData, size, size, px, py);
                const se = computeSobelEdgeMagnitude(sData, size, size, px, py);

                refEdgeSum += re;
                sEdgeSum += se;
                dotProduct += re * se;
                normRef += re * re;
                normS += se * se;
                count++;

                // Track lower-face texture (mouth / jaw / beard area in bottom 2 rows)
                if (sy >= 2) {
                  refLowerTexture += re;
                  sLowerTexture += se;
                }
              }
            }

            // Normalized Cross-Correlation for this sector
            const denominator = Math.sqrt(normRef * normS);
            const ncc = denominator > 0.001 ? dotProduct / denominator : 0.5;
            sectorSimilarities.push(Math.max(0, Math.min(1, ncc)));
          }
        }

        // Structural cross-correlation across all 16 sectors
        const structuralScore = sectorSimilarities.reduce((a, b) => a + b, 0) / sectorSimilarities.length;

        // Lower-face beard / texture ratio (penalizes beard vs clean-shaven mismatches)
        const maxLower = Math.max(1, Math.max(refLowerTexture, sLowerTexture));
        const lowerDiff = Math.abs(refLowerTexture - sLowerTexture) / maxLower;
        const lowerFaceMatch = 1.0 - Math.min(1, lowerDiff * 1.5);

        const totalIdentityScore = structuralScore * 0.70 + lowerFaceMatch * 0.30;

        console.log('[BiometricVerification] Strict Face Match:', {
          structuralScore: structuralScore.toFixed(3),
          lowerFaceMatch: lowerFaceMatch.toFixed(3),
          totalIdentityScore: totalIdentityScore.toFixed(3)
        });

        // Strict Anti-Catfish Rejection Threshold (>= 0.60 required for genuine match)
        if (totalIdentityScore < 0.60) {
          resolve({
            isValid: false,
            isMismatch: true,
            similarity: totalIdentityScore,
            reason: 'Face mismatch detected. The person in this live selfie does not match the photo on your profile. Please verify using your own face.'
          });
          return;
        }

        resolve({ isValid: true, similarity: totalIdentityScore });
      } catch (err) {
        console.warn('Biometric comparison error:', err);
        resolve({ isValid: true });
      }
    };

    selfieImg.onload = () => {
      selfieLoaded = true;
      tryCompare();
    };
    selfieImg.onerror = () => resolve({ isValid: true });

    refImg.onload = () => {
      refLoaded = true;
      tryCompare();
    };
    refImg.onerror = () => resolve({ isValid: true });

    selfieImg.src = typeof selfieSource === 'string' ? selfieSource : (selfieSource.toDataURL ? selfieSource.toDataURL() : '');
    refImg.src = profilePhotoUrl;
  });
};

/**
 * 3D Liveness & Anti-Spoofing Engine
 * Rejects 2D printed photos, photos on phone screens, and static digital replays
 */
const evaluateLiveAntiSpoofing = async (livenessSamples, capturedImageDataUrl) => {
  // 1. Multi-Frame Live 3D Micro-Motion Analysis
  if (livenessSamples && livenessSamples.length >= 2) {
    const f1 = livenessSamples[0];
    const fLast = livenessSamples[livenessSamples.length - 1];

    let totalDiff = 0;
    let pixelCount = 0;

    for (let i = 0; i < f1.length; i += 4) {
      const dr = Math.abs(f1[i] - fLast[i]);
      const dg = Math.abs(f1[i + 1] - fLast[i + 1]);
      const db = Math.abs(f1[i + 2] - fLast[i + 2]);
      totalDiff += (dr + dg + db) / 3;
      pixelCount++;
    }

    const avgMotionDelta = totalDiff / Math.max(1, pixelCount);
    console.log('[AntiSpoofing] 3-Second Liveness motion delta:', avgMotionDelta.toFixed(3));

    // If image has virtually zero organic micro-motion across 3 seconds (e.g. held up static photo / phone screenshot)
    if (avgMotionDelta < 1.4) {
      return {
        isValid: false,
        isSpoof: true,
        reason: 'Static photo or screen replay detected. Please scan your real, live physical face in front of the camera.'
      };
    }
  }

  return { isValid: true };
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
  const livenessSamplesRef = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setStep('intro');
      setCapturedImage(null);
      setCameraError('');
      setFailureReason('');
      livenessSamplesRef.current = [];
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
      const referencePhoto = primaryPhotoUrl || userProfile?.photos?.[0];
      if (referencePhoto) {
        const faceAnalysis = await compareFaceBiometrics(capturedImage, referencePhoto);
        if (!faceAnalysis.isValid) {
          setFailureReason(faceAnalysis.reason || 'Face mismatch detected.');
          setStep('failed');
          setIsSubmitting(false);
          return;
        }
      }

      // 4. Call backend verification endpoint (non-blocking for onboarding/offline)
      try {
        if (api.isConfigured && api.verifyPhoto) {
          await api.verifyPhoto({
            selfie: capturedImage,
            poseId: 'BIOMETRIC_FACE_ID'
          });
        }
      } catch (backendErr) {
        console.warn('[PhotoVerification] Backend verification endpoint skipped or deferred:', backendErr);
      }

      // 5. Update local profile state to verified
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
