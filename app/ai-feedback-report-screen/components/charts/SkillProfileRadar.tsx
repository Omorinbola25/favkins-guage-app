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
import { getPacingScore, getStarComplianceScore } from '../../../libs/scoring';
import type { StoredSession } from '../../../libs/session-types';

const TARGET_SCORE = 85;

interface SkillProfileRadarProps {
  session: StoredSession;
  previousSession: StoredSession | null;
}

interface RadarPoint {
  skill: string;
  current: number;
  previous: number | null;
  target: number;
}

function buildRadarData(
  session: StoredSession,
  previousSession: StoredSession | null
): RadarPoint[] {
  const axes = [
    { skill: 'Confidence', read: (input: StoredSession) => input.confidence },
    { skill: 'Clarity', read: (input: StoredSession) => input.clarity },
    { skill: 'Structure', read: (input: StoredSession) => getStarComplianceScore(input.answers) },
    { skill: 'Pacing', read: (input: StoredSession) => getPacingScore(input.answers) },
    { skill: 'Overall', read: (input: StoredSession) => input.overallScore },
  ];

  return axes.map(({ skill, read }) => ({
    skill,
    current: read(session),
    previous: previousSession ? read(previousSession) : null,
    target: TARGET_SCORE,
  }));
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
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="bg-primary h-2 w-2 rounded-full" />
            <span className="text-muted-foreground">This session</span>
          </div>
          <span className="font-mono-data text-primary-light font-semibold">{point.current}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="bg-muted-foreground h-2 w-2 rounded-full" />
            <span className="text-muted-foreground">Previous</span>
          </div>
          <span className="font-mono-data text-muted-foreground">{point.previous ?? 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="bg-success h-2 w-2 rounded-full" />
            <span className="text-muted-foreground">Target</span>
          </div>
          <span className="font-mono-data text-success">{point.target}</span>
        </div>
      </div>
    </div>
  );
}

export default function SkillProfileRadar({ session, previousSession }: SkillProfileRadarProps) {
  const data = buildRadarData(session, previousSession);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Radar
          name="Target"
          dataKey="target"
          stroke="var(--success)"
          fill="var(--success)"
          fillOpacity={0.05}
          strokeWidth={1}
          strokeDasharray="4 2"
          dot={false}
        />
        {previousSession && (
          <Radar
            name="Previous"
            dataKey="previous"
            stroke="var(--border)"
            fill="var(--muted)"
            fillOpacity={0.15}
            strokeWidth={1}
            dot={false}
          />
        )}
        <Radar
          name="This Session"
          dataKey="current"
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
