import { useState, useEffect, useRef } from 'react';
import { normalizeArtworkUrl } from '../utils/normalizeArtworkUrl';

interface UseAlbumArtBackgroundOptions {
  artworkUrl: string | undefined | null;
  playbackState: string;
  fallbackImage: string;
}

interface UseAlbumArtBackgroundResult {
  backgroundImage: string;
  isLoading: boolean;
}

/**
 * Manages album art background with preloading, validation, and fallback.
 * Persists last-known-good background during transient state changes.
 */
export function useAlbumArtBackground({
  artworkUrl,
  playbackState,
  fallbackImage,
}: UseAlbumArtBackgroundOptions): UseAlbumArtBackgroundResult {
  const [backgroundImage, setBackgroundImage] = useState<string>(fallbackImage);
  const [isLoading, setIsLoading] = useState(false);
  const lastValidArtworkRef = useRef<string | null>(null);
  const preloadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any pending preload timeout
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
      preloadTimeoutRef.current = null;
    }

    // Normalize and validate the artwork URL
    const normalizedUrl = normalizeArtworkUrl(artworkUrl);

    // If no valid artwork, use fallback
    if (!normalizedUrl) {
      // Only update if we don't have a last valid artwork to persist
      if (!lastValidArtworkRef.current) {
        setBackgroundImage(fallbackImage);
      }
      return;
    }

    // If this is the same as the last valid artwork, keep it
    if (normalizedUrl === lastValidArtworkRef.current) {
      return;
    }

    // Delay preloading during connecting/buffering to reduce flicker
    const shouldDelay = playbackState === 'connecting' || playbackState === 'buffering';
    const delay = shouldDelay ? 2000 : 0;

    preloadTimeoutRef.current = setTimeout(() => {
      setIsLoading(true);

      // Preload the image
      const img = new Image();
      
      img.onload = () => {
        setBackgroundImage(normalizedUrl);
        lastValidArtworkRef.current = normalizedUrl;
        setIsLoading(false);
      };

      img.onerror = () => {
        console.warn('[useAlbumArtBackground] Failed to load artwork:', normalizedUrl);
        // On error, fall back to the fallback image only if we don't have a last valid artwork
        if (!lastValidArtworkRef.current) {
          setBackgroundImage(fallbackImage);
        }
        setIsLoading(false);
      };

      img.src = normalizedUrl;
    }, delay);

    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
        preloadTimeoutRef.current = null;
      }
    };
  }, [artworkUrl, playbackState, fallbackImage]);

  return {
    backgroundImage,
    isLoading,
  };
}
