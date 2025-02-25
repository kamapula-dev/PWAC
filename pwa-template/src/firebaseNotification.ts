import { getToken } from 'firebase/messaging';
import { messaging } from './firebaseConfig';
import { getExternalId } from './shared/helpers/analytics.ts';

export const requestPermissionAndGetToken = async (
  onSuccess?: (token: string) => void,
  onError?: (error: Error) => void,
) => {
  console.log('[Notification] Starting notification setup...');

  if (!('serviceWorker' in navigator)) {
    const error = new Error('Service workers not supported');
    console.warn('[Notification]', error.message);
    onError?.(error);
    return;
  }

  try {
    console.log('[Notification] Registering service worker...');
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
    );

    console.log('[Notification] Requesting permissions...');
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      const error = new Error('Permission not granted');
      console.log('[Notification]', error.message);
      onError?.(error);
      return;
    }

    console.log('[Notification] Getting FCM token...');
    const pushToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_APP_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    console.log('[Notification] Sending token to server...');
    const externalId = getExternalId();
    await fetch('https://pwac.world/pwa-external-mapping', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ externalId, pushToken }),
    });

    console.log('[Notification] Setup completed successfully');
    onSuccess?.(pushToken);
    return pushToken;
  } catch (error) {
    console.error('[Notification] Setup failed:', error);
    onError?.(error instanceof Error ? error : new Error('Unknown error'));
    throw error;
  }
};
