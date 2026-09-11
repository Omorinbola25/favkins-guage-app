export const FILLER_SOUNDS = ['um', 'uh', 'erm', 'er', 'ah', 'hmm', 'mm'] as const;

export const FILLER_PHRASES = [
  'you know',
  'i mean',
  'sort of',
  'kind of',
  'like i said',
  'or something',
  'stuff like that',
] as const;

export const HEDGE_PHRASES = [
  'i think',
  'i guess',
  'maybe',
  'probably',
  'i suppose',
  'not sure',
  "i'm not sure",
  'perhaps',
  'hopefully',
  'i would say',
  'a little bit',
] as const;

export const STAR_MARKERS = {
  situation: [
    'when i',
    'at my',
    'we were',
    'the situation',
    'there was',
    'back when',
    'during my',
    'the problem was',
  ],
  task: [
    'my task',
    'my role',
    'i needed to',
    'i had to',
    'responsible for',
    'the goal was',
    'i was asked',
  ],
  action: [
    'i built',
    'i decided',
    'i implemented',
    'i led',
    'i created',
    'i designed',
    'so i',
    'i started',
    'i worked',
    'i proposed',
  ],
  result: [
    'as a result',
    'which reduced',
    'which increased',
    'the outcome',
    'ended up',
    'we shipped',
    'in the end',
    'this led to',
    'improved by',
    'we saw a',
  ],
} as const;

export type StarComponent = keyof typeof STAR_MARKERS;
