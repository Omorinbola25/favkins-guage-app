'use client';

import React from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { averageOf, getPacingScore, getStarComplianceScore } from '../../libs/scoring';
import type { StoredSession } from '../../libs/session-types';

const RECENT_WINDOW = 5;

interface SkillRadarChartProps {
  sessions: StoredSession[];
}

interface RadarPoint {
  skill: string;
  score: number;
  previous: number | null;
}

function summarise(sessions: StoredSession[]): Record<string, number> {
  return {
    Confidence: averageOf(sessions.map((session) => session.confidence)),
    Clarity: averageOf(sessions.map((session) => session.clarity)),
    Structure: averageOf(sessions.map((session) => getStarComplianceScore(session.answers))),
    Pacing: averageOf(sessions.map((session) => getPacingScore(session.answers))),
    Overall: averageOf(sessions.map((session) => session.overallScore)),
  };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: RadarPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="card-glass p-3 text-xs shadow-xl">
      <p className="text-foreground mb-2 font-semibold">{point.skill}</p>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Recent</span>
        <span className="font-mono-data text-primary-light font-semibold">{point.score}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Earlier</span>
        <span className="font-mono-data text-muted-foreground">{point.previous ?? 'N/A'}</span>
      </div>
    </div>
  );
}

export default function SkillRadarChart({ sessions }: SkillRadarChartProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">
          Complete a session to see your skill profile.
        </p>
      </div>
    );
  }

  const ordered = [...sessions].sort((first, second) =>
    second.createdAt.localeCompare(first.createdAt)
  );
  const recent = ordered.slice(0, RECENT_WINDOW);
  const earlier = ordered.slice(RECENT_WINDOW, RECENT_WINDOW * 2);

  const recentScores = summarise(recent);
  const earlierScores = earlier.length > 0 ? summarise(earlier) : null;

  const data: RadarPoint[] = Object.keys(recentScores).map((skill) => ({
    skill,
    score: recentScores[skill],
    previous: earlierScores ? earlierScores[skill] : null,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        {earlierScores && (
          <Radar
            name="Earlier"
            dataKey="previous"
            stroke="var(--border)"
            fill="var(--muted)"
            fillOpacity={0.15}
            strokeWidth={1}
            dot={false}
          />
        )}
        <Radar
          name="Recent"
          dataKey="score"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.2}
          strokeWidth={2}
          dot={{ fill: 'var(--primary)', r: 3, strokeWidth: 0 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
