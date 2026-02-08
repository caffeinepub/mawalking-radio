import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TrackTitleMarquee from './TrackTitleMarquee';

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

  const handleContainerClick = (e: React.MouseEvent) => {
    // Only open now playing if not clicking on interactive elements
    const target = e.target as HTMLElement;
    if (!target.closest('button') && !target.closest('[role="button"]')) {
      onOpenNowPlaying();
    }
  };

  return (
    <div 
      className="fixed left-0 right-0 z-20 bg-background/95 backdrop-blur-md border-t border-white/10 cursor-pointer"
      style={{
        bottom: 'calc(var(--bottom-tab-nav-height) + var(--safe-area-inset-bottom))',
      }}
      onClick={handleContainerClick}
    >
      <div className="flex items-center gap-3 px-4 py-3 max-w-full">
        {/* Album Art */}
        <img 
          src={albumArt || '/assets/generated/mawalking-logo-mark.dim_512x512.png'}
          alt={displayTitle}
          className="w-12 h-12 rounded-lg shadow-md object-cover flex-shrink-0"
        />

        {/* Track Info - ensure proper flex constraints for marquee */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <TrackTitleMarquee 
            text={displayTitle}
            className="text-sm font-semibold text-white"
          />
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
