import { useState, useEffect, useRef } from 'react';

export function useSleepTimer(audioRef: React.RefObject<HTMLAudioElement | null>) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (audioRef.current) {
              audioRef.current.pause();
            }
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, timeRemaining, audioRef]);

  const startTimer = (minutes: number) => {
    setTimeRemaining(minutes * 60);
    setIsActive(true);
  };

  const cancelTimer = () => {
    setIsActive(false);
    setTimeRemaining(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return {
    timeRemaining,
    isActive,
    startTimer,
    cancelTimer,
  };
}
