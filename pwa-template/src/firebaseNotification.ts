import { getToken } from 'firebase/messaging';
import { messaging } from './firebaseConfig';
import { getExternalId, logEvent } from './shared/helpers/analytics.ts';

export const requestPermissionAndGetToken = async (pwaContentId: string) => {
  try {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers not supported');
    }

    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
    );
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

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

    const isInstalled = localStorage.getItem('is_installed');

    if (isInstalled !== 'true') {
      await logEvent(
        pwaContentId,
        window.location.hostname,
        'OpenPWA',
        getExternalId(),
      );

      localStorage.setItem('is_installed', 'true');
    }
  } catch (error) {
    console.error('[Notification] Error:', error);
    throw error;
  }
};
