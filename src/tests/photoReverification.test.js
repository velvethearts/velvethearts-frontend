import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  isSkinOrFacePixel,
  computeSobelEdgeMagnitude,
  detectFacialOcclusion,
  detectImageBlur,
  detectLightingQuality,
  detectHeadPoseAngle
} from '../utils/faceBiometrics.js';

describe('Photo Biometrics & Re-Verification Suite', () => {

  describe('1. Pixel & Edge Gradient Analysis', () => {
    test('isSkinOrFacePixel accurately detects skin tone and rejects darkness', () => {
      // Dark/black pixel
      assert.strictEqual(isSkinOrFacePixel(5, 5, 5), false);
      // Neutral gray/white
      assert.strictEqual(isSkinOrFacePixel(200, 200, 200), false);
      // Skin tone chrominance (R > G > B)
      assert.strictEqual(isSkinOrFacePixel(180, 130, 110), true);
    });

    test('computeSobelEdgeMagnitude calculates gradient for texture/edges', () => {
      const width = 10;
      const height = 10;
      const data = new Uint8ClampedArray(width * height * 4);

      // Create a vertical edge (left dark, right bright)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const lum = x >= 5 ? 255 : 0;
          data[idx] = lum;
          data[idx + 1] = lum;
          data[idx + 2] = lum;
          data[idx + 3] = 255;
        }
      }

      // Center pixel on the edge (x=4, y=5)
      const edgeMagnitude = computeSobelEdgeMagnitude(data, width, height, 4, 5);
      assert.ok(edgeMagnitude > 0, 'Edge magnitude should detect gradient step');

      // Flat region (x=1, y=1)
      const flatMagnitude = computeSobelEdgeMagnitude(data, width, height, 1, 1);
      assert.strictEqual(flatMagnitude, 0, 'Flat region should have 0 edge gradient');
    });
  });

  describe('2. Face Quality & Anti-Catfish Checks', () => {
    test('detectFacialOcclusion flags occluded face when eyes/mouth are covered', () => {
      const size = 100;
      const occludedData = new Uint8ClampedArray(size * size * 4); // All black (no face/skin)
      const result = detectFacialOcclusion(occludedData, size);
      assert.strictEqual(result.isOccluded, true);
      assert.ok(result.reason.includes('covered or obscured'));
    });

    test('detectLightingQuality catches severe darkness and overexposure', () => {
      const size = 100;
      // Too dark (all 0s)
      const darkData = new Uint8ClampedArray(size * size * 4);
      const darkResult = detectLightingQuality(darkData, size);
      assert.strictEqual(darkResult.isBadLighting, true);
      assert.ok(darkResult.reason.includes('too dark'));

      // Too bright (all 255s)
      const brightData = new Uint8ClampedArray(size * size * 4).fill(255);
      const brightResult = detectLightingQuality(brightData, size);
      assert.strictEqual(brightResult.isBadLighting, true);
      assert.ok(brightResult.reason.includes('glare') || brightResult.reason.includes('overexposure'));
    });

    test('detectHeadPoseAngle checks facial symmetry and rejects severe side profile angles', () => {
      const size = 100;
      const sidePoseData = new Uint8ClampedArray(size * size * 4);

      // Fill only the right half with strong gradients, leave left flat
      for (let y = 20; y < 80; y++) {
        for (let x = 50; x < 82; x++) {
          const idx = (y * size + x) * 4;
          const val = (x % 2 === 0) ? 255 : 0;
          sidePoseData[idx] = val;
          sidePoseData[idx + 1] = val;
          sidePoseData[idx + 2] = val;
          sidePoseData[idx + 3] = 255;
        }
      }

      const poseResult = detectHeadPoseAngle(sidePoseData, size);
      assert.strictEqual(poseResult.isSideAngle, true);
      assert.ok(poseResult.reason.includes('Side profile angles are not permitted'));
    });
  });

  describe('3. Primary Photo Re-Verification State Machine Logic', () => {
    // Model of the state evaluation function used in EditProfile
    const evaluatePrimaryPhotoChange = ({
      currentPhotos,
      newPhotos,
      isVerified,
      biometricMatchScore
    }) => {
      const oldPrimary = currentPhotos[0] || null;
      const newPrimary = newPhotos[0] || null;

      // 1. If user was not verified to begin with, status stays false
      if (!isVerified) {
        return { shouldRemainVerified: false, promptReverify: false };
      }

      // 2. If all photos removed
      if (!newPrimary) {
        return { shouldRemainVerified: false, promptReverify: false };
      }

      // 3. If primary photo (slot 1) is unchanged (e.g. secondary photos modified/added/deleted)
      if (oldPrimary === newPrimary) {
        return { shouldRemainVerified: true, promptReverify: false };
      }

      // 4. Primary photo changed -> evaluate biometric match score against verified reference
      if (biometricMatchScore !== undefined) {
        if (biometricMatchScore >= 0.32) {
          // Authentic face match -> seamlessly retain verified badge
          return { shouldRemainVerified: true, promptReverify: false };
        } else {
          // Face mismatch / distinct person -> pause badge and prompt re-verify
          return { shouldRemainVerified: false, promptReverify: true };
        }
      }

      // Default fallback
      return { shouldRemainVerified: false, promptReverify: true };
    };

    test('Case A: Adding/Modifying secondary photos (slots 2-6) retains verification status with zero prompt', () => {
      const result = evaluatePrimaryPhotoChange({
        currentPhotos: ['https://cdn.example.com/primary.jpg', 'https://cdn.example.com/old_sub.jpg'],
        newPhotos: ['https://cdn.example.com/primary.jpg', 'https://cdn.example.com/new_sub1.jpg', 'https://cdn.example.com/new_sub2.jpg'],
        isVerified: true
      });

      assert.strictEqual(result.shouldRemainVerified, true);
      assert.strictEqual(result.promptReverify, false);
    });

    test('Case B: Primary photo replaced with matching biometric face retains verification status', () => {
      const result = evaluatePrimaryPhotoChange({
        currentPhotos: ['https://cdn.example.com/selfie1.jpg'],
        newPhotos: ['https://cdn.example.com/selfie2_same_person.jpg'],
        isVerified: true,
        biometricMatchScore: 0.78 // High ZNCC structural match
      });

      assert.strictEqual(result.shouldRemainVerified, true);
      assert.strictEqual(result.promptReverify, false);
    });

    test('Case C: Primary photo replaced with non-matching photo / catfish pauses badge and triggers re-verification prompt', () => {
      const result = evaluatePrimaryPhotoChange({
        currentPhotos: ['https://cdn.example.com/alice.jpg'],
        newPhotos: ['https://cdn.example.com/bob_different_person.jpg'],
        isVerified: true,
        biometricMatchScore: 0.18 // Low mismatch score
      });

      assert.strictEqual(result.shouldRemainVerified, false);
      assert.strictEqual(result.promptReverify, true);
    });

    test('Case D: Deleting all photos removes verification without redundant prompt', () => {
      const result = evaluatePrimaryPhotoChange({
        currentPhotos: ['https://cdn.example.com/alice.jpg'],
        newPhotos: [],
        isVerified: true
      });

      assert.strictEqual(result.shouldRemainVerified, false);
      assert.strictEqual(result.promptReverify, false);
    });

    test('Case E: Unverified user changing photos stays unverified without unwanted alerts', () => {
      const result = evaluatePrimaryPhotoChange({
        currentPhotos: ['https://cdn.example.com/unverified1.jpg'],
        newPhotos: ['https://cdn.example.com/unverified2.jpg'],
        isVerified: false
      });

      assert.strictEqual(result.shouldRemainVerified, false);
      assert.strictEqual(result.promptReverify, false);
    });
  });
});
