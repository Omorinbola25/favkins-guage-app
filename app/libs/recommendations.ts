import {
  IDEAL_ANSWER_SECONDS,
  getPacingScore,
  getStarComplianceCount,
  getWeakestAnswers,
} from './scoring';
import type { StoredSession } from './session-types';

export type RecommendationPriority = 'High' | 'Medium' | 'Low';
export type RecommendationKind = 'fillers' | 'structure' | 'pacing' | 'depth' | 'confidence';

export interface Recommendation {
  id: string;
  kind: RecommendationKind;
  priority: RecommendationPriority;
  title: string;
  description: string;
  metric: string;
}

const PRIORITY_ORDER: Record<RecommendationPriority, number> = { High: 0, Medium: 1, Low: 2 };
const MAX_RECOMMENDATIONS = 3;
const FILLERS_PER_ANSWER_TARGET = 1;
const SIGNIFICANT_SCORE_GAP = 10;

function listQuestions(questionNumbers: number[]): string {
  const labels = questionNumbers.map((questionNumber) => `Q${questionNumber}`);
  if (labels.length <= 1) return labels.join('');
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
}

export function buildRecommendations(session: StoredSession): Recommendation[] {
  const { answers } = session;
  if (answers.length === 0) return [];

  const recommendations: Recommendation[] = [];

  const fillerTarget = answers.length * FILLERS_PER_ANSWER_TARGET;
  if (session.fillerWords > fillerTarget) {
    const worst = answers
      .filter((answer) => answer.fillerWords >= 3)
      .sort((first, second) => second.fillerWords - first.fillerWords)
      .slice(0, 2);

    recommendations.push({
      id: 'rec-fillers',
      kind: 'fillers',
      priority: 'High',
      title: 'Cut down on filler words',
      description: worst.length
        ? `${listQuestions(worst.map((answer) => answer.questionNum))} carried the most fillers. Practice pausing silently instead of reaching for "um" or "uh". A one second pause reads as more confident than a filler.`
        : 'Filler words are spread across your answers. Practice pausing silently instead of filling the gap out loud.',
      metric: `${session.fillerWords} fillers, target under ${fillerTarget}`,
    });
  }

  const compliantCount = getStarComplianceCount(answers);
  if (compliantCount < answers.length) {
    const nonCompliant = answers.filter((answer) => !answer.starCompliance).slice(0, 3);

    recommendations.push({
      id: 'rec-structure',
      kind: 'structure',
      priority: 'High',
      title: 'Apply the STAR method consistently',
      description: `${listQuestions(nonCompliant.map((answer) => answer.questionNum))} did not follow a clear Situation, Task, Action, Result arc. Interviewers look for how a story resolves, not just how it started. Sketch a four sentence STAR outline before your next session.`,
      metric: `STAR compliance ${compliantCount}/${answers.length}`,
    });
  }

  const pacingScore = getPacingScore(answers);
  if (pacingScore < 100) {
    const offPace = answers.filter(
      (answer) =>
        answer.durationSec < IDEAL_ANSWER_SECONDS.minimum ||
        answer.durationSec > IDEAL_ANSWER_SECONDS.maximum
    );
    const tooShort = offPace.filter(
      (answer) => answer.durationSec < IDEAL_ANSWER_SECONDS.minimum
    ).length;

    recommendations.push({
      id: 'rec-pacing',
      kind: 'pacing',
      priority: pacingScore < 60 ? 'High' : 'Medium',
      title:
        tooShort >= offPace.length - tooShort
          ? 'Give your answers more room'
          : 'Tighten your longer answers',
      description: `${listQuestions(offPace.slice(0, 3).map((answer) => answer.questionNum))} landed outside the one to three minute window that most interviewers expect. Aim for a full STAR arc without trailing past three minutes.`,
      metric: `${offPace.length} of ${answers.length} answers off pace`,
    });
  }

  const [weakest] = getWeakestAnswers(answers, 1);
  if (weakest && session.overallScore - weakest.score >= SIGNIFICANT_SCORE_GAP) {
    recommendations.push({
      id: 'rec-depth',
      kind: 'depth',
      priority: 'Medium',
      title: `Rework your ${weakest.category} answer`,
      description: `Q${weakest.questionNum} scored ${weakest.score}, well under your session average of ${session.overallScore}. Re-run this question on its own and compare the two attempts.`,
      metric: `Q${weakest.questionNum}: ${weakest.score} vs average ${session.overallScore}`,
    });
  }

  if (session.clarity - session.confidence >= SIGNIFICANT_SCORE_GAP) {
    recommendations.push({
      id: 'rec-confidence',
      kind: 'confidence',
      priority: 'Medium',
      title: 'Deliver with more conviction',
      description:
        'Your content is landing more clearly than your delivery. The substance is there, so focus on steadier pace and fewer hedging phrases such as "I think" or "kind of".',
      metric: `Confidence ${session.confidence} vs clarity ${session.clarity}`,
    });
  }

  return recommendations
    .sort((first, second) => PRIORITY_ORDER[first.priority] - PRIORITY_ORDER[second.priority])
    .slice(0, MAX_RECOMMENDATIONS);
}
