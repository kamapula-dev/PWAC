import { getToken } from 'firebase/messaging';
import { messaging } from './firebaseConfig';
import { getExternalId } from './shared/helpers/analytics.ts';

/**
 * Проверяет, запущено ли PWA в In-App браузере.
 * Если да — сервис-воркер не регистрируется.
 */
const isInAppBrowser = () => {
  return /FBAN|FBAV|Instagram|LINE|LinkedIn|TikTok|Telegram/i.test(
    navigator.userAgent,
  );
};

export const requestPermissionAndGetToken = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker не поддерживается в этом браузере.');
    return;
  }

  if (isInAppBrowser()) {
    console.warn('In-App браузер обнаружен. Push-уведомления отключены.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
    );

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Пользователь не дал разрешение на уведомления.');
      return;
    }

    const pushToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_APP_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!pushToken) {
      console.warn('Не удалось получить push-токен.');
      return;
    }

    const externalId = getExternalId();
    await fetch('https://pwac.world/pwa-external-mapping', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ externalId, pushToken }),
    });

    return pushToken;
  } catch (error) {
    console.error(
      'Ошибка при регистрации Service Worker или получении токена:',
      error,
    );
    setTimeout(requestPermissionAndGetToken, 500);
  }
};
