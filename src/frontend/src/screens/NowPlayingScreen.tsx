import { useState } from 'react';
import { Play, Pause, Loader2, X, Volume2, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/ShareButton';
import VolumeSlider from '@/components/player/VolumeSlider';
import TrackTitleMarquee from '@/components/player/TrackTitleMarquee';
import { useSleepTimer } from '@/hooks/useSleepTimer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NowPlayingScreenProps {
  playbackState: string;
  isPlaying: boolean;
  nowPlaying: any;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onPlayPause: () => void;
  onClose: () => void;
}

export default function NowPlayingScreen({
  playbackState,
  isPlaying,
  nowPlaying,
  audioRef,
  onPlayPause,
  onClose,
}: NowPlayingScreenProps) {
  const { timeRemaining, isActive, startTimer, cancelTimer } = useSleepTimer(audioRef);
  const [showSleepTimer, setShowSleepTimer] = useState(false);

  const songTitle = nowPlaying?.now_playing?.song?.title || 'Mawalking Radio';
  const songArtist = nowPlaying?.now_playing?.song?.artist || 'Live Stream';
  const albumArt = nowPlaying?.now_playing?.song?.art;

  const isLoading = playbackState === 'connecting' || playbackState === 'buffering' || playbackState === 'reconnecting';

  const handleSleepTimerSelect = (value: string) => {
    const minutes = parseInt(value);
    startTimer(minutes);
    setShowSleepTimer(false);
  };

  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col relative w-full overflow-x-hidden pb-fixed-bottom-ui">
      {/* Background - optimized for mobile */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: albumArt 
              ? `url(${albumArt})` 
              : 'url(/assets/generated/nairobi-skyline-background.dim_1920x1080.png)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 backdrop-blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col pt-safe">
        {/* Header */}
        <header className="w-full py-4 px-4 flex items-center justify-between">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 touch-manipulation"
          >
            <X className="w-6 h-6" />
          </Button>
          <h2 className="text-sm font-medium text-white/80">Now Playing</h2>
          <ShareButton 
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 touch-manipulation"
          />
        </header>

        {/* Album Art */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <img 
            src={albumArt || '/assets/generated/mawalking-hero-art.dim_1200x1200.png'}
            alt={songTitle}
            className="w-full max-w-xs sm:max-w-sm aspect-square rounded-2xl shadow-2xl object-cover"
          />
        </div>

        {/* Track Info - ensure proper width constraints for marquee */}
        <div className="px-4 sm:px-6 py-4 space-y-2 w-full">
          <div className="w-full min-w-0">
            <TrackTitleMarquee 
              text={songTitle}
              className="text-xl sm:text-2xl md:text-3xl font-bold text-white"
            />
          </div>
          <p className="text-base sm:text-lg text-white/80 truncate">
            {songArtist}
          </p>
          <p className="text-xs sm:text-sm text-white/60">
            You're listening to Congolese Rhumba, Soukous, Ndombolo, and more on Mawalking Radio.
          </p>
        </div>

        {/* Controls */}
        <div className="px-4 sm:px-6 py-6 space-y-6">
          {/* Volume */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white/80">
              <Volume2 className="w-4 h-4" />
              <span className="text-sm">Volume</span>
            </div>
            <VolumeSlider audioRef={audioRef} />
          </div>

          {/* Play/Pause */}
          <div className="flex items-center justify-center gap-6">
            <Button
              onClick={onPlayPause}
              size="lg"
              className="w-20 h-20 rounded-full shadow-xl touch-manipulation bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isLoading ? (
                <Loader2 className="w-10 h-10 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-10 h-10" fill="currentColor" />
              ) : (
                <Play className="w-10 h-10 ml-1" fill="currentColor" />
              )}
            </Button>
          </div>

          {/* Sleep Timer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/80">
                <Timer className="w-4 h-4" />
                <span className="text-sm">Sleep Timer</span>
              </div>
              {isActive && (
                <span className="text-sm text-accent font-medium">
                  {formatTimeRemaining(timeRemaining)}
                </span>
              )}
            </div>
            {isActive ? (
              <Button
                onClick={cancelTimer}
                variant="outline"
                size="sm"
                className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 touch-manipulation"
              >
                Cancel Timer
              </Button>
            ) : (
              <Select onValueChange={handleSleepTimerSelect}>
                <SelectTrigger className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20">
                  <SelectValue placeholder="Set timer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
