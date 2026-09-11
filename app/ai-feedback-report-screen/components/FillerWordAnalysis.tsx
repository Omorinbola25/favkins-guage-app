import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { getAnalysedAnswers } from '../../libs/scoring';
import type { AnswerData } from '../../libs/session-types';

const FILLERS_PER_ANSWER_TARGET = 1;

interface FillerWordAnalysisProps {
  answers: AnswerData[];
}

function barColor(count: number): string {
  if (count === 0) return 'bg-success/30';
  if (count >= 3) return 'bg-danger/60';
  return 'bg-warning/60';
}

function countColor(count: number): string {
  if (count === 0) return 'text-success';
  if (count >= 3) return 'text-danger';
  return 'text-warning';
}

export default function FillerWordAnalysis({ answers: allAnswers }: FillerWordAnalysisProps) {
  const answers = getAnalysedAnswers(allAnswers);
  const totalFillers = answers.reduce((total, answer) => total + answer.fillerWords, 0);
  const cleanAnswers = answers.filter((answer) => answer.fillerWords === 0).length;
  const maxCount = answers.reduce((highest, answer) => Math.max(highest, answer.fillerWords), 0);
  const target = answers.length * FILLERS_PER_ANSWER_TARGET;
  const averagePerAnswer = answers.length === 0 ? 0 : (totalFillers / answers.length).toFixed(1);
  const isWithinTarget = totalFillers <= target;

  if (answers.length === 0) return null;

  return (
    <div className="card-glass p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-foreground text-base font-semibold">Filler Word Analysis</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {totalFillers} total across {answers.length} question{answers.length === 1 ? '' : 's'}{' '}
            target is under {target}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 ${
            isWithinTarget ? 'bg-success/10 border-success/20' : 'bg-warning/10 border-warning/20'
          }`}
        >
          {isWithinTarget ? (
            <CheckCircle2 size={14} className="text-success" />
          ) : (
            <AlertCircle size={14} className="text-warning" />
          )}
          <span
            className={`text-xs font-medium ${isWithinTarget ? 'text-success' : 'text-warning'}`}
          >
            {isWithinTarget ? 'Within target' : `${totalFillers - target} over target`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <p className="text-muted-foreground mb-4 text-xs font-medium tracking-widest uppercase">
            Summary
          </p>
          <dl className="space-y-3">
            {[
              { label: 'Total filler words', value: `${totalFillers}` },
              { label: 'Average per answer', value: `${averagePerAnswer}` },
              { label: 'Filler-free answers', value: `${cleanAnswers} of ${answers.length}` },
              { label: 'Worst single answer', value: `${maxCount}` },
            ].map((row) => (
              <div
                key={row.label}
                className="border-border/50 flex items-center justify-between border-b pb-2"
              >
                <dt className="text-muted-foreground text-sm">{row.label}</dt>
                <dd className="font-mono-data text-foreground text-sm font-semibold">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <p className="text-muted-foreground mb-4 text-xs font-medium tracking-widest uppercase">
            Per Question
          </p>
          <div className="flex h-24 items-end gap-2">
            {answers.map((answer) => (
              <div
                key={`filler-q${answer.questionNum}`}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <span
                  className={`font-mono-data text-xs font-medium ${countColor(answer.fillerWords)}`}
                >
                  {answer.fillerWords}
                </span>
                <div className="flex w-full flex-col justify-end" style={{ height: '64px' }}>
                  <div
                    className={`w-full rounded-t-sm transition-all duration-500 ${barColor(answer.fillerWords)}`}
                    style={{
                      height: `${maxCount > 0 ? (answer.fillerWords / maxCount) * 100 : 4}%`,
                      minHeight: answer.fillerWords === 0 ? '2px' : '4px',
                    }}
                  />
                </div>
                <span className="text-muted-foreground text-xs">Q{answer.questionNum}</span>
              </div>
            ))}
          </div>
          <div className="border-border text-muted-foreground mt-3 flex items-center gap-4 border-t pt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="bg-success/30 h-2 w-2 rounded-sm" />
              <span>Zero fillers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="bg-warning/60 h-2 w-2 rounded-sm" />
              <span>1 to 2 fillers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="bg-danger/60 h-2 w-2 rounded-sm" />
              <span>3+ fillers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
