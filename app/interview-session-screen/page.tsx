import React, { Suspense } from 'react';
import AuthGuard from '@/components/AuthGuard';
import PageLoader from '@/components/ui/PageLoader';
import InterviewSessionContent from './components/InterviewSessionContent';

export default function InterviewSessionPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <PageLoader title="Preparing your session" message="Loading questions for this role." />
        }
      >
        <InterviewSessionContent />
      </Suspense>
    </AuthGuard>
  );
}
