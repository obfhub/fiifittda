const MEMBERSHIP_STORAGE_KEY = 'fiifit_memberships';

export const memberVideos = [
  {
    title: 'Start aici: cum folosesti programul',
    duration: '08 min',
    type: 'Orientare'
  },
  {
    title: 'Bazele slabirii sanatoase',
    duration: '18 min',
    type: 'Nutritie'
  },
  {
    title: 'Antrenament full body pentru acasa',
    duration: '32 min',
    type: 'Workout'
  },
  {
    title: 'Organizarea meselor fara stres',
    duration: '14 min',
    type: 'Rutina'
  },
  {
    title: 'Mentinerea rezultatului',
    duration: '21 min',
    type: 'Mindset'
  }
];

export const personalizedPlan = [
  {
    day: 'Luni',
    focus: 'Full body + hidratare',
    action: '30 min antrenament si 2L apa'
  },
  {
    day: 'Marti',
    focus: 'Mese simple',
    action: 'Planifica proteina la fiecare masa'
  },
  {
    day: 'Miercuri',
    focus: 'Live cu Tanya',
    action: 'Participa sau urmareste inregistrarea'
  },
  {
    day: 'Joi',
    focus: 'Tracker',
    action: 'Analizeaza 1 masa si ajusteaza portiile'
  },
  {
    day: 'Vineri',
    focus: 'Mobilitate si pasi',
    action: '20 min miscare usoara + 7000 pasi'
  },
  {
    day: 'Weekend',
    focus: 'Reflectie',
    action: 'Noteaza ce a mers si ce ajustezi'
  }
];

export function getStoredAuth() {
  try {
    const user = JSON.parse(localStorage.getItem('fiifit_user') || 'null');
    const auth = JSON.parse(localStorage.getItem('fiifit_auth') || 'null');
    const expiresAt = Number(auth?.expires_at || 0) * 1000;

    if (!user || !auth?.authenticated) return null;
    if (expiresAt && expiresAt < Date.now()) return null;

    return { user, auth };
  } catch (error) {
    return null;
  }
}

export function getMembershipKey(user) {
  return String(user?.email || user?.id || '').trim().toLowerCase();
}

export function getMemberships() {
  try {
    return JSON.parse(localStorage.getItem(MEMBERSHIP_STORAGE_KEY) || '{}') || {};
  } catch (error) {
    return {};
  }
}

export function getUserMembership(user) {
  if (user?.membership?.status === 'active') {
    return user.membership;
  }

  const key = getMembershipKey(user);
  if (!key) return null;

  const membership = getMemberships()[key];
  if (!membership || membership.status !== 'active') return null;

  return membership;
}

export function hasActivePlan(user) {
  return Boolean(getUserMembership(user));
}

export function saveUserMembership(user, plan) {
  const key = getMembershipKey(user);
  if (!key) return null;

  const normalizedPlan = {
    duration: plan?.duration || 'FiiFit Online',
    price: plan?.price || '275 EUR',
    description: plan?.description || 'Acces complet la program'
  };

  const membership = {
    status: 'active',
    plan: normalizedPlan,
    startedAt: new Date().toISOString(),
    videosUnlocked: memberVideos.length,
    trackerAccess: true
  };

  localStorage.setItem(
    MEMBERSHIP_STORAGE_KEY,
    JSON.stringify({
      ...getMemberships(),
      [key]: membership
    })
  );

  return membership;
}
