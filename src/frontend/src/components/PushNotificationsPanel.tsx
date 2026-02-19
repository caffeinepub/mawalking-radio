import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, Loader2, CheckCircle, XCircle, Info } from 'lucide-react';
import { usePushSubscription } from '../hooks/usePushSubscription';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function PushNotificationsPanel() {
  const { 
    isSupported, 
    isSubscribed, 
    isSubscribing, 
    error, 
    subscribe,
    diagnostics 
  } = usePushSubscription();

  if (!isSupported) {
    return (
      <Card className="bg-white/10 border-white/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BellOff className="w-5 h-5" />
            Push Notifications
          </CardTitle>
          <CardDescription className="text-white/70">
            Push notifications are not supported in this browser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white/60">
            Your browser doesn't support push notifications. You'll still receive in-app notifications while the app is open.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          {isSubscribed ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-400" />
              Push Notifications Enabled
            </>
          ) : (
            <>
              <Bell className="w-5 h-5" />
              Enable Push Notifications
            </>
          )}
        </CardTitle>
        <CardDescription className="text-white/70">
          {isSubscribed
            ? 'Receive notifications when the app is closed (browser permitting)'
            : 'Get notified about track changes and live shows'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Diagnostics */}
        {diagnostics && (
          <Alert className="bg-white/5 border-white/20">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-white/70 text-xs space-y-1">
              <div>Service Worker: {diagnostics.swReady ? '✓ Ready' : '✗ Not Ready'}</div>
              <div>Permission: {diagnostics.permission}</div>
              <div>Subscription: {diagnostics.hasSubscription ? '✓ Active' : '✗ None'}</div>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="text-sm text-white">{error}</p>
              {error.includes('permission') && (
                <p className="text-xs text-white/70">
                  Please enable notifications in your browser settings and try again.
                </p>
              )}
            </div>
          </div>
        )}

        {!isSubscribed && (
          <Button
            onClick={subscribe}
            disabled={isSubscribing}
            className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            {isSubscribing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subscribing...
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Enable Push Notifications
              </>
            )}
          </Button>
        )}

        {isSubscribed && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/20 border border-green-500/30">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-sm text-white">
              You're subscribed to push notifications
            </p>
          </div>
        )}

        <p className="text-xs text-white/60">
          {isSubscribed
            ? 'Push notifications will be delivered when the browser supports it and the app is closed. Some browsers may require the app to remain installed or have specific settings enabled.'
            : 'You can manage notification permissions in your browser settings at any time.'}
        </p>
      </CardContent>
    </Card>
  );
}
