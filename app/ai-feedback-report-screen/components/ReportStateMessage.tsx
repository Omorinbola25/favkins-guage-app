import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, FileQuestion } from 'lucide-react';
import PageLoader from '@/components/ui/PageLoader';

type ReportState = 'loading' | 'error' | 'not-found';

interface ReportStateMessageProps {
  state: ReportState;
  message?: string;
  onRetry?: () => void;
}

const STATE_CONTENT: Record<
  Exclude<ReportState, 'loading'>,
  { icon: React.ElementType; title: string; body: string; iconClass: string }
> = {
  error: {
    icon: AlertCircle,
    title: 'We could not load this report',
    body: 'Something went wrong while reading your session.',
    iconClass: 'text-danger',
  },
  'not-found': {
    icon: FileQuestion,
    title: 'Report not found',
    body: 'This session does not exist, or it belongs to a different account.',
    iconClass: 'text-warning',
  },
};

export default function ReportStateMessage({ state, message, onRetry }: ReportStateMessageProps) {
  if (state === 'loading') {
    return (
      <PageLoader
        title="Loading your report"
        message={message ?? 'Fetching this session from your history.'}
      />
    );
  }

  const { icon: Icon, title, body, iconClass } = STATE_CONTENT[state];

  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-20 lg:px-8">
      <div className="card-glass mx-auto flex max-w-md flex-col items-center p-10 text-center">
        <Icon size={32} className={iconClass} aria-hidden />
        <h1 className="text-foreground mt-4 text-lg font-semibold">{title}</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{message ?? body}</p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onRetry && (
            <button type="button" onClick={onRetry} className="btn-secondary">
              Try again
            </button>
          )}
          <Link href="/" className="btn-primary">
            Back to dashboard
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
