import { Mail, Globe, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PushNotificationsPanel } from '@/components/PushNotificationsPanel';
import { toast } from 'sonner';
import { useState } from 'react';

export default function SettingsAboutScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshBackground = async () => {
    setIsRefreshing(true);
    try {
      // Clear all new background image variants from all caches
      const backgroundAssets = [
        '/assets/generated/mawalking-user-bg-mobile.dim_1080x1920.avif',
        '/assets/generated/mawalking-user-bg-mobile.dim_1080x1920.webp',
        '/assets/generated/mawalking-user-bg-mobile.dim_1080x1920.png',
        '/assets/generated/mawalking-user-bg.dim_1920x1080.avif',
        '/assets/generated/mawalking-user-bg.dim_1920x1080.webp',
        '/assets/generated/mawalking-user-bg.dim_1920x1080.png'
      ];

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(async (cacheName) => {
            const cache = await caches.open(cacheName);
            await Promise.all(
              backgroundAssets.map(asset => cache.delete(asset))
            );
          })
        );
      }

      // Notify service worker to clear background cache
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEAR_BACKGROUND_CACHE'
        });
      }

      toast.success('Background cache cleared. Reloading...');
      
      // Reload the app after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Failed to refresh background:', error);
      toast.error('Failed to refresh background. Please try again.');
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden pb-fixed-bottom-ui">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-6 bg-background/80 backdrop-blur-md border-b border-white/10 pt-safe">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Settings & About
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 sm:px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Notifications */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Notifications</CardTitle>
              <CardDescription className="text-white/60">
                Manage push notifications for track changes and live shows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PushNotificationsPanel />
            </CardContent>
          </Card>

          {/* Background Refresh */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Background Image</CardTitle>
              <CardDescription className="text-white/60">
                Refresh the background image if it appears outdated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleRefreshBackground}
                disabled={isRefreshing}
                className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 touch-manipulation"
                variant="outline"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Background
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* About */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">About Mawalking Radio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/80 leading-relaxed">
                Mawalking Radio is dedicated to showcasing the vibrant sounds of African music to a global audience. 
                We broadcast live Congolese Rhumba, Soukous, Ndombolo, and Afro Zouk 24/7, celebrating the rich 
                musical heritage of Africa and bringing it to listeners worldwide.
              </p>
              <p className="text-white/80 leading-relaxed">
                Our mission is to preserve and promote African rhythms, connecting communities through the universal 
                language of music. From classic Rhumba legends to contemporary Ndombolo hits, we're your home for 
                authentic African sounds.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-white/20 touch-manipulation"
                asChild
              >
                <a href="https://www.mawalkingradio.app" target="_blank" rel="noopener noreferrer">
                  <Globe className="w-4 h-4 mr-2" />
                  Visit Our Website
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-white/20 touch-manipulation"
                asChild
              >
                <a href="mailto:info@mawalkingradio.app">
                  <Mail className="w-4 h-4 mr-2" />
                  info@mawalkingradio.app
                </a>
              </Button>
            </CardContent>
          </Card>

          <Separator className="bg-white/10" />

          {/* Footer */}
          <div className="text-center py-4">
            <p className="text-sm text-white/60">
              © 2026. Built with love using{' '}
              <a 
                href="https://caffeine.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
