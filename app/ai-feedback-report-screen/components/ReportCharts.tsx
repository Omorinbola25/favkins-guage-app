'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { getWeakestAnswers } from '../../libs/scoring';
import type { StoredSession } from '../../libs/session-types';

const PerQuestionBarChart = dynamic(() => import('./charts/PerQuestionBarChart'), { ssr: false });
const SkillProfileRadar = dynamic(() => import('./charts/SkillProfileRadar'), { ssr: false });

const TABS = [
  { id: 'tab-per-question', label: 'Per-Question Scores' },
  { id: 'tab-skill-profile', label: 'Skill Profile' },
] as const;

type TabId = (typeof TABS)[number]['id'];

interface ReportChartsProps {
  session: StoredSession;
  previousSession: StoredSession | null;
}

function buildWeakestNote(session: StoredSession): string {
  const belowAverage = session.answers.filter((answer) => answer.score < session.overallScore);
  if (belowAverage.length === 0) return 'Every answer scored at or above your session average.';

  const weakest = getWeakestAnswers(belowAverage, 2).map((answer) => `Q${answer.questionNum}`);
  return `${weakest.join(' and ')} scored below your average. See the breakdown below.`;
}

export default function ReportCharts({ session, previousSession }: ReportChartsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('tab-per-question');

  return (
    <div className="card-glass p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-foreground text-base font-semibold">Performance Analysis</h2>
        <div className="bg-muted flex items-center gap-1 rounded-lg p-1" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-card-elevated text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-card-elevated/50 hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-72">
        {activeTab === 'tab-per-question' ? (
          <PerQuestionBarChart answers={session.answers} />
        ) : (
          <SkillProfileRadar session={session} previousSession={previousSession} />
        )}
      </div>
      {activeTab === 'tab-per-question' && (
        <div className="border-border mt-4 flex flex-wrap items-center gap-6 border-t pt-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary h-3 w-3 rounded-sm" />
            <span className="text-muted-foreground text-xs">Overall Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-accent h-3 w-3 rounded-sm" />
            <span className="text-muted-foreground text-xs">Confidence</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-success h-3 w-3 rounded-sm" />
            <span className="text-muted-foreground text-xs">Clarity</span>
          </div>
          <p className="text-muted-foreground ml-auto text-xs">{buildWeakestNote(session)}</p>
        </div>
      )}
    </div>
  );
}
