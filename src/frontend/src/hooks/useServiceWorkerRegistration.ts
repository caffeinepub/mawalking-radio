import { useEffect, useState, useCallback } from 'react';

interface ServiceWorkerRegistrationState {
  registration: ServiceWorkerRegistration | null;
  isRegistering: boolean;
  error: Error | null;
  isReady: boolean;
  updateAvailable: boolean;
  waitingWorker: ServiceWorker | null;
}

export function useServiceWorkerRegistration() {
  const [state, setState] = useState<ServiceWorkerRegistrationState>({
    registration: null,
    isRegistering: false,
    error: null,
    isReady: false,
    updateAvailable: false,
    waitingWorker: null,
  });

  const applyUpdate = useCallback(() => {
    if (state.waitingWorker) {
      console.log('[SW Registration] Applying update - sending SKIP_WAITING message');
      state.waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [state.waitingWorker]);

  const resetServiceWorker = useCallback(async () => {
    try {
      console.log('[SW Registration] Resetting service worker...');
      
      // Send reset message to service worker
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'RESET_CACHE' });
      }
      
      // Unregister all service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      
      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      
      // Clear storage
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.warn('[SW Registration] Could not clear storage:', e);
      }
      
      console.log('[SW Registration] Service worker reset complete');
      
      // Reload the page with cache busting
      window.location.href = window.location.href + '?nocache=' + Date.now();
    } catch (error) {
      console.error('[SW Registration] Failed to reset service worker:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    // Service worker registration is non-blocking - app should render even if it fails
    if (!('serviceWorker' in navigator)) {
      console.warn('[SW Registration] Service Worker not supported');
      setState({
        registration: null,
        isRegistering: false,
        error: null, // Don't treat as fatal error
        isReady: true,
        updateAvailable: false,
        waitingWorker: null,
      });
      return;
    }

    let mounted = true;
    let hasReloaded = false;

    const registerServiceWorker = async () => {
      setState((prev) => ({ ...prev, isRegistering: true }));

      try {
        // Check if already registered
        let registration = await navigator.serviceWorker.getRegistration('/');
        
        if (registration) {
          console.log('[SW Registration] Service Worker already registered, checking for updates...');
          
          // Always check for updates with cache busting
          try {
            await registration.update();
            console.log('[SW Registration] Update check complete');
          } catch (updateError) {
            console.warn('[SW Registration] Update check failed (non-fatal):', updateError);
            // Report to diagnostics but don't block
            if (window.__startupDiagnostics) {
              window.__startupDiagnostics.swErrors.push({
                message: 'SW update check failed: ' + (updateError as Error).message,
                timestamp: Date.now()
              });
            }
          }
        } else {
          // Register new service worker with cache busting
          console.log('[SW Registration] Registering Service Worker...');
          const swUrl = '/service-worker.js?v=' + Date.now();
          registration = await navigator.serviceWorker.register(swUrl, {
            scope: '/',
            updateViaCache: 'none', // Don't cache the service worker script
          });
          console.log('[SW Registration] Service Worker registered successfully');
        }

        if (!mounted) return;

        // Set up update detection
        const handleUpdateFound = () => {
          console.log('[SW Registration] Update found');
          const installingWorker = registration!.installing;
          
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SW Registration] New service worker installed, update available');
                if (mounted) {
                  setState((prev) => ({
                    ...prev,
                    updateAvailable: true,
                    waitingWorker: installingWorker,
                  }));
                }
              }
            });
          }
        };

        registration.addEventListener('updatefound', handleUpdateFound);

        // Check if there's already a waiting worker
        if (registration.waiting) {
          console.log('[SW Registration] Waiting worker detected on registration');
          if (mounted) {
            setState((prev) => ({
              ...prev,
              updateAvailable: true,
              waitingWorker: registration.waiting,
            }));
          }
        }

        // Listen for controller change (new SW activated) - reload once
        const handleControllerChange = () => {
          if (!hasReloaded) {
            hasReloaded = true;
            console.log('[SW Registration] Controller changed, reloading page');
            window.location.reload();
          }
        };

        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

        // Periodic update checks for draft/preview (every 60 seconds)
        const updateCheckInterval = setInterval(() => {
          if (registration) {
            console.log('[SW Registration] Periodic update check');
            registration.update().catch(err => {
              console.warn('[SW Registration] Periodic update check failed:', err);
            });
          }
        }, 60000);

        if (mounted) {
          setState({
            registration,
            isRegistering: false,
            error: null,
            isReady: true,
            updateAvailable: !!registration.waiting,
            waitingWorker: registration.waiting,
          });
        }

        return () => {
          registration?.removeEventListener('updatefound', handleUpdateFound);
          navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
          clearInterval(updateCheckInterval);
        };

      } catch (error) {
        console.error('[SW Registration] Registration failed (non-fatal):', error);
        
        // Report to diagnostics but don't block
        if (window.__startupDiagnostics) {
          window.__startupDiagnostics.swErrors.push({
            message: 'SW registration failed: ' + (error as Error).message,
            timestamp: Date.now()
          });
        }
        
        if (mounted) {
          // Don't block app rendering on SW registration failure
          setState({
            registration: null,
            isRegistering: false,
            error: error as Error,
            isReady: true, // Mark as ready even on error
            updateAvailable: false,
            waitingWorker: null,
          });
        }
      }
    };

    registerServiceWorker();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    ...state,
    applyUpdate,
    resetServiceWorker,
  };
}
