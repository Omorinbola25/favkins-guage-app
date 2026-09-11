import React from 'react';
import AppLayout from '@/components/AppLayout';
import { DashboardDataProvider } from './components/DashboardDataProvider';
import DashboardHero from './components/DashboardHero';
import RecentSessionsTable from './components/RecentSessionTable';
import ProgressCharts from './components/progressCharts';
import QuickStartPanel from './components/QuickStartPanel';

export default function DashboardPage() {
  return (
    <AppLayout>
      <DashboardDataProvider>
        <div className="mx-auto max-w-screen-2xl px-6 py-8 lg:px-8 xl:px-10 2xl:px-16">
          <DashboardHero />
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ProgressCharts />
            </div>
            <div className="lg:col-span-1">
              <QuickStartPanel />
            </div>
          </div>
          <div className="mt-8">
            <RecentSessionsTable />
          </div>
        </div>
      </DashboardDataProvider>
    </AppLayout>
  );
}
