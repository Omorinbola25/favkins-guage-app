'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import ReportHero from './ReportHero';
import SkillScoreGrid from './SkillScoreGrid';
import ReportCharts from './ReportCharts';
import AnswerBreakdownTable from './AnswerBreakdownTable';
import FillerWordAnalysis from './FillerWordAnalysis';
import ImprovementRecommendations from './ImprovementRecommendations';
import ReportStateMessage from './ReportStateMessage';
import ReportsIndex from './ReportsIndex';
import { useSession } from '../../hooks/useSession';
import { formatSessionTimestamp } from '../../libs/scoring';
import { resolveRoleId } from '../../libs/role';

export default function FeedbackReportClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const { session, previousSession, loading, error, notFound, reload } = useSession(sessionId);

  if (!sessionId) return <ReportsIndex />;
  if (loading) return <ReportStateMessage state="loading" />;
  if (error) return <ReportStateMessage state="error" message={error} onRetry={reload} />;
  if (notFound || !session) {
    return (
      <ReportStateMessage
        state="not-found"
        message="This session does not exist, or it belongs to a different account."
      />
    );
  }

  const practiceHref = `/interview-session-screen?role=${encodeURIComponent(resolveRoleId(session.role, session.roleId))}`;

  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-8 lg:px-8 xl:px-10 2xl:px-16">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground mb-1 text-xs font-medium tracking-widest uppercase">
            AI Feedback Report
          </p>
          <h1 className="text-foreground text-2xl font-bold">Session Analysis</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            {session.role} · {session.company} ·{' '}
            <span className="font-mono-data">
              {formatSessionTimestamp(session.createdAt)} · {session.duration}
            </span>
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          <Link
            href={practiceHref}
            className="bg-primary hover:bg-primary-dark flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-200 active:scale-95"
          >
            <RotateCcw size={15} />
            <span className="hidden sm:block">Practice Again</span>
          </Link>
        </div>
      </div>

      <ReportHero session={session} previousSession={previousSession} />

      <div className="mt-6">
        <SkillScoreGrid session={session} previousSession={previousSession} />
      </div>

      <div className="mt-6">
        <ReportCharts session={session} previousSession={previousSession} />
      </div>

      <div className="mt-6">
        <AnswerBreakdownTable answers={session.answers} />
      </div>

      <div className="mt-6">
        <FillerWordAnalysis answers={session.answers} />
      </div>

      <div className="mt-6 mb-8">
        <ImprovementRecommendations session={session} />
      </div>
    </div>
  );
}
