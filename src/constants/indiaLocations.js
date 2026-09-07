/**
 * Velvet Hearts — Indian States & Union Territories Dataset & Geodesic Distance Engine
 * Contains all 28 States and 8 Union Territories with capital/centroid coordinates (lat/lng)
 */

export const INDIAN_STATES = [
  // Northern States & UTs
  { code: 'DL', name: 'Delhi', region: 'North', lat: 28.6139, lng: 77.2090, isUT: true },
  { code: 'JK', name: 'Jammu & Kashmir', region: 'North', lat: 34.0837, lng: 74.7973, isUT: true },
  { code: 'LA', name: 'Ladakh', region: 'North', lat: 34.1526, lng: 77.5771, isUT: true },
  { code: 'HP', name: 'Himachal Pradesh', region: 'North', lat: 31.1048, lng: 77.1734, isUT: false },
  { code: 'PB', name: 'Punjab', region: 'North', lat: 30.7333, lng: 76.7794, isUT: false },
  { code: 'CH', name: 'Chandigarh', region: 'North', lat: 30.7333, lng: 76.7794, isUT: true },
  { code: 'HR', name: 'Haryana', region: 'North', lat: 30.7333, lng: 76.7794, isUT: false },
  { code: 'UK', name: 'Uttarakhand', region: 'North', lat: 30.3165, lng: 78.0322, isUT: false },
  { code: 'UP', name: 'Uttar Pradesh', region: 'North', lat: 26.8467, lng: 80.9462, isUT: false },
  { code: 'RJ', name: 'Rajasthan', region: 'North', lat: 26.9124, lng: 75.7873, isUT: false },

  // Western States & UTs
  { code: 'MH', name: 'Maharashtra', region: 'West', lat: 18.9220, lng: 72.8347, isUT: false },
  { code: 'GJ', name: 'Gujarat', region: 'West', lat: 23.2156, lng: 72.6369, isUT: false },
  { code: 'GA', name: 'Goa', region: 'West', lat: 15.4909, lng: 73.8278, isUT: false },
  { code: 'DN', name: 'Dadra and Nagar Haveli & Daman and Diu', region: 'West', lat: 20.4283, lng: 72.8397, isUT: true },

  // Southern States & UTs
  { code: 'KA', name: 'Karnataka', region: 'South', lat: 12.9716, lng: 77.5946, isUT: false },
  { code: 'TS', name: 'Telangana', region: 'South', lat: 17.3850, lng: 78.4867, isUT: false },
  { code: 'AP', name: 'Andhra Pradesh', region: 'South', lat: 16.5062, lng: 80.6480, isUT: false },
  { code: 'TN', name: 'Tamil Nadu', region: 'South', lat: 13.0827, lng: 80.2707, isUT: false },
  { code: 'KL', name: 'Kerala', region: 'South', lat: 8.5241, lng: 76.9366, isUT: false },
  { code: 'PY', name: 'Puducherry', region: 'South', lat: 11.9416, lng: 79.8083, isUT: true },
  { code: 'LD', name: 'Lakshadweep', region: 'South', lat: 10.5667, lng: 72.6417, isUT: true },
  { code: 'AN', name: 'Andaman & Nicobar Islands', region: 'South', lat: 11.6234, lng: 92.7265, isUT: true },

  // Central States
  { code: 'MP', name: 'Madhya Pradesh', region: 'Central', lat: 23.2599, lng: 77.4126, isUT: false },
  { code: 'CG', name: 'Chhattisgarh', region: 'Central', lat: 21.2514, lng: 81.6296, isUT: false },

  // Eastern States
  { code: 'WB', name: 'West Bengal', region: 'East', lat: 22.5726, lng: 88.3639, isUT: false },
  { code: 'OD', name: 'Odisha', region: 'East', lat: 20.2961, lng: 85.8245, isUT: false },
  { code: 'BR', name: 'Bihar', region: 'East', lat: 25.5941, lng: 85.1376, isUT: false },
  { code: 'JH', name: 'Jharkhand', region: 'East', lat: 23.3441, lng: 85.3096, isUT: false },

  // North-Eastern States
  { code: 'AS', name: 'Assam', region: 'Northeast', lat: 26.1445, lng: 91.7362, isUT: false },
  { code: 'SK', name: 'Sikkim', region: 'Northeast', lat: 27.3389, lng: 88.6065, isUT: false },
  { code: 'ML', name: 'Meghalaya', region: 'Northeast', lat: 25.5788, lng: 91.8933, isUT: false },
  { code: 'TR', name: 'Tripura', region: 'Northeast', lat: 23.8315, lng: 91.2868, isUT: false },
  { code: 'MZ', name: 'Mizoram', region: 'Northeast', lat: 23.7271, lng: 92.7176, isUT: false },
  { code: 'MN', name: 'Manipur', region: 'Northeast', lat: 24.8170, lng: 93.9368, isUT: false },
  { code: 'NL', name: 'Nagaland', region: 'Northeast', lat: 25.6751, lng: 94.1086, isUT: false },
  { code: 'AR', name: 'Arunachal Pradesh', region: 'Northeast', lat: 27.0844, lng: 93.6053, isUT: false }
];

// Major Indian city-to-state alias mapping for backward compatibility
const CITY_TO_STATE_MAP = {
  mumbai: 'Maharashtra',
  pune: 'Maharashtra',
  nagpur: 'Maharashtra',
  nashik: 'Maharashtra',
  bangalore: 'Karnataka',
  bengaluru: 'Karnataka',
  mysore: 'Karnataka',
  delhi: 'Delhi',
  'new delhi': 'Delhi',
  ncr: 'Delhi',
  hyderabad: 'Telangana',
  chennai: 'Tamil Nadu',
  coimbatore: 'Tamil Nadu',
  kolkata: 'West Bengal',
  ahmedabad: 'Gujarat',
  surat: 'Gujarat',
  jaipur: 'Rajasthan',
  udaipur: 'Rajasthan',
  lucknow: 'Uttar Pradesh',
  kanpur: 'Uttar Pradesh',
  noida: 'Uttar Pradesh',
  ghaziabad: 'Uttar Pradesh',
  gurgaon: 'Haryana',
  gurugram: 'Haryana',
  chandigarh: 'Chandigarh',
  kochi: 'Kerala',
  thiruvananthapuram: 'Kerala',
  bhopal: 'Madhya Pradesh',
  indore: 'Madhya Pradesh',
  patna: 'Bihar',
  bhubaneswar: 'Odisha',
  ranchi: 'Jharkhand',
  guwahati: 'Assam',
  panaji: 'Goa',
  dehradun: 'Uttarakhand',
  shimla: 'Himachal Pradesh'
};

/**
 * Normalizes any free-form string or city name to the official State/UT name
 */
export function normalizeStateName(input) {
  if (!input || typeof input !== 'string') return '';
  const clean = input.trim();
  const lower = clean.toLowerCase();

  // 1. Direct match with official state name
  const exact = INDIAN_STATES.find(s => s.name.toLowerCase() === lower);
  if (exact) return exact.name;

  // 2. Partial match in official state names
  const partial = INDIAN_STATES.find(s => lower.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(lower));
  if (partial) return partial.name;

  // 3. City alias lookup
  for (const [city, state] of Object.entries(CITY_TO_STATE_MAP)) {
    if (lower.includes(city)) {
      return state;
    }
  }

  return clean;
}

/**
 * Finds state metadata object by name or alias
 */
export function getStateInfo(stateName) {
  const normalized = normalizeStateName(stateName);
  return INDIAN_STATES.find(s => s.name.toLowerCase() === normalized.toLowerCase()) || null;
}

/**
 * Calculates Haversine distance in kilometers between two geo-coordinates
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds the closest Indian state or city from dataset to a given GPS coordinate
 */
export function findNearestStateOrCity(lat, lng) {
  if (lat == null || lng == null) return null;
  let minDistance = Infinity;
  let nearest = null;

  for (const state of INDIAN_STATES) {
    const d = haversineDistance(lat, lng, state.lat, state.lng);
    if (d < minDistance) {
      minDistance = d;
      nearest = state;
    }
  }

  return nearest;
}

/**
 * Calculates distance from user's live GPS coordinates to target profile or city
 * @param {{ lat: number, lng: number }} userGps
 * @param {{ lat?: number, lng?: number, coordinates?: { lat: number, lng: number }, city?: string, location?: string } | string} target
 * @returns {{ distanceKm: number, formatted: string, isLiveGps: boolean } | null}
 */
export function calculateGpsDistance(userGps, target) {
  if (!userGps || userGps.lat == null || userGps.lng == null || !target) {
    return null;
  }

  let targetLat = null;
  let targetLng = null;

  if (typeof target === 'string') {
    const info = getStateInfo(target);
    if (info) {
      targetLat = info.lat;
      targetLng = info.lng;
    }
  } else if (typeof target === 'object') {
    if (target.lat != null && target.lng != null) {
      targetLat = target.lat;
      targetLng = target.lng;
    } else if (target.coordinates?.lat != null && target.coordinates?.lng != null) {
      targetLat = target.coordinates.lat;
      targetLng = target.coordinates.lng;
    } else if (target.city || target.location) {
      const info = getStateInfo(target.city || target.location);
      if (info) {
        targetLat = info.lat;
        targetLng = info.lng;
      }
    }
  }

  if (targetLat == null || targetLng == null) {
    return null;
  }

  const rawKm = haversineDistance(userGps.lat, userGps.lng, targetLat, targetLng);
  const distanceKm = Math.round(rawKm * 10) / 10;

  let formatted = '';
  if (distanceKm < 1) {
    formatted = '< 1 km away';
  } else if (distanceKm < 10) {
    formatted = `${distanceKm.toFixed(1)} km away`;
  } else {
    formatted = `${Math.round(distanceKm)} km away`;
  }

  return {
    distanceKm,
    formatted,
    isLiveGps: true
  };
}

/**
 * Computes the distance in km between two Indian states / user locations
 * @param {string} stateA - User A state or city name
 * @param {string} stateB - User B state or city name
 * @returns {{ distanceKm: number, formatted: string, isSameState: boolean }}
 */
export function calculateStateDistance(stateA, stateB) {
  if (!stateA || !stateB) {
    return { distanceKm: 25, formatted: 'Within India', isSameState: false };
  }

  const sA = getStateInfo(stateA);
  const sB = getStateInfo(stateB);

  if (!sA || !sB) {
    return { distanceKm: 50, formatted: 'Nearby', isSameState: false };
  }

  // Same State: Close proximity
  if (sA.name === sB.name) {
    return {
      distanceKm: 20,
      formatted: 'Same State (< 50 km)',
      isSameState: true
    };
  }

  // Different States: Calculate Haversine geodesic distance
  const km = Math.round(haversineDistance(sA.lat, sA.lng, sB.lat, sB.lng));
  return {
    distanceKm: km,
    formatted: `${km} km away`,
    isSameState: false
  };
}
