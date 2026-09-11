export interface AudioRecording {
  blob: Blob;
  mimeType: string;
  durationSec: number;
  sizeBytes: number;
}

export interface StoredAudioReference {
  key: string;
  mimeType: string;
  sizeBytes: number;
  durationSec: number;
}

export interface AudioStore {
  save(key: string, recording: AudioRecording): Promise<StoredAudioReference>;
  createPlaybackUrl(key: string): Promise<string | null>;
  revokePlaybackUrl(url: string): void;
  remove(key: string): Promise<void>;
}

export function buildRecordingKey(sessionId: string, questionNum: number): string {
  return `${sessionId}/q${questionNum}`;
}
