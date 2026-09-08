import { unlockAchievement, type TidefallProgress } from './progress';

export type QuestCondition =
  | { type: 'room'; target: string }
  | { type: 'mastery'; target: string; value: number }
  | { type: 'casts'; value: number }
  | { type: 'discoveries'; value: number }
  | { type: 'reading'; value: number }
  | { type: 'secret'; target: string };

export type QuestStep = {
  text: string;
  condition: QuestCondition;
};

export type Quest = {
  slug: string;
  title: string;
  label: string;
  copy: string;
  reward: number;
  steps: QuestStep[];
};

export const quests: Quest[] = [
  {
    slug: 'first-current',
    title: 'Follow the First Current',
    label: 'STARTER QUEST',
    copy: 'Learn how the Academy, Magic and Discover systems connect.',
    reward: 180,
    steps: [
      { text: 'Enter the Library', condition: { type: 'room', target: 'library' } },
      { text: 'Reach 16% mastery with Veyra', condition: { type: 'mastery', target: 'veyra', value: 16 } },
      { text: 'Log 3 discoveries', condition: { type: 'discoveries', value: 3 } },
    ],
  },
  {
    slug: 'door-that-wasnt-there',
    title: "The Door That Wasn't There",
    label: 'ACADEMY QUEST',
    copy: 'The map insists a route is impossible. The map is losing the argument.',
    reward: 260,
    steps: [
      { text: 'Discover the Hidden Corridors', condition: { type: 'room', target: 'hidden-corridors' } },
      { text: 'Find the Corridor Echo secret', condition: { type: 'secret', target: 'corridor-echo' } },
      { text: 'Reach 24% mastery with Sela', condition: { type: 'mastery', target: 'sela', value: 24 } },
    ],
  },
  {
    slug: 'precision-before-power',
    title: 'Precision Before Power',
    label: 'MAGIC QUEST',
    copy: 'A strong cast that cannot be controlled is just an expensive accident.',
    reward: 220,
    steps: [
      { text: 'Cast 8 spells', condition: { type: 'casts', value: 8 } },
      { text: 'Reach 40% mastery with Tavra', condition: { type: 'mastery', target: 'tavra', value: 40 } },
    ],
  },
  {
    slug: 'story-current',
    title: 'Words Change the Map',
    label: 'STORY QUEST',
    copy: 'Read far enough for the story to start leaving fingerprints elsewhere in the app.',
    reward: 200,
    steps: [
      { text: 'Reach 5% of Book One', condition: { type: 'reading', value: 5 } },
      { text: 'Reach 10% of Book One', condition: { type: 'reading', value: 10 } },
    ],
  },
];

export type Secret = {
  slug: string;
  title: string;
  clue: string;
  source: string;
  points: number;
  room?: string;
};

export const secrets: Secret[] = [
  { slug: 'misfiled-page', title: 'The Misfiled Page', clue: 'The catalogue says the page belongs somewhere else.', source: 'Library', points: 55, room: 'library' },
  { slug: 'rumour-ledger', title: 'The Rumour Ledger', clue: 'Someone has been keeping score of stories that turned out to be true.', source: 'Café', points: 45, room: 'cafe' },
  { slug: 'practice-mark', title: 'The Practice Mark', clue: 'A spell mark sits too low on the wall to have been part of a normal lesson.', source: 'Classrooms', points: 55, room: 'classrooms' },
  { slug: 'redacted-line', title: 'The Redacted Line', clue: 'One line was covered, then covered again.', source: 'Admin & Records', points: 65, room: 'records' },
  { slug: 'four-knocks', title: 'Four Knocks', clue: 'The same four knocks have been heard in rooms that do not share a wall.', source: 'Dormitories', points: 55, room: 'dorms' },
  { slug: 'corridor-echo', title: 'Corridor Echo', clue: 'Your footsteps return one beat too late.', source: 'Hidden Corridors', points: 90, room: 'hidden-corridors' },
  { slug: 'sixth-tide', title: 'The Sixth Tide', clue: 'Most people stop tapping when nothing happens.', source: 'Somewhere obvious', points: 120 },
  { slug: 'silver-margin', title: 'Silver in the Margin', clue: 'A line in the story seems more interested in you than the page.', source: 'Book One', points: 75 },
];

export function secretForRoom(room: string) {
  return secrets.find((secret) => secret.room === room);
}

export type AchievementCondition =
  | { type: 'rooms'; value: number }
  | { type: 'casts'; value: number }
  | { type: 'failedCasts'; value: number }
  | { type: 'mastery'; target: string; value: number }
  | { type: 'spells'; value: number }
  | { type: 'discoveries'; value: number }
  | { type: 'secrets'; value: number }
  | { type: 'quests'; value: number }
  | { type: 'reading'; value: number };

export type Achievement = {
  slug: string;
  title: string;
  description: string;
  hidden?: boolean;
  reward: number;
  condition: AchievementCondition;
};

export const achievements: Achievement[] = [
  { slug: 'first-step', title: 'First Step', description: 'Discover your first Academy room.', reward: 35, condition: { type: 'rooms', value: 1 } },
  { slug: 'map-problem', title: 'Map Problem', description: 'Discover five Academy areas.', reward: 80, condition: { type: 'rooms', value: 5 } },
  { slug: 'spark', title: 'Spark', description: 'Cast your first spell.', reward: 35, condition: { type: 'casts', value: 1 } },
  { slug: 'three-disciplines', title: 'Three Disciplines', description: 'Cast every known spell at least once.', reward: 90, condition: { type: 'spells', value: 3 } },
  { slug: 'veyra-fifty', title: 'Hold the Light', description: 'Reach 50% Veyra mastery.', reward: 100, condition: { type: 'mastery', target: 'veyra', value: 50 } },
  { slug: 'again', title: 'Again?!', description: 'Fail ten casts. Persistence counts.', hidden: true, reward: 60, condition: { type: 'failedCasts', value: 10 } },
  { slug: 'current-chaser', title: 'Current Chaser', description: 'Log ten discoveries.', reward: 80, condition: { type: 'discoveries', value: 10 } },
  { slug: 'dont-tell', title: "Don't Tell the Headmaster", description: 'Find your first secret.', hidden: true, reward: 60, condition: { type: 'secrets', value: 1 } },
  { slug: 'questing', title: 'Something to Do', description: 'Complete your first quest.', reward: 70, condition: { type: 'quests', value: 1 } },
  { slug: 'reader-current', title: 'Words Have Weight', description: 'Reach 10% of Book One.', reward: 55, condition: { type: 'reading', value: 10 } },
];

export type WorldState = {
  slug: string;
  label: string;
  title: string;
  body: string;
  changedRoom?: string;
  boostedSpell?: string;
  quest?: string;
  characterLocations: Record<string, string>;
};

export const worldStates: WorldState[] = [
  {
    slug: 'still-water',
    label: 'THE TIDE TODAY',
    title: 'The water beneath Brannor is unusually still.',
    body: 'The Library feels wrong today. Jasper has already noticed.',
    changedRoom: 'library',
    quest: 'first-current',
    characterLocations: { jasper: 'Library', harper: 'Café', lily: 'Dormitories', ava: 'Admin & Records' },
  },
  {
    slug: 'moving-route',
    label: 'THE TIDE TODAY',
    title: 'A route moved overnight.',
    body: 'The Hidden Corridors are more visible than they have any right to be.',
    changedRoom: 'hidden-corridors',
    quest: 'door-that-wasnt-there',
    characterLocations: { jasper: 'Hidden Corridors', harper: 'Classrooms', lily: 'Library', ava: 'Admin & Records' },
  },
  {
    slug: 'bright-current',
    label: 'MAGIC CURRENT',
    title: 'Light magic is running unusually clean.',
    body: 'Veyra casts earn an extra current bonus today.',
    boostedSpell: 'veyra',
    quest: 'precision-before-power',
    characterLocations: { jasper: 'Classrooms', harper: 'Classrooms', lily: 'Café', ava: 'Library' },
  },
  {
    slug: 'records-noise',
    label: 'ACADEMY SIGNAL',
    title: 'Something in Records does not match yesterday.',
    body: 'A tiny change is attracting a suspicious amount of attention.',
    changedRoom: 'records',
    characterLocations: { jasper: 'Library', harper: 'Café', lily: 'Classrooms', ava: 'Admin & Records' },
  },
  {
    slug: 'story-pull',
    label: 'STORY CURRENT',
    title: 'The book is pulling on the rest of Tidefall.',
    body: 'Read a little further. Something is waiting in the margin.',
    quest: 'story-current',
    characterLocations: { jasper: 'Dormitories', harper: 'Café', lily: 'Library', ava: 'Classrooms' },
  },
];

export function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function worldForDate(date = new Date()) {
  const seed = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  return worldStates[Math.abs(seed) % worldStates.length];
}

export function questStepComplete(progress: TidefallProgress, condition: QuestCondition) {
  if (condition.type === 'room') return progress.discoveredRooms.includes(condition.target);
  if (condition.type === 'mastery') return (progress.spellMastery[condition.target] || 0) >= condition.value;
  if (condition.type === 'casts') return progress.totalCasts >= condition.value;
  if (condition.type === 'discoveries') return progress.discoveries.length >= condition.value;
  if (condition.type === 'reading') return progress.reading.bookOnePercent >= condition.value;
  if (condition.type === 'secret') return progress.foundSecrets.includes(condition.target);
  return false;
}

export function questCompletion(progress: TidefallProgress, quest: Quest) {
  const completed = quest.steps.filter((step) => questStepComplete(progress, step.condition)).length;
  return { completed, total: quest.steps.length, ready: completed === quest.steps.length };
}

export function achievementConditionMet(progress: TidefallProgress, condition: AchievementCondition) {
  if (condition.type === 'rooms') return progress.discoveredRooms.length >= condition.value;
  if (condition.type === 'casts') return progress.totalCasts >= condition.value;
  if (condition.type === 'failedCasts') return progress.failedCasts >= condition.value;
  if (condition.type === 'mastery') return (progress.spellMastery[condition.target] || 0) >= condition.value;
  if (condition.type === 'spells') return Object.values(progress.spellMastery).filter((value) => value > 0).length >= condition.value;
  if (condition.type === 'discoveries') return progress.discoveries.length >= condition.value;
  if (condition.type === 'secrets') return progress.foundSecrets.length >= condition.value;
  if (condition.type === 'quests') return progress.completedQuests.length >= condition.value;
  if (condition.type === 'reading') return progress.reading.bookOnePercent >= condition.value;
  return false;
}

export function reconcileAchievements(progress: TidefallProgress) {
  let next = progress;
  achievements.forEach((achievement) => {
    if (!next.unlockedAchievements.includes(achievement.slug) && achievementConditionMet(next, achievement.condition)) {
      next = unlockAchievement(next, achievement.slug, achievement.title, achievement.reward);
    }
  });
  return next;
}

export function characterLocation(slug: string, date = new Date()) {
  return worldForDate(date).characterLocations[slug] || 'Somewhere in the Academy';
}
