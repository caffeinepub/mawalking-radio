import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { usePushSubscription } from '../hooks/usePushSubscription';

export function PushNotificationsPanel() {
  const { isSupported, isSubscribed, isSubscribing, error, subscribe } = usePushSubscription();

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
            ? 'You will receive notifications even when the app is closed'
            : 'Get notified about track changes and live shows'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-white">{error}</p>
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
            ? 'Push notifications will work even when the app is closed or in the background.'
            : 'You can manage notification permissions in your browser settings at any time.'}
        </p>
      </CardContent>
    </Card>
  );
}
