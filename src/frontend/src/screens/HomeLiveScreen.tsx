import { Heart, Share2, Calendar, AlertCircle, RefreshCw, Play, Pause, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShareButton } from '@/components/ShareButton';
import { useFavoriteStation } from '@/hooks/useFavoriteStation';
import OnAirIndicator from '@/components/status/OnAirIndicator';

interface HomeLiveScreenProps {
  playbackState: string;
  isPlaying: boolean;
  isLoading: boolean;
  errorMessage: string;
  nowPlaying: any;
  onPlayPause: () => void;
  onRetry: () => void;
  onOpenNowPlaying: () => void;
  onOpenRequestForm: () => void;
  notificationPermission: NotificationPermission;
  onRequestNotificationPermission: () => Promise<boolean>;
}

export default function HomeLiveScreen({
  playbackState,
  isPlaying,
  isLoading,
  errorMessage,
  onPlayPause,
  onRetry,
  onOpenRequestForm,
}: HomeLiveScreenProps) {
  const { isFavorite, toggleFavorite } = useFavoriteStation();
  const hasError = playbackState === 'error';
  const isConnecting = playbackState === 'connecting' || playbackState === 'buffering' || playbackState === 'reconnecting';
  
  // Determine if we're in the initial play state (not playing, not connecting)
  const isInitialPlayState = !isPlaying && !isConnecting;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-6 pt-safe">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/generated/mawalking-logo-mark.dim_512x512.png" 
              alt="Mawalking Radio"
              className="w-12 h-12 rounded-full shadow-lg"
            />
            <div>
              <h1 className="text-xl font-bold text-white drop-shadow-lg">
                Mawalking Radio
              </h1>
              <p className="text-sm text-white/80 drop-shadow-md">
                African Rhumba 24/7
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-2xl space-y-8">
          {/* Now Playing Info */}
          <div className="text-center space-y-4">
            {isPlaying && (
              <div className="flex items-center justify-center gap-2 mb-3">
                <OnAirIndicator />
                <span className="text-sm font-medium text-white/90 drop-shadow-md">
                  Live Now
                </span>
              </div>
            )}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              {isPlaying ? 'Live Rhumba Music' : 'Listen Live'}
            </h2>
            <p className="text-lg sm:text-xl text-white/90 drop-shadow-md">
              Congolese Rhumba, Soukous, Ndombolo & More
            </p>
          </div>

          {/* Play/Pause Button */}
          <div className="flex justify-center">
            <Button
              onClick={onPlayPause}
              disabled={isLoading || isConnecting}
              size="lg"
              className={`rounded-full touch-manipulation transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                isInitialPlayState
                  ? 'w-36 h-36 bg-black hover:bg-black/90 text-white shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-4 ring-black/40 hover:ring-black/60'
                  : 'w-28 h-28 bg-accent hover:bg-accent/90 text-accent-foreground shadow-[0_0_40px_rgba(251,191,36,0.5)] ring-4 ring-accent/30 hover:ring-accent/50'
              }`}
            >
              {isConnecting ? (
                <Loader2 className="w-14 h-14 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-14 h-14" />
              ) : (
                <Play className="w-16 h-16 ml-1" />
              )}
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button
              onClick={toggleFavorite}
              variant="outline"
              size="lg"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm touch-manipulation h-14 px-6"
            >
              <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Favorited' : 'Favorite'}
            </Button>
            <ShareButton 
              variant="outline"
              size="lg"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm touch-manipulation h-14 px-6"
            />
            <Button
              onClick={onOpenRequestForm}
              variant="outline"
              size="lg"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm touch-manipulation h-14 px-6"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Request
            </Button>
          </div>

          {/* Error Alert */}
          {hasError && (
            <Alert className="bg-white/10 border-white/20 backdrop-blur-md">
              <AlertCircle className="h-4 w-4 text-white" />
              <AlertDescription className="text-white flex flex-col gap-3">
                <span className="text-sm">
                  {errorMessage || 'Connection lost. Please check your internet connection.'}
                </span>
                <Button
                  onClick={onRetry}
                  variant="outline"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-full touch-manipulation"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Connection
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  );
}
