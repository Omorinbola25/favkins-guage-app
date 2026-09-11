import React from 'react';
import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  title?: string;
  message?: string;
}

export default function PageLoader({ title = 'Loading', message }: PageLoaderProps) {
  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-20 lg:px-8">
      <div
        role="status"
        aria-live="polite"
        className="card-glass mx-auto flex max-w-md flex-col items-center p-10 text-center"
      >
        <Loader2 size={32} className="text-primary animate-spin" aria-hidden />
        <h1 className="text-foreground mt-4 text-lg font-semibold">{title}</h1>
        {message && <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{message}</p>}
      </div>
    </div>
  );
}
