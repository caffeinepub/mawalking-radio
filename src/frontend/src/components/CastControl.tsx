import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { SiChromecast } from 'react-icons/si';
import { useChromecast } from '../hooks/useChromecast';
import { trackCastStartedEvent } from '../utils/analytics';
import { toast } from 'sonner';

interface CastControlProps {
  streamUrl: string;
  songTitle?: string;
  songArtist?: string;
  className?: string;
}

export function CastControl({ streamUrl, songTitle, songArtist, className = '' }: CastControlProps) {
  const { isAvailable, isCasting, isConnecting, deviceName, startCasting, stopCasting } =
    useChromecast(streamUrl);

  if (!isAvailable) {
    return null; // Hide control if Chromecast is not available
  }

  const handleCastToggle = async () => {
    if (isCasting) {
      const success = await stopCasting();
      if (success) {
        toast.success('Stopped casting');
      } else {
        toast.error('Failed to stop casting');
      }
    } else {
      const success = await startCasting();
      if (success) {
        toast.success(`Casting to ${deviceName || 'device'}`);
        
        // Track cast started event after successful cast
        trackCastStartedEvent({
          streamUrl,
          deviceName: deviceName || undefined,
          songTitle,
          songArtist,
        });
      }
    }
  };

  return (
    <Button
      onClick={handleCastToggle}
      disabled={isConnecting}
      variant="outline"
      size="sm"
      className={`bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm h-9 w-9 sm:h-10 sm:w-10 p-0 touch-manipulation shadow-md ${className}`}
      title={isCasting ? `Casting to ${deviceName}` : 'Cast to device'}
    >
      {isConnecting ? (
        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
      ) : (
        <SiChromecast
          className={`w-4 h-4 sm:w-5 sm:h-5 ${isCasting ? 'text-blue-400' : ''}`}
        />
      )}
    </Button>
  );
}
