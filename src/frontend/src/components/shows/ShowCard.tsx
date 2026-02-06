import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import type { Show } from '@/data/mockShows';

interface ShowCardProps {
  show: Show;
  onClick: () => void;
}

export default function ShowCard({ show, onClick }: ShowCardProps) {
  return (
    <Card 
      className="bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer touch-manipulation"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex gap-4">
          <img 
            src={show.image}
            alt={show.title}
            className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-l-lg flex-shrink-0"
          />
          <div className="flex-1 py-3 pr-3 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate mb-1">
              {show.title}
            </h3>
            <p className="text-sm text-white/60 line-clamp-2 mb-2">
              {show.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              {show.genres.slice(0, 2).map(genre => (
                <Badge key={genre} variant="secondary" className="bg-accent/20 text-accent-foreground text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs text-white/60">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{show.day}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{show.time}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
