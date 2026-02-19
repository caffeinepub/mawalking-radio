import { Mail, Globe, RefreshCw, Smartphone, Battery, Moon, MapPin, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PushNotificationsPanel } from '@/components/PushNotificationsPanel';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useRequestAdminRole } from '@/hooks/useRequestAdminRole';
import { toast } from 'sonner';
import { useState } from 'react';

interface SettingsAboutScreenProps {
  onNavigateToVenueSubmit: () => void;
  onNavigateToAdminVenues: () => void;
}

export default function SettingsAboutScreen({
  onNavigateToVenueSubmit,
  onNavigateToAdminVenues,
}: SettingsAboutScreenProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isAdmin, isLoading: adminLoading, isFetched } = useAdminRole();
  const requestAdminMutation = useRequestAdminRole();

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

  const handleEnableAdminAccess = async () => {
    try {
      await requestAdminMutation.mutateAsync();
      toast.success('Admin access enabled successfully!');
    } catch (error: any) {
      console.error('Failed to enable admin access:', error);
      
      // Parse error message for user-friendly feedback
      const errorMessage = error?.message || String(error);
      
      if (errorMessage.includes('already an admin')) {
        toast.error('You are already an admin.');
      } else if (errorMessage.includes('admin already exists')) {
        toast.error('An admin already exists. New admins must be granted by existing admins.');
      } else {
        toast.error('Failed to enable admin access. Please try again.');
      }
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
          <PushNotificationsPanel />

          {/* Venue Management */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Venue Discovery
              </CardTitle>
              <CardDescription className="text-white/70">
                Help us grow the rhumba community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={onNavigateToVenueSubmit}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Submit a Venue
              </Button>
              <p className="text-white/60 text-sm">
                Know a great rhumba venue? Submit it for approval and help others discover amazing places to enjoy rhumba music.
              </p>
            </CardContent>
          </Card>

          {/* Admin Access Section - Show when not admin */}
          {!adminLoading && isFetched && !isAdmin && (
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Admin Access
                </CardTitle>
                <CardDescription className="text-white/70">
                  Enable admin privileges to manage venue submissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-white/80 text-sm">
                  As the app owner, you can enable admin access to review and approve venue submissions.
                </p>
                <Button
                  onClick={handleEnableAdminAccess}
                  disabled={requestAdminMutation.isPending}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {requestAdminMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enabling...
                    </>
                  ) : (
                    'Enable Admin Access'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Admin Panel - Show when admin */}
          {!adminLoading && isFetched && isAdmin && (
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Admin Panel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={onNavigateToAdminVenues}
                  variant="outline"
                  className="w-full bg-white/5 hover:bg-white/10 text-white border-white/20"
                >
                  Manage Venues
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Background Playback Info */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Background Playback
              </CardTitle>
              <CardDescription className="text-white/70">
                Keep the music playing when your screen is off
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80 text-sm">
              <Alert className="bg-white/5 border-white/10">
                <Battery className="h-4 w-4" />
                <AlertTitle className="text-white">iOS / Safari Users</AlertTitle>
                <AlertDescription className="text-white/70">
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Install the app to your home screen for best results</li>
                    <li>Keep the app in the foreground or use Control Center to control playback</li>
                    <li>Background playback may pause due to iOS power management</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Alert className="bg-white/5 border-white/10">
                <Moon className="h-4 w-4" />
                <AlertTitle className="text-white">Android Users</AlertTitle>
                <AlertDescription className="text-white/70">
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Disable battery optimization for this app in Settings</li>
                    <li>Use the notification controls to manage playback</li>
                    <li>Some devices may pause audio when the screen locks</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <p className="text-white/60">
                For the best experience, we recommend installing Mawalking Radio as a Progressive Web App (PWA) on your device.
              </p>
            </CardContent>
          </Card>

          {/* Background Refresh */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Background Refresh
              </CardTitle>
              <CardDescription className="text-white/70">
                Clear cached background images
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleRefreshBackground}
                disabled={isRefreshing}
                variant="outline"
                className="w-full bg-white/5 hover:bg-white/10 text-white border-white/20"
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
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">About Mawalking Radio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80 text-sm">
              <p>
                Mawalking Radio brings you the best of African Rhumba music, featuring Congolese Rhumba, Soukous, Ndombolo, and more. Broadcasting 24/7 from the heart of African music culture.
              </p>
              <Separator className="bg-white/10" />
              <div className="space-y-2">
                <h3 className="text-white font-semibold">Contact Us</h3>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:info@mawalkingradio.com" className="hover:text-accent transition-colors">
                    info@mawalkingradio.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <a href="https://www.mawalkingradio.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                    www.mawalkingradio.com
                  </a>
                </div>
              </div>
              <Separator className="bg-white/10" />
              <p className="text-white/60 text-xs">
                © {new Date().getFullYear()} Mawalking Radio. Built with love using{' '}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                    typeof window !== 'undefined' ? window.location.hostname : 'mawalking-radio'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent/80 transition-colors"
                >
                  caffeine.ai
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
