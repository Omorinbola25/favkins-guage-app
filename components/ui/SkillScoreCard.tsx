import React from 'react';

interface SkillScoreCardProps {
  label: string;
  score: number;
  delta: number | null;
  icon: React.ReactNode;
  description: string;
}

export default function SkillScoreCard({
  label,
  score,
  delta,
  icon,
  description,
}: SkillScoreCardProps) {
  const scoreColor =
    score >= 80
      ? 'text-success'
      : score >= 65
        ? 'text-primary-light'
        : score >= 50
          ? 'text-warning'
          : 'text-danger';

  return (
    <div className="card-glass hover:bg-card-elevated p-5 transition-all duration-200">
      <div className="mb-3 flex items-center justify-between">
        <div className="bg-muted/50 flex h-9 w-9 items-center justify-center rounded-xl">
          {icon}
        </div>
        {delta === null ? (
          <span className="text-muted-foreground text-xs font-medium">No prior session</span>
        ) : (
          <span className={`text-xs font-medium ${delta >= 0 ? 'text-success' : 'text-danger'}`}>
            {delta >= 0 ? '+' : ''}
            {delta} pts
          </span>
        )}
      </div>
      <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <span className={`font-mono-data text-2xl font-bold ${scoreColor}`}>{score}</span>
        <span className="text-muted-foreground text-sm">/100</span>
      </div>
      <p className="text-muted-foreground mt-1 text-xs">{description}</p>
    </div>
  );
}
