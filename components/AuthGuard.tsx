'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLoader from '@/components/ui/PageLoader';
import { useAuth } from '../app/hooks/useAuth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return <PageLoader title="Checking your session" />;
  }

  if (!user) {
    return (
      <PageLoader
        title="Redirecting to sign in"
        message="You need an account to practise and save sessions."
      />
    );
  }

  return <>{children}</>;
}
