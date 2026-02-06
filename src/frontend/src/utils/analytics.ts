/**
 * Google Analytics utility for safe event tracking
 * Handles gtag availability checks and provides typed event helpers
 */

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

/**
 * Check if Google Analytics is available
 */
export function isGtagAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Safely emit a Google Analytics event
 * Fails silently if gtag is not available
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
): void {
  if (!isGtagAvailable()) {
    return;
  }

  try {
    window.gtag!('event', eventName, eventParams);
  } catch (error) {
    // Fail silently - analytics should never break the app
    console.debug('Analytics event failed:', error);
  }
}

/**
 * Track audio playback start event with metadata
 */
export function trackPlayEvent(params: {
  streamUrl: string;
  userIntent: boolean;
  songTitle?: string;
  songArtist?: string;
}): void {
  const eventParams: Record<string, any> = {
    stream_url: params.streamUrl,
    user_intent: params.userIntent,
  };

  if (params.songTitle) {
    eventParams.song_title = params.songTitle;
  }

  if (params.songArtist) {
    eventParams.song_artist = params.songArtist;
  }

  trackEvent('audio_play', eventParams);
}

/**
 * Track audio pause event with metadata
 */
export function trackPauseEvent(params: {
  streamUrl: string;
  userIntent: boolean;
  songTitle?: string;
  songArtist?: string;
}): void {
  const eventParams: Record<string, any> = {
    stream_url: params.streamUrl,
    user_intent: params.userIntent,
  };

  if (params.songTitle) {
    eventParams.song_title = params.songTitle;
  }

  if (params.songArtist) {
    eventParams.song_artist = params.songArtist;
  }

  trackEvent('audio_pause', eventParams);
}

/**
 * Track Chromecast cast started event with metadata
 */
export function trackCastStartedEvent(params: {
  streamUrl: string;
  deviceName?: string;
  songTitle?: string;
  songArtist?: string;
}): void {
  const eventParams: Record<string, any> = {
    stream_url: params.streamUrl,
  };

  if (params.deviceName) {
    eventParams.device_name = params.deviceName;
  }

  if (params.songTitle) {
    eventParams.song_title = params.songTitle;
  }

  if (params.songArtist) {
    eventParams.song_artist = params.songArtist;
  }

  trackEvent('cast_started', eventParams);
}
