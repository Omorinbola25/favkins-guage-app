'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

export default function NotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    router?.push('/');
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history?.back();
    }
  };

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <h1 className="text-primary text-9xl font-bold opacity-20">404</h1>
          </div>
        </div>

        <h2 className="text-foreground mb-2 text-2xl font-medium">Page Not Found</h2>
        <p className="text-foreground/70 mb-8">
          The page you are looking for does not exist. Let us get you back.
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <button type="button" onClick={handleGoBack} className="btn-primary px-6 py-3">
            <Icon name="ArrowLeftIcon" size={16} />
            Go Back
          </button>

          <button type="button" onClick={handleGoHome} className="btn-secondary px-6 py-3">
            <Icon name="HomeIcon" size={16} />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
