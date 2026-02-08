import { useEffect, useState, useLayoutEffect, RefObject } from 'react';

interface MarqueeMeasurements {
  shouldAnimate: boolean;
  duration: number;
  distance: string;
  gap: number;
  remountKey: string;
}

/**
 * Custom hook that measures container/text widths, determines overflow,
 * and computes marquee CSS custom properties for seamless right-to-left scrolling.
 * Handles dynamic element changes and ensures measurements stay synchronized.
 */
export function useMarqueeMeasurements(
  containerRef: RefObject<HTMLElement | null>,
  textRef: RefObject<HTMLElement | null>,
  text: string,
  speedPxPerSecond: number = 140
): MarqueeMeasurements {
  const [measurements, setMeasurements] = useState<MarqueeMeasurements>({
    shouldAnimate: false,
    duration: 10,
    distance: '0px',
    gap: 32,
    remountKey: '0',
  });

  // Use layout effect for synchronous measurement after DOM paint
  useLayoutEffect(() => {
    let rafId: number | null = null;
    let retryTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let retryAttempts = 0;

    const measureAndUpdate = () => {
      if (!containerRef.current || !textRef.current) {
        // Schedule retry if elements aren't ready (max 10 attempts)
        if (retryAttempts < 10) {
          retryAttempts++;
          retryTimeoutId = setTimeout(() => {
            rafId = requestAnimationFrame(measureAndUpdate);
          }, 50);
        }
        return;
      }

      // Get computed dimensions
      const containerWidth = containerRef.current.clientWidth;
      const textWidth = textRef.current.scrollWidth;

      // If zero width, schedule retry (element might not be laid out yet)
      if ((containerWidth === 0 || textWidth === 0) && retryAttempts < 10) {
        retryAttempts++;
        retryTimeoutId = setTimeout(() => {
          rafId = requestAnimationFrame(measureAndUpdate);
        }, 50);
        return;
      }

      const hasOverflow = textWidth > containerWidth;

      if (hasOverflow) {
        const gap = 32; // 2rem spacing between duplicates
        const totalDistance = textWidth + gap;
        
        // For right-to-left: animate from 0 to negative total distance
        // This moves the text from its starting position (visible) to the left (off-screen)
        const distance = `-${totalDistance}px`;

        // Calculate duration based on configured speed
        const calculatedDuration = totalDistance / speedPxPerSecond;
        // Clamp duration to prevent extremely fast/slow animations
        const clampedDuration = Math.max(3, Math.min(30, calculatedDuration));

        // Create unique key based on measurements to force remount when they change
        const remountKey = `${text}-${containerWidth}-${textWidth}-${clampedDuration}-${speedPxPerSecond}`;

        setMeasurements((prev) => {
          // Only update if values actually changed
          if (
            prev.shouldAnimate === true &&
            prev.duration === clampedDuration &&
            prev.distance === distance &&
            prev.gap === gap &&
            prev.remountKey === remountKey
          ) {
            return prev;
          }

          return {
            shouldAnimate: true,
            duration: clampedDuration,
            distance,
            gap,
            remountKey,
          };
        });
      } else {
        setMeasurements((prev) => {
          // Only update if we're currently animating
          if (!prev.shouldAnimate) {
            return prev;
          }

          return {
            shouldAnimate: false,
            duration: 10,
            distance: '0px',
            gap: 32,
            remountKey: `${text}-no-overflow`,
          };
        });
      }
    };

    // Initial measurement with RAF
    rafId = requestAnimationFrame(measureAndUpdate);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (retryTimeoutId !== null) {
        clearTimeout(retryTimeoutId);
      }
    };
  }, [text, containerRef, textRef, speedPxPerSecond]);

  // Separate effect for resize/orientation observers
  useEffect(() => {
    const container = containerRef.current;
    const textElement = textRef.current;

    if (!container || !textElement) {
      return;
    }

    let rafId: number | null = null;

    const measureAndUpdate = () => {
      if (!containerRef.current || !textRef.current) {
        return;
      }

      const containerWidth = containerRef.current.clientWidth;
      const textWidth = textRef.current.scrollWidth;

      if (containerWidth === 0 || textWidth === 0) {
        return;
      }

      const hasOverflow = textWidth > containerWidth;

      if (hasOverflow) {
        const gap = 32;
        const totalDistance = textWidth + gap;
        const distance = `-${totalDistance}px`;
        const calculatedDuration = totalDistance / speedPxPerSecond;
        const clampedDuration = Math.max(3, Math.min(30, calculatedDuration));
        const remountKey = `${text}-${containerWidth}-${textWidth}-${clampedDuration}-${speedPxPerSecond}`;

        setMeasurements((prev) => {
          if (
            prev.shouldAnimate === true &&
            prev.duration === clampedDuration &&
            prev.distance === distance &&
            prev.gap === gap &&
            prev.remountKey === remountKey
          ) {
            return prev;
          }

          return {
            shouldAnimate: true,
            duration: clampedDuration,
            distance,
            gap,
            remountKey,
          };
        });
      } else {
        setMeasurements((prev) => {
          if (!prev.shouldAnimate) {
            return prev;
          }

          return {
            shouldAnimate: false,
            duration: 10,
            distance: '0px',
            gap: 32,
            remountKey: `${text}-no-overflow`,
          };
        });
      }
    };

    // Set up ResizeObserver for both container and text size changes
    let containerObserver: ResizeObserver | null = null;
    let textObserver: ResizeObserver | null = null;
    
    try {
      containerObserver = new ResizeObserver(() => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        rafId = requestAnimationFrame(measureAndUpdate);
      });

      textObserver = new ResizeObserver(() => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        rafId = requestAnimationFrame(measureAndUpdate);
      });

      containerObserver.observe(container);
      textObserver.observe(textElement);
    } catch (e) {
      console.warn('ResizeObserver not available');
    }

    // Listen for window resize and orientation changes
    const handleResize = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(measureAndUpdate);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Listen for font loading completion
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        setTimeout(() => {
          rafId = requestAnimationFrame(measureAndUpdate);
        }, 100);
      });
    }

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (containerObserver) {
        containerObserver.disconnect();
      }
      if (textObserver) {
        textObserver.disconnect();
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [text, containerRef, textRef, speedPxPerSecond]);

  return measurements;
}
