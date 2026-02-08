import { useEffect, useRef, useState } from 'react';
import { useMarqueeMeasurements } from '@/hooks/useMarqueeMeasurements';

interface TrackTitleMarqueeProps {
  text: string;
  className?: string;
  speedPxPerSecond?: number;
}

export default function TrackTitleMarquee({ 
  text, 
  className = '',
  speedPxPerSecond = 140
}: TrackTitleMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);
  const lastPointerTimeRef = useRef<number>(0);

  // Use the measurements hook with right-to-left support and configurable speed
  const { shouldAnimate, duration, distance, gap, remountKey } = useMarqueeMeasurements(
    containerRef,
    textRef,
    text,
    speedPxPerSecond
  );

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if ((mediaQuery as any).removeListener) {
        (mediaQuery as any).removeListener(handleChange);
      }
    };
  }, []);

  const enableAnimation = shouldAnimate && !prefersReducedMotion;

  // Interaction handlers for pause/resume
  const handlePointerDown = () => {
    if (enableAnimation) {
      lastPointerTimeRef.current = Date.now();
      setIsPaused(true);
    }
  };

  const handlePointerUp = () => {
    if (enableAnimation) {
      setIsPaused(false);
      setIsKeyboardFocused(false);
    }
  };

  const handlePointerLeave = () => {
    if (enableAnimation && isPaused) {
      setIsPaused(false);
    }
  };

  const handlePointerCancel = () => {
    if (enableAnimation && isPaused) {
      setIsPaused(false);
    }
  };

  const handleFocus = () => {
    if (enableAnimation) {
      const timeSincePointer = Date.now() - lastPointerTimeRef.current;
      if (timeSincePointer > 100) {
        setIsKeyboardFocused(true);
        setIsPaused(true);
      }
    }
  };

  const handleBlur = () => {
    if (enableAnimation) {
      setIsKeyboardFocused(false);
      setIsPaused(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (enableAnimation && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      setIsPaused((prev) => !prev);
    }
  };

  // Ensure paused state is cleared when animation is disabled
  useEffect(() => {
    if (!enableAnimation && isPaused) {
      setIsPaused(false);
      setIsKeyboardFocused(false);
    }
  }, [enableAnimation, isPaused]);

  // Handle global pointer events for edge cases
  useEffect(() => {
    if (!enableAnimation || !isPaused) return;

    const handleGlobalPointerUp = () => {
      setIsPaused(false);
    };

    const handleGlobalPointerCancel = () => {
      setIsPaused(false);
    };

    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerCancel);

    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerCancel);
    };
  }, [enableAnimation, isPaused]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden relative w-full min-w-0 ${className}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerCancel}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      tabIndex={enableAnimation ? 0 : -1}
      role={enableAnimation ? 'button' : undefined}
      aria-label={enableAnimation ? `Track title: ${text}. Press to pause scrolling` : undefined}
      aria-pressed={enableAnimation ? isPaused : undefined}
    >
      {enableAnimation ? (
        <div
          key={remountKey}
          className="marquee-wrapper-rtl"
          style={{
            ['--marquee-duration' as string]: `${duration}s`,
            ['--marquee-distance' as string]: distance,
            ['--marquee-gap' as string]: `${gap}px`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          <span ref={textRef} className="marquee-text">
            {text}
          </span>
          <span className="marquee-text" aria-hidden="true">
            {text}
          </span>
        </div>
      ) : (
        <span ref={textRef} className="inline-block whitespace-nowrap">
          {text}
        </span>
      )}
    </div>
  );
}
