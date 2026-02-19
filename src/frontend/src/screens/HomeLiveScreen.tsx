import { Heart, Share2, Calendar, AlertCircle, RefreshCw, Play, Pause, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShareButton } from '@/components/ShareButton';
import { useFavoriteStation } from '@/hooks/useFavoriteStation';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useNearbyVenues } from '@/hooks/useVenueQueries';
import { VenueCard } from '@/components/venues/VenueCard';
import OnAirIndicator from '@/components/status/OnAirIndicator';
import { useEffect } from 'react';

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
  onNavigateToVenuesList: () => void;
  onNavigateToVenueDetail: (venueId: string) => void;
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function HomeLiveScreen({
  playbackState,
  isPlaying,
  isLoading,
  errorMessage,
  onPlayPause,
  onRetry,
  onOpenRequestForm,
  onNavigateToVenuesList,
  onNavigateToVenueDetail,
}: HomeLiveScreenProps) {
  const { isFavorite, toggleFavorite } = useFavoriteStation();
  const hasError = playbackState === 'error';
  const isConnecting = playbackState === 'connecting' || playbackState === 'buffering' || playbackState === 'reconnecting';
  
  // Determine if we're in the initial play state (not playing, not connecting)
  const isInitialPlayState = !isPlaying && !isConnecting;

  // Location detection
  const {
    location,
    isLoading: locationLoading,
    error: locationError,
    permissionState,
    hasAttempted,
    requestLocation,
    retry: retryLocation,
  } = useUserLocation();

  // Auto-request location on mount
  useEffect(() => {
    if (!hasAttempted && !locationLoading) {
      requestLocation();
    }
  }, [hasAttempted, locationLoading, requestLocation]);

  // Fetch nearby venues
  const { data: nearbyVenues } = useNearbyVenues(
    location?.latitude || null,
    location?.longitude || null,
    50
  );

  const topVenues = nearbyVenues?.slice(0, 3) || [];

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden pb-fixed-bottom-ui">
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-6 pt-safe">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img 
              src="/assets/ChatGPT Image Nov 22, 2025 at 04_27_28 PM-1.png" 
              alt="Mawalking Radio"
              className="w-12 h-12 rounded-full shadow-lg object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white drop-shadow-lg truncate">
                Mawalking Radio
              </h1>
              <p className="text-sm text-white/80 drop-shadow-md truncate">
                African Rhumba 24/7
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 py-8 space-y-8">
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
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg px-4">
              {isPlaying ? 'Live Rhumba Music' : 'Listen Live'}
            </h2>
            <p className="text-lg sm:text-xl text-white/90 drop-shadow-md px-4">
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
                  ? 'w-32 h-32 sm:w-36 sm:h-36 bg-black hover:bg-black/90 text-white shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-4 ring-black/40 hover:ring-black/60'
                  : 'w-24 h-24 sm:w-28 sm:h-28 bg-accent hover:bg-accent/90 text-accent-foreground shadow-[0_0_40px_rgba(251,191,36,0.5)] ring-4 ring-accent/30 hover:ring-accent/50'
              }`}
            >
              {isConnecting ? (
                <Loader2 className="w-12 h-12 sm:w-14 sm:h-14 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-12 h-12 sm:w-14 sm:h-14" />
              ) : (
                <Play className="w-14 h-14 sm:w-16 sm:h-16 ml-1" />
              )}
            </Button>
          </div>

          {/* Quick Actions - Mobile Optimized Responsive Row */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 px-2">
            <Button
              onClick={toggleFavorite}
              variant="outline"
              size="lg"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm touch-manipulation h-11 sm:h-12 md:h-14 px-3 sm:px-4 md:px-6 flex-shrink-0 text-sm sm:text-base"
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'fill-current' : ''}`} />
              <span className="ml-1.5 sm:ml-2">{isFavorite ? 'Favorited' : 'Favorite'}</span>
            </Button>
            <ShareButton 
              variant="outline"
              size="lg"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm touch-manipulation h-11 sm:h-12 md:h-14 px-3 sm:px-4 md:px-6 flex-shrink-0"
            />
            <Button
              onClick={onOpenRequestForm}
              variant="outline"
              size="lg"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm touch-manipulation h-11 sm:h-12 md:h-14 px-3 sm:px-4 md:px-6 flex-shrink-0 text-sm sm:text-base"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="ml-1.5 sm:ml-2">Request</span>
            </Button>
          </div>

          {/* Error Alert */}
          {hasError && (
            <Alert className="bg-white/10 border-white/20 backdrop-blur-md mx-2">
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

          {/* Location Permission Prompt */}
          {!hasAttempted && !locationLoading && (
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-accent" />
                  Discover Rhumba Near You
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-white/80 text-sm">
                  We use your location to recommend nearby rhumba music venues and events.
                </p>
                <Button
                  onClick={requestLocation}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Enable Location
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Location Loading */}
          {locationLoading && (
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="py-6 flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 text-accent animate-spin" />
                <span className="text-white">Detecting your location...</span>
              </CardContent>
            </Card>
          )}

          {/* Location Error */}
          {locationError && !locationLoading && (
            <Alert className="bg-white/10 border-white/20 backdrop-blur-md">
              <AlertCircle className="h-4 w-4 text-white" />
              <AlertDescription className="text-white flex flex-col gap-3">
                <span className="text-sm">{locationError}</span>
                <Button
                  onClick={retryLocation}
                  variant="outline"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Rhumba Near You Section */}
          {location && topVenues.length > 0 && (
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent" />
                    Rhumba Near You
                  </CardTitle>
                  <Button
                    variant="link"
                    onClick={onNavigateToVenuesList}
                    className="text-accent hover:text-accent/80 p-0 h-auto"
                  >
                    See All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {topVenues.map((venue) => {
                  const distance = calculateDistance(
                    location.latitude,
                    location.longitude,
                    venue.address.latitude,
                    venue.address.longitude
                  );
                  return (
                    <VenueCard
                      key={venue.id}
                      venue={venue}
                      distance={distance}
                      onSelect={() => onNavigateToVenueDetail(venue.id)}
                    />
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
