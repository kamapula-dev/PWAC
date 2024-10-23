const PUBLIC_VAPID_KEY =
  "BD9M5P5GqWTe7cu3NghJeO_OVQ-RZrlwcW6bSGBWB8eyXd-1lJ0f02R2ChzJxoeP-yyAKkNQBf-JiL12plMuDrQ";

function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker
    .register("/sw.js")
    .then(function (registration) {
      console.log("Service worker successfully registered.");
      return registration;
    })
    .catch(function (err) {
      console.error("Unable to register service worker.", err);
      return Promise.reject(err);
    });
}

function requestPermission() {
  return new Promise((resolve, reject) => {
    const permissionResult = Notification.requestPermission((result) => {
      resolve(result);
    });

    if (permissionResult) {
      permissionResult.then(resolve, reject);
    }
  }).then((permissionResult) => {
    if (permissionResult !== "granted") {
      throw new Error("Permission denied");
    }
    return subscribeUserToPush();
  });
}

async function subscribeUserToPush() {
  const registration = await registerServiceWorker();
  if (!registration.pushManager) {
    throw new Error("Push manager is not available.");
  }
  const subscribeOptions = {
    userVisibleOnly: true,
    applicationServerKey: PUBLIC_VAPID_KEY,
  };
  const pushSubscription = await registration.pushManager.subscribe(
    subscribeOptions
  );

  console.log(JSON.stringify(pushSubscription));

  try {
    const response = await fetch("/api/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pushSubscription),
    });

    if (!response.ok) {
      throw new Error("Failed to send subscription to server");
    }
  } catch (error) {
    console.error("Error sending subscription to server:", error);
  }

  return pushSubscription;
}

export { requestPermission };
