import AsyncStorage from '@react-native-async-storage/async-storage';
import type { House, Spell } from './tidefall';

const KEY = 'tidefall.progress.v4';
const PREVIOUS_KEY = 'tidefall.progress.v3';
const OLD_PROFILE_KEY = 'tidefall.profile';
const OLD_VISITED_KEY = 'tidefall.visitedActivities';

export type DiscoveryKind = 'room' | 'spell' | 'lore' | 'story' | 'activity' | 'secret' | 'quest' | 'achievement';

export type Discovery = {
  id: string;
  title: string;
  kind: DiscoveryKind;
  at: number;
};

export type TidefallProgress = {
  tidePoints: number;
  discoveredRooms: string[];
  spellMastery: Record<string, number>;
  bestCastQuality: Record<string, number>;
  totalCasts: number;
  failedCasts: number;
  foundSecrets: string[];
  completedQuests: string[];
  unlockedAchievements: string[];
  discoveries: Discovery[];
  profile: {
    house?: House;
    favourite?: string;
    title?: string;
  };
  reading: {
    bookOnePercent: number;
  };
};

export const emptyProgress: TidefallProgress = {
  tidePoints: 0,
  discoveredRooms: [],
  spellMastery: {},
  bestCastQuality: {},
  totalCasts: 0,
  failedCasts: 0,
  foundSecrets: [],
  completedQuests: [],
  unlockedAchievements: [],
  discoveries: [],
  profile: {},
  reading: { bookOnePercent: 0 },
};

function clone(progress: TidefallProgress): TidefallProgress {
  return {
    ...progress,
    discoveredRooms: [...progress.discoveredRooms],
    spellMastery: { ...progress.spellMastery },
    bestCastQuality: { ...progress.bestCastQuality },
    foundSecrets: [...progress.foundSecrets],
    completedQuests: [...progress.completedQuests],
    unlockedAchievements: [...progress.unlockedAchievements],
    discoveries: [...progress.discoveries],
    profile: { ...progress.profile },
    reading: { ...progress.reading },
  };
}

function isHouse(value: unknown): value is House {
  return value === 'Brannor' || value === 'Calyx' || value === 'Noctern';
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function numberRecord(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter((entry): entry is [string, number] => typeof entry[1] === 'number' && Number.isFinite(entry[1])),
  );
}

function normalise(parsed: Partial<TidefallProgress>): TidefallProgress {
  const profile = parsed.profile || {};
  return {
    tidePoints: Number.isFinite(Number(parsed.tidePoints)) ? Number(parsed.tidePoints) : 0,
    discoveredRooms: stringArray(parsed.discoveredRooms),
    spellMastery: numberRecord(parsed.spellMastery),
    bestCastQuality: numberRecord(parsed.bestCastQuality),
    totalCasts: Number.isFinite(Number(parsed.totalCasts)) ? Number(parsed.totalCasts) : 0,
    failedCasts: Number.isFinite(Number(parsed.failedCasts)) ? Number(parsed.failedCasts) : 0,
    foundSecrets: stringArray(parsed.foundSecrets),
    completedQuests: stringArray(parsed.completedQuests),
    unlockedAchievements: stringArray(parsed.unlockedAchievements),
    discoveries: Array.isArray(parsed.discoveries) ? parsed.discoveries : [],
    profile: {
      house: isHouse(profile.house) ? profile.house : undefined,
      favourite: typeof profile.favourite === 'string' ? profile.favourite : undefined,
      title: typeof profile.title === 'string' ? profile.title : undefined,
    },
    reading: {
      bookOnePercent: Number.isFinite(Number(parsed.reading?.bookOnePercent)) ? Number(parsed.reading?.bookOnePercent) : 0,
    },
  };
}

export async function loadProgress(): Promise<TidefallProgress> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return normalise(JSON.parse(raw) as Partial<TidefallProgress>);

    const previousRaw = await AsyncStorage.getItem(PREVIOUS_KEY);
    if (previousRaw) {
      const migrated = normalise(JSON.parse(previousRaw) as Partial<TidefallProgress>);
      const estimatedCasts = Object.values(migrated.spellMastery).reduce((sum, mastery) => sum + Math.ceil(mastery / 8), 0);
      migrated.totalCasts = Math.max(migrated.totalCasts, estimatedCasts);
      await saveProgress(migrated);
      return migrated;
    }

    const [oldProfileRaw, oldVisitedRaw] = await Promise.all([
      AsyncStorage.getItem(OLD_PROFILE_KEY),
      AsyncStorage.getItem(OLD_VISITED_KEY),
    ]);
    const oldProfile = oldProfileRaw ? JSON.parse(oldProfileRaw) : {};
    const oldVisited: string[] = oldVisitedRaw ? JSON.parse(oldVisitedRaw) : [];
    const migrated: TidefallProgress = {
      ...emptyProgress,
      tidePoints: oldVisited.length * 15,
      discoveries: oldVisited.map((title, index) => ({
        id: `legacy:${title}`,
        title,
        kind: 'activity' as const,
        at: Date.now() - index,
      })),
      profile: {
        house: isHouse(oldProfile.order) ? oldProfile.order : undefined,
        favourite: typeof oldProfile.favourite === 'string' ? oldProfile.favourite : undefined,
      },
    };
    await saveProgress(migrated);
    return migrated;
  } catch {
    return clone(emptyProgress);
  }
}

export async function saveProgress(progress: TidefallProgress) {
  await AsyncStorage.setItem(KEY, JSON.stringify(progress));
}

export function addPoints(progress: TidefallProgress, points: number): TidefallProgress {
  if (!points) return progress;
  const next = clone(progress);
  next.tidePoints = Math.max(0, next.tidePoints + points);
  return next;
}

export function addDiscovery(
  progress: TidefallProgress,
  discovery: Omit<Discovery, 'at'>,
  points = 25,
): TidefallProgress {
  if (progress.discoveries.some((item) => item.id === discovery.id)) return progress;
  const next = clone(progress);
  next.tidePoints += points;
  next.discoveries = [{ ...discovery, at: Date.now() }, ...next.discoveries].slice(0, 150);
  return next;
}

export function discoverRoom(progress: TidefallProgress, slug: string, title: string): TidefallProgress {
  if (progress.discoveredRooms.includes(slug)) return progress;
  let next = clone(progress);
  next.discoveredRooms.unshift(slug);
  next = addDiscovery(next, { id: `room:${slug}`, title: `${title} discovered`, kind: 'room' }, 70);
  return next;
}

export function castSpell(progress: TidefallProgress, spell: Spell, quality = 80): TidefallProgress {
  let next = clone(progress);
  const cleanQuality = Math.max(0, Math.min(100, Math.round(quality)));
  const before = next.spellMastery[spell.slug] || 0;
  const masteryGain = 4 + Math.floor(cleanQuality / 25);
  next.spellMastery[spell.slug] = Math.min(100, before + masteryGain);
  next.bestCastQuality[spell.slug] = Math.max(next.bestCastQuality[spell.slug] || 0, cleanQuality);
  next.totalCasts += 1;
  next.tidePoints += before < 100 ? 4 + Math.floor(cleanQuality / 20) : 1;
  if (before === 0) {
    next = addDiscovery(next, { id: `spell:${spell.slug}`, title: `${spell.name} cast`, kind: 'spell' }, 35);
  }
  return next;
}

export function recordFailedCast(progress: TidefallProgress): TidefallProgress {
  const next = clone(progress);
  next.failedCasts += 1;
  return next;
}

export function recordSecret(progress: TidefallProgress, slug: string, title: string, points: number): TidefallProgress {
  if (progress.foundSecrets.includes(slug)) return progress;
  let next = clone(progress);
  next.foundSecrets.unshift(slug);
  next.tidePoints += points;
  next = addDiscovery(next, { id: `secret:${slug}`, title: `Secret found: ${title}`, kind: 'secret' }, 0);
  return next;
}

export function completeQuest(progress: TidefallProgress, slug: string, title: string, points: number): TidefallProgress {
  if (progress.completedQuests.includes(slug)) return progress;
  let next = clone(progress);
  next.completedQuests.unshift(slug);
  next.tidePoints += points;
  next = addDiscovery(next, { id: `quest:${slug}`, title: `Quest complete: ${title}`, kind: 'quest' }, 0);
  return next;
}

export function unlockAchievement(progress: TidefallProgress, slug: string, title: string, points: number): TidefallProgress {
  if (progress.unlockedAchievements.includes(slug)) return progress;
  let next = clone(progress);
  next.unlockedAchievements.unshift(slug);
  next.tidePoints += points;
  next = addDiscovery(next, { id: `achievement:${slug}`, title: `Achievement: ${title}`, kind: 'achievement' }, 0);
  return next;
}

export function updateProfile(
  progress: TidefallProgress,
  patch: Partial<TidefallProgress['profile']>,
): TidefallProgress {
  const next = clone(progress);
  next.profile = { ...next.profile, ...patch };
  return next;
}

export function updateReading(progress: TidefallProgress, percent: number): TidefallProgress {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  let next = clone(progress);
  if (clamped > next.reading.bookOnePercent) {
    next.tidePoints += Math.max(1, Math.floor((clamped - next.reading.bookOnePercent) / 2));
  }
  next.reading.bookOnePercent = Math.max(next.reading.bookOnePercent, clamped);
  if (clamped >= 5) {
    next = addDiscovery(next, { id: 'story:book-one-started', title: 'Book One started', kind: 'story' }, 20);
  }
  return next;
}

export function levelFromPoints(points: number) {
  return Math.max(1, Math.floor(points / 250) + 1);
}

export function titleFromProgress(progress: TidefallProgress) {
  if (progress.profile.title) return progress.profile.title;
  if (progress.completedQuests.length >= 3) return 'Tidewalker';
  if (progress.foundSecrets.length >= 4) return 'Secret Keeper';
  if (progress.discoveredRooms.length >= 5) return 'Academy Cartographer';
  if (Object.values(progress.spellMastery).some((value) => value >= 50)) return 'Spell Trainee';
  if (progress.discoveries.length >= 5) return 'Current Chaser';
  return 'First Year';
}
