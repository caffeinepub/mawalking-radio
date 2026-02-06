import { useState, useEffect, useCallback, useRef } from 'react';

declare global {
  interface Window {
    chrome?: {
      cast?: {
        isAvailable?: boolean;
      };
    };
    __onGCastApiAvailable?: (isAvailable: boolean) => void;
  }
}

// Use 'any' for Chrome Cast API to avoid complex type definitions
// The Cast SDK is loaded externally and doesn't have official TypeScript definitions
interface ChromeCastAPI {
  isAvailable: boolean;
  initialize: (
    apiConfig: any,
    onInitSuccess: () => void,
    onInitError: (error: any) => void
  ) => void;
  SessionRequest: new (appId: string) => any;
  ApiConfig: new (
    sessionRequest: any,
    sessionListener: (session: any) => void,
    receiverListener: (availability: string) => void
  ) => any;
  AutoJoinPolicy: {
    ORIGIN_SCOPED: string;
  };
  DefaultActionPolicy: {
    CREATE_SESSION: string;
  };
  ReceiverAvailability: {
    AVAILABLE: string;
    UNAVAILABLE: string;
  };
  requestSession: (
    onSuccess: (session: any) => void,
    onError: (error: any) => void
  ) => void;
  media: {
    DEFAULT_MEDIA_RECEIVER_APP_ID: string;
    MediaInfo: new (url: string, contentType: string) => any;
    GenericMediaMetadata: new () => any;
    LoadRequest: new (mediaInfo: any) => any;
  };
  Image: new (url: string) => any;
}

interface CastSession {
  loadMedia: (
    request: any,
    onSuccess: () => void,
    onError: (error: any) => void
  ) => void;
  stop: (onSuccess: () => void, onError: (error: any) => void) => void;
  getSessionObj: () => any;
}

export function useChromecast(streamUrl: string) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const sessionRef = useRef<CastSession | null>(null);
  const initializationAttemptedRef = useRef(false);

  // Initialize Cast API
  useEffect(() => {
    if (initializationAttemptedRef.current) return;

    const initializeCastApi = () => {
      if (!window.chrome?.cast?.isAvailable) {
        console.log('[Cast] API not available yet');
        return;
      }

      if (initializationAttemptedRef.current) return;
      initializationAttemptedRef.current = true;

      console.log('[Cast] Initializing Cast API');

      // Access chrome.cast as any to bypass TypeScript checks
      const cast = (window as any).chrome.cast as ChromeCastAPI;

      const sessionRequest = new cast.SessionRequest(
        cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
      );

      const apiConfig = new cast.ApiConfig(
        sessionRequest,
        (session: CastSession) => {
          console.log('[Cast] Session listener called');
          sessionRef.current = session;
          setIsCasting(true);
          setDeviceName(session.getSessionObj()?.receiver?.friendlyName || 'Cast Device');
        },
        (availability: string) => {
          console.log('[Cast] Receiver availability:', availability);
          setIsAvailable(availability === cast.ReceiverAvailability.AVAILABLE);
        }
      );

      cast.initialize(
        apiConfig,
        () => {
          console.log('[Cast] Initialization success');
          setIsAvailable(true);
        },
        (error: any) => {
          console.error('[Cast] Initialization error:', error);
          setError('Failed to initialize Chromecast');
          setIsAvailable(false);
        }
      );
    };

    // Set up callback for when Cast API becomes available
    window.__onGCastApiAvailable = (isAvailable: boolean) => {
      console.log('[Cast] API available:', isAvailable);
      if (isAvailable) {
        initializeCastApi();
      }
    };

    // Try immediate initialization if API is already loaded
    if (window.chrome?.cast?.isAvailable) {
      initializeCastApi();
    }

    return () => {
      // Cleanup
      if (sessionRef.current) {
        try {
          sessionRef.current.stop(() => {}, () => {});
        } catch (err) {
          console.warn('[Cast] Cleanup error:', err);
        }
      }
    };
  }, []);

  const startCasting = useCallback(async () => {
    if (!isAvailable || !streamUrl) {
      setError('Chromecast not available or stream URL missing');
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const cast = (window as any).chrome.cast as ChromeCastAPI;

      await new Promise<void>((resolve, reject) => {
        cast.requestSession(
          (session: CastSession) => {
            console.log('[Cast] Session created');
            sessionRef.current = session;
            setDeviceName(session.getSessionObj()?.receiver?.friendlyName || 'Cast Device');

            // Load media
            const mediaInfo = new cast.media.MediaInfo(streamUrl, 'audio/mpeg');
            mediaInfo.metadata = new cast.media.GenericMediaMetadata();
            mediaInfo.metadata.title = 'Mawalking Radio';
            mediaInfo.metadata.subtitle = 'Live Stream';
            mediaInfo.metadata.images = [
              new cast.Image('/generated/mawalking-radio-icon.dim_512x512.png'),
            ];

            const request = new cast.media.LoadRequest(mediaInfo);

            session.loadMedia(
              request,
              () => {
                console.log('[Cast] Media loaded successfully');
                setIsCasting(true);
                setIsConnecting(false);
                resolve();
              },
              (error: any) => {
                console.error('[Cast] Media load error:', error);
                setError('Failed to load stream on Chromecast');
                setIsConnecting(false);
                reject(error);
              }
            );
          },
          (error: any) => {
            console.error('[Cast] Session request error:', error);
            if (error.code !== 'cancel') {
              setError('Failed to connect to Chromecast device');
            }
            setIsConnecting(false);
            reject(error);
          }
        );
      });

      return true;
    } catch (error: any) {
      console.error('[Cast] Start casting failed:', error);
      setIsConnecting(false);
      return false;
    }
  }, [isAvailable, streamUrl]);

  const stopCasting = useCallback(async () => {
    if (!sessionRef.current) {
      return true;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        sessionRef.current!.stop(
          () => {
            console.log('[Cast] Session stopped');
            sessionRef.current = null;
            setIsCasting(false);
            setDeviceName(null);
            resolve();
          },
          (error: any) => {
            console.error('[Cast] Stop error:', error);
            reject(error);
          }
        );
      });

      return true;
    } catch (error) {
      console.error('[Cast] Stop casting failed:', error);
      // Force cleanup even if stop fails
      sessionRef.current = null;
      setIsCasting(false);
      setDeviceName(null);
      return false;
    }
  }, []);

  return {
    isAvailable,
    isCasting,
    isConnecting,
    error,
    deviceName,
    startCasting,
    stopCasting,
  };
}
