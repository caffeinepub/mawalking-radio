import { Music, Radio, Disc3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NotificationType } from '@/hooks/useNotifications';

interface TrackNotificationProps {
  type: NotificationType;
  title: string;
  artist: string;
  onDismiss?: () => void;
}

export function TrackNotification({ type, title, artist, onDismiss }: TrackNotificationProps) {
  const getNotificationConfig = () => {
    switch (type) {
      case 'live':
        return {
          icon: Radio,
          bgColor: 'bg-red-600/95',
          iconBgColor: 'bg-red-700/30',
          iconColor: 'text-white',
          label: 'Live Show Starting',
          labelColor: 'text-red-100',
          titleColor: 'text-white',
          artistColor: 'text-red-50',
          borderColor: 'border-red-400/30',
        };
      case 'mix':
        return {
          icon: Disc3,
          bgColor: 'bg-accent/95',
          iconBgColor: 'bg-accent/30',
          iconColor: 'text-accent-foreground',
          label: 'New Mix Playing',
          labelColor: 'text-accent-foreground/80',
          titleColor: 'text-accent-foreground',
          artistColor: 'text-accent-foreground/80',
          borderColor: 'border-accent/30',
        };
      default:
        return {
          icon: Music,
          bgColor: 'bg-card/95',
          iconBgColor: 'bg-accent/20',
          iconColor: 'text-accent',
          label: 'Now Playing',
          labelColor: 'text-muted-foreground',
          titleColor: 'text-foreground',
          artistColor: 'text-muted-foreground',
          borderColor: 'border-white/20',
        };
    }
  };

  const config = getNotificationConfig();
  const Icon = config.icon;

  return (
    <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 animate-in slide-in-from-top-5 duration-300 max-w-[calc(100vw-1rem)] sm:max-w-sm">
      <div className={`${config.bgColor} backdrop-blur-md rounded-lg shadow-2xl p-3 sm:p-4 border ${config.borderColor}`}>
        <div className="flex items-start gap-2 sm:gap-3">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${config.iconBgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${config.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs sm:text-sm font-medium ${config.labelColor} mb-0.5 sm:mb-1 leading-tight`}>
              {config.label}
            </p>
            <h4 className={`text-sm sm:text-base font-semibold ${config.titleColor} truncate leading-tight`}>
              {title}
            </h4>
            <p className={`text-xs sm:text-sm ${config.artistColor} truncate leading-tight`}>
              {artist}
            </p>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 touch-manipulation hover:bg-white/20"
              onClick={onDismiss}
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
