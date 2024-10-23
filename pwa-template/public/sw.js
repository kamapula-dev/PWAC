/* eslint-env serviceworker */
import { precacheAndRoute } from "workbox-precaching";

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("push", (event) => {
  const data = event.data.json();
  console.log("Push event!! ", data);
  self.registration.showNotification(data.title, {
    body: "У вас уведомление",
  });
});

self.addEventListener("notificationclick", function (event) {
  console.log("On notification click: ", event.notification.tag);
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window" }).then(function (windowClients) {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
