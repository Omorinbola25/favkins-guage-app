'use client';

import React from 'react';
import { DashboardDataProvider } from '@/app/components/DashboardDataProvider';
import RecentSessionsTable from '@/app/components/RecentSessionTable';

export default function ReportsIndex() {
  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-8 lg:px-8 xl:px-10 2xl:px-16">
      <div className="mb-8">
        <p className="text-muted-foreground mb-1 text-xs font-medium tracking-widest uppercase">
          AI Feedback Reports
        </p>
        <h1 className="text-foreground text-2xl font-bold">Your Reports</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Open any session to see its full analysis and play back your recorded answers.
        </p>
      </div>

      <DashboardDataProvider>
        <RecentSessionsTable />
      </DashboardDataProvider>
    </div>
  );
}
