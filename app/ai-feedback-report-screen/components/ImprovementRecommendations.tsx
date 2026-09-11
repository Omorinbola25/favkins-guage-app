import React from 'react';
import Link from 'next/link';
import { Zap, Target, BookOpen, Gauge, Mic, ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  buildRecommendations,
  type RecommendationKind,
  type RecommendationPriority,
} from '../../libs/recommendations';
import { getWeakestAnswers } from '../../libs/scoring';
import { resolveRoleId } from '../../libs/role';
import type { StoredSession } from '../../libs/session-types';

interface ImprovementRecommendationsProps {
  session: StoredSession;
}

const KIND_ICONS: Record<RecommendationKind, React.ElementType> = {
  fillers: Zap,
  structure: Target,
  pacing: Gauge,
  depth: BookOpen,
  confidence: Mic,
};

const PRIORITY_STYLES: Record<RecommendationPriority, string> = {
  High: 'bg-danger/10 text-danger border-danger/20',
  Medium: 'bg-warning/10 text-warning border-warning/20',
  Low: 'bg-accent/10 text-accent border-accent/20',
};

const ICON_BACKGROUNDS: Record<RecommendationPriority, string> = {
  High: 'bg-danger/10 text-danger',
  Medium: 'bg-warning/10 text-warning',
  Low: 'bg-accent/10 text-accent',
};

function buildNextSessionHint(session: StoredSession): string {
  const weakest = getWeakestAnswers(session.answers, 2);
  if (weakest.length === 0) return 'Run another session to start tracking your progress over time.';

  const labels = weakest.map((answer) => `Q${answer.questionNum}`).join(' and ');
  return `Focus your next session on ${labels}, your lowest scoring answer${weakest.length === 1 ? '' : 's'}.`;
}

export default function ImprovementRecommendations({ session }: ImprovementRecommendationsProps) {
  const recommendations = buildRecommendations(session);
  const practiceHref = `/interview-session-screen?role=${encodeURIComponent(resolveRoleId(session.role, session.roleId))}`;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-foreground text-base font-semibold">Top Improvement Areas</h2>
        <p className="text-muted-foreground text-xs">Prioritized by impact on your overall score</p>
      </div>

      {recommendations.length === 0 ? (
        <div className="card-glass flex items-start gap-4 p-6">
          <div className="bg-success/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl">
            <CheckCircle2 size={18} className="text-success" />
          </div>
          <div>
            <h3 className="text-foreground mb-1 text-sm font-semibold">
              Nothing flagged this session
            </h3>
            <p className="text-secondary-foreground text-sm leading-relaxed">
              Your pacing, structure and filler word counts all landed inside target. Keep the
              streak going with another session.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => {
            const Icon = KIND_ICONS[recommendation.kind];
            return (
              <div
                key={recommendation.id}
                className="card-glass hover:bg-card-elevated p-5 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-shrink-0 flex-col items-center gap-2">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${ICON_BACKGROUNDS[recommendation.priority]}`}
                    >
                      <Icon size={18} />
                    </div>
                    <span className="text-muted-foreground font-mono-data text-xs font-bold">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-foreground text-sm font-semibold">
                          {recommendation.title}
                        </h3>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[recommendation.priority]}`}
                        >
                          {recommendation.priority} Priority
                        </span>
                      </div>
                      <span className="font-mono-data text-muted-foreground hidden flex-shrink-0 text-xs sm:block">
                        {recommendation.metric}
                      </span>
                    </div>

                    <p className="text-secondary-foreground mb-4 text-sm leading-relaxed">
                      {recommendation.description}
                    </p>

                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono-data text-muted-foreground text-xs sm:hidden">
                        {recommendation.metric}
                      </span>
                      <Link
                        href={practiceHref}
                        className="bg-primary/10 hover:bg-primary/20 text-primary-light ml-auto flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 active:scale-95"
                      >
                        Practice again
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card-glass relative mt-6 overflow-hidden p-6">
        <div className="blob-violet pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative z-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h3 className="text-foreground mb-1 text-sm font-semibold">
              Ready to improve these scores?
            </h3>
            <p className="text-muted-foreground text-xs">{buildNextSessionHint(session)}</p>
          </div>
          <Link
            href={practiceHref}
            className="bg-primary hover:bg-primary-dark glow-primary flex flex-shrink-0 items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 active:scale-95"
          >
            Start Next Session
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
