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
 * Returns the profile photo or fallback avatar based on gender.
 * @param {object} profile - Profile object
 * @param {string} [fallbackGender] - Optional fallback gender
 * @returns {string} Image URL
 */
export function getProfilePhoto(profile, fallbackGender) {
  if (!profile) return getDefaultAvatar(fallbackGender);

  if (Array.isArray(profile.photos) && profile.photos.length > 0 && profile.photos[0]) {
    return profile.photos[0];
  }

  if (profile.photo) {
    return profile.photo;
  }

  return getDefaultAvatar(profile.gender || fallbackGender);
}
