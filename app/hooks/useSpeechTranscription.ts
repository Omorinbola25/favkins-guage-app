'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  getSpeechRecognitionConstructor,
  type SpeechRecognitionEventLike,
  type SpeechRecognitionErrorEventLike,
  type SpeechRecognitionLike,
} from '../libs/speech-recognition-types';

const RECOGNITION_LANGUAGE = 'en-US';
const RECOVERABLE_ERRORS = new Set(['no-speech', 'aborted', 'network']);

interface UseSpeechTranscriptionResult {
  isSupported: boolean;
  interimText: string;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => string;
  cancel: () => void;
}

const subscribeToNothing = () => () => {};
const readSupportOnClient = () => getSpeechRecognitionConstructor() !== null;
const readSupportOnServer = () => false;

export function useSpeechTranscription(): UseSpeechTranscriptionResult {
  const isSupported = useSyncExternalStore(
    subscribeToNothing,
    readSupportOnClient,
    readSupportOnServer
  );
  const [interimText, setInterimText] = useState('');

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef('');
  const shouldKeepListeningRef = useRef(false);

  const createRecognition = useCallback((): SpeechRecognitionLike | null => {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) return null;

    const recognition = new Recognition();
    recognition.lang = RECOGNITION_LANGUAGE;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result[0].transcript;

        if (result.isFinal) {
          finalTranscriptRef.current += `${text.trim()} `;
        } else {
          interim += text;
        }
      }

      setInterimText(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      if (!RECOVERABLE_ERRORS.has(event.error)) {
        shouldKeepListeningRef.current = false;
      }
    };

    recognition.onend = () => {
      if (shouldKeepListeningRef.current) {
        try {
          recognition.start();
        } catch {
          shouldKeepListeningRef.current = false;
        }
      }
    };

    return recognition;
  }, []);

  const beginListening = useCallback(() => {
    const recognition = createRecognition();
    if (!recognition) return;

    shouldKeepListeningRef.current = true;
    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      shouldKeepListeningRef.current = false;
    }
  }, [createRecognition]);

  const start = useCallback(() => {
    finalTranscriptRef.current = '';
    setInterimText('');
    beginListening();
  }, [beginListening]);

  const pause = useCallback(() => {
    shouldKeepListeningRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }, []);

  const resume = useCallback(() => {
    beginListening();
  }, [beginListening]);

  const stop = useCallback(() => {
    shouldKeepListeningRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;

    const transcript = `${finalTranscriptRef.current} ${interimText}`.replace(/\s+/g, ' ').trim();
    setInterimText('');
    return transcript;
  }, [interimText]);

  const cancel = useCallback(() => {
    shouldKeepListeningRef.current = false;
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    finalTranscriptRef.current = '';
    setInterimText('');
  }, []);

  useEffect(() => cancel, [cancel]);

  return { isSupported, interimText, start, pause, resume, stop, cancel };
}
