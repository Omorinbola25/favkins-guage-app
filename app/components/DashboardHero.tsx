'use client';

import React from 'react';
import { Award, Clock, MessageSquare, TrendingUp } from 'lucide-react';
import { formatDuration, getTierForScore } from '../libs/scoring';
import { useDashboardData } from './DashboardDataProvider';

export default function DashboardHero() {
  const { sessions, stats, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div className="bg-card border-border animate-pulse rounded-2xl border p-6">
        <div className="bg-muted mb-4 h-7 w-64 rounded" />
        <div className="bg-muted h-24 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border-danger/30 rounded-2xl border p-6">
        <h2 className="text-foreground text-lg font-semibold">We could not load your progress</h2>
        <p className="text-muted-foreground mt-1 text-sm">{error}</p>
      </div>
    );
  }

  const totalSessions = stats?.totalSessions ?? 0;
  const averageScore = stats?.averageScore ?? 0;
  const totalSeconds = sessions.reduce((total, session) => total + session.durationSeconds, 0);
  const tier = getTierForScore(averageScore);

  const tiles = [
    {
      id: 'tile-sessions',
      icon: MessageSquare,
      label: 'Sessions',
      value: `${totalSessions}`,
      unit: 'completed',
    },
    {
      id: 'tile-average',
      icon: TrendingUp,
      label: 'Average Score',
      value: totalSessions === 0 ? 'N/A' : `${averageScore}`,
      unit: totalSessions === 0 ? 'no data yet' : 'out of 100',
    },
    {
      id: 'tile-best',
      icon: Award,
      label: 'Best Score',
      value: totalSessions === 0 ? 'N/A' : `${stats?.bestScore ?? 0}`,
      unit: totalSessions === 0 ? 'no data yet' : 'personal best',
    },
    {
      id: 'tile-practice',
      icon: Clock,
      label: 'Time Practised',
      value: formatDuration(totalSeconds),
      unit: 'min:sec',
    },
  ];

  return (
    <div className="bg-card border-border rounded-2xl border p-6">
      <div className="mb-5">
        <p className="text-muted-foreground mb-1 text-xs font-medium tracking-widest uppercase">
          Your Progress
        </p>
        <h2 className="text-foreground text-xl font-bold">
          {totalSessions === 0
            ? 'No sessions yet'
            : `${tier.label} across ${totalSessions} session${totalSessions === 1 ? '' : 's'}`}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {totalSessions === 0
            ? 'Complete your first practice interview to start tracking your readiness.'
            : tier.description}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div key={tile.id} className="bg-muted/40 border-border/50 rounded-xl border p-3">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Icon size={13} className="text-muted-foreground" aria-hidden />
                <p className="text-muted-foreground text-xs">{tile.label}</p>
              </div>
              <p className="font-mono-data text-foreground text-base font-bold">{tile.value}</p>
              <p className="text-muted-foreground text-xs">{tile.unit}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
