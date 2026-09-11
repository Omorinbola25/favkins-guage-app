'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mic,
  MicOff,
  Clock,
  ArrowLeft,
  SkipForward,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner';
import { createSessionId, saveSession } from '../../libs/sessions';
import { buildRecordingKey, type AudioRecording } from '../../libs/audio-store';
import { recordingStore } from '../../libs/recording-storage';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useSpeechTranscription } from '../../hooks/useSpeechTranscription';
import { analyseTranscript, buildAnswerFeedback } from '../../libs/speech-analysis';
import type { AnswerData, SessionData } from '../../libs/session-types';
import { formatDuration, summarizeSession } from '../../libs/scoring';
import { getQuestionsForRole, getRoleById } from '../../libs/role';

async function persistRecordings(
  sessionId: string,
  answers: AnswerData[],
  recordings: Map<number, AudioRecording>
): Promise<AnswerData[]> {
  return Promise.all(
    answers.map(async (answer) => {
      const recording = recordings.get(answer.questionNum);
      if (!recording) return answer;

      const key = buildRecordingKey(sessionId, answer.questionNum);

      try {
        const stored = await recordingStore.save(key, recording);
        return { ...answer, recordingKey: stored.key, recordingMimeType: stored.mimeType };
      } catch (error) {
        console.error(`Could not store the recording for question ${answer.questionNum}`, error);
        return answer;
      }
    })
  );
}

export default function InterviewSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ─── Get role from URL ──────────────────────────────────────
  const roleId = searchParams.get('role') || 'software-engineer';
  const role = getRoleById(roleId);
  const questionList = getQuestionsForRole(roleId);

  // ─── State ──────────────────────────────────────────────────
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [answers, setAnswers] = useState<AnswerData[]>([]);
  const recordingsRef = useRef<Map<number, AudioRecording>>(new Map());
  const recorder = useAudioRecorder();
  const transcription = useSpeechTranscription();
  const transcriptsRef = useRef<Map<number, string>>(new Map());

  const isRequestingMicrophone = recorder.status === 'requesting';
  const currentQuestion = questionList[currentQuestionIndex];
  const totalQuestions = questionList.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // ─── Timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  const handleStartRecording = async () => {
    const started = await recorder.start();

    if (!started) {
      toast.error('Microphone unavailable', {
        description: recorder.error ?? 'We could not start recording.',
      });
      return;
    }

    transcription.start();
    setIsRecording(true);
    setIsPaused(false);
    setHasRecorded(true);
    toast.info('Recording started', { description: 'Speak clearly into your microphone.' });
  };

  const handlePauseRecording = () => {
    if (isPaused) {
      recorder.resume();
      transcription.resume();
      setIsPaused(false);
      toast.info('Recording resumed');
      return;
    }

    recorder.pause();
    transcription.pause();
    setIsPaused(true);
    toast.info('Recording paused');
  };

  const handleStopRecording = async (): Promise<AudioRecording | null> => {
    const recording = await recorder.stop();
    const transcript = transcription.stop();
    setIsRecording(false);
    setIsPaused(false);

    if (!recording) {
      toast.warning('Nothing was captured', { description: 'Try recording that answer again.' });
      setHasRecorded(false);
      return null;
    }

    const questionNumber = currentQuestionIndex + 1;
    recordingsRef.current.set(questionNumber, recording);
    transcriptsRef.current.set(questionNumber, transcript);

    toast.success('Answer captured', {
      description: transcript
        ? 'Your answer was transcribed and scored.'
        : 'Recorded, but no speech was detected to score.',
    });
    return recording;
  };

  // ─── Save Current Answer and Move ──────────────────────────
  const saveCurrentAnswerAndMove = () => {
    const questionNumber = currentQuestionIndex + 1;
    const recording = recordingsRef.current.get(questionNumber);
    const currentDuration = recording?.durationSec ?? timeElapsed;
    const transcript = transcriptsRef.current.get(questionNumber) ?? '';
    const analysis = analyseTranscript(transcript, currentDuration);
    const analyzed = analysis.wordCount > 0;

    const answerData: AnswerData = {
      questionNum: questionNumber,
      category: currentQuestion.category,
      question: currentQuestion.text,
      duration: formatDuration(currentDuration),
      durationSec: currentDuration,
      score: analysis.score,
      confidence: analysis.confidence,
      clarity: analysis.clarity,
      fillerWords: analysis.fillerWords,
      starCompliance: analysis.starCompliance,
      transcript,
      feedback: analyzed
        ? buildAnswerFeedback(analysis)
        : 'No speech was captured for this answer, so it could not be scored.',
      analyzed,
      wordsPerMinute: analyzed ? analysis.wordsPerMinute : undefined,
      recordingMimeType: recording?.mimeType,
    };
    setAnswers((previous) => [...previous, answerData]);

    if (currentQuestionIndex >= totalQuestions - 1) {
      setIsCompleted(true);
      toast.success('Interview complete!', { description: 'All questions answered.' });
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeElapsed(0);
      setHasRecorded(false);
      setIsRecording(false);
      toast.info(`Question ${currentQuestionIndex + 2} of ${totalQuestions}`);
    }
  };

  const handleNextQuestion = async () => {
    let hasCapturedAnswer = hasRecorded;

    if (isRecording) {
      hasCapturedAnswer = (await handleStopRecording()) !== null;
    }

    if (!hasCapturedAnswer) {
      toast.warning('Please record your answer first, or tap Skip.', {
        description: 'Your answer needs to be recorded.',
      });
      return;
    }

    saveCurrentAnswerAndMove();
  };

  const handleSkip = () => {
    recorder.cancel();
    transcription.cancel();
    recordingsRef.current.delete(currentQuestionIndex + 1);
    transcriptsRef.current.delete(currentQuestionIndex + 1);
    setIsRecording(false);
    setIsPaused(false);
    toast.warning('Skipped question', { description: 'You can come back to it later.' });
    const answerData: AnswerData = {
      questionNum: currentQuestionIndex + 1,
      category: currentQuestion.category,
      question: currentQuestion.text,
      duration: '00:00',
      durationSec: 0,
      score: 0,
      confidence: 0,
      clarity: 0,
      fillerWords: 0,
      starCompliance: false,
      transcript: '',
      feedback: 'This question was skipped.',
      analyzed: false,
    };
    setAnswers((prev) => [...prev, answerData]);

    if (currentQuestionIndex >= totalQuestions - 1) {
      setIsCompleted(true);
      toast.success('Interview complete!', { description: 'All questions processed.' });
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeElapsed(0);
      setHasRecorded(false);
      setIsRecording(false);
    }
  };

  const handleBackToDashboard = () => {
    recorder.cancel();
    transcription.cancel();
    router.push('/');
  };

  // ─── Save to Firestore ─────────────────────────────────────
  const handleCompleteInterview = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const sessionId = createSessionId();
      const answersWithRecordings = await persistRecordings(
        sessionId,
        answers,
        recordingsRef.current
      );

      const sessionData: Omit<SessionData, 'createdAt'> = {
        date: new Date().toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        }),
        role: role?.title ?? 'Software Engineer',
        roleId,
        company: 'FAANG-tier',
        ...summarizeSession(answersWithRecordings),
        answers: answersWithRecordings,
      };

      const docId = await saveSession(sessionId, sessionData);
      toast.success('Session saved', { description: 'Your interview data has been stored.' });

      setTimeout(() => {
        router.push(`/ai-feedback-report-screen?session=${docId}`);
      }, 1000);
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Failed to save session', { description: 'Please try again.' });
      setIsSaving(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────

  if (isCompleted) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="bg-success/20 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <CheckCircle size={40} className="text-success" />
          </div>
          <h2 className="text-foreground mb-2 text-2xl font-bold">Interview Complete!</h2>
          <p className="text-muted-foreground mb-6">
            You have completed all {totalQuestions} questions for {role?.title || 'this role'}.
          </p>
          <button
            type="button"
            onClick={handleCompleteInterview}
            disabled={isSaving}
            className="btn-primary mx-auto px-8 py-3"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              'View Feedback Reports'
            )}
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-foreground mb-2 text-2xl font-bold">No questions found</h2>
          <p className="text-muted-foreground">Please select a valid role.</p>
          <button type="button" onClick={handleBackToDashboard} className="btn-primary mt-4">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackToDashboard}
            className="group text-muted-foreground hover:bg-muted hover:text-foreground -ml-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-all duration-200"
          >
            <ArrowLeft
              size={16}
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
              aria-hidden
            />
            Back to Dashboard
          </button>
          <span className="text-muted-foreground text-sm font-medium">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
        </div>

        <div className="bg-muted mb-8 h-1.5 w-full rounded-full">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="bg-card border-border mb-8 rounded-2xl border p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <span className="bg-primary/20 text-primary rounded-full px-3 py-1 text-xs font-semibold">
              {currentQuestion.category}
            </span>
            <span className="bg-muted text-muted-foreground flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
              <Clock size={12} />
              Target: {currentQuestion.targetTime}
            </span>
          </div>
          <h2 className="text-foreground text-xl leading-relaxed font-semibold sm:text-2xl">
            {currentQuestion.text}
          </h2>
        </div>

        <div className="bg-card border-border rounded-2xl border p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="text-foreground font-mono text-4xl font-bold">
                {formatDuration(timeElapsed)}
              </div>
              {isRecording && (
                <div className="flex items-center gap-2">
                  <div className="bg-danger h-3 w-3 animate-pulse rounded-full" />
                  <span className="text-danger text-xs font-medium">REC</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  disabled={isRequestingMicrophone}
                  className="bg-primary hover:bg-primary-dark hover:shadow-primary/40 disabled:hover:bg-primary flex items-center gap-3 rounded-full px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                >
                  {isRequestingMicrophone ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Mic size={20} />
                  )}
                  {isRequestingMicrophone ? 'Waiting for microphone' : 'Start Recording'}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handlePauseRecording}
                    className="bg-muted hover:bg-card-elevated border-border hover:border-primary/40 text-foreground flex items-center gap-2 rounded-full border px-6 py-3 font-medium transition-all duration-200 active:scale-95"
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="bg-danger hover:shadow-danger/40 flex items-center gap-2 rounded-full px-6 py-3 font-medium text-white transition-all duration-200 hover:shadow-lg hover:brightness-110 active:scale-95"
                  >
                    <MicOff size={18} />
                    Stop
                  </button>
                </>
              )}
            </div>

            {!transcription.isSupported && (
              <p className="text-warning flex max-w-md items-center gap-2 text-center text-sm">
                <AlertCircle size={14} className="flex-shrink-0" />
                This browser cannot transcribe speech, so your answers will be recorded but not
                scored. Chrome, Edge or Safari will score them.
              </p>
            )}

            {isRecording && transcription.interimText && (
              <div className="border-border bg-muted/30 w-full max-w-2xl rounded-xl border p-4">
                <p className="text-muted-foreground mb-1 text-xs tracking-widest uppercase">
                  Live transcript
                </p>
                <p className="font-mono-data text-secondary-foreground text-sm leading-relaxed">
                  {transcription.interimText}
                </p>
              </div>
            )}

            {recorder.error && (
              <p
                role="alert"
                className="text-danger flex max-w-md items-center gap-2 text-center text-sm"
              >
                <AlertCircle size={14} className="flex-shrink-0" />
                {recorder.error}
              </p>
            )}

            {!isRecording && !hasRecorded && timeElapsed === 0 && !recorder.error && (
              <p className="text-muted-foreground text-sm">
                Press record when you are ready to answer
              </p>
            )}
            {isRecording && (
              <p className="text-success flex items-center gap-2 text-sm">
                <AlertCircle size={14} />
                Recording in progress... Speak clearly.
              </p>
            )}
            {isPaused && (
              <p className="text-warning flex items-center gap-2 text-sm">
                <AlertCircle size={14} />
                Recording paused. Press Resume to continue.
              </p>
            )}
            {!isRecording && hasRecorded && (
              <p className="text-success flex items-center gap-2 text-sm">
                <CheckCircle size={14} />
                Answer recorded! Tap Next Question to continue.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={handleSkip}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all duration-200 active:scale-95"
          >
            <SkipForward size={16} />
            Skip
          </button>
          {!isRecording && hasRecorded && (
            <button type="button" onClick={handleNextQuestion} className="btn-primary px-6 py-2">
              Next Question
              <CheckCircle size={16} />
            </button>
          )}
          {!isRecording && !hasRecorded && timeElapsed === 0 && (
            <span className="text-muted-foreground self-center text-xs">
              Record your answer to continue
            </span>
          )}
          {isRecording && (
            <span className="text-muted-foreground self-center text-xs">
              Stop recording to continue
            </span>
          )}
        </div>

        <div className="bg-muted/30 border-border mt-8 rounded-xl border p-4">
          <h4 className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
            <Lightbulb size={13} aria-hidden />
            Interview Tips
          </h4>
          <ul className="text-muted-foreground list-disc space-y-1 pl-4 text-xs">
            <li>Speak clearly and at a moderate pace</li>
            <li>Use the STAR method (Situation, Task, Action, Result)</li>
            <li>Aim for the target time range</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
