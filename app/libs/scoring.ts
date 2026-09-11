import type { AnswerData, ScoreTier, SessionData } from './session-types';

export interface TierDescriptor {
  tier: ScoreTier;
  label: string;
  headline: string;
  description: string;
}

const TIER_SCALE: ReadonlyArray<TierDescriptor & { minimumScore: number }> = [
  {
    minimumScore: 85,
    tier: 'excellent',
    label: 'Interview Ready',
    headline: 'Excellent session.',
    description: "You're well-prepared. Walk in with confidence.",
  },
  {
    minimumScore: 70,
    tier: 'good',
    label: 'Almost There',
    headline: 'Solid performance.',
    description: 'Strong foundation. A few targeted improvements will push you over.',
  },
  {
    minimumScore: 55,
    tier: 'fair',
    label: 'Needs Work',
    headline: 'Good effort this session.',
    description: 'Focus on clarity and reducing filler words.',
  },
  {
    minimumScore: 0,
    tier: 'poor',
    label: 'Needs Practice',
    headline: 'Room to grow.',
    description: 'This session revealed key gaps. Use the recommendations below to improve.',
  },
];

export const IDEAL_ANSWER_SECONDS = { minimum: 60, maximum: 180 } as const;

export function getTierForScore(score: number): TierDescriptor {
  const match = TIER_SCALE.find((entry) => score >= entry.minimumScore);
  return match ?? TIER_SCALE[TIER_SCALE.length - 1];
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function averageOf(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

export function getAnalysedAnswers(answers: AnswerData[]): AnswerData[] {
  return answers.filter((answer) => answer.analyzed);
}

export function getStarComplianceScore(answers: AnswerData[]): number {
  const analysed = getAnalysedAnswers(answers);
  if (analysed.length === 0) return 0;

  const compliant = analysed.filter((answer) => answer.starCompliance).length;
  return Math.round((compliant / analysed.length) * 100);
}

export function getStarComplianceCount(answers: AnswerData[]): number {
  return getAnalysedAnswers(answers).filter((answer) => answer.starCompliance).length;
}

export function getPacingScore(answers: AnswerData[]): number {
  const analysed = getAnalysedAnswers(answers);
  if (analysed.length === 0) return 0;

  const withinRange = analysed.filter(
    (answer) =>
      answer.durationSec >= IDEAL_ANSWER_SECONDS.minimum &&
      answer.durationSec <= IDEAL_ANSWER_SECONDS.maximum
  ).length;
  return Math.round((withinRange / analysed.length) * 100);
}

export function getWeakestAnswers(answers: AnswerData[], count: number): AnswerData[] {
  return getAnalysedAnswers(answers)
    .sort((first, second) => first.score - second.score)
    .slice(0, count);
}

export function getFillerHeavyAnswers(answers: AnswerData[], minimumFillers: number): AnswerData[] {
  return answers
    .filter((answer) => answer.fillerWords >= minimumFillers)
    .sort((first, second) => second.fillerWords - first.fillerWords);
}

export function getScoreDelta(current: number, previous: number | undefined): number | null {
  if (previous === undefined) return null;
  return current - previous;
}

export function formatSessionTimestamp(isoTimestamp: string): string {
  const parsed = new Date(isoTimestamp);
  if (Number.isNaN(parsed.getTime())) return 'Unknown date';
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function summarizeSession(
  answers: AnswerData[]
): Pick<
  SessionData,
  | 'questions'
  | 'duration'
  | 'durationSeconds'
  | 'overallScore'
  | 'confidence'
  | 'clarity'
  | 'fillerWords'
  | 'tier'
  | 'tierLabel'
> {
  const durationSeconds = answers.reduce((total, answer) => total + answer.durationSec, 0);
  const analysed = getAnalysedAnswers(answers);
  const overallScore = averageOf(analysed.map((answer) => answer.score));
  const { tier, label } = getTierForScore(overallScore);

  return {
    questions: answers.length,
    duration: formatDuration(durationSeconds),
    durationSeconds,
    overallScore,
    confidence: averageOf(analysed.map((answer) => answer.confidence)),
    clarity: averageOf(analysed.map((answer) => answer.clarity)),
    fillerWords: analysed.reduce((total, answer) => total + answer.fillerWords, 0),
    tier,
    tierLabel: label,
  };
}
