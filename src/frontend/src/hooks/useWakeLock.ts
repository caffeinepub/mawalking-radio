import { useEffect, useRef, useCallback } from 'react';

interface WakeLockSentinel {
  release: () => Promise<void>;
  released: boolean;
  type: string;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
}

export function useWakeLock(isActive: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const isRequestingRef = useRef(false);

  const isSupported = 'wakeLock' in navigator;

  const requestWakeLock = useCallback(async () => {
    if (!isSupported || isRequestingRef.current) {
      return false;
    }

    // Don't request if we already have an active wake lock
    if (wakeLockRef.current && !wakeLockRef.current.released) {
      return true;
    }

    isRequestingRef.current = true;

    try {
      const wakeLock = await (navigator as any).wakeLock.request('screen');
      wakeLockRef.current = wakeLock;

      console.log('[WakeLock] Acquired successfully');

      // Listen for wake lock release
      wakeLock.addEventListener('release', () => {
        console.log('[WakeLock] Released by system');
        wakeLockRef.current = null;
      });

      isRequestingRef.current = false;
      return true;
    } catch (err: any) {
      console.warn('[WakeLock] Request failed:', err.message);
      wakeLockRef.current = null;
      isRequestingRef.current = false;
      return false;
    }
  }, [isSupported]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current && !wakeLockRef.current.released) {
      try {
        await wakeLockRef.current.release();
        console.log('[WakeLock] Released manually');
      } catch (err) {
        console.warn('[WakeLock] Release failed:', err);
      }
      wakeLockRef.current = null;
    }
  }, []);

  // Request wake lock when active, release when inactive
  useEffect(() => {
    if (isActive && isSupported) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
  }, [isActive, isSupported, requestWakeLock, releaseWakeLock]);

  // Re-request wake lock on visibility change if still active
  useEffect(() => {
    if (!isSupported) return;

    const handleVisibilityChange = () => {
      if (!document.hidden && isActive) {
        // Page became visible and playback is active - re-request wake lock
        console.log('[WakeLock] Page visible, re-requesting wake lock');
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, isSupported, requestWakeLock]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

  return {
    isSupported,
    requestWakeLock,
    releaseWakeLock,
    isActive: wakeLockRef.current !== null && !wakeLockRef.current.released,
  };
}
