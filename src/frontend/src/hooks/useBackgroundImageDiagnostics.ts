import { useEffect } from 'react';

/**
 * Diagnostic hook that checks if the background image is properly applied
 * and logs a warning if it fails to load.
 */
export function useBackgroundImageDiagnostics() {
  useEffect(() => {
    // Wait for initial paint and CSS to be applied
    const timeoutId = setTimeout(() => {
      const computedStyle = window.getComputedStyle(document.body);
      const backgroundImage = computedStyle.backgroundImage;

      // Check if background image is missing or set to 'none'
      if (!backgroundImage || backgroundImage === 'none' || backgroundImage === '') {
        console.warn(
          '⚠️ Background image failed to load. Expected one of the following paths:\n' +
          'Mobile:\n' +
          '  - /assets/generated/mawalking-user-bg-mobile.dim_1080x1920.avif\n' +
          '  - /assets/generated/mawalking-user-bg-mobile.dim_1080x1920.webp\n' +
          '  - /assets/generated/mawalking-user-bg-mobile.dim_1080x1920.png\n' +
          'Desktop:\n' +
          '  - /assets/generated/mawalking-user-bg.dim_1920x1080.avif\n' +
          '  - /assets/generated/mawalking-user-bg.dim_1920x1080.webp\n' +
          '  - /assets/generated/mawalking-user-bg.dim_1920x1080.png\n\n' +
          'Try using Settings → Refresh Background to clear the cache and reload.'
        );
      } else {
        console.log('✅ Background image loaded successfully:', backgroundImage);
      }
    }, 1000); // Wait 1 second after mount

    return () => clearTimeout(timeoutId);
  }, []); // Run only once on mount
}
