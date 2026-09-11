'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Headphones } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import AnswerPlayback from './AnswerPlayback';
import { IDEAL_ANSWER_SECONDS, getTierForScore } from '../../libs/scoring';
import type { AnswerData } from '../../libs/session-types';

type BadgeVariant = 'good' | 'excellent' | 'fair' | 'poor' | 'info';

const CATEGORY_VARIANTS: Record<string, BadgeVariant> = {
  Technical: 'good',
  'System Design': 'good',
  Leadership: 'excellent',
  'Cultural Fit': 'fair',
};

const COLUMN_HEADINGS = [
  '#',
  'Category',
  'Question',
  'Duration',
  'Score',
  'Confidence',
  'Clarity',
  'Fillers',
  'STAR',
  'Tier',
];

interface AnswerBreakdownTableProps {
  answers: AnswerData[];
}

function UnscoredCell() {
  return <span className="font-mono-data text-muted-foreground text-sm">N/A</span>;
}

function ScoreChip({ value }: { value: number }) {
  const color =
    value >= 80
      ? 'text-success'
      : value >= 65
        ? 'text-primary-light'
        : value >= 50
          ? 'text-warning'
          : 'text-danger';
  return <span className={`font-mono-data text-sm font-semibold ${color}`}>{value}</span>;
}

function fillerColor(count: number): string {
  if (count === 0) return 'text-success';
  if (count <= 2) return 'text-secondary-foreground';
  if (count <= 4) return 'text-warning';
  return 'text-danger';
}

export default function AnswerBreakdownTable({ answers }: AnswerBreakdownTableProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const toggleRow = (questionNum: number) =>
    setExpandedQuestion((current) => (current === questionNum ? null : questionNum));

  return (
    <div className="card-glass">
      <div className="border-border border-b p-6">
        <h2 className="text-foreground text-base font-semibold">Answer-by-Answer Breakdown</h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Click any row to play your recording and read the transcript
        </p>
      </div>

      {answers.length === 0 ? (
        <p className="text-muted-foreground px-6 py-8 text-sm">
          No answers were recorded in this session.
        </p>
      ) : (
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-border border-b">
                {COLUMN_HEADINGS.map((heading) => (
                  <th
                    key={`answer-th-${heading}`}
                    scope="col"
                    className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wide whitespace-nowrap uppercase"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {answers.map((answer) => {
                const isExpanded = expandedQuestion === answer.questionNum;
                const tier = getTierForScore(answer.score);
                const isOffPace =
                  answer.durationSec < IDEAL_ANSWER_SECONDS.minimum ||
                  answer.durationSec > IDEAL_ANSWER_SECONDS.maximum;

                return (
                  <React.Fragment key={`answer-${answer.questionNum}`}>
                    <tr
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      aria-controls={`answer-details-${answer.questionNum}`}
                      aria-label={`Question ${answer.questionNum}: ${answer.question}. ${isExpanded ? 'Collapse' : 'Expand'} to ${isExpanded ? 'hide' : 'see'} your recording, transcript and feedback`}
                      onClick={() => toggleRow(answer.questionNum)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          toggleRow(answer.questionNum);
                        }
                      }}
                      className={`border-border/50 focus-visible:bg-muted/30 focus-visible:ring-ring cursor-pointer border-b transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset ${
                        isExpanded ? 'bg-muted/25 hover:bg-muted/35' : 'hover:bg-muted/30'
                      }`}
                    >
                      <td className="font-mono-data text-muted-foreground px-4 py-3.5 text-sm">
                        <span className="flex items-center gap-1.5">
                          Q{answer.questionNum}
                          {answer.recordingKey && (
                            <Headphones
                              size={13}
                              className="text-primary"
                              aria-label="Recording available"
                            />
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge
                          variant={CATEGORY_VARIANTS[answer.category] ?? 'info'}
                          label={answer.category}
                        />
                      </td>
                      <td className="max-w-xs px-4 py-3.5">
                        <p className="text-foreground truncate text-sm">{answer.question}</p>
                      </td>
                      <td className="font-mono-data px-4 py-3.5 text-sm whitespace-nowrap">
                        <span className={isOffPace ? 'text-warning' : 'text-secondary-foreground'}>
                          {answer.duration}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {answer.analyzed ? <ScoreChip value={answer.score} /> : <UnscoredCell />}
                      </td>
                      <td className="px-4 py-3.5">
                        {answer.analyzed ? (
                          <ScoreChip value={answer.confidence} />
                        ) : (
                          <UnscoredCell />
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {answer.analyzed ? <ScoreChip value={answer.clarity} /> : <UnscoredCell />}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`font-mono-data text-sm font-medium ${fillerColor(answer.fillerWords)}`}
                        >
                          {answer.analyzed ? answer.fillerWords : 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {!answer.analyzed ? (
                          <span className="font-mono-data text-muted-foreground text-sm">N/A</span>
                        ) : answer.starCompliance ? (
                          <CheckCircle2
                            size={15}
                            className="text-success"
                            aria-label="Followed STAR"
                          />
                        ) : (
                          <AlertTriangle
                            size={15}
                            className="text-warning"
                            aria-label="Did not follow STAR"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <StatusBadge variant={tier.tier} label={tier.label} />
                          {isExpanded ? (
                            <ChevronUp size={14} className="text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronDown
                              size={14}
                              className="text-muted-foreground flex-shrink-0"
                            />
                          )}
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr id={`answer-details-${answer.questionNum}`} className="bg-muted/10">
                        <td colSpan={COLUMN_HEADINGS.length} className="px-6 py-5">
                          <div className="mb-5">
                            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-widest uppercase">
                              Your Recording
                            </p>
                            <AnswerPlayback recordingKey={answer.recordingKey} />
                          </div>
                          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                              <p className="text-muted-foreground mb-2 text-xs font-medium tracking-widest uppercase">
                                Transcript
                              </p>
                              <div className="bg-background border-border rounded-xl border p-4">
                                <p className="text-secondary-foreground font-mono-data text-sm leading-relaxed">
                                  {answer.transcript ||
                                    'No transcript was captured for this answer.'}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-2 text-xs font-medium tracking-widest uppercase">
                                AI Feedback
                              </p>
                              <div className="bg-primary/5 border-primary/20 rounded-xl border p-4">
                                <p className="text-secondary-foreground text-sm leading-relaxed">
                                  {answer.feedback || 'No feedback was generated for this answer.'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
