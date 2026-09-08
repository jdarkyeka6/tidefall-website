import AsyncStorage from '@react-native-async-storage/async-storage';
import type { House, Spell } from './tidefall';

const KEY = 'tidefall.progress.v3';
const OLD_PROFILE_KEY = 'tidefall.profile';
const OLD_VISITED_KEY = 'tidefall.visitedActivities';

export type DiscoveryKind = 'room' | 'spell' | 'lore' | 'story' | 'activity';

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
  discoveries: [],
  profile: {},
  reading: { bookOnePercent: 0 },
};

function clone(progress: TidefallProgress): TidefallProgress {
  return {
    ...progress,
    discoveredRooms: [...progress.discoveredRooms],
    spellMastery: { ...progress.spellMastery },
    discoveries: [...progress.discoveries],
    profile: { ...progress.profile },
    reading: { ...progress.reading },
  };
}

function isHouse(value: unknown): value is House {
  return value === 'Brannor' || value === 'Calyx' || value === 'Noctern';
}

export async function loadProgress(): Promise<TidefallProgress> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<TidefallProgress>;
      return {
        tidePoints: Number(parsed.tidePoints || 0),
        discoveredRooms: Array.isArray(parsed.discoveredRooms) ? parsed.discoveredRooms : [],
        spellMastery: parsed.spellMastery && typeof parsed.spellMastery === 'object' ? parsed.spellMastery : {},
        discoveries: Array.isArray(parsed.discoveries) ? parsed.discoveries : [],
        profile: parsed.profile || {},
        reading: parsed.reading || { bookOnePercent: 0 },
      };
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

export function addDiscovery(
  progress: TidefallProgress,
  discovery: Omit<Discovery, 'at'>,
  points = 25,
): TidefallProgress {
  if (progress.discoveries.some((item) => item.id === discovery.id)) return progress;
  const next = clone(progress);
  next.tidePoints += points;
  next.discoveries = [{ ...discovery, at: Date.now() }, ...next.discoveries].slice(0, 100);
  return next;
}

export function discoverRoom(progress: TidefallProgress, slug: string, title: string): TidefallProgress {
  if (progress.discoveredRooms.includes(slug)) return progress;
  let next = clone(progress);
  next.discoveredRooms.unshift(slug);
  next = addDiscovery(next, { id: `room:${slug}`, title: `${title} discovered`, kind: 'room' }, 70);
  return next;
}

export function castSpell(progress: TidefallProgress, spell: Spell): TidefallProgress {
  let next = clone(progress);
  const before = next.spellMastery[spell.slug] || 0;
  next.spellMastery[spell.slug] = Math.min(100, before + 8);
  next.tidePoints += before < 100 ? 6 : 1;
  if (before === 0) {
    next = addDiscovery(next, { id: `spell:${spell.slug}`, title: `${spell.name} cast`, kind: 'spell' }, 35);
  }
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
  if (progress.discoveredRooms.length >= 5) return 'Academy Cartographer';
  if (Object.values(progress.spellMastery).some((value) => value >= 50)) return 'Spell Trainee';
  if (progress.discoveries.length >= 5) return 'Current Chaser';
  return 'First Year';
}
