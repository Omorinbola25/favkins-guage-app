'use client';

import React, { useEffect, useState } from 'react';
import { MicOff } from 'lucide-react';
import { recordingStore } from '../../libs/recording-storage';

type PlaybackStatus = 'loading' | 'ready' | 'missing';

interface AnswerPlaybackProps {
  recordingKey?: string;
}

export default function AnswerPlayback({ recordingKey }: AnswerPlaybackProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<PlaybackStatus>('loading');

  useEffect(() => {
    if (!recordingKey) return;

    let active = true;
    let createdUrl: string | null = null;

    const load = async () => {
      try {
        const playbackUrl = await recordingStore.createPlaybackUrl(recordingKey);

        if (!active) {
          if (playbackUrl) recordingStore.revokePlaybackUrl(playbackUrl);
          return;
        }

        if (!playbackUrl) {
          setStatus('missing');
          return;
        }

        createdUrl = playbackUrl;
        setUrl(playbackUrl);
        setStatus('ready');
      } catch {
        if (active) setStatus('missing');
      }
    };

    load();

    return () => {
      active = false;
      if (createdUrl) recordingStore.revokePlaybackUrl(createdUrl);
    };
  }, [recordingKey]);

  if (!recordingKey) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <MicOff size={13} aria-hidden />
        <span>No audio was recorded for this answer.</span>
      </div>
    );
  }

  if (status === 'missing') {
    return (
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <MicOff size={13} aria-hidden />
        <span>This recording is not available on this device.</span>
      </div>
    );
  }

  if (status === 'loading' || !url) {
    return (
      <div className="bg-muted/40 h-10 animate-pulse rounded-xl" aria-label="Loading recording" />
    );
  }

  return (
    <audio controls preload="metadata" src={url} className="w-full">
      Your browser cannot play this recording.
    </audio>
  );
}
