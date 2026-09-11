'use client';

import { useCallback, useEffect, useState } from 'react';
import { getPreviousSession, getSessionById } from '../libs/sessions';
import { toUserFacingMessage } from '../libs/errors';
import type { StoredSession } from '../libs/session-types';
import { useAuth } from './useAuth';

type FetchStatus = 'loading' | 'loaded' | 'not-found' | 'error';

interface FetchResult {
  status: FetchStatus;
  session: StoredSession | null;
  previousSession: StoredSession | null;
  error: string | null;
}

interface UseSessionResult {
  session: StoredSession | null;
  previousSession: StoredSession | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
  reload: () => void;
}

const INITIAL_RESULT: FetchResult = {
  status: 'loading',
  session: null,
  previousSession: null,
  error: null,
};

export function useSession(sessionId: string | null): UseSessionResult {
  const { user, loading: authLoading } = useAuth();
  const [result, setResult] = useState<FetchResult>(INITIAL_RESULT);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);
  const canFetch = !authLoading && Boolean(user) && Boolean(sessionId);

  useEffect(() => {
    if (!canFetch || !sessionId) return;

    let active = true;

    const load = async () => {
      setResult(INITIAL_RESULT);

      try {
        const found = await getSessionById(sessionId);
        if (!active) return;

        if (!found) {
          setResult({ status: 'not-found', session: null, previousSession: null, error: null });
          return;
        }

        const previous = await getPreviousSession(found.createdAt);
        if (!active) return;

        setResult({ status: 'loaded', session: found, previousSession: previous, error: null });
      } catch (caught) {
        if (!active) return;
        setResult({
          status: 'error',
          session: null,
          previousSession: null,
          error: toUserFacingMessage(caught),
        });
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [canFetch, sessionId, reloadToken]);

  if (!sessionId) {
    return {
      session: null,
      previousSession: null,
      loading: authLoading,
      error: null,
      notFound: !authLoading,
      reload,
    };
  }

  return {
    session: result.session,
    previousSession: result.previousSession,
    loading: authLoading || result.status === 'loading',
    error: result.status === 'error' ? result.error : null,
    notFound: result.status === 'not-found',
    reload,
  };
}
