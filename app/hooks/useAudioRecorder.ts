'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AudioRecording } from '../libs/audio-store';

export type RecorderStatus =
  'idle' | 'requesting' | 'recording' | 'paused' | 'denied' | 'unsupported' | 'failed';

const SPEECH_BITS_PER_SECOND = 24000;

const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/ogg;codecs=opus',
];

interface UseAudioRecorderResult {
  status: RecorderStatus;
  error: string | null;
  isRecording: boolean;
  start: () => Promise<boolean>;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<AudioRecording | null>;
  cancel: () => void;
}

function pickSupportedMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  return PREFERRED_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? null;
}

function isRecordingSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  );
}

export function useAudioRecorder(): UseAudioRecorderResult {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const recordedMsRef = useRef<number>(0);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  useEffect(() => releaseStream, [releaseStream]);

  const start = useCallback(async () => {
    if (!isRecordingSupported()) {
      setStatus('unsupported');
      setError('This browser cannot record audio. Try Chrome, Edge, or Safari.');
      return false;
    }

    setStatus('requesting');
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickSupportedMimeType();
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: SPEECH_BITS_PER_SECOND,
      });

      chunksRef.current = [];
      recordedMsRef.current = 0;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      streamRef.current = stream;
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();

      recorder.start();
      setStatus('recording');
      return true;
    } catch (caught) {
      releaseStream();
      const isPermissionError =
        caught instanceof DOMException &&
        (caught.name === 'NotAllowedError' || caught.name === 'SecurityError');

      if (isPermissionError) {
        setStatus('denied');
        setError(
          'Microphone access was blocked. Allow it in your browser settings to record your answers.'
        );
      } else {
        setStatus('failed');
        setError('We could not start your microphone. Check that no other app is using it.');
      }
      return false;
    }
  }, [releaseStream]);

  const pause = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== 'recording') return;

    recorder.pause();
    recordedMsRef.current += Date.now() - startedAtRef.current;
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== 'paused') return;

    recorder.resume();
    startedAtRef.current = Date.now();
    setStatus('recording');
  }, []);

  const stop = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      releaseStream();
      setStatus('idle');
      return null;
    }

    if (recorder.state === 'recording') {
      recordedMsRef.current += Date.now() - startedAtRef.current;
    }

    const recording = await new Promise<AudioRecording | null>((resolve) => {
      recorder.onstop = () => {
        const chunks = chunksRef.current;
        if (chunks.length === 0) {
          resolve(null);
          return;
        }

        const mimeType = recorder.mimeType || chunks[0].type || 'audio/webm';
        const blob = new Blob(chunks, { type: mimeType });

        resolve({
          blob,
          mimeType,
          durationSec: Math.round(recordedMsRef.current / 1000),
          sizeBytes: blob.size,
        });
      };

      recorder.stop();
    });

    releaseStream();
    chunksRef.current = [];
    setStatus('idle');
    return recording;
  }, [releaseStream]);

  const cancel = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null;
      recorder.stop();
    }
    chunksRef.current = [];
    recordedMsRef.current = 0;
    releaseStream();
    setStatus('idle');
  }, [releaseStream]);

  return {
    status,
    error,
    isRecording: status === 'recording',
    start,
    pause,
    resume,
    stop,
    cancel,
  };
}
