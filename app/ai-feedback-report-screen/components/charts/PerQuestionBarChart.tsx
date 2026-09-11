'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { AnswerData } from '../../../libs/session-types';

interface PerQuestionBarChartProps {
  answers: AnswerData[];
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
          key={`bar-tooltip-${entry.name}`}
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

export default function PerQuestionBarChart({ answers }: PerQuestionBarChartProps) {
  const data = answers
    .filter((answer) => answer.analyzed)
    .map((answer) => ({
      question: `Q${answer.questionNum}`,
      overall: answer.score,
      confidence: answer.confidence,
      clarity: answer.clarity,
    }));

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">No answers were recorded in this session.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        barGap={2}
        barCategoryGap="25%"
        margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="question"
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
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.3 }} />
        <Bar dataKey="overall" radius={[3, 3, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={`cell-overall-${entry.question}`}
              fill={
                entry.overall < 70
                  ? 'var(--danger)'
                  : entry.overall >= 85
                    ? 'var(--success)'
                    : 'var(--primary)'
              }
              opacity={0.85}
            />
          ))}
        </Bar>
        <Bar dataKey="confidence" fill="var(--accent)" radius={[3, 3, 0, 0]} opacity={0.7} />
        <Bar dataKey="clarity" fill="var(--success)" radius={[3, 3, 0, 0]} opacity={0.6} />
      </BarChart>
    </ResponsiveContainer>
  );
}
