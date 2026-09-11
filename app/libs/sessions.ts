import {
  doc,
  getDoc,
  collection,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { NotAuthenticatedError, SessionAccessError } from './errors';
import { averageOf } from './scoring';
import { removeAllRecordingsForSession } from './firestore-audio-store';
import type { SessionData, SessionStats, StoredSession } from './session-types';

export type {
  AnswerData,
  SessionData,
  SessionStats,
  StoredSession,
  ScoreTier,
} from './session-types';

const SESSIONS_PAGE_SIZE = 20;
const STATS_SAMPLE_SIZE = 100;

function requireCurrentUserId(): string {
  const user = auth.currentUser;
  if (!user) throw new NotAuthenticatedError();
  return user.uid;
}

function sessionsCollection(userId: string) {
  return collection(db, 'users', userId, 'sessions');
}

export function createSessionId(): string {
  return doc(sessionsCollection(requireCurrentUserId())).id;
}

export async function saveSession(
  sessionId: string,
  sessionData: Omit<SessionData, 'createdAt'>
): Promise<string> {
  const userId = requireCurrentUserId();

  try {
    await setDoc(doc(db, 'users', userId, 'sessions', sessionId), {
      ...sessionData,
      createdAt: new Date().toISOString(),
    });
    return sessionId;
  } catch (error) {
    throw new SessionAccessError('Could not save this session.', error);
  }
}

export async function getSessions(
  limitCount: number = SESSIONS_PAGE_SIZE
): Promise<StoredSession[]> {
  const userId = requireCurrentUserId();

  try {
    const sessionsQuery = query(
      sessionsCollection(userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(sessionsQuery);

    return snapshot.docs.map((snapshotDoc) => ({
      ...(snapshotDoc.data() as SessionData),
      id: snapshotDoc.id,
    }));
  } catch (error) {
    throw new SessionAccessError('Could not load your sessions.', error);
  }
}

export async function getSessionById(sessionId: string): Promise<StoredSession | null> {
  const userId = requireCurrentUserId();

  try {
    const snapshot = await getDoc(doc(db, 'users', userId, 'sessions', sessionId));
    if (!snapshot.exists()) return null;

    return { ...(snapshot.data() as SessionData), id: snapshot.id };
  } catch (error) {
    throw new SessionAccessError('Could not load this session.', error);
  }
}

export async function getPreviousSession(createdAt: string): Promise<StoredSession | null> {
  const userId = requireCurrentUserId();

  try {
    const previousQuery = query(
      sessionsCollection(userId),
      where('createdAt', '<', createdAt),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(previousQuery);
    const previous = snapshot.docs[0];
    if (!previous) return null;

    return { ...(previous.data() as SessionData), id: previous.id };
  } catch (error) {
    throw new SessionAccessError('Could not load your previous session.', error);
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  const userId = requireCurrentUserId();

  await removeAllRecordingsForSession(sessionId);

  try {
    await deleteDoc(doc(db, 'users', userId, 'sessions', sessionId));
  } catch (error) {
    throw new SessionAccessError('Could not delete this session.', error);
  }
}

export function buildSessionStats(sessions: StoredSession[]): SessionStats {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      averageScore: 0,
      bestScore: 0,
      averageConfidence: 0,
      averageClarity: 0,
      totalFillerWords: 0,
      recentSessions: [],
    };
  }

  const scores = sessions.map((session) => session.overallScore);

  return {
    totalSessions: sessions.length,
    averageScore: averageOf(scores),
    bestScore: Math.max(...scores),
    averageConfidence: averageOf(sessions.map((session) => session.confidence)),
    averageClarity: averageOf(sessions.map((session) => session.clarity)),
    totalFillerWords: sessions.reduce((total, session) => total + session.fillerWords, 0),
    recentSessions: sessions.slice(0, 8),
  };
}

export async function getSessionStats(): Promise<SessionStats> {
  return buildSessionStats(await getSessions(STATS_SAMPLE_SIZE));
}
