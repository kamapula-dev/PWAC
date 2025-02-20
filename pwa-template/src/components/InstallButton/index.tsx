/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useSelector, useDispatch } from "react-redux";
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
} from "../../shared/helpers/analytics.ts";
import Cookies from "js-cookie";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

declare const window: any;

interface Props {
  appLink: string;
  installPrompt: BeforeInstallPromptEvent | null;
  dark: boolean;
  pixel?: [Pixel];
  id?: string;
  customText?: string;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const InstallButton: React.FC<Props> = ({
  appLink,
  installPrompt,
  dark,
  pixel,
  id,
  customText,
}) => {
  const installState = useSelector((state: RootState) =>
    getInstallState(state.install)
  );

  const dispatch = useDispatch();

  const intl = useIntl();

  const downloadPWA = () => {
    dispatch(setInstallState(PWAInstallState.downloading));
  };

  const handleSendInfoAboutInstall = () => {
    if (window.fbq) {
      if (pixel?.length) {
        const eventName = "Install";
        let leadEvent;

        pixel.forEach((pixel) => {
          const event = pixel.events.find(
            ({ triggerEvent }) => triggerEvent === eventName
          );

          if (event) {
            leadEvent = eventName;
            window.fbq("track", pixel.pixelId, event.sentEvent);
          }
        });

        if (leadEvent && id) {
          logEvent(id, window.location.hostname, leadEvent, getExternalId());
        }
      } else {
        window.fbq("track", "Lead");
      }
    }
  };

  const redirectToOffer = () => {
    const pwaLink = localStorage.getItem("pwaLink");
    dispatch(setInstallState(PWAInstallState.waitingForRedirect));
    setTimeout(() => {
      window.open(pwaLink, "_blank");
    }, 5000);
  };

  const installPWA = async () => {
    dispatch(setInstallState(PWAInstallState.installing));
    handleSendInfoAboutInstall();
    if (installPrompt) {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setTimeout(() => {
          dispatch(setInstallState(PWAInstallState.installed));
        }, 40000);
      } else {
        redirectToOffer();
      }
    } else {
      redirectToOffer();
    }
  };

  const openLink = () => {
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
            id: "download",
            defaultMessage: "Download",
          })
        );

      case PWAInstallState.downloading:
      case PWAInstallState.installing:
      case PWAInstallState.installed:
        return intl.formatMessage({
          id: "open",
          defaultMessage: "Open",
        });

      case PWAInstallState.downloaded:
        return intl.formatMessage({
          id: "install",
          defaultMessage: "Install",
        });
    }
  };

  const handleButtonClick = () => {
    switch (installState) {
      case PWAInstallState.idle:
        downloadPWA();
        break;

      case PWAInstallState.installed:
        openLink();
        break;

      case PWAInstallState.downloaded:
        installPWA();
        break;

      case PWAInstallState.downloading:
        return;
    }
  };

  if (installState === PWAInstallState.waitingForRedirect) {
    return (
      <button
        style={dark ? { background: "#A8C8FB", color: "#062961" } : {}}
        className={`h-9 rounded-[60px] bg-[#1357CD]  w-full text-white ${
          customText ? "" : "mb-[22px]"
        } transition duration-300 active:scale-95 disabled:bg-gray-300`}
        disabled
      >
        <Spin indicator={<LoadingOutlined spin />} />
      </button>
    );
  }

  return (
    <div className="flex justify-between gap-2">
      {installState === PWAInstallState.downloading && (
        <button
          style={dark ? { background: "#A8C8FB", color: "#062961" } : {}}
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
        style={dark ? { background: "#A8C8FB", color: "#062961" } : {}}
        className={`h-9 rounded-[60px] bg-[#1357CD]  w-full text-white ${
          customText ? "" : "mb-[22px]"
        } transition duration-300 active:scale-95 disabled:bg-gray-300 `}
        onClick={handleButtonClick}
        disabled={
          installState === PWAInstallState.downloading ||
          installState === PWAInstallState.installing
        }
      >
        {showButtonText()}
      </button>
    </div>
  );
};

export default InstallButton;
