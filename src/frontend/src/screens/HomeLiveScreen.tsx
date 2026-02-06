import { Play, Pause, Loader2, Heart, Share2, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShareButton } from '@/components/ShareButton';
import { useFavoriteStation } from '@/hooks/useFavoriteStation';
import OnAirIndicator from '@/components/status/OnAirIndicator';
import LiveBadge from '@/components/status/LiveBadge';

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
  nowPlaying,
  onPlayPause,
  onRetry,
  onOpenNowPlaying,
  onOpenRequestForm,
}: HomeLiveScreenProps) {
  const { isFavorite, toggleFavorite } = useFavoriteStation();
  const hasError = playbackState === 'error';

  const songTitle = nowPlaying?.now_playing?.song?.title;
  const songArtist = nowPlaying?.now_playing?.song?.artist;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-6">
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
          {/* Station Artwork */}
          <div className="flex justify-center">
            <div className="relative">
              <img 
                src="/assets/generated/mawalking-hero-art.dim_1200x1200.png"
                alt="Mawalking Radio Station"
                className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl shadow-2xl object-cover"
              />
              {isPlaying && (
                <div className="absolute top-4 right-4">
                  <LiveBadge />
                </div>
              )}
            </div>
          </div>

          {/* Now Playing Info */}
          <div className="text-center space-y-2">
            {isPlaying && (songTitle || songArtist) ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <OnAirIndicator />
                  <span className="text-sm font-medium text-white/90 drop-shadow-md">
                    Live Now
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                  {songTitle || 'Mawalking Radio'}
                </h2>
                {songArtist && (
                  <p className="text-lg sm:text-xl text-white/90 drop-shadow-md">
                    {songArtist}
                  </p>
                )}
              </>
            ) : (
              <>
                <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                  {isPlaying ? 'Live Rhumba Music' : 'Listen Live'}
                </h2>
                <p className="text-lg text-white/90 drop-shadow-md">
                  Congolese Rhumba, Soukous, Ndombolo & More
                </p>
              </>
            )}
          </div>

          {/* Play Button */}
          <div className="flex justify-center">
            <Button
              onClick={onPlayPause}
              size="lg"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isLoading ? (
                <Loader2 className="w-12 h-12 sm:w-14 sm:h-14 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-12 h-12 sm:w-14 sm:h-14" fill="currentColor" />
              ) : (
                <Play className="w-12 h-12 sm:w-14 sm:h-14 ml-1" fill="currentColor" />
              )}
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-center gap-4">
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
