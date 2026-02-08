import { useEffect, useState, useRef } from 'react';

/**
 * Hook that tracks whether the user is navigating via keyboard.
 * Returns true if recent Tab/Shift+Tab/arrow key activity detected.
 * Helps distinguish keyboard focus from programmatic/screen-reader focus on mobile.
 */
export function useKeyboardFocusIntent(): boolean {
  const [hasKeyboardIntent, setHasKeyboardIntent] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Track navigation keys that indicate keyboard focus intent
      if (
        e.key === 'Tab' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight'
      ) {
        setHasKeyboardIntent(true);

        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Reset after 2 seconds of no keyboard activity
        timeoutRef.current = setTimeout(() => {
          setHasKeyboardIntent(false);
        }, 2000);
      }
    };

    // Reset on any pointer activity (mouse/touch)
    const handlePointerDown = () => {
      setHasKeyboardIntent(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return hasKeyboardIntent;
}
