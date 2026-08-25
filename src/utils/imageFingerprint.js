/**
 * imageFingerprint.js
 * High-performance client-side exact & perceptual duplicate image detection.
 * Uses SHA-256 for identical file matching and 64-bit dHash (Difference Hash)
 * for detecting visually identical / re-compressed / cropped images.
 */

export const DUPLICATE_PHOTO_MESSAGE =
  "You’ve already added this photo! Please upload different pictures to showcase more sides of yourself";

/**
 * Computes exact SHA-256 hash of a File or Blob.
 * @param {File|Blob} file
 * @returns {Promise<string>} Hex string hash
 */
export async function computeFileSha256(file) {
  try {
    if (!file || typeof file.arrayBuffer !== 'function') return '';
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.warn('SHA-256 computation error:', err);
    return '';
  }
}

/**
 * Loads an image from a File, Blob, or URL into an HTMLImageElement.
 * @param {File|Blob|string} src
 * @returns {Promise<HTMLImageElement>}
 */
function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrl = null;
    if (src instanceof Blob || src instanceof File) {
      objectUrl = URL.createObjectURL(src);
      img.src = objectUrl;
    } else if (typeof src === 'string') {
      img.src = src;
    } else {
      return reject(new Error('Invalid image source'));
    }

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = (e) => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for fingerprinting'));
    };
  });
}

/**
 * Computes a 64-bit Difference Hash (dHash) using a 9x8 canvas.
 * @param {File|Blob|string} imageSource
 * @returns {Promise<string>} 16-character hex dHash
 */
export async function computeImageDHash(imageSource) {
  try {
    const img = await loadImageElement(imageSource);
    const width = 9;
    const height = 8;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return '';

    ctx.drawImage(img, 0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height).data;

    // Convert to grayscale values
    const grays = [];
    for (let i = 0; i < imgData.length; i += 4) {
      // Standard luminance formula
      const gray = imgData[i] * 0.299 + imgData[i + 1] * 0.587 + imgData[i + 2] * 0.114;
      grays.push(gray);
    }

    // Compute difference between adjacent pixels row by row
    let binaryHash = '';
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width - 1; col++) {
        const left = grays[row * width + col];
        const right = grays[row * width + col + 1];
        binaryHash += left > right ? '1' : '0';
      }
    }

    // Convert 64-bit binary to 16-char hex
    let hexHash = '';
    for (let i = 0; i < 64; i += 4) {
      const nibble = binaryHash.substring(i, i + 4);
      hexHash += parseInt(nibble, 2).toString(16);
    }

    return hexHash;
  } catch (err) {
    console.warn('dHash computation error (likely cross-origin or format issue):', err);
    return '';
  }
}

/**
 * Computes Hamming Distance between two hex hashes of equal length.
 * @param {string} hash1
 * @param {string} hash2
 * @returns {number} Distance (number of differing bits, 0 to 64)
 */
export function getHammingDistance(hash1, hash2) {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) return 64;
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    const v1 = parseInt(hash1[i], 16);
    const v2 = parseInt(hash2[i], 16);
    let xor = v1 ^ v2;
    while (xor > 0) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
}

/**
 * Checks if a new photo matches any existing photo in an array of photo URLs/files.
 * @param {File|Blob|string} newPhoto
 * @param {Array<string|File|Blob>} existingPhotos
 * @param {number} maxHammingDistance - Threshold for visual duplication (default 6 bits difference out of 64)
 * @returns {Promise<{ isDuplicate: boolean, duplicateIndex: number, message: string }>}
 */
export async function checkPhotoDuplicate(newPhoto, existingPhotos = [], maxHammingDistance = 6) {
  if (!newPhoto || !Array.isArray(existingPhotos) || existingPhotos.length === 0) {
    return { isDuplicate: false, duplicateIndex: -1, message: '' };
  }

  // Filter valid existing photos
  const validExisting = existingPhotos
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => Boolean(item));

  if (validExisting.length === 0) {
    return { isDuplicate: false, duplicateIndex: -1, message: '' };
  }

  // 1. Check SHA-256 for exact binary match if newPhoto is a File/Blob
  let newSha = '';
  if (newPhoto instanceof Blob || newPhoto instanceof File) {
    newSha = await computeFileSha256(newPhoto);
  }

  // 2. Compute visual dHash
  const newDHash = await computeImageDHash(newPhoto);

  // Compare against each existing photo
  for (const { item, index } of validExisting) {
    // If exact same URL or data string
    if (typeof newPhoto === 'string' && typeof item === 'string' && newPhoto === item) {
      return {
        isDuplicate: true,
        duplicateIndex: index,
        message: DUPLICATE_PHOTO_MESSAGE
      };
    }

    // Check exact SHA-256 if item is also a File/Blob
    if (newSha && (item instanceof Blob || item instanceof File)) {
      const itemSha = await computeFileSha256(item);
      if (itemSha && newSha === itemSha) {
        return {
          isDuplicate: true,
          duplicateIndex: index,
          message: DUPLICATE_PHOTO_MESSAGE
        };
      }
    }

    // Check visual perceptual dHash
    if (newDHash) {
      const itemDHash = await computeImageDHash(item);
      if (itemDHash) {
        const distance = getHammingDistance(newDHash, itemDHash);
        if (distance <= maxHammingDistance) {
          return {
            isDuplicate: true,
            duplicateIndex: index,
            message: DUPLICATE_PHOTO_MESSAGE
          };
        }
      }
    }
  }

  return { isDuplicate: false, duplicateIndex: -1, message: '' };
}
