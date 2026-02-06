import { X, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockShows } from '@/data/mockShows';
import { generateICS } from '@/utils/ics';
import { toast } from 'sonner';

interface ShowDetailScreenProps {
  showId: string;
  onClose: () => void;
}

export default function ShowDetailScreen({ showId, onClose }: ShowDetailScreenProps) {
  const show = mockShows.find(s => s.id === showId);

  if (!show) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Show not found</p>
      </div>
    );
  }

  const handleAddToCalendar = () => {
    generateICS(show);
    toast.success('Calendar event downloaded!');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-4 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-white/10">
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 touch-manipulation"
        >
          <X className="w-6 h-6" />
        </Button>
        <h2 className="text-sm font-medium text-white/80">Show Details</h2>
        <div className="w-10" />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Show Image */}
          <img 
            src={show.image}
            alt={show.title}
            className="w-full aspect-video rounded-xl shadow-2xl object-cover"
          />

          {/* Show Info */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-white">
              {show.title}
            </h1>

            <div className="flex flex-wrap gap-2">
              {show.genres.map(genre => (
                <Badge key={genre} variant="secondary" className="bg-accent/20 text-accent-foreground">
                  {genre}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-4 text-white/80">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{show.day}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{show.time}</span>
              </div>
            </div>

            <p className="text-white/80 leading-relaxed">
              {show.description}
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={handleAddToCalendar}
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground touch-manipulation"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Add to Calendar
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 touch-manipulation"
                onClick={() => toast.info('Reminder feature coming soon!')}
              >
                Remind Me
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
