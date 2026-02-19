import { useState, useCallback, useEffect } from 'react';
import { useActor } from './useActor';
import { useServiceWorkerRegistration } from './useServiceWorkerRegistration';

interface PushSubscriptionState {
  isSubscribed: boolean;
  isSubscribing: boolean;
  error: string | null;
  subscription: PushSubscription | null;
  diagnostics: {
    swReady: boolean;
    permission: NotificationPermission;
    hasSubscription: boolean;
  } | null;
}

export function usePushSubscription() {
  const { actor } = useActor();
  const { registration, isReady } = useServiceWorkerRegistration();
  const [state, setState] = useState<PushSubscriptionState>({
    isSubscribed: false,
    isSubscribing: false,
    error: null,
    subscription: null,
    diagnostics: null,
  });

  const isSupported = 'PushManager' in window && 'serviceWorker' in navigator && 'Notification' in window;

  // Check existing subscription on load
  useEffect(() => {
    if (!isSupported || !isReady || !registration) return;

    const checkExistingSubscription = async () => {
      try {
        const existingSubscription = await registration.pushManager.getSubscription();
        const permission = Notification.permission;

        setState((prev) => ({
          ...prev,
          isSubscribed: !!existingSubscription && permission === 'granted',
          subscription: existingSubscription,
          diagnostics: {
            swReady: isReady,
            permission,
            hasSubscription: !!existingSubscription,
          },
        }));

        console.log('[Push] Existing subscription check:', {
          hasSubscription: !!existingSubscription,
          permission,
        });
      } catch (error) {
        console.warn('[Push] Failed to check existing subscription:', error);
        setState((prev) => ({
          ...prev,
          diagnostics: {
            swReady: isReady,
            permission: Notification.permission,
            hasSubscription: false,
          },
        }));
      }
    };

    checkExistingSubscription();
  }, [isSupported, isReady, registration]);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setState((prev) => ({
        ...prev,
        error: 'Push notifications are not supported in this browser',
      }));
      return false;
    }

    if (!isReady || !registration) {
      setState((prev) => ({
        ...prev,
        error: 'Service Worker not ready. Please try again.',
      }));
      return false;
    }

    if (!actor) {
      setState((prev) => ({
        ...prev,
        error: 'Backend connection not available. Please log in and try again.',
      }));
      return false;
    }

    setState((prev) => ({ ...prev, isSubscribing: true, error: null }));

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        setState({
          isSubscribed: false,
          isSubscribing: false,
          error: 'Notification permission denied. Please enable notifications in your browser settings.',
          subscription: null,
          diagnostics: {
            swReady: isReady,
            permission,
            hasSubscription: false,
          },
        });
        return false;
      }

      // Check for existing subscription
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Create new subscription
        // Using a public VAPID key - in production, this should be your actual VAPID public key
        const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
        });

        console.log('[Push] New subscription created');
      } else {
        console.log('[Push] Using existing subscription');
      }

      // Extract subscription details
      const subscriptionJSON = subscription.toJSON();
      const endpoint = subscriptionJSON.endpoint || '';
      const keys = subscriptionJSON.keys || {};
      const auth = keys.auth || '';
      const p256dh = keys.p256dh || '';

      if (!endpoint || !auth || !p256dh) {
        throw new Error('Invalid subscription data');
      }

      // Store subscription in backend
      try {
        await actor.storePushSubscription(endpoint, auth, p256dh);
        console.log('[Push] Subscription stored in backend');
      } catch (backendError: any) {
        // Handle authorization errors gracefully
        if (backendError.message && backendError.message.includes('Unauthorized')) {
          throw new Error('You must be logged in to enable push notifications. Please log in and try again.');
        }
        throw backendError;
      }

      setState({
        isSubscribed: true,
        isSubscribing: false,
        error: null,
        subscription,
        diagnostics: {
          swReady: isReady,
          permission,
          hasSubscription: true,
        },
      });

      return true;
    } catch (error: any) {
      console.error('[Push] Subscription failed:', error);
      setState((prev) => ({
        ...prev,
        isSubscribed: false,
        isSubscribing: false,
        error: error.message || 'Failed to subscribe to push notifications. Please try again.',
        diagnostics: {
          swReady: isReady,
          permission: Notification.permission,
          hasSubscription: false,
        },
      }));
      return false;
    }
  }, [isSupported, isReady, registration, actor]);

  const unsubscribe = useCallback(async () => {
    if (!state.subscription) {
      return true;
    }

    try {
      await state.subscription.unsubscribe();
      setState({
        isSubscribed: false,
        isSubscribing: false,
        error: null,
        subscription: null,
        diagnostics: state.diagnostics ? {
          ...state.diagnostics,
          hasSubscription: false,
        } : null,
      });
      return true;
    } catch (error: any) {
      console.error('[Push] Unsubscribe failed:', error);
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to unsubscribe',
      }));
      return false;
    }
  }, [state.subscription, state.diagnostics]);

  return {
    ...state,
    isSupported,
    subscribe,
    unsubscribe,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
