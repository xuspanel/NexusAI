import { useRef, useCallback } from 'react';

/**
 * OPTIMIZED STREAMING HOOK WITH 50MS BATCHED RAF BUFFERING
 */
export function useOptimizedStream() {
  const abortControllerRef = useRef(null);
  const bufferQueueRef = useRef('');
  const timerIdRef = useRef(null);

  const startStream = useCallback(async ({ url, body, onChunk, onComplete, onError }) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    bufferQueueRef.current = '';

    // 50ms Batched RAF Buffer Loop
    const flushBuffer = () => {
      onChunk(bufferQueueRef.current);
      timerIdRef.current = setTimeout(flushBuffer, 50);
    };

    timerIdRef.current = setTimeout(flushBuffer, 50);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('nexusai_auth_token') : null;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        signal: abortController.signal,
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error(`Stream HTTP error ${response.status}`);
      if (!response.body) throw new Error('ReadableStream not supported');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let accumulated = '';
      let streamBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        const lines = streamBuffer.split('\n');
        streamBuffer = lines.pop() || ''; // Keep partial line for next iteration

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const jsonStr = trimmed.replace('data: ', '').trim();
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);
            if (data.token !== undefined) {
              accumulated += data.token;
              bufferQueueRef.current = accumulated;
            }
            if (data.done) break;
          } catch {
            // fallback
          }
        }
      }

      if (timerIdRef.current) clearTimeout(timerIdRef.current);
      bufferQueueRef.current = accumulated;
      onChunk(accumulated);
      onComplete?.(accumulated);
    } catch (err) {
      if (timerIdRef.current) clearTimeout(timerIdRef.current);
      if (err.name !== 'AbortError') {
        onError?.(err);
      }
    } finally {
      if (timerIdRef.current) clearTimeout(timerIdRef.current);
      abortControllerRef.current = null;
    }
  }, []);

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);

  return { startStream, cancelStream };
}
