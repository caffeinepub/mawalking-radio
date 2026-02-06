import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MiniPlayerProps {
  isPlaying: boolean;
  songTitle?: string;
  songArtist?: string;
  albumArt?: string;
  onPlayPause: () => void;
  onOpenNowPlaying: () => void;
}

export default function MiniPlayer({
  isPlaying,
  songTitle,
  songArtist,
  albumArt,
  onPlayPause,
  onOpenNowPlaying,
}: MiniPlayerProps) {
  const displayTitle = songTitle || 'Mawalking Radio';
  const displayArtist = songArtist || 'Live Stream';

  return (
    <div 
      className="fixed bottom-14 left-0 right-0 z-20 bg-background/95 backdrop-blur-md border-t border-white/10 pb-safe"
      onClick={onOpenNowPlaying}
    >
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer">
        {/* Album Art */}
        <img 
          src={albumArt || '/assets/generated/mawalking-logo-mark.dim_512x512.png'}
          alt={displayTitle}
          className="w-12 h-12 rounded-lg shadow-md object-cover flex-shrink-0"
        />

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white truncate">
            {displayTitle}
          </h4>
          <p className="text-xs text-white/60 truncate">
            {displayArtist}
          </p>
        </div>

        {/* Play/Pause Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onPlayPause();
          }}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 touch-manipulation flex-shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" fill="currentColor" />
          ) : (
            <Play className="w-6 h-6" fill="currentColor" />
          )}
        </Button>
      </div>
    </div>
  );
}
