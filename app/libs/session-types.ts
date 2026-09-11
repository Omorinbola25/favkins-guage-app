export type ScoreTier = 'excellent' | 'good' | 'fair' | 'poor';

export interface AnswerData {
  questionNum: number;
  category: string;
  question: string;
  duration: string;
  durationSec: number;
  score: number;
  confidence: number;
  clarity: number;
  fillerWords: number;
  starCompliance: boolean;
  transcript: string;
  feedback: string;
  analyzed: boolean;
  wordsPerMinute?: number;
  recordingKey?: string;
  recordingMimeType?: string;
}

export interface SessionData {
  date: string;
  role: string;
  roleId?: string;
  company: string;
  questions: number;
  duration: string;
  durationSeconds: number;
  overallScore: number;
  confidence: number;
  clarity: number;
  fillerWords: number;
  tier: ScoreTier;
  tierLabel: string;
  answers: AnswerData[];
  createdAt: string;
}

export interface StoredSession extends SessionData {
  id: string;
}

export interface SessionStats {
  totalSessions: number;
  averageScore: number;
  bestScore: number;
  averageConfidence: number;
  averageClarity: number;
  totalFillerWords: number;
  recentSessions: StoredSession[];
}
