'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { StoredSession } from '../../libs/session-types';

const MAX_POINTS = 14;

interface SessionProgressChartProps {
  sessions: StoredSession[];
}

interface TooltipEntry {
  color: string;
  name: string;
  value: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="card-glass min-w-[140px] p-3 text-xs shadow-xl">
      <p className="text-foreground mb-2 font-semibold">{label}</p>
      {payload.map((entry) => (
        <div
          key={`area-tooltip-${entry.name}`}
          className="mb-1 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-sm" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground capitalize">{entry.name}</span>
          </div>
          <span className="font-mono-data text-foreground font-semibold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function SessionProgressChart({ sessions }: SessionProgressChartProps) {
  const data = [...sessions]
    .sort((first, second) => first.createdAt.localeCompare(second.createdAt))
    .slice(-MAX_POINTS)
    .map((session, index) => ({
      session: `S${index + 1}`,
      overall: session.overallScore,
      confidence: session.confidence,
      clarity: session.clarity,
    }));

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">
          Complete a session to start tracking your progress.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="overallFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="session"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="overall"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#overallFill)"
        />
        <Area
          type="monotone"
          dataKey="confidence"
          stroke="var(--accent)"
          strokeWidth={1.5}
          fill="none"
        />
        <Area
          type="monotone"
          dataKey="clarity"
          stroke="var(--success)"
          strokeWidth={1.5}
          fill="none"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
