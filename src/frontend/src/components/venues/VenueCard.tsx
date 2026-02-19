import { MapPin, Phone, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Venue } from '../../backend';

interface VenueCardProps {
  venue: Venue;
  distance?: number;
  onSelect: () => void;
}

export function VenueCard({ venue, distance, onSelect }: VenueCardProps) {
  return (
    <Card
      className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-colors cursor-pointer"
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-white text-lg leading-tight flex-1">
            {venue.name}
          </CardTitle>
          {distance !== undefined && (
            <span className="text-accent text-sm font-medium whitespace-nowrap flex-shrink-0">
              {distance.toFixed(1)} mi
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-start gap-2 text-white/70 text-sm">
          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">
            {venue.address.street}, {venue.address.city}, {venue.address.state}
          </span>
        </div>
        {venue.description && (
          <p className="text-white/60 text-sm line-clamp-2">{venue.description}</p>
        )}
        <div className="flex items-center gap-2 pt-2">
          {venue.phone_number && (
            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 hover:bg-white/10 text-white border-white/20 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `tel:${venue.phone_number}`;
              }}
            >
              <Phone className="w-3 h-3 mr-1" />
              Call
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="bg-white/5 hover:bg-white/10 text-white border-white/20 text-xs"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
