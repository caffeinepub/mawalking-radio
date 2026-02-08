import { useEffect, useRef } from 'react';

interface UseStreamInterruptionRecoveryProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  userWantsToPlay: boolean;
  streamUrl: string;
  onRecoveryStateChange: (state: string) => void;
  onRecoveryError: (message: string) => void;
}

const MAX_RETRY_ATTEMPTS = 5;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds
const MAX_RETRY_DELAY = 30000; // 30 seconds
const STALL_TIMEOUT = 15000; // 15 seconds

export function useStreamInterruptionRecovery({
  audioRef,
  userWantsToPlay,
  streamUrl,
  onRecoveryStateChange,
  onRecoveryError,
}: UseStreamInterruptionRecoveryProps) {
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stallTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRecoveringRef = useRef(false);

  const clearTimeouts = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (stallTimeoutRef.current) {
      clearTimeout(stallTimeoutRef.current);
      stallTimeoutRef.current = null;
    }
  };

  const getRetryDelay = (attemptNumber: number): number => {
    // Exponential backoff with max cap
    const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attemptNumber), MAX_RETRY_DELAY);
    return delay;
  };

  const attemptRecovery = async () => {
    const audio = audioRef.current;
    if (!audio || !userWantsToPlay || isRecoveringRef.current) {
      return;
    }

    if (retryCountRef.current >= MAX_RETRY_ATTEMPTS) {
      console.error('[Recovery] Max retry attempts reached');
      onRecoveryStateChange('error');
      onRecoveryError('Unable to connect to stream. Please check your connection and try again.');
      isRecoveringRef.current = false;
      return;
    }

    isRecoveringRef.current = true;
    retryCountRef.current += 1;
    const delay = getRetryDelay(retryCountRef.current - 1);

    console.log(`[Recovery] Attempt ${retryCountRef.current}/${MAX_RETRY_ATTEMPTS} after ${delay}ms`);
    onRecoveryStateChange('reconnecting');

    retryTimeoutRef.current = setTimeout(async () => {
      if (!userWantsToPlay) {
        console.log('[Recovery] User no longer wants to play, aborting recovery');
        isRecoveringRef.current = false;
        return;
      }

      try {
        // Reload the audio source
        audio.load();
        
        // Attempt to play
        await audio.play();
        
        console.log('[Recovery] Successfully recovered playback');
        retryCountRef.current = 0;
        isRecoveringRef.current = false;
      } catch (error: any) {
        console.warn('[Recovery] Recovery attempt failed:', error.message);
        isRecoveringRef.current = false;
        
        // Try again if user still wants to play
        if (userWantsToPlay) {
          attemptRecovery();
        }
      }
    }, delay);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      console.log('[Recovery] Stream ended');
      if (userWantsToPlay) {
        console.log('[Recovery] User wants to play, attempting recovery');
        attemptRecovery();
      }
    };

    const handleStalled = () => {
      console.log('[Recovery] Stream stalled');
      if (userWantsToPlay) {
        // Set a timeout to attempt recovery if stall persists
        stallTimeoutRef.current = setTimeout(() => {
          console.log('[Recovery] Stall timeout reached, attempting recovery');
          attemptRecovery();
        }, STALL_TIMEOUT);
      }
    };

    const handleError = () => {
      console.log('[Recovery] Stream error');
      if (userWantsToPlay) {
        console.log('[Recovery] User wants to play, attempting recovery');
        attemptRecovery();
      }
    };

    const handleProgress = () => {
      // Clear stall timeout if we're making progress
      if (stallTimeoutRef.current) {
        clearTimeout(stallTimeoutRef.current);
        stallTimeoutRef.current = null;
      }
    };

    const handlePlaying = () => {
      // Successfully playing - reset retry count
      retryCountRef.current = 0;
      isRecoveringRef.current = false;
      clearTimeouts();
    };

    const handlePause = () => {
      // Clear any pending recovery attempts when paused
      if (!userWantsToPlay) {
        clearTimeouts();
        isRecoveringRef.current = false;
        retryCountRef.current = 0;
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('error', handleError);
    audio.addEventListener('progress', handleProgress);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('progress', handleProgress);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      clearTimeouts();
    };
  }, [audioRef, userWantsToPlay, streamUrl]);

  // Reset retry count when user intent changes
  useEffect(() => {
    if (!userWantsToPlay) {
      retryCountRef.current = 0;
      isRecoveringRef.current = false;
      clearTimeouts();
    }
  }, [userWantsToPlay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, []);
}
