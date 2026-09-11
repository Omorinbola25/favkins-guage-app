'use client';

import React from 'react';
import Link from 'next/link';
import { Mic, TrendingUp, Award, ArrowRight, Hand } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDashboardData } from './DashboardDataProvider';

const READY_SCORE = 85;

export default function QuickStartPanel() {
  const { user } = useAuth();
  const { stats, loading } = useDashboardData();

  const firstName = user?.displayName?.split(' ')[0] ?? 'there';
  const totalSessions = stats?.totalSessions ?? 0;
  const averageScore = stats?.averageScore ?? 0;
  const hasSessions = totalSessions > 0;
  const pointsToReady = Math.max(READY_SCORE - averageScore, 0);

  if (loading) {
    return (
      <div className="bg-card border-border animate-pulse rounded-2xl border p-6">
        <div className="bg-muted mb-4 h-6 w-3/4 rounded" />
        <div className="bg-muted mb-6 h-4 w-1/2 rounded" />
        <div className="bg-muted mb-4 h-24 rounded-xl" />
        <div className="bg-muted h-12 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-card border-border rounded-2xl border p-6">
      <h3 className="text-foreground mb-2 flex items-center gap-2 text-base font-semibold">
        Welcome back, {firstName}
        <Hand size={16} className="text-accent" aria-hidden />
      </h3>
      <p className="text-muted-foreground mb-6 text-sm">
        {hasSessions
          ? `You have completed ${totalSessions} session${totalSessions === 1 ? '' : 's'}. Keep going.`
          : 'Start your first practice session today.'}
      </p>

      <div className="bg-muted/30 mb-6 rounded-xl p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-muted-foreground text-xs tracking-widest uppercase">
            Readiness Score
          </span>
          <span className="text-foreground text-2xl font-bold">{averageScore}/100</span>
        </div>
        <div className="bg-muted h-2 w-full rounded-full">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(averageScore, 100)}%` }}
          />
        </div>
        <p className="text-muted-foreground mt-2 text-xs">
          {hasSessions
            ? pointsToReady === 0
              ? 'You have reached Interview Ready.'
              : `${pointsToReady} pts to Interview Ready`
            : 'Complete a session to get your first score'}
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-success" />
          <span className="text-foreground text-sm">
            <span className="text-success font-semibold">{totalSessions}</span> sessions
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Award size={16} className="text-accent" />
          <span className="text-foreground text-sm">
            Best: <span className="font-semibold">{stats?.bestScore ?? 0}</span>
          </span>
        </div>
      </div>

      <Link
        href="/roles"
        className="group from-primary to-primary/80 hover:from-primary-dark hover:to-primary shadow-primary/25 hover:shadow-primary/40 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.98]"
      >
        <Mic size={18} aria-hidden />
        Start Practice
        <ArrowRight
          size={16}
          className="ml-1 transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden
        />
      </Link>

      <p className="text-muted-foreground mt-3 text-center text-xs">
        About 15 min · Voice-enabled · AI feedback
      </p>
    </div>
  );
}
