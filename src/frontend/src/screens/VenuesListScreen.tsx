import { ArrowLeft, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VenueCard } from '@/components/venues/VenueCard';
import { useNearbyVenues } from '@/hooks/useVenueQueries';
import type { UserLocation } from '@/hooks/useUserLocation';

interface VenuesListScreenProps {
  userLocation: UserLocation;
  onBack: () => void;
  onVenueSelect: (venueId: string) => void;
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

export default function VenuesListScreen({
  userLocation,
  onBack,
  onVenueSelect,
}: VenuesListScreenProps) {
  const { data: venues, isLoading, error } = useNearbyVenues(
    userLocation.latitude,
    userLocation.longitude,
    50
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden pb-fixed-bottom-ui">
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-6 bg-background/80 backdrop-blur-md border-b border-white/10 pt-safe">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/10 flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
              Rhumba Near You
            </h1>
            <p className="text-sm text-white/70 truncate">
              {userLocation.source === 'gps' ? 'Based on your location' : 'Based on approximate location'}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 sm:px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
          )}

          {error && (
            <Alert className="bg-white/10 border-white/20 backdrop-blur-md">
              <AlertDescription className="text-white">
                Failed to load venues. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && venues && venues.length === 0 && (
            <Alert className="bg-white/10 border-white/20 backdrop-blur-md">
              <MapPin className="w-4 h-4 text-white" />
              <AlertDescription className="text-white">
                No rhumba venues found within 50 miles of your location. Check back soon as we add more venues!
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && venues && venues.length > 0 && (
            <>
              <p className="text-white/70 text-sm">
                Found {venues.length} venue{venues.length !== 1 ? 's' : ''} within 50 miles
              </p>
              <div className="space-y-3">
                {venues.map((venue) => {
                  const distance = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    venue.address.latitude,
                    venue.address.longitude
                  );
                  return (
                    <VenueCard
                      key={venue.id}
                      venue={venue}
                      distance={distance}
                      onSelect={() => onVenueSelect(venue.id)}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
