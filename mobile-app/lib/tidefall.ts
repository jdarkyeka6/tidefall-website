export const ASSET = 'https://tidefall.com.au/assets';

export type Character = {
  slug: string;
  name: string;
  fullName: string;
  image: string;
  tint: string;
  house: 'Brannor';
  signature: string;
  magic: string;
};

export const characters: Character[] = [
  {
    slug: 'harper',
    name: 'Harper',
    fullName: 'Harper Vale',
    image: `${ASSET}/harper.png`,
    tint: '#F4A7C5',
    house: 'Brannor',
    signature: 'Undisclosed',
    magic: 'Power and instinct',
  },
  {
    slug: 'jasper',
    name: 'Jasper',
    fullName: 'Jasper Holloway',
    image: `${ASSET}/jasper.png`,
    tint: '#F6C86A',
    house: 'Brannor',
    signature: 'Necklace',
    magic: 'Titan-sense',
  },
  {
    slug: 'lily',
    name: 'Lily',
    fullName: 'Lily Hart',
    image: `${ASSET}/lily.png`,
    tint: '#A8E6FF',
    house: 'Brannor',
    signature: 'Heart hair clip',
    magic: 'Titan-sense',
  },
  {
    slug: 'ava',
    name: 'Ava',
    fullName: 'Ava Rees',
    image: `${ASSET}/ava.png`,
    tint: '#8ED6A7',
    house: 'Brannor',
    signature: 'Old brass key',
    magic: 'Control and precision',
  },
];

export const houses = ['Brannor', 'Calyx', 'Noctern'] as const;
export type House = (typeof houses)[number];

export type Spell = {
  slug: string;
  name: string;
  symbol: string;
  discipline: string;
  description: string;
};

export const spells: Spell[] = [
  {
    slug: 'veyra',
    name: 'Veyra',
    symbol: '✦',
    discipline: 'Light',
    description: 'Shape a controlled source of light and hold it steady.',
  },
  {
    slug: 'sela',
    name: 'Sela',
    symbol: '◌',
    discipline: 'Pull',
    description: 'Draw a target towards you without losing control.',
  },
  {
    slug: 'tavra',
    name: 'Tavra',
    symbol: '⌁',
    discipline: 'Shield',
    description: 'Form a defensive barrier and keep it stable under pressure.',
  },
];

export type AcademyPlace = {
  slug: string;
  title: string;
  floor: 'Ground' | 'Upper' | 'Unknown';
  glyph: string;
  copy: string;
  secrets: number;
  hidden?: boolean;
  intel: string[];
};

export const academyPlaces: AcademyPlace[] = [
  {
    slug: 'library',
    title: 'Library',
    floor: 'Ground',
    glyph: '▤',
    copy: 'Books, research, quiet corners and details people forget to file properly.',
    secrets: 3,
    intel: ['A major research space inside the Academy.', 'Not every useful answer is in the obvious section.', 'Some discoveries only appear after you return.'],
  },
  {
    slug: 'cafe',
    title: 'Café',
    floor: 'Ground',
    glyph: '◫',
    copy: 'A social checkpoint between classes, rumours and whatever just happened in the corridor.',
    secrets: 1,
    intel: ['A common meeting point for students.', 'Useful information travels faster here than official notices.'],
  },
  {
    slug: 'classrooms',
    title: 'Classrooms',
    floor: 'Ground',
    glyph: '✦',
    copy: 'Lessons, magic training and the places where theory becomes much less theoretical.',
    secrets: 2,
    intel: ['Magic is taught without wands.', 'Control matters as much as raw power.', 'Different rooms are built for different kinds of practice.'],
  },
  {
    slug: 'records',
    title: 'Admin & Records',
    floor: 'Ground',
    glyph: '⌑',
    copy: 'Official files, school records and things that are definitely labelled correctly. Probably.',
    secrets: 2,
    intel: ['The Academy keeps records on students and school activity.', 'Official information is not always complete information.'],
  },
  {
    slug: 'dorms',
    title: 'Dormitories',
    floor: 'Upper',
    glyph: '⌂',
    copy: 'Student rooms, belongings, late-night conversations and the occasional terrible idea.',
    secrets: 2,
    intel: ['Dorms sit on the upper floors.', 'Rooms are shared by students.', 'Personal items can matter more than they first appear.'],
  },
  {
    slug: 'hidden-corridors',
    title: 'Hidden Corridors',
    floor: 'Unknown',
    glyph: '≈',
    copy: 'Routes the official map does not reliably admit exist.',
    secrets: 5,
    hidden: true,
    intel: ['Some routes through Tidefall are not stable.', 'A corridor can matter because of where it leads, or because it should not be there at all.'],
  },
];

export const dailyTides = [
  {
    label: 'THE TIDE TODAY',
    title: 'The Academy map is behaving strangely.',
    body: 'One route is refusing to stay where the map says it belongs.',
    route: '/academy',
    action: 'CHECK THE ACADEMY',
  },
  {
    label: 'SPELL SIGNAL',
    title: 'Your casting chamber is active.',
    body: 'Train a spell and push its mastery a little further.',
    route: '/magic',
    action: 'BEGIN TRAINING',
  },
  {
    label: 'DISCOVERY',
    title: 'There is something you have not logged yet.',
    body: 'Pick a current and let the app choose where you go next.',
    route: '/explore',
    action: 'DISCOVER SOMETHING',
  },
  {
    label: 'STORY CURRENT',
    title: 'The story is waiting where you left it.',
    body: 'Open the native book shelf and continue your Tidefall progress.',
    route: '/books',
    action: 'OPEN BOOKS',
  },
] as const;

export function tideForDate(date = new Date()) {
  const seed = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  return dailyTides[Math.abs(seed) % dailyTides.length];
}
