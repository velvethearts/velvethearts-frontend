export const DEFAULT_FEMALE_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500';
export const DEFAULT_MALE_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500';
export const DEFAULT_NEUTRAL_AVATAR = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500';

/**
 * Returns the default placeholder photo based on user gender.
 * @param {string} gender - Gender string ('Man', 'Woman', 'Male', 'Female', etc.)
 * @returns {string} Image URL
 */
export function getDefaultAvatar(gender) {
  if (!gender) return DEFAULT_FEMALE_AVATAR;

  const g = String(gender).toLowerCase().trim();

  if (g === 'man' || g === 'male' || g === 'trans man' || g.includes('man') || g.includes('male')) {
    return DEFAULT_MALE_AVATAR;
  }

  if (g === 'woman' || g === 'female' || g === 'trans woman' || g.includes('woman') || g.includes('female')) {
    return DEFAULT_FEMALE_AVATAR;
  }

  return DEFAULT_NEUTRAL_AVATAR;
}

/**
 * Returns an array of valid photo URL strings from a profile object.
 * @param {object} profile - Profile object
 * @returns {string[]} Array of image URL strings
 */
export function extractPhotoUrls(profile) {
  if (!profile) return [];

  let list = [];

  if (Array.isArray(profile.photos) && profile.photos.length > 0) {
    list = profile.photos.map(p => {
      if (!p) return null;
      if (typeof p === 'string') return p.trim() || null;
      if (typeof p === 'object') {
        return p.secureUrl || p.url || p.cloudinaryPublicId || p.src || null;
      }
      return null;
    }).filter(Boolean);
  }

  if (list.length === 0 && profile.photo) {
    const p = profile.photo;
    const url = typeof p === 'string' ? p.trim() : (p && typeof p === 'object' ? p.secureUrl || p.url : null);
    if (url) list.push(url);
  }

  if (list.length === 0 && profile.avatar) {
    list = [profile.avatar];
  }

  return list;
}

/**
 * Returns the primary profile photo or fallback avatar based on gender.
 * @param {object} profile - Profile object
 * @param {string} [fallbackGender] - Optional fallback gender
 * @returns {string} Image URL
 */
export function getProfilePhoto(profile, fallbackGender) {
  const photos = extractPhotoUrls(profile);
  if (photos.length > 0) {
    return photos[0];
  }

  return getDefaultAvatar(profile?.gender || fallbackGender);
}
