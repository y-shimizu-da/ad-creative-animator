'use client';

import { useState, useCallback, useRef } from 'react';
import { JobStatus } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const POLL_INTERVAL = 5000;

export function useVideoGeneration(onComplete: (videoUrl: string) => void) {
  const [status, setStatus] = useState<JobStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(
    (jobId: string) => {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`${API_URL}/api/status/${jobId}`);
          if (!res.ok) throw new Error('ステータスの取得に失敗しました');

          const data = await res.json();

          if (data.status === 'complete' && data.videoUrl) {
            stopPolling();
            setStatus('complete');
            onComplete(data.videoUrl);
          } else if (data.status === 'error') {
            stopPolling();
            setStatus('error');
            setError(data.error || '動画生成に失敗しました');
          }
        } catch {
          stopPolling();
          setStatus('error');
          setError('サーバーとの通信に失敗しました');
        }
      }, POLL_INTERVAL);
    },
    [onComplete, stopPolling]
  );

  const submit = useCallback(
    async (imageFile: File, maskBase64: string, prompt: string) => {
      setStatus('uploading');
      setError(null);
      stopPolling();

      try {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('mask', maskBase64);
        formData.append('prompt', prompt);

        const res = await fetch(`${API_URL}/api/generate`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `サーバーエラー (${res.status})`);
        }

        const { jobId } = await res.json();
        setStatus('generating');
        pollStatus(jobId);
      } catch (err: unknown) {
        setStatus('error');
        setError(
          err instanceof Error ? err.message : '予期しないエラーが発生しました'
        );
      }
    },
    [pollStatus, stopPolling]
  );

  return { status, error, submit };
}
