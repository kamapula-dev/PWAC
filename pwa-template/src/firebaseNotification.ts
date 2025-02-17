import { getToken } from 'firebase/messaging';
import { messaging } from './firebaseConfig';
import { getExternalId } from './shared/helpers/analytics.ts';

export const requestPermissionAndGetToken = async () => {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
    );

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const pushToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_APP_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      const externalId = getExternalId();
      await fetch('https://pwac.world/pwa-external-mapping', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ externalId, pushToken }),
      });

      return pushToken;
    }
  } catch (error) {
    console.error('Error registering SW or getting token:', error);
    setTimeout(requestPermissionAndGetToken, 500);
  }
};
