import { useEffect, useState, useLayoutEffect } from 'react';

interface MarqueeMeasurements {
  shouldAnimate: boolean;
  duration: number;
  distance: string;
  gap: number;
  remountKey: string;
}

/**
 * Custom hook that measures container/text widths, determines overflow,
 * and computes marquee CSS custom properties for seamless left-to-right scrolling.
 * Handles dynamic element changes and ensures measurements stay synchronized across
 * render branch switches (static vs animated).
 */
export function useMarqueeMeasurements(
  container: HTMLElement | null,
  text: HTMLElement | null,
  textContent: string,
  speedPxPerSecond: number = 50
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
      if (!container || !text) {
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
      const containerWidth = container.clientWidth;
      const textWidth = text.scrollWidth;

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
        
        // For left-to-right: animate from negative total distance to 0
        const distance = `-${totalDistance}px`;

        // Calculate duration based on configured speed
        const calculatedDuration = totalDistance / speedPxPerSecond;
        // Clamp duration to prevent extremely fast/slow animations
        const clampedDuration = Math.max(4, Math.min(40, calculatedDuration));

        // Create unique key based on measurements to force remount when they change
        const remountKey = `${textContent}-${containerWidth}-${textWidth}-${clampedDuration}-${speedPxPerSecond}`;

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
            remountKey: `${textContent}-no-overflow`,
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
  }, [textContent, container, text, speedPxPerSecond]);

  // Separate effect for resize/orientation observers
  useEffect(() => {
    if (!container || !text) {
      return;
    }

    let rafId: number | null = null;

    const measureAndUpdate = () => {
      if (!container || !text) {
        return;
      }

      const containerWidth = container.clientWidth;
      const textWidth = text.scrollWidth;

      if (containerWidth === 0 || textWidth === 0) {
        return;
      }

      const hasOverflow = textWidth > containerWidth;

      if (hasOverflow) {
        const gap = 32;
        const totalDistance = textWidth + gap;
        const distance = `-${totalDistance}px`;
        const calculatedDuration = totalDistance / speedPxPerSecond;
        const clampedDuration = Math.max(4, Math.min(40, calculatedDuration));
        const remountKey = `${textContent}-${containerWidth}-${textWidth}-${clampedDuration}-${speedPxPerSecond}`;

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
            remountKey: `${textContent}-no-overflow`,
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
      textObserver.observe(text);
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
  }, [textContent, container, text, speedPxPerSecond]);

  return measurements;
}
