import { UAParser } from "ua-parser-js";
import { BeforeInstallPromptEvent } from "../App";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setInstallState } from "../Redux/feat/InstallSlice";
import { Pixel, PWAInstallState } from "./models";
import {
  getExternalId,
  logEvent,
  sendEventWithCAPI,
} from "./helpers/analytics";

const parser = new UAParser();
const ua = parser.getResult();

const shouldRedirectToApp =
  ua.os.name === "Android" &&
  (ua.browser.name === "Facebook" || /FBAN|FBAV/i.test(navigator.userAgent));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const window: any;

const useInstallPwaInstall = (
  installPrompt: BeforeInstallPromptEvent | null,
  pixel?: [Pixel],
  id?: string
) => {
  const [askedOnce, setAskedOnce] = useState(false);
  const dispatch = useDispatch();
  const handleSendInfoAboutInstall = () => {
    if (window.fbq) {
      if (pixel?.length) {
        const eventName = "Install";

        pixel.forEach((pixel) => {
          const event = pixel.events.find(
            ({ triggerEvent }) => triggerEvent === eventName
          );

          if (pixel.pixelId && pixel.token && event) {
            sendEventWithCAPI(pixel.pixelId, pixel.token, event.sentEvent);
          } else if (event) {
            window.fbq("track", pixel.pixelId, event.sentEvent);
          }
        });
      } else {
        window.fbq("track", "Lead");
      }
    }

    if (id) {
      logEvent(id, window.location.hostname, "Install", getExternalId());
    }
  };

  const redirectToOffer = () => {
    const pwaLink = localStorage.getItem("pwaLink");
    if (!pwaLink) return;
    dispatch(setInstallState(PWAInstallState.waitingForRedirect));
    window.open(pwaLink, "_blank");
    setTimeout(() => {
      dispatch(setInstallState(PWAInstallState.installed));
    }, 1000);
  };

  const installPWA = async () => {
    if (shouldRedirectToApp && !askedOnce) {
      setAskedOnce(true);
      const intentUrl = `intent://${window.location.hostname}${
        window.location.pathname
      }${
        window.location.search
      }#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(
        window.location.href
      )};end`;

      window.location.href = intentUrl;
      return;
    }
    console.log("installPWA");

    if (installPrompt) {
      dispatch(setInstallState(PWAInstallState.installing));
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the A2HS prompt");
      } else {
        handleSendInfoAboutInstall();
        redirectToOffer();
      }
    } else {
      handleSendInfoAboutInstall();
      redirectToOffer();
    }
  };

  return { installPWA };
};

export default useInstallPwaInstall;
