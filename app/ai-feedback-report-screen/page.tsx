import React, { Suspense } from 'react';
import AppLayout from '@/components/AppLayout';
import FeedbackReportClient from './components/FeedbackReportClient';
import ReportStateMessage from './components/ReportStateMessage';

export default function AIFeedbackReportPage() {
  return (
    <AppLayout>
      <Suspense fallback={<ReportStateMessage state="loading" />}>
        <FeedbackReportClient />
      </Suspense>
    </AppLayout>
  );
}
