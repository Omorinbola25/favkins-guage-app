'use client';

import React, { useEffect, useState } from 'react';
import { Award, TrendingUp, Clock, MessageSquare } from 'lucide-react';
import { getStarComplianceScore, getTierForScore } from '../../libs/scoring';
import type { StoredSession } from '../../libs/session-types';

interface ReportHeroProps {
  session: StoredSession;
  previousSession: StoredSession | null;
}

const RING_RADIUS = 54;
const ANIMATION_STEPS = 40;
const ANIMATION_INTERVAL_MS = 35;

function useAnimatedScore(targetScore: number): number {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (targetScore <= 0) return;

    let current = 0;
    const step = Math.ceil(targetScore / ANIMATION_STEPS);
    const interval = setInterval(() => {
      current = Math.min(current + step, targetScore);
      setDisplayScore(current);
      if (current >= targetScore) clearInterval(interval);
    }, ANIMATION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [targetScore]);

  return displayScore;
}

function buildInsight(session: StoredSession): string {
  const starScore = getStarComplianceScore(session.answers);
  const strengths = [
    { label: 'Confidence', value: session.confidence },
    { label: 'Clarity', value: session.clarity },
    { label: 'Structure', value: starScore },
  ].sort((first, second) => second.value - first.value);

  const strongest = strengths[0];
  const weakest = strengths[strengths.length - 1];
  const fillerNote =
    session.fillerWords === 0
      ? 'You used no filler words at all'
      : `You used ${session.fillerWords} filler word${session.fillerWords === 1 ? '' : 's'} across ${session.questions} question${session.questions === 1 ? '' : 's'}`;

  return `Your strongest area was ${strongest.label} (${strongest.value}/100), and the biggest opportunity is ${weakest.label} (${weakest.value}/100). ${fillerNote}.`;
}

export default function ReportHero({ session, previousSession }: ReportHeroProps) {
  const displayScore = useAnimatedScore(session.overallScore);
  const tier = getTierForScore(session.overallScore);
  const circumference = 2 * Math.PI * RING_RADIUS;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;
  const scoreDelta = previousSession ? session.overallScore - previousSession.overallScore : null;

  const quickStats = [
    {
      id: 'stat-questions',
      icon: MessageSquare,
      label: 'Questions',
      value: `${session.questions}`,
      unit: 'answered',
    },
    {
      id: 'stat-duration',
      icon: Clock,
      label: 'Duration',
      value: session.duration,
      unit: 'min:sec',
    },
    {
      id: 'stat-delta',
      icon: TrendingUp,
      label: 'vs Last Session',
      value: scoreDelta === null ? 'N/A' : `${scoreDelta >= 0 ? '+' : ''}${scoreDelta}`,
      unit: scoreDelta === null ? 'first session' : 'pts',
    },
    {
      id: 'stat-fillers',
      icon: Award,
      label: 'Filler Words',
      value: `${session.fillerWords}`,
      unit: 'total',
    },
  ];

  return (
    <div className="card-glass relative overflow-hidden p-6 lg:p-8">
      <div className="blob-violet pointer-events-none absolute top-0 right-0 h-96 w-96 opacity-20" />
      <div className="blob-cyan pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 opacity-10" />

      <div className="relative z-10 flex flex-col items-center gap-8 lg:flex-row lg:items-start">
        <div className="flex flex-shrink-0 flex-col items-center">
          <div className="relative h-36 w-36">
            <svg
              className="h-full w-full -rotate-90"
              viewBox="0 0 120 120"
              role="img"
              aria-label={`Overall score ${session.overallScore} out of 100`}
            >
              <circle
                cx="60"
                cy="60"
                r={RING_RADIUS}
                fill="none"
                stroke="var(--muted)"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r={RING_RADIUS}
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-75"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--accent)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono-data text-foreground text-4xl font-bold">
                {displayScore}
              </span>
              <span className="text-muted-foreground text-xs font-medium">/100</span>
            </div>
          </div>
          <p className="text-muted-foreground mt-3 text-sm font-medium">Overall Score</p>
          <div className="bg-primary/10 text-primary-light border-primary/30 mt-2 rounded-full border px-3 py-1.5 text-xs font-semibold">
            {session.tierLabel || tier.label}
          </div>
        </div>

        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-foreground mb-2 text-xl font-bold">{tier.headline}</h2>
          <p className="text-secondary-foreground mb-6 max-w-lg text-sm leading-relaxed">
            {tier.description} {buildInsight(session)}
          </p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {quickStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.id} className="bg-muted/50 border-border/50 rounded-xl border p-3">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Icon size={13} className="text-muted-foreground" />
                    <p className="text-muted-foreground text-xs">{stat.label}</p>
                  </div>
                  <p className="font-mono-data text-foreground text-base font-bold">{stat.value}</p>
                  <p className="text-muted-foreground text-xs">{stat.unit}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
