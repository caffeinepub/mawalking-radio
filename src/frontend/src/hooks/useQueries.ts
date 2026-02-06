import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

const FALLBACK_STREAM_URL = 'https://www.mawalkingradio.app/listen/mawalking_radio/mawalkingRhumba';

interface StreamUrlResult {
  url: string;
  isFallback: boolean;
  error?: string;
}

export function useStreamUrl() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['streamUrl'],
    queryFn: async () => {
      if (!actor) {
        console.warn('[Stream URL] Backend not initialized, using fallback URL');
        return FALLBACK_STREAM_URL;
      }
      
      try {
        const url = await actor.getRadioStreamUrl();
        
        if (!url) {
          console.warn('[Stream URL] Empty URL from backend, using fallback');
          return FALLBACK_STREAM_URL;
        }
        
        // Validate HTTPS for PWA compliance
        if (!url.startsWith('https://')) {
          console.error('[Stream URL] Non-HTTPS URL from backend:', url, '- using fallback');
          return FALLBACK_STREAM_URL;
        }
        
        // Validate URL format
        try {
          const urlObj = new URL(url);
          if (urlObj.protocol !== 'https:') {
            console.error('[Stream URL] Invalid protocol - using fallback');
            return FALLBACK_STREAM_URL;
          }
        } catch (error) {
          console.error('[Stream URL] Invalid URL format:', url, '- using fallback');
          return FALLBACK_STREAM_URL;
        }
        
        console.log('[Stream URL] Using backend URL:', url);
        return url;
      } catch (error) {
        console.error('[Stream URL] Backend call failed:', error, '- using fallback');
        return FALLBACK_STREAM_URL;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: Infinity,
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 5000),
    // Always return fallback on error instead of throwing
    throwOnError: false,
  });
}

export function useCheckStreamAvailability() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) {
        throw new Error('Backend not initialized');
      }
      
      const isAvailable = await actor.checkRadioStreamAvailability();
      return isAvailable;
    },
    retry: 2,
    retryDelay: 1000,
  });
}

interface NowPlayingData {
  now_playing?: {
    song?: {
      art?: string;
      title?: string;
      artist?: string;
    };
    playlist?: string;
    live?: {
      is_live?: boolean;
    };
  };
}

export function useNowPlaying() {
  return useQuery<NowPlayingData>({
    queryKey: ['nowPlaying'],
    queryFn: async () => {
      const response = await fetch('https://www.mawalkingradio.app/api/nowplaying/mawalking_radio', {
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch now playing data');
      }
      
      return response.json();
    },
    refetchInterval: 30000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 20000,
  });
}

interface SubmitRequestParams {
  requestType: 'song' | 'shoutout';
  message: string;
  name: string;
}

export function useSubmitRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SubmitRequestParams) => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      
      // Backend endpoint not yet implemented
      throw new Error('Song request feature is coming soon! The backend endpoint is being prepared.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}
