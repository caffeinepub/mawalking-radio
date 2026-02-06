import { useEffect, useState, useRef } from 'react';

interface NowPlayingData {
  now_playing?: {
    song?: {
      art?: string;
      title?: string;
      artist?: string;
      text?: string;
    };
    live?: {
      is_live?: boolean;
      streamer_name?: string;
    };
    playlist?: string;
  };
}

interface TrackInfo {
  title: string;
  artist: string;
}

export type NotificationType = 'track' | 'mix' | 'live';

interface NotificationInfo {
  type: NotificationType;
  title: string;
  artist: string;
}

export function useNotifications(nowPlaying: NowPlayingData | undefined) {
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<NotificationInfo | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const previousTrackRef = useRef<string>('');
  const previousShowTypeRef = useRef<string>('');
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const permissionRequestedRef = useRef(false);
  const lastNotificationTimeRef = useRef<number>(0);

  // Check notification permission on mount (don't request automatically)
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Request notification permission when user interacts (called from play button)
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('Notification permission denied by user');
      return false;
    }

    if (!permissionRequestedRef.current) {
      permissionRequestedRef.current = true;
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        return permission === 'granted';
      } catch (error) {
        console.error('Failed to request notification permission:', error);
        return false;
      }
    }

    return false;
  };

  // Detect show type based on metadata
  const detectShowType = (data: NowPlayingData | undefined): { type: NotificationType; identifier: string } => {
    if (!data?.now_playing) {
      return { type: 'track', identifier: '' };
    }

    const isLive = data.now_playing.live?.is_live === true;
    const streamerName = data.now_playing.live?.streamer_name;
    const playlist = data.now_playing.playlist;
    const songText = data.now_playing.song?.text;
    const songTitle = data.now_playing.song?.title || '';
    
    // Check for live show indicators
    if (isLive || streamerName) {
      const liveIdentifier = `live-${streamerName || 'unknown'}`;
      return { type: 'live', identifier: liveIdentifier };
    }

    // Check for mix indicators in title, playlist, or text
    const mixKeywords = ['mix', 'dj set', 'mixtape', 'session', 'live set'];
    const titleLower = songTitle.toLowerCase();
    const playlistLower = (playlist || '').toLowerCase();
    const textLower = (songText || '').toLowerCase();
    
    const isMix = mixKeywords.some(keyword => 
      titleLower.includes(keyword) || 
      playlistLower.includes(keyword) || 
      textLower.includes(keyword)
    );

    if (isMix) {
      // Use playlist or title as identifier for mix
      const mixIdentifier = `mix-${playlist || songTitle}`;
      return { type: 'mix', identifier: mixIdentifier };
    }

    // Regular track
    return { type: 'track', identifier: '' };
  };

  // Monitor track changes and show type changes with deduplication
  useEffect(() => {
    const currentTitle = nowPlaying?.now_playing?.song?.title;
    const currentArtist = nowPlaying?.now_playing?.song?.artist;
    
    // Skip if no track data
    if (!currentTitle) {
      return;
    }

    // Detect show type
    const { type: showType, identifier: showIdentifier } = detectShowType(nowPlaying);

    // Create unique identifier for track (normalize to handle slight variations)
    const trackIdentifier = `${currentTitle.trim().toLowerCase()}-${(currentArtist || '').trim().toLowerCase()}`;
    
    // Check if track has actually changed
    const trackChanged = previousTrackRef.current && previousTrackRef.current !== trackIdentifier;
    
    // Check if show type has changed (mix or live show started)
    const showTypeChanged = previousShowTypeRef.current && 
                           previousShowTypeRef.current !== showIdentifier && 
                           showIdentifier && 
                           (showType === 'mix' || showType === 'live');
    
    if (trackChanged || showTypeChanged) {
      const now = Date.now();
      const timeSinceLastNotification = now - lastNotificationTimeRef.current;
      
      // Prevent duplicate notifications within 10 seconds (handles polling edge cases)
      if (timeSinceLastNotification < 10000) {
        console.log('Skipping duplicate notification (too soon)');
        return;
      }

      lastNotificationTimeRef.current = now;

      // Determine notification type and message
      let notificationType: NotificationType = 'track';
      let notificationTitle = 'Now Playing on Mawalking Radio';
      let notificationBody = `${currentTitle}${currentArtist ? ` - ${currentArtist}` : ''}`;

      if (showTypeChanged) {
        if (showType === 'live') {
          notificationType = 'live';
          notificationTitle = 'Live Show Starting Now!';
          notificationBody = `A new live show is starting now on Mawalking Radio!`;
        } else if (showType === 'mix') {
          notificationType = 'mix';
          notificationTitle = 'New Mix Playing!';
          notificationBody = `A fresh mix is now playing on Mawalking Radio!`;
        }
      }

      // Update current notification info
      setCurrentNotification({
        type: notificationType,
        title: currentTitle,
        artist: currentArtist || 'Unknown Artist',
      });
      
      // Show in-app notification
      setShowNotification(true);
      
      // Clear previous timeout
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      
      // Hide notification after 5 seconds
      notificationTimeoutRef.current = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      
      // Show browser notification if permission granted
      if (notificationPermission === 'granted' && 'Notification' in window) {
        try {
          const notification = new Notification(notificationTitle, {
            body: notificationBody,
            icon: nowPlaying?.now_playing?.song?.art || '/favicon.ico',
            tag: `notification-${notificationType}`, // Different tags for different types
            requireInteraction: false,
            silent: false,
          });

          // Auto-close browser notification after 5 seconds
          setTimeout(() => {
            notification.close();
          }, 5000);
        } catch (error) {
          console.error('Failed to show browser notification:', error);
          // Fallback: ensure in-app notification is visible
          setShowNotification(true);
        }
      } else if (notificationPermission === 'denied') {
        // User denied browser notifications, rely on in-app notification
        console.log('Browser notifications denied, showing in-app notification only');
      } else if (notificationPermission === 'default') {
        // Permission not yet requested, show in-app notification only
        console.log('Browser notification permission not requested yet');
      }
    }
    
    // Update previous track reference
    if (trackIdentifier) {
      previousTrackRef.current = trackIdentifier;
    }
    
    // Update previous show type reference
    if (showIdentifier) {
      previousShowTypeRef.current = showIdentifier;
    }
    
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [nowPlaying, notificationPermission]);

  const dismissNotification = () => {
    setShowNotification(false);
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
  };

  return { 
    showNotification, 
    currentNotification,
    notificationPermission,
    requestPermission,
    dismissNotification,
  };
}
