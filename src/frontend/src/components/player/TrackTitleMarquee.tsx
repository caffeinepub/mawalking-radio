import { useEffect, useState } from 'react';
import { useMarqueeMeasurements } from '@/hooks/useMarqueeMeasurements';
import { useKeyboardFocusIntent } from '@/hooks/useKeyboardFocusIntent';
import { useElementCallbackRef } from '@/hooks/useElementCallbackRef';

interface TrackTitleMarqueeProps {
  text: string;
  className?: string;
  speedPxPerSecond?: number;
}

export default function TrackTitleMarquee({ 
  text, 
  className = '',
  speedPxPerSecond = 80
}: TrackTitleMarqueeProps) {
  // Use callback refs to track actual mounted elements
  const [containerElement, containerRef] = useElementCallbackRef<HTMLDivElement>();
  const [textElement, textRef] = useElementCallbackRef<HTMLSpanElement>();
  
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const hasKeyboardIntent = useKeyboardFocusIntent();

  // Use the measurements hook with element-aware refs
  const { shouldAnimate, duration, distance, gap, remountKey } = useMarqueeMeasurements(
    containerElement,
    textElement,
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
      setIsPaused(true);
    }
  };

  const handlePointerUp = () => {
    if (enableAnimation) {
      setIsPaused(false);
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
    // Only pause on focus if we have genuine keyboard navigation intent
    // This prevents mobile screen reader focus from pausing the marquee
    if (enableAnimation && hasKeyboardIntent) {
      setIsPaused(true);
    }
  };

  const handleBlur = () => {
    if (enableAnimation) {
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
      aria-label={enableAnimation ? (isPaused ? `Track title: ${text}. Press to resume scrolling` : `Track title: ${text}. Press to pause scrolling`) : `Track title: ${text}`}
      aria-pressed={enableAnimation ? isPaused : undefined}
    >
      {enableAnimation ? (
        <>
          {/* Visually hidden text for screen readers - announced once */}
          <span className="sr-only">{text}</span>
          {/* Animated marquee wrapper - hidden from screen readers */}
          <div
            key={remountKey}
            className="marquee-wrapper-rtl"
            aria-hidden="true"
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
            <span className="marquee-text">
              {text}
            </span>
          </div>
        </>
      ) : (
        <span ref={textRef} className="inline-block whitespace-nowrap">
          {text}
        </span>
      )}
    </div>
  );
}
