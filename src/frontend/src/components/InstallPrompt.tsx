import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Share, ChevronDown, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Detect Android
    const android = /Android/.test(navigator.userAgent);
    setIsAndroid(android);

    // Detect Safari (including iOS Safari)
    const safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setIsSafari(safari);

    // Detect Chrome (including Android Chrome)
    const chrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    setIsChrome(chrome);

    // Check if running in standalone mode (already installed)
    const standalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(standalone);

    // Don't show prompt if already installed
    if (standalone) {
      console.log('[PWA] App is running in standalone mode');
      return;
    }

    // Check if user has dismissed the prompt recently
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const iosGuideDismissed = localStorage.getItem('pwa-ios-guide-dismissed');
    const androidGuideDismissed = localStorage.getItem('pwa-android-guide-dismissed');
    
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        console.log('[PWA] Install prompt dismissed recently, waiting');
        return;
      }
    }

    // Listen for beforeinstallprompt event (Chrome, Edge, Samsung Internet)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWA] beforeinstallprompt event fired');
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Show prompt after a short delay to avoid overwhelming user
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS Safari, show dedicated installation guide
    if (ios && safari && !standalone) {
      console.log('[PWA] iOS Safari detected, showing install guide');
      
      // Check if iOS guide was dismissed recently
      if (iosGuideDismissed) {
        const dismissedTime = parseInt(iosGuideDismissed, 10);
        const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
        // Show again after 7 days
        if (daysSinceDismissed < 7) {
          console.log('[PWA] iOS guide dismissed recently, waiting');
          return;
        }
      }
      
      // Slightly longer delay for iOS to ensure page is fully loaded
      setTimeout(() => {
        setShowIOSGuide(true);
      }, 4000);
    }

    // For Android Chrome, show dedicated installation guide if beforeinstallprompt hasn't fired
    if (android && chrome && !standalone) {
      console.log('[PWA] Android Chrome detected');
      
      // Check if Android guide was dismissed recently
      if (androidGuideDismissed) {
        const dismissedTime = parseInt(androidGuideDismissed, 10);
        const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
        // Show again after 7 days
        if (daysSinceDismissed < 7) {
          console.log('[PWA] Android guide dismissed recently, waiting');
          return;
        }
      }
      
      // Wait to see if beforeinstallprompt fires, if not show manual guide
      setTimeout(() => {
        if (!deferredPrompt) {
          console.log('[PWA] No beforeinstallprompt on Android, showing manual guide');
          setShowAndroidGuide(true);
        }
      }, 5000);
    }

    // For other browsers that support PWA but don't fire beforeinstallprompt
    // (like Firefox), show a generic install message after delay
    if (!ios && !android && !standalone) {
      setTimeout(() => {
        // Only show if beforeinstallprompt hasn't fired
        if (!deferredPrompt) {
          console.log('[PWA] No beforeinstallprompt, checking for PWA support');
          // Check if manifest is available
          const manifestLink = document.querySelector('link[rel="manifest"]');
          if (manifestLink && 'serviceWorker' in navigator) {
            setShowPrompt(true);
          }
        }
      }, 8000);
    }

    // Log PWA readiness
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(() => {
          console.log('[PWA] Service Worker is ready');
        })
        .catch((error) => {
          console.error('[PWA] Service Worker not ready:', error);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    // iOS Safari - show instructions
    if (isIOS && isSafari) {
      toast.info(
        <div className="flex items-start gap-2">
          <Share className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Install on iOS:</p>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Tap the Share button <Share className="w-3 h-3 inline" /></li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" to confirm</li>
            </ol>
          </div>
        </div>,
        { duration: 10000 }
      );
      return;
    }

    // Android Chrome - show instructions
    if (isAndroid && isChrome && !deferredPrompt) {
      toast.info(
        <div className="flex items-start gap-2">
          <MoreVertical className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Install on Android:</p>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Tap the three dots in the top right</li>
              <li>Tap "Add to Home screen"</li>
              <li>Tap "Add" to confirm</li>
            </ol>
          </div>
        </div>,
        { duration: 10000 }
      );
      return;
    }

    // Chrome/Edge with beforeinstallprompt support
    if (deferredPrompt) {
      try {
        console.log('[PWA] Showing install prompt');
        // Show the install prompt
        await deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log('[PWA] User choice:', outcome);

        if (outcome === 'accepted') {
          console.log('[PWA] User accepted the install prompt');
          toast.success('App installed successfully!');
          setShowPrompt(false);
        } else {
          console.log('[PWA] User dismissed the install prompt');
          toast.info('You can install the app anytime from your browser menu.');
        }
      } catch (error) {
        console.error('[PWA] Error showing install prompt:', error);
        toast.error('Failed to show install prompt. Please try again.');
      }

      // Clear the deferredPrompt
      setDeferredPrompt(null);
      return;
    }

    // Fallback for browsers without beforeinstallprompt
    toast.info(
      <div>
        <p className="font-semibold mb-1">Install this app:</p>
        <p className="text-sm">
          Look for the install option in your browser's menu (usually under "Install app" or "Add to Home Screen").
        </p>
      </div>,
      { duration: 8000 }
    );
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    console.log('[PWA] Install prompt dismissed by user');
  };

  const handleIOSGuideDismiss = () => {
    setShowIOSGuide(false);
    localStorage.setItem('pwa-ios-guide-dismissed', Date.now().toString());
    console.log('[PWA] iOS guide dismissed by user');
  };

  const handleAndroidGuideDismiss = () => {
    setShowAndroidGuide(false);
    localStorage.setItem('pwa-android-guide-dismissed', Date.now().toString());
    console.log('[PWA] Android guide dismissed by user');
  };

  // Don't show if already installed
  if (isStandalone) {
    return null;
  }

  // iOS-specific installation guide banner
  if (showIOSGuide && isIOS && isSafari) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="bg-gradient-to-r from-radio-start to-radio-end text-white shadow-xl">
          <div className="max-w-4xl mx-auto px-3 py-3 xs:px-4 xs:py-4 sm:py-4">
            <div className="flex items-start gap-2 xs:gap-3">
              <div className="flex-shrink-0 mt-0.5 animate-in zoom-in duration-500 delay-300">
                <Download className="w-5 h-5 xs:w-6 xs:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm xs:text-base sm:text-base font-bold mb-1 leading-tight">
                  Install Mawalking Radio
                </h3>
                <p className="text-xs xs:text-sm sm:text-sm opacity-95 mb-2 leading-snug">
                  Get the full app experience on your iPhone
                </p>
                <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2.5 xs:p-3 space-y-2 text-xs xs:text-sm animate-in fade-in duration-500 delay-500">
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 xs:w-6 xs:h-6 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold shadow-sm">
                      1
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold leading-tight mb-1">Tap the Share button</p>
                      <div className="flex items-center gap-1.5 opacity-95">
                        <div className="flex-shrink-0 w-7 h-7 xs:w-8 xs:h-8 rounded-md bg-white/20 flex items-center justify-center animate-pulse">
                          <Share className="w-4 h-4 xs:w-4.5 xs:h-4.5" />
                        </div>
                        <span className="text-[10px] xs:text-xs leading-tight">(at the bottom of Safari)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 xs:w-6 xs:h-6 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold shadow-sm">
                      2
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold leading-tight mb-0.5">Scroll down and tap</p>
                      <p className="opacity-95 leading-tight text-[11px] xs:text-xs">"Add to Home Screen"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 xs:w-6 xs:h-6 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold shadow-sm">
                      3
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold leading-tight mb-0.5">Tap "Add" to confirm</p>
                      <p className="opacity-95 leading-tight text-[11px] xs:text-xs">The app will appear on your home screen</p>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleIOSGuideDismiss}
                className="flex-shrink-0 text-white/80 hover:text-white active:text-white/60 transition-colors touch-manipulation p-1 -mt-1 rounded-full hover:bg-white/10 active:bg-white/20"
                aria-label="Dismiss installation guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex justify-center pb-2 animate-in fade-in duration-700 delay-700">
            <ChevronDown className="w-4 h-4 opacity-70 animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  // Android-specific installation guide banner
  if (showAndroidGuide && isAndroid && isChrome) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="bg-gradient-to-r from-radio-start to-radio-end text-white shadow-xl">
          <div className="max-w-4xl mx-auto px-3 py-3 xs:px-4 xs:py-4 sm:py-4">
            <div className="flex items-start gap-2 xs:gap-3">
              <div className="flex-shrink-0 mt-0.5 animate-in zoom-in duration-500 delay-300">
                <Download className="w-5 h-5 xs:w-6 xs:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm xs:text-base sm:text-base font-bold mb-1 leading-tight">
                  Install Mawalking Radio
                </h3>
                <p className="text-xs xs:text-sm sm:text-sm opacity-95 mb-2 leading-snug">
                  Get the full app experience on your Android device
                </p>
                <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2.5 xs:p-3 space-y-2 text-xs xs:text-sm animate-in fade-in duration-500 delay-500">
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 xs:w-6 xs:h-6 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold shadow-sm">
                      1
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold leading-tight mb-1">Tap the three dots</p>
                      <div className="flex items-center gap-1.5 opacity-95">
                        <div className="flex-shrink-0 w-7 h-7 xs:w-8 xs:h-8 rounded-md bg-white/20 flex items-center justify-center animate-pulse">
                          <MoreVertical className="w-4 h-4 xs:w-4.5 xs:h-4.5" />
                        </div>
                        <span className="text-[10px] xs:text-xs leading-tight">(in the top right corner)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 xs:w-6 xs:h-6 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold shadow-sm">
                      2
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold leading-tight mb-0.5">Tap "Add to Home screen"</p>
                      <p className="opacity-95 leading-tight text-[11px] xs:text-xs">or "Install app" if available</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 xs:w-6 xs:h-6 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold shadow-sm">
                      3
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold leading-tight mb-0.5">Tap "Add" or "Install" to confirm</p>
                      <p className="opacity-95 leading-tight text-[11px] xs:text-xs">The app will appear on your home screen</p>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleAndroidGuideDismiss}
                className="flex-shrink-0 text-white/80 hover:text-white active:text-white/60 transition-colors touch-manipulation p-1 -mt-1 rounded-full hover:bg-white/10 active:bg-white/20"
                aria-label="Dismiss installation guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex justify-center pb-2 animate-in fade-in duration-700 delay-700">
            <ChevronDown className="w-4 h-4 opacity-70 animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  // Standard install prompt for non-iOS/Android devices or when beforeinstallprompt is available
  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-radio-start to-radio-end flex items-center justify-center shadow-md">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 leading-tight">
              Install Mawalking Radio
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 leading-snug">
              Install the app for quick access, offline support, and a native experience
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="flex-1 bg-gradient-to-r from-radio-start to-radio-end hover:opacity-90 active:opacity-80 text-white text-xs h-8 touch-manipulation transition-opacity"
              >
                Install Now
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white active:bg-gray-100 dark:active:bg-gray-800 text-xs h-8 px-3 touch-manipulation"
              >
                Not now
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 active:text-gray-800 dark:active:text-white transition-colors touch-manipulation p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

