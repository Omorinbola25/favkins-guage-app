import {
  FILLER_PHRASES,
  FILLER_SOUNDS,
  HEDGE_PHRASES,
  STAR_MARKERS,
  type StarComponent,
} from './speech-patterns';

export const IDEAL_WORDS_PER_MINUTE = { minimum: 110, maximum: 170 } as const;
export const IDEAL_ANSWER_WORDS = { minimum: 60, comfortable: 150 } as const;

const STAR_COMPONENTS_REQUIRED = 3;
const SCORE_WEIGHTS = { clarity: 0.3, confidence: 0.3, structure: 0.25, pacing: 0.15 } as const;

export interface SpeechAnalysis {
  wordCount: number;
  wordsPerMinute: number;
  fillerWords: number;
  fillerPer100Words: number;
  hedgeCount: number;
  starComponents: StarComponent[];
  starCompliance: boolean;
  clarity: number;
  confidence: number;
  structure: number;
  pacing: number;
  score: number;
}

function normalize(transcript: string): string {
  return transcript
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(normalized: string): number {
  if (!normalized) return 0;
  return normalized.split(' ').filter(Boolean).length;
}

function countOccurrences(normalized: string, terms: readonly string[]): number {
  const padded = ` ${normalized} `;

  return terms.reduce((total, term) => {
    const needle = ` ${term} `;
    let occurrences = 0;
    let index = padded.indexOf(needle);

    while (index !== -1) {
      occurrences += 1;
      index = padded.indexOf(needle, index + needle.length - 1);
    }

    return total + occurrences;
  }, 0);
}

function clamp(value: number, minimum = 0, maximum = 100): number {
  return Math.max(minimum, Math.min(maximum, Math.round(value)));
}

function scorePacing(wordsPerMinute: number, wordCount: number): number {
  if (wordCount < 10) return 0;

  const { minimum, maximum } = IDEAL_WORDS_PER_MINUTE;
  if (wordsPerMinute >= minimum && wordsPerMinute <= maximum) return 100;

  const distance = wordsPerMinute < minimum ? minimum - wordsPerMinute : wordsPerMinute - maximum;
  return clamp(100 - distance * 1.5);
}

function scoreClarity(fillerPer100Words: number, wordCount: number, pacing: number): number {
  const fillerPenalty = fillerPer100Words * 6;
  const lengthRatio = Math.min(wordCount / IDEAL_ANSWER_WORDS.comfortable, 1);
  const substance = 45 + lengthRatio * 40;

  return clamp(substance + pacing * 0.15 - fillerPenalty);
}

function scoreConfidence(
  hedgePer100Words: number,
  fillerPer100Words: number,
  wordCount: number
): number {
  if (wordCount < 10) return 0;

  const hedgePenalty = hedgePer100Words * 7;
  const fillerPenalty = fillerPer100Words * 4;
  const lengthRatio = Math.min(wordCount / IDEAL_ANSWER_WORDS.comfortable, 1);

  return clamp(60 + lengthRatio * 30 - hedgePenalty - fillerPenalty);
}

function detectStarComponents(normalized: string): StarComponent[] {
  return (Object.keys(STAR_MARKERS) as StarComponent[]).filter((component) =>
    STAR_MARKERS[component].some((marker) => normalized.includes(marker))
  );
}

export function analyseTranscript(transcript: string, durationSec: number): SpeechAnalysis {
  const normalized = normalize(transcript);
  const wordCount = countWords(normalized);

  if (wordCount === 0 || durationSec <= 0) {
    return {
      wordCount: 0,
      wordsPerMinute: 0,
      fillerWords: 0,
      fillerPer100Words: 0,
      hedgeCount: 0,
      starComponents: [],
      starCompliance: false,
      clarity: 0,
      confidence: 0,
      structure: 0,
      pacing: 0,
      score: 0,
    };
  }

  const fillerWords =
    countOccurrences(normalized, FILLER_SOUNDS) + countOccurrences(normalized, FILLER_PHRASES);
  const hedgeCount = countOccurrences(normalized, HEDGE_PHRASES);
  const wordsPerMinute = Math.round(wordCount / (durationSec / 60));

  const fillerPer100Words = (fillerWords / wordCount) * 100;
  const hedgePer100Words = (hedgeCount / wordCount) * 100;

  const starComponents = detectStarComponents(normalized);
  const starCompliance = starComponents.length >= STAR_COMPONENTS_REQUIRED;
  const structure = clamp((starComponents.length / 4) * 100);

  const pacing = scorePacing(wordsPerMinute, wordCount);
  const clarity = scoreClarity(fillerPer100Words, wordCount, pacing);
  const confidence = scoreConfidence(hedgePer100Words, fillerPer100Words, wordCount);

  const score = clamp(
    clarity * SCORE_WEIGHTS.clarity +
      confidence * SCORE_WEIGHTS.confidence +
      structure * SCORE_WEIGHTS.structure +
      pacing * SCORE_WEIGHTS.pacing
  );

  return {
    wordCount,
    wordsPerMinute,
    fillerWords,
    fillerPer100Words: Math.round(fillerPer100Words * 10) / 10,
    hedgeCount,
    starComponents,
    starCompliance,
    clarity,
    confidence,
    structure,
    pacing,
    score,
  };
}

export function buildAnswerFeedback(analysis: SpeechAnalysis): string {
  if (analysis.wordCount === 0) {
    return 'No speech was detected for this answer, so it could not be analysed.';
  }

  const notes: string[] = [];

  if (analysis.fillerWords === 0) {
    notes.push('You used no filler words, which reads as well rehearsed.');
  } else {
    notes.push(
      `You used ${analysis.fillerWords} filler word${analysis.fillerWords === 1 ? '' : 's'} (${analysis.fillerPer100Words} per 100 words).`
    );
  }

  if (analysis.wordsPerMinute < IDEAL_WORDS_PER_MINUTE.minimum) {
    notes.push(
      `At ${analysis.wordsPerMinute} words per minute you were speaking slowly; aim for 110 to 170.`
    );
  } else if (analysis.wordsPerMinute > IDEAL_WORDS_PER_MINUTE.maximum) {
    notes.push(
      `At ${analysis.wordsPerMinute} words per minute you were rushing; aim for 110 to 170.`
    );
  } else {
    notes.push(`Your pace of ${analysis.wordsPerMinute} words per minute was in the ideal range.`);
  }

  if (analysis.starCompliance) {
    notes.push(
      `Your answer covered ${analysis.starComponents.join(', ')}, so the STAR arc came through.`
    );
  } else {
    const missing = (Object.keys(STAR_MARKERS) as StarComponent[]).filter(
      (component) => !analysis.starComponents.includes(component)
    );
    notes.push(
      `The answer was light on ${missing.join(' and ')}. Interviewers listen for how the story resolves.`
    );
  }

  if (analysis.hedgeCount > 2) {
    notes.push(
      `You hedged ${analysis.hedgeCount} times with phrases like "I think" or "maybe". State your point directly.`
    );
  }

  if (analysis.wordCount < IDEAL_ANSWER_WORDS.minimum) {
    notes.push(
      `At ${analysis.wordCount} words this was short. A strong answer usually runs 100 to 200 words.`
    );
  }

  return notes.join(' ');
}
