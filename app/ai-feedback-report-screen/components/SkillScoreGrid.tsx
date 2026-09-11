import React from 'react';
import { Mic, AlignLeft, ListOrdered, Gauge } from 'lucide-react';
import SkillScoreCard from '@/components/ui/SkillScoreCard';
import { getPacingScore, getStarComplianceScore } from '../../libs/scoring';
import type { StoredSession } from '../../libs/session-types';

interface SkillScoreGridProps {
  session: StoredSession;
  previousSession: StoredSession | null;
}

export default function SkillScoreGrid({ session, previousSession }: SkillScoreGridProps) {
  const structureScore = getStarComplianceScore(session.answers);
  const pacingScore = getPacingScore(session.answers);

  const previousStructure = previousSession
    ? getStarComplianceScore(previousSession.answers)
    : null;
  const previousPacing = previousSession ? getPacingScore(previousSession.answers) : null;

  const skills = [
    {
      id: 'skill-confidence',
      label: 'Confidence',
      score: session.confidence,
      delta: previousSession ? session.confidence - previousSession.confidence : null,
      icon: <Mic size={18} />,
      description: 'Vocal steadiness, pace, hesitation',
    },
    {
      id: 'skill-clarity',
      label: 'Clarity',
      score: session.clarity,
      delta: previousSession ? session.clarity - previousSession.clarity : null,
      icon: <AlignLeft size={18} />,
      description: 'Answer structure, completeness',
    },
    {
      id: 'skill-structure',
      label: 'Structure',
      score: structureScore,
      delta: previousStructure === null ? null : structureScore - previousStructure,
      icon: <ListOrdered size={18} />,
      description: 'Share of answers following STAR',
    },
    {
      id: 'skill-pacing',
      label: 'Pacing',
      score: pacingScore,
      delta: previousPacing === null ? null : pacingScore - previousPacing,
      icon: <Gauge size={18} />,
      description: 'Answers landing in the 1 to 3 minute window',
    },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-foreground text-base font-semibold">Skill Breakdown</h2>
        <p className="text-muted-foreground text-xs">
          {previousSession
            ? 'Compared to your previous session'
            : 'This is your first recorded session'}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {skills.map(({ id, ...skill }) => (
          <SkillScoreCard key={id} {...skill} />
        ))}
      </div>
    </div>
  );
}
