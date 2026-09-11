'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useDashboardData } from './DashboardDataProvider';

const AreaChart = dynamic(() => import('./charts/SessionProgressChart'), { ssr: false });
const SkillRadar = dynamic(() => import('./charts/SkillRadarChart'), { ssr: false });

const tabs = [
  { id: 'tab-progress', label: 'Score Progress' },
  { id: 'tab-skills', label: 'Skill Breakdown' },
];

export default function ProgressCharts() {
  const { sessions } = useDashboardData();
  const [activeTab, setActiveTab] = useState('tab-progress');

  return (
    <div className="card-glass h-full p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-base font-semibold">Performance Trends</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {sessions.length === 0
              ? 'No sessions yet'
              : `Last ${Math.min(sessions.length, 14)} session${sessions.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <div
          role="tablist"
          aria-label="Performance views"
          className="bg-muted flex items-center gap-1 rounded-lg p-1"
        >
          {tabs.map((tab) => (
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
      <div className="h-64">
        {activeTab === 'tab-progress' ? (
          <AreaChart sessions={sessions} />
        ) : (
          <SkillRadar sessions={sessions} />
        )}
      </div>
      {activeTab === 'tab-progress' && (
        <div className="border-border mt-4 flex items-center gap-6 border-t pt-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary h-3 w-3 rounded-full" />
            <span className="text-muted-foreground text-xs">Overall Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-accent h-3 w-3 rounded-full" />
            <span className="text-muted-foreground text-xs">Confidence</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-success h-3 w-3 rounded-full" />
            <span className="text-muted-foreground text-xs">Clarity</span>
          </div>
        </div>
      )}
    </div>
  );
}
