import { useEffect, useRef } from 'react';

interface UseAppLifecyclePlaybackRecoveryProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  userWantsToPlay: boolean;
  isPlaying: boolean;
  onResumeNeeded: () => void;
}

export function useAppLifecyclePlaybackRecovery({
  audioRef,
  userWantsToPlay,
  isPlaying,
  onResumeNeeded,
}: UseAppLifecyclePlaybackRecoveryProps) {
  const wasPlayingBeforeHiddenRef = useRef(false);
  const resumeAttemptedRef = useRef(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (document.hidden) {
        // Page is being hidden - do NOT pause intentionally
        // Just track state for potential recovery
        wasPlayingBeforeHiddenRef.current = isPlaying && userWantsToPlay;
        resumeAttemptedRef.current = false;
        console.log('[Lifecycle] Page hidden, was playing:', wasPlayingBeforeHiddenRef.current);
      } else {
        // Page is becoming visible
        console.log('[Lifecycle] Page visible, should resume:', wasPlayingBeforeHiddenRef.current, 'userWantsToPlay:', userWantsToPlay);
        
        // Only resume if user wants to play AND we haven't attempted yet
        if (wasPlayingBeforeHiddenRef.current && userWantsToPlay && !resumeAttemptedRef.current) {
          resumeAttemptedRef.current = true;
          
          // Check if audio is paused (OS may have stopped it)
          if (audio.paused) {
            console.log('[Lifecycle] Attempting to resume playback');
            
            // Try to resume playback
            audio.play().catch((err) => {
              console.warn('[Lifecycle] Auto-resume failed:', err.message);
              // Notify parent that manual resume is needed
              onResumeNeeded();
            });
          }
        } else if (!userWantsToPlay) {
          console.log('[Lifecycle] User does not want to play, skipping auto-resume');
        }
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      // Handle page restoration from bfcache
      if (event.persisted) {
        console.log('[Lifecycle] Page restored from bfcache, userWantsToPlay:', userWantsToPlay);
        const audio = audioRef.current;
        
        // Only resume if user wants to play
        if (audio && userWantsToPlay && audio.paused) {
          console.log('[Lifecycle] Attempting to resume after bfcache restore');
          audio.play().catch((err) => {
            console.warn('[Lifecycle] Resume after bfcache failed:', err.message);
            onResumeNeeded();
          });
        }
      }
    };

    const handleFocus = () => {
      const audio = audioRef.current;
      if (!audio) return;

      // Window regained focus - only resume if user wants to play
      if (userWantsToPlay && audio.paused && !resumeAttemptedRef.current) {
        console.log('[Lifecycle] Window focused, attempting resume');
        resumeAttemptedRef.current = true;
        
        audio.play().catch((err) => {
          console.warn('[Lifecycle] Resume on focus failed:', err.message);
          onResumeNeeded();
        });
      } else if (!userWantsToPlay) {
        console.log('[Lifecycle] Window focused but user does not want to play');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);
    };
  }, [audioRef, userWantsToPlay, isPlaying, onResumeNeeded]);

  // Reset resume attempted flag when playback state changes
  useEffect(() => {
    if (isPlaying) {
      resumeAttemptedRef.current = false;
    }
  }, [isPlaying]);
}
