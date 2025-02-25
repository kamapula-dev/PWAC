import { getToken } from 'firebase/messaging';
import { messaging } from './firebaseConfig';
import { getExternalId } from './shared/helpers/analytics.ts';

// firebaseNotification.ts
export const requestPermissionAndGetToken = async () => {
  try {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers not supported');
    }

    const currentPermission = Notification.permission;
    const isPermissionDecided = currentPermission !== 'default';

    // Если разрешение уже получено или отклонено, не показываем диалог
    if (isPermissionDecided) {
      const registration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js',
      );

      if (currentPermission === 'granted') {
        const pushToken = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_APP_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        const externalId = getExternalId();
        await fetch('https://pwac.world/pwa-external-mapping', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ externalId, pushToken }),
        });

        return { token: pushToken, dialogShown: false };
      }

      return { token: null, dialogShown: false };
    }

    // Если разрешение еще не запрашивали (status === 'default')
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
    );
    const newPermission = await Notification.requestPermission();

    if (newPermission === 'granted') {
      const pushToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_APP_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      const externalId = getExternalId();
      await fetch('https://pwac.world/pwa-external-mapping', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ externalId, pushToken }),
      });

      return { token: pushToken, dialogShown: true };
    }

    return { token: null, dialogShown: true };
  } catch (error) {
    console.error('[Notification] Error:', error);
    throw error;
  }
};
