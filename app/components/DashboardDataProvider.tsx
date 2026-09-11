'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { buildSessionStats, getSessions } from '../libs/sessions';
import { toUserFacingMessage } from '../libs/errors';
import type { SessionStats, StoredSession } from '../libs/session-types';
import { useAuth } from '../hooks/useAuth';

const DASHBOARD_SAMPLE_SIZE = 100;

const EMPTY_SESSIONS: StoredSession[] = [];
const EMPTY_STATS: SessionStats = buildSessionStats(EMPTY_SESSIONS);

interface DashboardState {
  status: 'loading' | 'loaded' | 'error';
  sessions: StoredSession[];
  stats: SessionStats | null;
  error: string | null;
}

export interface DashboardData {
  loading: boolean;
  sessions: StoredSession[];
  stats: SessionStats | null;
  error: string | null;
  refresh: () => void;
}

const INITIAL_STATE: DashboardState = {
  status: 'loading',
  sessions: EMPTY_SESSIONS,
  stats: null,
  error: null,
};

const DashboardDataContext = createContext<DashboardData | null>(null);

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<DashboardState>(INITIAL_STATE);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => setRefreshToken((token) => token + 1), []);
  const canFetch = !authLoading && Boolean(user);

  useEffect(() => {
    if (!canFetch) return;

    let active = true;

    const load = async () => {
      setState(INITIAL_STATE);

      try {
        const fetched = await getSessions(DASHBOARD_SAMPLE_SIZE);
        if (!active) return;
        setState({
          status: 'loaded',
          sessions: fetched,
          stats: buildSessionStats(fetched),
          error: null,
        });
      } catch (caught) {
        if (!active) return;
        setState({
          status: 'error',
          sessions: EMPTY_SESSIONS,
          stats: null,
          error: toUserFacingMessage(caught),
        });
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [canFetch, refreshToken]);

  const value = useMemo<DashboardData>(() => {
    if (!authLoading && !user) {
      return { loading: false, sessions: EMPTY_SESSIONS, stats: EMPTY_STATS, error: null, refresh };
    }

    return {
      loading: authLoading || state.status === 'loading',
      sessions: state.sessions,
      stats: state.stats,
      error: state.error,
      refresh,
    };
  }, [authLoading, user, state, refresh]);

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
}

export function useDashboardData(): DashboardData {
  const context = useContext(DashboardDataContext);

  if (!context) {
    throw new Error('useDashboardData must be used inside a DashboardDataProvider.');
  }

  return context;
}
