import { useState, useEffect, useCallback } from 'react';

export interface UserLocation {
  latitude: number;
  longitude: number;
  source: 'gps' | 'ip' | 'manual';
  accuracy?: number;
}

export interface LocationState {
  location: UserLocation | null;
  isLoading: boolean;
  error: string | null;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unavailable';
  hasAttempted: boolean;
}

const IP_GEOLOCATION_TIMEOUT = 2000;
const GPS_TIMEOUT = 2000;

export function useUserLocation() {
  const [state, setState] = useState<LocationState>({
    location: null,
    isLoading: false,
    error: null,
    permissionState: 'prompt',
    hasAttempted: false,
  });

  const attemptIPGeolocation = useCallback(async (): Promise<UserLocation | null> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), IP_GEOLOCATION_TIMEOUT);

      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal,
        cache: 'no-cache',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('IP geolocation failed');
      }

      const data = await response.json();

      if (data.latitude && data.longitude) {
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          source: 'ip',
        };
      }

      return null;
    } catch (error) {
      console.warn('[Location] IP geolocation failed:', error);
      return null;
    }
  }, []);

  const attemptGPSLocation = useCallback(async (): Promise<UserLocation | null> => {
    if (!('geolocation' in navigator)) {
      return null;
    }

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve(null);
      }, GPS_TIMEOUT);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            source: 'gps',
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          clearTimeout(timeoutId);
          console.warn('[Location] GPS failed:', error.message);
          resolve(null);
        },
        {
          timeout: GPS_TIMEOUT,
          maximumAge: 300000, // 5 minutes
          enableHighAccuracy: false,
        }
      );
    });
  }, []);

  const requestLocation = useCallback(async () => {
    if (state.isLoading) return;

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      hasAttempted: true,
    }));

    try {
      // First, try GPS
      const gpsLocation = await attemptGPSLocation();

      if (gpsLocation) {
        setState({
          location: gpsLocation,
          isLoading: false,
          error: null,
          permissionState: 'granted',
          hasAttempted: true,
        });
        return;
      }

      // GPS failed or denied, try IP-based fallback
      const ipLocation = await attemptIPGeolocation();

      if (ipLocation) {
        setState({
          location: ipLocation,
          isLoading: false,
          error: null,
          permissionState: 'denied',
          hasAttempted: true,
        });
        return;
      }

      // Both failed
      setState({
        location: null,
        isLoading: false,
        error: 'Unable to determine your location. Please check your connection and try again.',
        permissionState: 'unavailable',
        hasAttempted: true,
      });
    } catch (error) {
      console.error('[Location] Error:', error);
      setState({
        location: null,
        isLoading: false,
        error: 'Location detection failed. Please try again.',
        permissionState: 'unavailable',
        hasAttempted: true,
      });
    }
  }, [state.isLoading, attemptGPSLocation, attemptIPGeolocation]);

  const retry = useCallback(() => {
    setState({
      location: null,
      isLoading: false,
      error: null,
      permissionState: 'prompt',
      hasAttempted: false,
    });
  }, []);

  return {
    ...state,
    requestLocation,
    retry,
  };
}
