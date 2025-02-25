import { getToken } from 'firebase/messaging';
import { messaging } from './firebaseConfig';
import { getExternalId } from './shared/helpers/analytics.ts';

export const requestPermissionAndGetToken = async () => {
  try {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers not supported');
    }

    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
    );

    const permission = await Notification.requestPermission();
    const isDialogShown = permission !== 'default';

    if (permission === 'granted') {
      const pushToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_APP_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      await fetch('https://pwac.world/pwa-external-mapping', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          externalId: getExternalId(),
          pushToken,
        }),
      });

      return { token: pushToken, dialogShown: isDialogShown };
    }

    return { token: null, dialogShown: isDialogShown };
  } catch (error) {
    console.error('[Notification] Error:', error);
    throw error;
  }
};
