import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';

interface VolumeSliderProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export default function VolumeSlider({ audioRef }: VolumeSliderProps) {
  const [volume, setVolume] = useState(100);

  useEffect(() => {
    if (audioRef.current) {
      setVolume(Math.round(audioRef.current.volume * 100));
    }
  }, [audioRef]);

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  return (
    <Slider
      value={[volume]}
      onValueChange={handleVolumeChange}
      max={100}
      step={1}
      className="w-full"
    />
  );
}
