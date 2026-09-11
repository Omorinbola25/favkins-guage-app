import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { NotAuthenticatedError, SessionAccessError } from './errors';
import { decodeBase64ToBytes, encodeBytesToBase64, splitIntoChunks } from './audio-encoding';
import type { AudioStore, StoredAudioReference } from './audio-store';

const BASE64_CHARS_PER_CHUNK = 700_000;
const MAX_RECORDING_BYTES = 2 * 1024 * 1024;

interface RecordingMetadata {
  mimeType: string;
  durationSec: number;
  sizeBytes: number;
  chunkCount: number;
  createdAt: string;
}

interface RecordingChunk {
  data: string;
}

interface RecordingLocation {
  sessionId: string;
  questionNum: string;
}

function requireCurrentUserId(): string {
  const user = auth.currentUser;
  if (!user) throw new NotAuthenticatedError();
  return user.uid;
}

function parseRecordingKey(key: string): RecordingLocation {
  const [sessionId, questionSegment] = key.split('/');
  if (!sessionId || !questionSegment) {
    throw new SessionAccessError(`Malformed recording key: ${key}`);
  }
  return { sessionId, questionNum: questionSegment };
}

function recordingDocument(userId: string, location: RecordingLocation) {
  return doc(
    db,
    'users',
    userId,
    'sessions',
    location.sessionId,
    'recordings',
    location.questionNum
  );
}

function chunksCollection(userId: string, location: RecordingLocation) {
  return collection(
    db,
    'users',
    userId,
    'sessions',
    location.sessionId,
    'recordings',
    location.questionNum,
    'chunks'
  );
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  return encodeBytesToBase64(new Uint8Array(buffer));
}

export const firestoreAudioStore: AudioStore = {
  async save(key, recording): Promise<StoredAudioReference> {
    const userId = requireCurrentUserId();
    const location = parseRecordingKey(key);

    if (recording.sizeBytes > MAX_RECORDING_BYTES) {
      throw new SessionAccessError(
        'That answer is too long to store. Keep answers under about 10 minutes.'
      );
    }

    try {
      const base64 = await blobToBase64(recording.blob);
      const chunks = splitIntoChunks(base64, BASE64_CHARS_PER_CHUNK);

      const metadata: RecordingMetadata = {
        mimeType: recording.mimeType,
        durationSec: recording.durationSec,
        sizeBytes: recording.sizeBytes,
        chunkCount: chunks.length,
        createdAt: new Date().toISOString(),
      };

      const batch = writeBatch(db);
      batch.set(recordingDocument(userId, location), metadata);

      chunks.forEach((data, index) => {
        batch.set(doc(chunksCollection(userId, location), String(index).padStart(4, '0')), {
          data,
        });
      });

      await batch.commit();

      return {
        key,
        mimeType: recording.mimeType,
        sizeBytes: recording.sizeBytes,
        durationSec: recording.durationSec,
      };
    } catch (error) {
      if (error instanceof SessionAccessError) throw error;
      throw new SessionAccessError('Could not save that recording.', error);
    }
  },

  async createPlaybackUrl(key) {
    const userId = requireCurrentUserId();
    const location = parseRecordingKey(key);

    try {
      const metadataSnapshot = await getDoc(recordingDocument(userId, location));
      if (!metadataSnapshot.exists()) return null;

      const metadata = metadataSnapshot.data() as RecordingMetadata;
      const chunkSnapshot = await getDocs(
        query(chunksCollection(userId, location), orderBy('__name__'))
      );
      if (chunkSnapshot.empty) return null;

      const base64 = chunkSnapshot.docs
        .map((chunk) => (chunk.data() as RecordingChunk).data)
        .join('');
      const blob = new Blob([decodeBase64ToBytes(base64)], { type: metadata.mimeType });

      return URL.createObjectURL(blob);
    } catch (error) {
      throw new SessionAccessError('Could not load that recording.', error);
    }
  },

  revokePlaybackUrl(url) {
    URL.revokeObjectURL(url);
  },

  async remove(key) {
    const userId = requireCurrentUserId();
    const location = parseRecordingKey(key);

    try {
      const chunkSnapshot = await getDocs(chunksCollection(userId, location));
      const batch = writeBatch(db);

      chunkSnapshot.docs.forEach((chunk) => batch.delete(chunk.ref));
      await batch.commit();
      await deleteDoc(recordingDocument(userId, location));
    } catch (error) {
      throw new SessionAccessError('Could not delete that recording.', error);
    }
  },
};

export async function removeAllRecordingsForSession(sessionId: string): Promise<void> {
  const userId = requireCurrentUserId();

  try {
    const recordingsSnapshot = await getDocs(
      collection(db, 'users', userId, 'sessions', sessionId, 'recordings')
    );

    for (const recording of recordingsSnapshot.docs) {
      const location: RecordingLocation = { sessionId, questionNum: recording.id };
      const chunkSnapshot = await getDocs(chunksCollection(userId, location));

      if (!chunkSnapshot.empty) {
        const batch = writeBatch(db);
        chunkSnapshot.docs.forEach((chunk) => batch.delete(chunk.ref));
        await batch.commit();
      }

      await deleteDoc(recording.ref);
    }
  } catch (error) {
    throw new SessionAccessError('Could not delete the recordings for this session.', error);
  }
}
