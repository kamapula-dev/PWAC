import { getToken } from 'firebase/messaging';
import { messaging } from './firebaseConfig';
import { getExternalId, logEvent } from './shared/helpers/analytics.ts';

export const requestPermissionAndGetToken = async (pwaContentId: string) => {
  try {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers not supported');
    }

    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    const pushToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_APP_VAPID_KEY,
    });

    await fetch('https://pwac.world/pwa-external-mapping', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        externalId: getExternalId(),
        pushToken,
      }),
    });

    await logEvent(
      pwaContentId,
      window.location.hostname,
      'OpenPWA',
      getExternalId(),
    );
  } catch (error) {
    console.error('[Notification] Error:', error);
    throw error;
  }
};
