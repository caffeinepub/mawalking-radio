import { useState, useRef, useEffect, Component, ReactNode } from 'react';
import { useStreamUrl, useNowPlaying } from './hooks/useQueries';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RequestForm } from './components/RequestForm';
import { TrackNotification } from './components/TrackNotification';
import { InstallPrompt } from './components/InstallPrompt';
import { ServiceWorkerRecoveryBanner } from './components/ServiceWorkerRecoveryBanner';
import { useNotifications } from './hooks/useNotifications';
import { useWakeLock } from './hooks/useWakeLock';
import { useAppLifecyclePlaybackRecovery } from './hooks/useAppLifecyclePlaybackRecovery';
import { useServiceWorkerRegistration } from './hooks/useServiceWorkerRegistration';
import { useAlbumArtBackground } from './hooks/useAlbumArtBackground';
import { trackPlayEvent, trackPauseEvent } from './utils/analytics';
import { toast } from 'sonner';
import HomeLiveScreen from './screens/HomeLiveScreen';
import NowPlayingScreen from './screens/NowPlayingScreen';
import BrowseShowsScreen from './screens/BrowseShowsScreen';
import SettingsAboutScreen from './screens/SettingsAboutScreen';
import ShowDetailScreen from './screens/ShowDetailScreen';
import BottomTabNav from './components/navigation/BottomTabNav';
import MiniPlayer from './components/player/MiniPlayer';

type PlaybackState = 'idle' | 'connecting' | 'buffering' | 'playing' | 'paused' | 'error' | 'reconnecting';
type TabView = 'home' | 'browse' | 'settings';
type AppView = 'main' | 'nowPlaying' | 'showDetail';

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[Error Boundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="bg-card rounded-lg shadow-2xl p-8 max-w-md w-full">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Something Went Wrong
              </h1>
              <p className="text-muted-foreground">
                The app encountered an unexpected error. Please try reloading.
              </p>
              {this.state.error && (
                <details className="w-full text-left">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Error Details
                  </summary>
                  <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-40">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              <div className="flex gap-3 w-full">
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Reload App
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      if ('serviceWorker' in navigator) {
                        const registrations = await navigator.serviceWorker.getRegistrations();
                        await Promise.all(registrations.map(reg => reg.unregister()));
                      }
                      if ('caches' in window) {
                        const cacheNames = await caches.keys();
                        await Promise.all(cacheNames.map(name => caches.delete(name)));
                      }
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.reload();
                    } catch (error) {
                      console.error('Reset failed:', error);
                      window.location.reload();
                    }
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Reset & Reload
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [resumePromptVisible, setResumePromptVisible] = useState(false);
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);
  const [isResettingSW, setIsResettingSW] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabView>('home');
  const [currentView, setCurrentView] = useState<AppView>('main');
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const healthMonitorIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const userWantsToPlayRef = useRef(false);
  const isInitializedRef = useRef(false);
  const isReconnectingRef = useRef(false);
  const lastPlayTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const playbackStateRef = useRef<PlaybackState>('idle');
  const lastProgressTimeRef = useRef<number>(0);
  const stallDetectionTimeRef = useRef<number>(0);
  const notificationRequestedRef = useRef(false);
  const streamUrlRef = useRef<string>('');
  const lastAnalyticsEventTimeRef = useRef<number>(0);
  const lastPauseAnalyticsEventTimeRef = useRef<number>(0);
  const pauseIntentRef = useRef(false);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const BASE_RETRY_DELAY = 1000;
  const QUICK_RESUME_THRESHOLD = 120000;
  const HEALTH_CHECK_INTERVAL = 3000;
  const STALL_THRESHOLD = 5000;
  const ANALYTICS_THROTTLE_MS = 1000;

  const { data: streamUrl, isLoading: isLoadingUrl, error: urlError, refetch: refetchUrl } = useStreamUrl();
  const { data: nowPlaying } = useNowPlaying();
  
  const { backgroundImage } = useAlbumArtBackground({
    artworkUrl: nowPlaying?.now_playing?.song?.art,
    playbackState,
    fallbackImage: '/assets/generated/mawalking-pattern-bg.dim_1920x1080.png',
  });
  
  const { 
    showNotification, 
    currentNotification, 
    notificationPermission,
    requestPermission,
    dismissNotification,
  } = useNotifications(nowPlaying);

  const { 
    error: swError, 
    updateAvailable, 
    applyUpdate, 
    resetServiceWorker 
  } = useServiceWorkerRegistration();

  useEffect(() => {
    if (window.__clearReactMountTimeout) {
      window.__clearReactMountTimeout();
      console.log('[App] React mounted successfully, timeout cleared');
    }
  }, []);

  useEffect(() => {
    if (updateAvailable) {
      console.log('[App] Showing recovery banner: update available');
      setShowRecoveryBanner(true);
    } else if (swError && swError.message && swError.message.includes('critical')) {
      console.log('[App] Showing recovery banner: critical SW error');
      setShowRecoveryBanner(true);
    }
  }, [updateAvailable, swError]);

  const handleReload = () => {
    if (updateAvailable) {
      applyUpdate();
    } else {
      window.location.reload();
    }
  };

  const handleReset = async () => {
    setIsResettingSW(true);
    try {
      await resetServiceWorker();
    } catch (error) {
      console.error('[App] Failed to reset service worker:', error);
      toast.error('Failed to reset. Please try refreshing manually.');
      setIsResettingSW(false);
    }
  };

  const isPlaying = playbackState === 'playing';
  useWakeLock(isPlaying);

  useAppLifecyclePlaybackRecovery({
    audioRef,
    userWantsToPlay: userWantsToPlayRef.current,
    isPlaying,
    onResumeNeeded: () => {
      console.log('[App] Manual resume needed');
      setResumePromptVisible(true);
      toast.info('Tap Play to resume playback', {
        duration: 5000,
      });
    },
  });

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Mawalking Radio',
        artist: 'Live Stream',
        album: 'Rhumba Vibes',
        artwork: [
          { src: '/assets/generated/mawalking-radio-icon.dim_192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/assets/generated/mawalking-radio-icon.dim_512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (audioRef.current && userWantsToPlayRef.current) {
          audioRef.current.play().catch(console.error);
        }
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        if (audioRef.current) {
          audioRef.current.pause();
          userWantsToPlayRef.current = false;
          pauseIntentRef.current = true;
          setPlaybackState('paused');
        }
      });

      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
      navigator.mediaSession.setActionHandler('seekto', null);
    }
  }, []);

  useEffect(() => {
    if ('mediaSession' in navigator && nowPlaying?.now_playing?.song) {
      const song = nowPlaying.now_playing.song;
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title || 'Mawalking Radio',
        artist: song.artist || 'Live Stream',
        album: 'Rhumba Vibes',
        artwork: song.art ? [
          { src: song.art, sizes: '512x512', type: 'image/jpeg' }
        ] : [
          { src: '/assets/generated/mawalking-radio-icon.dim_192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/assets/generated/mawalking-radio-icon.dim_512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      });
    }
  }, [nowPlaying]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      if (playbackState === 'playing') {
        navigator.mediaSession.playbackState = 'playing';
      } else if (playbackState === 'paused') {
        navigator.mediaSession.playbackState = 'paused';
      } else {
        navigator.mediaSession.playbackState = 'none';
      }
    }
  }, [playbackState]);

  useEffect(() => {
    if (playbackState === 'playing' && 
        notificationPermission === 'default' && 
        !notificationRequestedRef.current) {
      notificationRequestedRef.current = true;
      requestPermission().then((granted) => {
        if (granted) {
          toast.success('Notifications enabled for track changes and live shows');
        }
      }).catch(() => {
        toast.info('You\'ll see in-app notifications for track changes and live shows');
      });
    }
  }, [playbackState, notificationPermission, requestPermission]);

  useEffect(() => {
    playbackStateRef.current = playbackState;
  }, [playbackState]);

  useEffect(() => {
    if (isInitializedRef.current) return;
    
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = 1.0;
    
    if ('playsInline' in audio) {
      (audio as any).playsInline = true;
    }
    
    audioRef.current = audio;
    isInitializedRef.current = true;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    } catch (error) {
      console.warn('AudioContext not available');
    }

    const handleOnline = () => {
      if (userWantsToPlayRef.current && playbackStateRef.current !== 'playing') {
        setTimeout(() => {
          if (userWantsToPlayRef.current && !isReconnectingRef.current) {
            autoReconnect();
          }
        }, 1000);
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
      
      if (healthMonitorIntervalRef.current) {
        clearInterval(healthMonitorIntervalRef.current);
        healthMonitorIntervalRef.current = null;
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
        audioRef.current = null;
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      isInitializedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (streamUrl) {
      streamUrlRef.current = streamUrl;
    }
  }, [streamUrl]);

  const startHealthMonitoring = () => {
    if (healthMonitorIntervalRef.current) {
      clearInterval(healthMonitorIntervalRef.current);
    }

    const audio = audioRef.current;
    if (!audio) return;

    healthMonitorIntervalRef.current = setInterval(() => {
      if (!audio || !userWantsToPlayRef.current || playbackStateRef.current !== 'playing') {
        return;
      }

      const currentTime = audio.currentTime;
      const hasProgressed = currentTime !== lastProgressTimeRef.current;
      
      if (hasProgressed) {
        lastProgressTimeRef.current = currentTime;
        stallDetectionTimeRef.current = 0;
        return;
      }

      if (!audio.paused && audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        if (stallDetectionTimeRef.current === 0) {
          stallDetectionTimeRef.current = Date.now();
          return;
        }

        const stallDuration = Date.now() - stallDetectionTimeRef.current;
        
        if (stallDuration > STALL_THRESHOLD) {
          stallDetectionTimeRef.current = 0;
          if (!isReconnectingRef.current) {
            autoReconnect();
          }
        }
      }
    }, HEALTH_CHECK_INTERVAL);
  };

  const stopHealthMonitoring = () => {
    if (healthMonitorIntervalRef.current) {
      clearInterval(healthMonitorIntervalRef.current);
      healthMonitorIntervalRef.current = null;
    }
    stallDetectionTimeRef.current = 0;
    lastProgressTimeRef.current = 0;
  };

  const getRetryDelay = (attempt: number): number => {
    return Math.min(BASE_RETRY_DELAY * Math.pow(2, attempt), 8000);
  };

  const cleanupReconnection = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    isReconnectingRef.current = false;
  };

  const attemptPlayback = async (audio: HTMLAudioElement): Promise<boolean> => {
    if (!audio || !userWantsToPlayRef.current) {
      return false;
    }

    try {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      await audio.play();
      lastPlayTimeRef.current = Date.now();
      lastProgressTimeRef.current = audio.currentTime;
      
      return true;
    } catch (error: unknown) {
      const err = error as Error;
      
      if (err.name === 'NotAllowedError' || err.name === 'NotSupportedError') {
        setPlaybackState('error');
        setErrorMessage(err.name === 'NotAllowedError' 
          ? 'Click the play button to start playback' 
          : 'Stream format not supported by your browser');
        userWantsToPlayRef.current = false;
        return false;
      } else if (err.name === 'AbortError') {
        return false;
      }
      
      throw error;
    }
  };

  const initializeStream = async (audio: HTMLAudioElement, url: string): Promise<void> => {
    audio.pause();
    
    if (audio.src) {
      audio.removeAttribute('src');
      audio.load();
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    if (!userWantsToPlayRef.current) return;
    
    audio.preload = 'auto';
    audio.src = url;
    audio.load();
    
    await new Promise<void>((resolve) => {
      const canPlayHandler = () => {
        cleanup();
        resolve();
      };
      
      const loadedDataHandler = () => {
        cleanup();
        resolve();
      };
      
      const errorHandler = () => {
        cleanup();
        resolve();
      };
      
      const cleanup = () => {
        audio.removeEventListener('canplay', canPlayHandler);
        audio.removeEventListener('loadeddata', loadedDataHandler);
        audio.removeEventListener('error', errorHandler);
      };
      
      audio.addEventListener('canplay', canPlayHandler, { once: true });
      audio.addEventListener('loadeddata', loadedDataHandler, { once: true });
      audio.addEventListener('error', errorHandler, { once: true });
      
      setTimeout(() => {
        cleanup();
        resolve();
      }, 3000);
    });
  };

  const autoReconnect = async () => {
    if (isReconnectingRef.current || !userWantsToPlayRef.current) {
      return;
    }

    const audio = audioRef.current;
    if (!audio || !streamUrl) {
      return;
    }

    if (!navigator.onLine) {
      setPlaybackState('error');
      setErrorMessage('No internet connection. Please check your network.');
      return;
    }

    isReconnectingRef.current = true;
    setPlaybackState('reconnecting');

    try {
      await initializeStream(audio, streamUrl);
      
      if (!userWantsToPlayRef.current) {
        cleanupReconnection();
        return;
      }
      
      const success = await attemptPlayback(audio);
      
      if (success) {
        setErrorMessage('');
        reconnectAttemptsRef.current = 0;
        cleanupReconnection();
      } else {
        isReconnectingRef.current = false;
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          retryConnection();
        } else {
          setPlaybackState('error');
          setErrorMessage('Unable to reconnect. Please try again.');
          userWantsToPlayRef.current = false;
          cleanupReconnection();
        }
      }
    } catch (error) {
      isReconnectingRef.current = false;
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        retryConnection();
      } else {
        setPlaybackState('error');
        setErrorMessage('Unable to reconnect. Please try again.');
        userWantsToPlayRef.current = false;
        cleanupReconnection();
      }
    }
  };

  const retryConnection = () => {
    if (isReconnectingRef.current || reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      return;
    }

    const delay = getRetryDelay(reconnectAttemptsRef.current);
    reconnectAttemptsRef.current += 1;
    isReconnectingRef.current = true;
    setPlaybackState('reconnecting');

    cleanupReconnection();

    reconnectTimeoutRef.current = setTimeout(async () => {
      if (!audioRef.current || !streamUrl || !userWantsToPlayRef.current) {
        cleanupReconnection();
        return;
      }

      const audio = audioRef.current;
      
      try {
        await initializeStream(audio, streamUrl);
        
        if (!userWantsToPlayRef.current) {
          cleanupReconnection();
          return;
        }
        
        const success = await attemptPlayback(audio);
        
        if (!success && userWantsToPlayRef.current) {
          isReconnectingRef.current = false;
          retryConnection();
        } else {
          cleanupReconnection();
        }
      } catch (error) {
        isReconnectingRef.current = false;
        if (userWantsToPlayRef.current) {
          retryConnection();
        } else {
          cleanupReconnection();
        }
      }
    }, delay);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => {
      if (userWantsToPlayRef.current && playbackState !== 'playing') {
        setPlaybackState('connecting');
        setErrorMessage('');
      }
    };

    const handleLoadedMetadata = () => {
      if (userWantsToPlayRef.current) {
        setPlaybackState('buffering');
      }
    };

    const handleCanPlay = () => {
      if (userWantsToPlayRef.current && (playbackState === 'connecting' || playbackState === 'buffering' || playbackState === 'reconnecting')) {
        setPlaybackState('buffering');
        setErrorMessage('');
      }
    };

    const handlePlaying = () => {
      setPlaybackState('playing');
      reconnectAttemptsRef.current = 0;
      setErrorMessage('');
      cleanupReconnection();
      lastPlayTimeRef.current = Date.now();
      lastProgressTimeRef.current = audio.currentTime;
      stallDetectionTimeRef.current = 0;
      startHealthMonitoring();
      setResumePromptVisible(false);

      const now = Date.now();
      const timeSinceLastEvent = now - lastAnalyticsEventTimeRef.current;
      
      if (timeSinceLastEvent >= ANALYTICS_THROTTLE_MS) {
        lastAnalyticsEventTimeRef.current = now;
        
        trackPlayEvent({
          streamUrl: streamUrlRef.current,
          userIntent: userWantsToPlayRef.current,
          songTitle: nowPlaying?.now_playing?.song?.title,
          songArtist: nowPlaying?.now_playing?.song?.artist,
        });
      }
    };

    const handlePause = () => {
      if (!userWantsToPlayRef.current) {
        const previousState = playbackStateRef.current;
        setPlaybackState('paused');
        pauseTimeRef.current = Date.now();
        stopHealthMonitoring();

        if (
          (previousState === 'playing' || 
           previousState === 'buffering' || 
           previousState === 'connecting' || 
           previousState === 'reconnecting') &&
          pauseIntentRef.current
        ) {
          const now = Date.now();
          const timeSinceLastPauseEvent = now - lastPauseAnalyticsEventTimeRef.current;
          
          if (timeSinceLastPauseEvent >= ANALYTICS_THROTTLE_MS) {
            lastPauseAnalyticsEventTimeRef.current = now;
            
            trackPauseEvent({
              streamUrl: streamUrlRef.current,
              userIntent: pauseIntentRef.current,
              songTitle: nowPlaying?.now_playing?.song?.title,
              songArtist: nowPlaying?.now_playing?.song?.artist,
            });
          }
        }

        pauseIntentRef.current = false;
      }
    };

    const handleWaiting = () => {
      if (userWantsToPlayRef.current && playbackState === 'playing') {
        setPlaybackState('buffering');
      }
    };

    const handleStalled = () => {
      if (!userWantsToPlayRef.current) return;
      
      if (!isReconnectingRef.current) {
        setTimeout(() => {
          if (userWantsToPlayRef.current && !isReconnectingRef.current) {
            autoReconnect();
          }
        }, 1000);
      }
    };

    const handleError = () => {
      const error = audio.error;
      
      if (!userWantsToPlayRef.current) {
        setPlaybackState('paused');
        return;
      }

      console.error('[Playback Error]', {
        errorCode: error?.code,
        errorMessage: error?.message,
        networkState: audio.networkState,
        readyState: audio.readyState,
        streamUrl: streamUrlRef.current,
        errorCategory: error ? getMediaErrorCategory(error.code) : 'unknown',
      });

      if (error) {
        switch (error.code) {
          case MediaError.MEDIA_ERR_NETWORK:
          case MediaError.MEDIA_ERR_DECODE:
          case MediaError.MEDIA_ERR_ABORTED:
            if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS && !isReconnectingRef.current) {
              retryConnection();
            } else {
              setPlaybackState('error');
              setErrorMessage('Unable to play stream. Please check your connection and try again.');
              userWantsToPlayRef.current = false;
              cleanupReconnection();
              stopHealthMonitoring();
            }
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            setErrorMessage('Stream format not supported by your browser.');
            setPlaybackState('error');
            userWantsToPlayRef.current = false;
            cleanupReconnection();
            stopHealthMonitoring();
            break;
          default:
            if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS && !isReconnectingRef.current) {
              retryConnection();
            } else {
              setPlaybackState('error');
              setErrorMessage('Unable to play stream. Please try again.');
              userWantsToPlayRef.current = false;
              cleanupReconnection();
              stopHealthMonitoring();
            }
        }
      } else {
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS && !isReconnectingRef.current) {
          retryConnection();
        } else {
          setPlaybackState('error');
          setErrorMessage('Unable to play stream. Please try again.');
          userWantsToPlayRef.current = false;
          cleanupReconnection();
          stopHealthMonitoring();
        }
      }
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('error', handleError);
    };
  }, [playbackState, nowPlaying]);

  const getMediaErrorCategory = (code: number): string => {
    switch (code) {
      case MediaError.MEDIA_ERR_ABORTED:
        return 'ABORTED';
      case MediaError.MEDIA_ERR_NETWORK:
        return 'NETWORK';
      case MediaError.MEDIA_ERR_DECODE:
        return 'DECODE';
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return 'SRC_NOT_SUPPORTED';
      default:
        return 'UNKNOWN';
    }
  };

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    
    if (!audio) {
      setErrorMessage('Audio player not initialized. Please refresh the page.');
      return;
    }

    if (playbackState === 'playing' || playbackState === 'buffering' || playbackState === 'connecting') {
      audio.pause();
      userWantsToPlayRef.current = false;
      pauseIntentRef.current = true;
      setPlaybackState('paused');
      setErrorMessage('');
      pauseTimeRef.current = Date.now();
      cleanupReconnection();
      reconnectAttemptsRef.current = 0;
      stopHealthMonitoring();
    } else {
      userWantsToPlayRef.current = true;
      pauseIntentRef.current = false;
      reconnectAttemptsRef.current = 0;
      setErrorMessage('');
      cleanupReconnection();
      setResumePromptVisible(false);

      if (!streamUrl) {
        setPlaybackState('connecting');
        setTimeout(() => {
          if (streamUrl && userWantsToPlayRef.current) {
            handlePlayPause();
          }
        }, 500);
        return;
      }

      const timeSincePause = Date.now() - pauseTimeRef.current;
      const canQuickResume = playbackState === 'paused' && 
                            timeSincePause < QUICK_RESUME_THRESHOLD &&
                            audio.src === streamUrl;

      if (canQuickResume) {
        setPlaybackState('buffering');
        
        const success = await attemptPlayback(audio);
        
        if (!success && userWantsToPlayRef.current) {
          setPlaybackState('connecting');
          
          try {
            await initializeStream(audio, streamUrl);
            if (!userWantsToPlayRef.current) return;
            
            const playSuccess = await attemptPlayback(audio);
            
            if (!playSuccess && userWantsToPlayRef.current) {
              setTimeout(() => {
                if (userWantsToPlayRef.current && !isReconnectingRef.current) {
                  retryConnection();
                }
              }, 500);
            }
          } catch (error) {
            if (userWantsToPlayRef.current && !isReconnectingRef.current) {
              retryConnection();
            }
          }
        }
      } else {
        setPlaybackState('connecting');

        try {
          await initializeStream(audio, streamUrl);
          if (!userWantsToPlayRef.current) return;
          
          const success = await attemptPlayback(audio);
          
          if (!success && userWantsToPlayRef.current) {
            setTimeout(() => {
              if (userWantsToPlayRef.current && !isReconnectingRef.current) {
                retryConnection();
              }
            }, 500);
          }
        } catch (error) {
          if (userWantsToPlayRef.current && !isReconnectingRef.current) {
            retryConnection();
          }
        }
      }
    }
  };

  const handleRetry = () => {
    reconnectAttemptsRef.current = 0;
    setErrorMessage('');
    setPlaybackState('idle');
    cleanupReconnection();
    stopHealthMonitoring();
    
    refetchUrl();
    userWantsToPlayRef.current = false;
    setTimeout(() => {
      handlePlayPause();
    }, 300);
  };

  const openNowPlaying = () => {
    setCurrentView('nowPlaying');
  };

  const closeNowPlaying = () => {
    setCurrentView('main');
  };

  const openShowDetail = (showId: string) => {
    setSelectedShowId(showId);
    setCurrentView('showDetail');
  };

  const closeShowDetail = () => {
    setSelectedShowId(null);
    setCurrentView('main');
  };

  const songTitle = nowPlaying?.now_playing?.song?.title;
  const songArtist = nowPlaying?.now_playing?.song?.artist;

  const showMiniPlayer = (playbackState === 'playing' || playbackState === 'paused' || playbackState === 'buffering') && currentView === 'main';

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
        {showRecoveryBanner && (
          <ServiceWorkerRecoveryBanner 
            onReload={handleReload}
            onReset={handleReset}
            isResetting={isResettingSW}
            hasError={!!swError}
          />
        )}

        <div className="fixed inset-0 z-0">
          <div 
            className="album-art-background absolute inset-0"
            style={{ 
              backgroundImage: `url(${backgroundImage})`,
            }}
          />
          <div className="album-art-overlay absolute inset-0" />
        </div>

        {showNotification && currentNotification && (
          <TrackNotification 
            type={currentNotification.type}
            title={currentNotification.title}
            artist={currentNotification.artist}
            onDismiss={dismissNotification}
          />
        )}

        <InstallPrompt />

        <div className="relative z-10 min-h-screen flex flex-col pb-safe">
          {currentView === 'main' && (
            <>
              <div className="flex-1 overflow-y-auto pb-[calc(3.5rem+env(safe-area-inset-bottom))]" style={{ paddingBottom: showMiniPlayer ? 'calc(5rem + 3.5rem + env(safe-area-inset-bottom))' : 'calc(3.5rem + env(safe-area-inset-bottom))' }}>
                {currentTab === 'home' && (
                  <HomeLiveScreen
                    playbackState={playbackState}
                    isPlaying={isPlaying}
                    isLoading={isLoadingUrl}
                    errorMessage={errorMessage}
                    nowPlaying={nowPlaying}
                    onPlayPause={handlePlayPause}
                    onRetry={handleRetry}
                    onOpenNowPlaying={openNowPlaying}
                    onOpenRequestForm={() => setShowRequestForm(true)}
                    notificationPermission={notificationPermission}
                    onRequestNotificationPermission={requestPermission}
                  />
                )}
                {currentTab === 'browse' && (
                  <BrowseShowsScreen onShowSelect={openShowDetail} />
                )}
                {currentTab === 'settings' && (
                  <SettingsAboutScreen />
                )}
              </div>

              {showMiniPlayer && (
                <MiniPlayer
                  isPlaying={isPlaying}
                  songTitle={songTitle}
                  songArtist={songArtist}
                  albumArt={nowPlaying?.now_playing?.song?.art}
                  onPlayPause={handlePlayPause}
                  onOpenNowPlaying={openNowPlaying}
                />
              )}

              <BottomTabNav
                currentTab={currentTab}
                onTabChange={setCurrentTab}
              />
            </>
          )}

          {currentView === 'nowPlaying' && (
            <NowPlayingScreen
              playbackState={playbackState}
              isPlaying={isPlaying}
              nowPlaying={nowPlaying}
              audioRef={audioRef}
              onPlayPause={handlePlayPause}
              onClose={closeNowPlaying}
            />
          )}

          {currentView === 'showDetail' && selectedShowId && (
            <ShowDetailScreen
              showId={selectedShowId}
              onClose={closeShowDetail}
            />
          )}
        </div>

        <RequestForm 
          open={showRequestForm}
          onOpenChange={setShowRequestForm}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
