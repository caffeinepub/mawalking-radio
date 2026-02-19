import { ArrowLeft, MapPin, Phone, ExternalLink, Clock, Music, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useVenueById } from '@/hooks/useVenueQueries';
import { buildPhoneLink, buildDirectionsLink } from '@/components/venues/venueLinks';
import { Loader2 } from 'lucide-react';

interface VenueDetailScreenProps {
  venueId: string;
  onBack: () => void;
}

export default function VenueDetailScreen({ venueId, onBack }: VenueDetailScreenProps) {
  const { data: venue, isLoading, error } = useVenueById(venueId);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center pb-fixed-bottom-ui">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden pb-fixed-bottom-ui">
        <header className="w-full py-4 px-4 sm:px-6 bg-background/80 backdrop-blur-md border-b border-white/10 pt-safe">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-white">Venue Details</h1>
          </div>
        </header>
        <main className="px-4 sm:px-6 py-6">
          <Alert className="bg-white/10 border-white/20 backdrop-blur-md max-w-2xl mx-auto">
            <AlertDescription className="text-white">
              Venue not found or no longer available.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  const directionsUrl = buildDirectionsLink({
    street: venue.address.street,
    city: venue.address.city,
    state: venue.address.state,
    latitude: venue.address.latitude,
    longitude: venue.address.longitude,
  });

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
          <h1 className="text-xl font-bold text-white truncate flex-1">
            {venue.name}
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 sm:px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Image */}
          {venue.ac_logo && (
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-white/5">
              <img
                src={venue.ac_logo}
                alt={venue.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Primary Actions */}
          <div className="flex gap-3">
            {venue.phone_number && (
              <Button
                asChild
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <a href={buildPhoneLink(venue.phone_number)}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call Venue
                </a>
              </Button>
            )}
            <Button
              asChild
              variant="outline"
              className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                <MapPin className="w-4 h-4 mr-2" />
                Directions
              </a>
            </Button>
          </div>

          {/* Details Card */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Venue Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Address */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  <span>Address</span>
                </div>
                <p className="text-white pl-6">
                  {venue.address.street}
                  <br />
                  {venue.address.city}, {venue.address.state}
                </p>
              </div>

              <Separator className="bg-white/10" />

              {/* Description */}
              {venue.description && (
                <>
                  <div className="space-y-1">
                    <p className="text-white/70 text-sm font-medium">About</p>
                    <p className="text-white">{venue.description}</p>
                  </div>
                  <Separator className="bg-white/10" />
                </>
              )}

              {/* Hours */}
              {venue.hours_of_operation && (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      <span>Hours of Operation</span>
                    </div>
                    <p className="text-white pl-6">{venue.hours_of_operation}</p>
                  </div>
                  <Separator className="bg-white/10" />
                </>
              )}

              {/* Music Genre */}
              {venue.music_genre && (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
                      <Music className="w-4 h-4" />
                      <span>Music Genre</span>
                    </div>
                    <p className="text-white pl-6">{venue.music_genre}</p>
                  </div>
                  <Separator className="bg-white/10" />
                </>
              )}

              {/* Live Events */}
              {venue.weekly_events && (
                <>
                  <div className="space-y-1">
                    <p className="text-white/70 text-sm font-medium">Live Events & Schedule</p>
                    <p className="text-white">{venue.weekly_events}</p>
                  </div>
                  <Separator className="bg-white/10" />
                </>
              )}

              {/* Cover Charge */}
              {venue.cover_charge && (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
                      <DollarSign className="w-4 h-4" />
                      <span>Cover Charge</span>
                    </div>
                    <p className="text-white pl-6">{venue.cover_charge}</p>
                  </div>
                  <Separator className="bg-white/10" />
                </>
              )}

              {/* Website */}
              {venue.website && (
                <div className="space-y-1">
                  <p className="text-white/70 text-sm font-medium">Website</p>
                  <Button
                    asChild
                    variant="link"
                    className="text-accent hover:text-accent/80 p-0 h-auto"
                  >
                    <a href={venue.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Visit Website
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
