/**
 * Computes a dynamic Vibe Match percentage between two user profiles.
 * Baseline starts at 50%.
 * +8% per shared interest (preset or custom)
 * +12% for matching relationship seeking intent
 * +6% for matching city/location
 * +4% for verified status
 * Clamped between 50% and 98%.
 */
export function computeVibeMatch(userProfile, targetProfile) {
  if (!targetProfile) return 65;
  let score = 50;

  const userInterests = userProfile?.interests || [];
  const targetInterests = targetProfile?.interests || [];
  const sharedCount = targetInterests.filter(i => 
    userInterests.some(ui => ui.trim().toLowerCase() === i.trim().toLowerCase())
  ).length;

  // Shared interests boost
  score += sharedCount * 8;

  // Relationship intent match
  if (userProfile?.relationshipIntent && targetProfile?.relationshipIntent) {
    const uIntent = userProfile.relationshipIntent.toLowerCase();
    const tIntent = targetProfile.relationshipIntent.toLowerCase();
    if (uIntent === tIntent || uIntent.includes(tIntent) || tIntent.includes(uIntent)) {
      score += 12;
    }
  }

  // City match
  if (userProfile?.city && targetProfile?.city) {
    if (userProfile.city.trim().toLowerCase() === targetProfile.city.trim().toLowerCase()) {
      score += 6;
    }
  }

  // Verified boost
  if (targetProfile?.verified) {
    score += 4;
  }

  return Math.min(Math.max(score, 50), 98);
}
