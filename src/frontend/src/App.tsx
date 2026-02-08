import { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import HomeLiveScreen from './screens/HomeLiveScreen';
import NowPlayingScreen from './screens/NowPlayingScreen';
import BrowseShowsScreen from './screens/BrowseShowsScreen';
import ShowDetailScreen from './screens/ShowDetailScreen';
import SettingsAboutScreen from './screens/SettingsAboutScreen';
import BottomTabNav from './components/navigation/BottomTabNav';
import MiniPlayer from './components/player/MiniPlayer';
import { InstallPrompt } from './components/InstallPrompt';
import { RequestForm } from './components/RequestForm';
import { useStreamUrl, useNowPlaying } from './hooks/useQueries';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

type View = 'home' | 'now-playing' | 'browse' | 'settings' | 'show-detail';
type TabView = 'home' | 'browse' | 'settings';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  
  // Audio state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackState, setPlaybackState] = useState<string>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  const { data: streamUrl } = useStreamUrl();
  const { data: nowPlaying } = useNowPlaying();

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'none';
    }

    const audio = audioRef.current;

    const handlePlay = () => {
      setIsPlaying(true);
      setPlaybackState('playing');
    };

    const handlePause = () => {
      setIsPlaying(false);
      setPlaybackState('paused');
    };

    const handleError = () => {
      setPlaybackState('error');
      setErrorMessage('Failed to load stream. Please try again.');
    };

    const handleWaiting = () => {
      setPlaybackState('buffering');
    };

    const handleCanPlay = () => {
      if (!audio.paused) {
        setPlaybackState('playing');
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  // Update audio source when stream URL changes
  useEffect(() => {
    if (audioRef.current && streamUrl) {
      audioRef.current.src = streamUrl;
    }
  }, [streamUrl]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      setPlaybackState('connecting');
      audioRef.current.play().catch((error) => {
        console.error('Playback error:', error);
        setPlaybackState('error');
        setErrorMessage('Failed to start playback. Please try again.');
      });
    }
  };

  const handleRetry = () => {
    if (!audioRef.current) return;
    setPlaybackState('connecting');
    setErrorMessage('');
    audioRef.current.load();
    audioRef.current.play().catch((error) => {
      console.error('Retry error:', error);
      setPlaybackState('error');
      setErrorMessage('Failed to connect. Please check your internet connection.');
    });
  };

  const handleNavigate = (view: View, showId?: string) => {
    setCurrentView(view);
    if (view === 'show-detail' && showId) {
      setSelectedShowId(showId);
    }
  };

  const handleTabChange = (tab: TabView) => {
    if (tab === 'home') {
      setCurrentView('home');
    } else if (tab === 'browse') {
      setCurrentView('browse');
    } else if (tab === 'settings') {
      setCurrentView('settings');
    }
  };

  const handleRequestNotificationPermission = async (): Promise<boolean> => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    }
    return false;
  };

  const getCurrentTab = (): TabView => {
    if (currentView === 'home' || currentView === 'now-playing') return 'home';
    if (currentView === 'browse' || currentView === 'show-detail') return 'browse';
    return 'settings';
  };

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      <InstallPrompt />
      
      {currentView === 'home' && (
        <HomeLiveScreen 
          playbackState={playbackState}
          isPlaying={isPlaying}
          isLoading={false}
          errorMessage={errorMessage}
          nowPlaying={nowPlaying}
          onPlayPause={handlePlayPause}
          onRetry={handleRetry}
          onOpenNowPlaying={() => handleNavigate('now-playing')}
          onOpenRequestForm={() => setShowRequestForm(true)}
          notificationPermission={notificationPermission}
          onRequestNotificationPermission={handleRequestNotificationPermission}
        />
      )}
      {currentView === 'now-playing' && (
        <NowPlayingScreen 
          playbackState={playbackState}
          isPlaying={isPlaying}
          nowPlaying={nowPlaying}
          audioRef={audioRef}
          onPlayPause={handlePlayPause}
          onClose={() => handleNavigate('home')}
        />
      )}
      {currentView === 'browse' && (
        <BrowseShowsScreen onShowSelect={(showId) => handleNavigate('show-detail', showId)} />
      )}
      {currentView === 'show-detail' && selectedShowId && (
        <ShowDetailScreen 
          showId={selectedShowId} 
          onClose={() => handleNavigate('browse')} 
        />
      )}
      {currentView === 'settings' && <SettingsAboutScreen />}

      <MiniPlayer 
        isPlaying={isPlaying}
        songTitle={nowPlaying?.now_playing?.song?.title}
        songArtist={nowPlaying?.now_playing?.song?.artist}
        albumArt={nowPlaying?.now_playing?.song?.art}
        onPlayPause={handlePlayPause}
        onOpenNowPlaying={() => handleNavigate('now-playing')}
      />
      <BottomTabNav 
        currentTab={getCurrentTab()} 
        onTabChange={handleTabChange} 
      />

      <RequestForm 
        open={showRequestForm}
        onOpenChange={setShowRequestForm}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
