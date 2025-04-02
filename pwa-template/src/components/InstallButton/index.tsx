/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIntl } from "react-intl";
import {
  getInstallState,
  setInstallState,
} from "../../Redux/feat/InstallSlice";
import { Pixel, PWAInstallState } from "../../shared/models";
import { RootState } from "../../Redux/store/store";
import {
  buildAppLink,
  getExternalId,
  logEvent,
  sendEventWithCAPI,
} from "../../shared/helpers/analytics.ts";
import Cookies from "js-cookie";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { UAParser } from "ua-parser-js";

declare const window: any;

interface Props {
  appLink: string;
  installPrompt: BeforeInstallPromptEvent | null;
  dark: boolean;
  pixel?: [Pixel];
  id?: string;
  customText?: string;
  mainThemeColor?: string;
  installButtonTextColor?: string;
  onClick?: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const parser = new UAParser();
const ua = parser.getResult();

const shouldRedirectToApp =
  ua.os.name === "Android" &&
  (ua.browser.name === "Facebook" || /FBAN|FBAV/i.test(navigator.userAgent));

const InstallButton: React.FC<Props> = ({
  appLink,
  installPrompt,
  dark,
  pixel,
  id,
  customText,
  mainThemeColor,
  installButtonTextColor,
  onClick,
}) => {
  const installState = useSelector((state: RootState) =>
    getInstallState(state.install),
  );
  const [askedOnce, setAskedOnce] = React.useState(false);

  const dispatch = useDispatch();

  const intl = useIntl();

  const handleSendInfoAboutInstall = () => {
    if (window.fbq) {
      if (pixel?.length) {
        const eventName = "Install";

        pixel.forEach((pixel) => {
          const event = pixel.events.find(
            ({ triggerEvent }) => triggerEvent === eventName,
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
    onClick?.();
    if (shouldRedirectToApp && !askedOnce) {
      setAskedOnce(true);
      window.location.href = `intent://${window.location.hostname}${
        window.location.pathname
      }${
        window.location.search
      }#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(
        window.location.href,
      )};end`;
      return;
    }

    if (installPrompt) {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        dispatch(setInstallState(PWAInstallState.installing));
      } else {
        dispatch(setInstallState(PWAInstallState.waitingForRedirect));
        handleSendInfoAboutInstall();
        redirectToOffer();
      }
    } else {
      dispatch(setInstallState(PWAInstallState.waitingForRedirect));
      handleSendInfoAboutInstall();
      redirectToOffer();
    }
  };

  const openLink = async () => {
    handleSendInfoAboutInstall();
    const fbc = Cookies.get("_fbc");
    const fbp = Cookies.get("_fbp");
    window.open(buildAppLink(appLink, fbc, fbp), "_blank");
  };

  const showButtonText = () => {
    switch (installState) {
      case PWAInstallState.idle:
        return (
          customText ??
          intl.formatMessage({
            id: "install",
            defaultMessage: "Install",
          })
        );

      case PWAInstallState.installing:
      case PWAInstallState.installed:
        return intl.formatMessage({
          id: "open",
          defaultMessage: "Open",
        });
    }
  };

  const handleButtonClick = () => {
    switch (installState) {
      case PWAInstallState.installed:
        openLink();
        break;

      case PWAInstallState.idle:
        installPWA();
        break;
    }
  };

  if (installState === PWAInstallState.waitingForRedirect) {
    return (
      <button
        className={`h-9 rounded-[60px] bg-[#1357CD]  w-full text-white ${
          customText ? "" : "mb-[22px]"
        } transition duration-300 active:scale-95 disabled:bg-gray-300`}
        disabled
      >
        <Spin indicator={<LoadingOutlined spin />} />
      </button>
    );
  }

  const disabled = installState === PWAInstallState.installing;

  return (
    <div className="flex justify-between gap-2">
      {installState === PWAInstallState.installing && (
        <button
          style={
            mainThemeColor
              ? { background: mainThemeColor, color: installButtonTextColor }
              : dark
                ? { background: "#A8C8FB", color: "#062961" }
                : {}
          }
          className={`h-9 rounded-[60px] bg-[#1357CD] w-full text-white ${
            customText ? "" : "mb-[22px]"
          } transition duration-300 active:scale-95 disabled:bg-gray-300`}
          onClick={() => dispatch(setInstallState(PWAInstallState.idle))}
        >
          {intl.formatMessage({
            id: "cancel",
            defaultMessage: "Cancel",
          })}
        </button>
      )}
      <button
        style={
          mainThemeColor
            ? {
                background: disabled ? "#D1D5DB" : mainThemeColor,
                color: installButtonTextColor,
              }
            : dark
              ? {
                  background: disabled ? "#D1D5DB" : "#A8C8FB",
                  color: disabled ? "#FFFFFF" : "#062961",
                }
              : {}
        }
        className={`h-9 rounded-[60px] bg-[#1357CD]  w-full text-white ${
          customText ? "" : "mb-[22px]"
        } transition duration-300 active:scale-95 disabled:bg-gray-300 `}
        onClick={handleButtonClick}
        disabled={disabled}
      >
        {showButtonText()}
      </button>
    </div>
  );
};

export default InstallButton;
