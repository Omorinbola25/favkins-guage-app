'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronUp, ChevronDown, Eye, RotateCcw, Mic, Trash2, Loader2 } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';
import { useDashboardData } from './DashboardDataProvider';
import { deleteSession } from '../libs/sessions';
import { toUserFacingMessage } from '../libs/errors';
import { resolveRoleId } from '../../app/libs/role';
import { formatSessionTimestamp } from '../../app/libs/scoring';
import type { StoredSession } from '../../app/libs/session-types';

type SortKey = 'createdAt' | 'overallScore' | 'confidence' | 'clarity' | 'fillerWords';

function ScoreCell({ value }: { value: number }) {
  const color =
    value >= 80
      ? 'text-success'
      : value >= 65
        ? 'text-primary'
        : value >= 50
          ? 'text-warning'
          : 'text-danger';
  return <span className={`font-mono text-sm font-semibold ${color}`}>{value}</span>;
}

const COLUMNS: Array<{ label: string; key: SortKey | null }> = [
  { label: 'Date', key: 'createdAt' },
  { label: 'Role / Target', key: null },
  { label: 'Questions', key: null },
  { label: 'Duration', key: null },
  { label: 'Overall', key: 'overallScore' },
  { label: 'Confidence', key: 'confidence' },
  { label: 'Clarity', key: 'clarity' },
  { label: 'Filler Words', key: 'fillerWords' },
  { label: 'Tier', key: null },
  { label: 'Actions', key: null },
];

function SortIcon({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) {
  if (!active) {
    return (
      <ChevronUp
        size={12}
        className="text-muted-foreground opacity-30 transition-opacity duration-150 group-hover:opacity-70"
        aria-hidden
      />
    );
  }
  return direction === 'asc' ? (
    <ChevronUp size={12} className="text-primary" aria-hidden />
  ) : (
    <ChevronDown size={12} className="text-primary" aria-hidden />
  );
}

export default function RecentSessionsTable() {
  const { sessions, loading, refresh } = useDashboardData();
  const [sessionToDelete, setSessionToDelete] = useState<StoredSession | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const closeDeleteDialog = () => {
    if (!isDeleting) setSessionToDelete(null);
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;
    setIsDeleting(true);

    try {
      await deleteSession(sessionToDelete.id);
      toast.success('Session deleted', { description: 'The session and its recordings are gone.' });
      setSessionToDelete(null);
      refresh();
    } catch (error) {
      toast.error('Could not delete that session', { description: toUserFacingMessage(error) });
    } finally {
      setIsDeleting(false);
    }
  };

  const searchTerm = search.trim().toLowerCase();

  const filtered = sessions
    .filter(
      (session: StoredSession) =>
        session.role?.toLowerCase().includes(searchTerm) ||
        session.company?.toLowerCase().includes(searchTerm)
    )
    .sort((first: StoredSession, second: StoredSession) => {
      const direction = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'createdAt') {
        return direction * first.createdAt.localeCompare(second.createdAt);
      }
      return direction * (first[sortKey] - second[sortKey]);
    });

  if (loading) {
    return (
      <div className="bg-card border-border rounded-2xl border p-6">
        <div className="animate-pulse">
          <div className="bg-muted mb-4 h-6 w-1/4 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-muted h-12 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-border rounded-2xl border">
      <div className="border-border flex items-center justify-between gap-4 border-b p-6">
        <div>
          <h2 className="text-foreground text-base font-semibold">Recent Sessions</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {sessions.length} sessions completed
          </p>
        </div>
        <div className="relative">
          <Search
            size={14}
            className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
          />
          <input
            type="text"
            placeholder="Search role or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search sessions by role or company"
            className="bg-muted border-border text-foreground placeholder:text-muted-foreground hover:border-primary/40 focus:border-primary/60 focus:ring-ring w-56 rounded-lg border py-2 pr-4 pl-9 text-sm transition-all duration-200 focus:ring-2 focus:outline-none"
          />
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <Mic size={32} className="text-muted-foreground opacity-40" />
          <p className="text-foreground text-sm font-medium">No sessions yet</p>
          <p className="text-muted-foreground text-xs">
            Complete your first practice interview to see results here
          </p>
          <Link href="/roles" className="btn-primary mt-2">
            Start Practice
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-border border-b">
                  {COLUMNS.map((column) => {
                    const isSorted = column.key !== null && sortKey === column.key;
                    return (
                      <th
                        key={column.label}
                        scope="col"
                        aria-sort={
                          isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined
                        }
                        className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wide whitespace-nowrap uppercase"
                      >
                        {column.key === null ? (
                          column.label === 'Actions' ? (
                            <span className="sr-only">Actions</span>
                          ) : (
                            column.label
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => column.key && handleSort(column.key)}
                            className="group hover:text-foreground -mx-1 flex items-center gap-1 rounded px-1 uppercase transition-colors duration-150"
                          >
                            {column.label}
                            <SortIcon active={isSorted} direction={sortDir} />
                          </button>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filtered.map((session: StoredSession) => (
                  <tr
                    key={session.id}
                    className="group border-border/50 hover:bg-muted/30 border-b transition-colors duration-100"
                  >
                    <td className="text-muted-foreground px-4 py-3.5 font-mono text-sm whitespace-nowrap">
                      {session.date}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-foreground text-sm font-medium">{session.role || 'N/A'}</p>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {session.company || 'N/A'}
                      </p>
                    </td>
                    <td className="text-secondary-foreground px-4 py-3.5 font-mono text-sm">
                      {session.questions}
                    </td>
                    <td className="text-secondary-foreground px-4 py-3.5 text-sm whitespace-nowrap">
                      {session.duration}
                    </td>
                    <td className="px-4 py-3.5">
                      <ScoreCell value={session.overallScore} />
                    </td>
                    <td className="px-4 py-3.5">
                      <ScoreCell value={session.confidence} />
                    </td>
                    <td className="px-4 py-3.5">
                      <ScoreCell value={session.clarity} />
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`font-mono text-sm font-medium ${session.fillerWords > 25 ? 'text-danger' : session.fillerWords > 15 ? 'text-warning' : 'text-success'}`}
                      >
                        {session.fillerWords}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge
                        variant={session.tier || 'fair'}
                        label={session.tierLabel || 'N/A'}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 transition-opacity duration-150 focus-within:opacity-100 sm:opacity-60 sm:group-hover:opacity-100">
                        <Link
                          href={`/ai-feedback-report-screen?session=${session.id}`}
                          aria-label={`Open the report for your ${session.role} session on ${session.date}`}
                          title="Open report"
                          className="btn-icon hover:text-primary"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          href={`/interview-session-screen?role=${encodeURIComponent(resolveRoleId(session.role, session.roleId))}`}
                          aria-label={`Practise ${session.role} again`}
                          title="Practise again"
                          className="btn-icon hover:text-accent"
                        >
                          <RotateCcw size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSessionToDelete(session)}
                          disabled={isDeleting && sessionToDelete?.id === session.id}
                          aria-label={`Delete your ${session.role} session on ${session.date}`}
                          title="Delete session"
                          className="btn-icon hover:bg-danger/10 hover:text-danger"
                        >
                          {isDeleting && sessionToDelete?.id === session.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={COLUMNS.length}
                      className="text-muted-foreground px-4 py-10 text-center text-sm"
                    >
                      No sessions match &ldquo;{search}&rdquo;.{' '}
                      <button
                        type="button"
                        onClick={() => setSearch('')}
                        className="text-primary-light hover:text-primary font-medium underline-offset-4 transition-colors duration-150 hover:underline"
                      >
                        Clear search
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-border flex items-center justify-between border-t px-6 py-4">
            <p className="text-muted-foreground text-xs">
              Showing {filtered.length} of {sessions.length} sessions
            </p>
          </div>
        </>
      )}
      <ConfirmDialog
        open={sessionToDelete !== null}
        tone="danger"
        title="Delete this session?"
        description={
          sessionToDelete && (
            <>
              This permanently deletes your{' '}
              <span className="text-foreground font-medium">{sessionToDelete.role}</span> session
              and every recorded answer in it. This cannot be undone.
            </>
          )
        }
        confirmLabel="Delete session"
        pendingLabel="Deleting"
        pending={isDeleting}
        onConfirm={confirmDelete}
        onCancel={closeDeleteDialog}
      >
        {sessionToDelete && (
          <dl className="bg-muted/40 border-border/60 grid grid-cols-3 gap-3 rounded-xl border p-3">
            <div>
              <dt className="text-muted-foreground text-xs">Recorded</dt>
              <dd className="text-foreground mt-0.5 text-sm font-medium">
                {formatSessionTimestamp(sessionToDelete.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Questions</dt>
              <dd className="font-mono-data text-foreground mt-0.5 text-sm font-medium">
                {sessionToDelete.questions}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Score</dt>
              <dd className="font-mono-data text-foreground mt-0.5 text-sm font-medium">
                {sessionToDelete.overallScore}/100
              </dd>
            </div>
          </dl>
        )}
      </ConfirmDialog>
    </div>
  );
}
