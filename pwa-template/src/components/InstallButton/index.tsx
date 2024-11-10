/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useIntl } from "react-intl";
import {
  getInstallState,
  setInstallState,
} from "../../Redux/feat/InstallSlice";
import { PWAInstallState } from "../../shared/models";
import { RootState } from "../../Redux/store/store";

declare const window: any;

interface Props {
  appLink: string;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const InstallButton: React.FC<Props> = ({ appLink }) => {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const installState = useSelector((state: RootState) =>
    getInstallState(state.install)
  );

  const dispatch = useDispatch();

  useEffect(() => {
    window.addEventListener(
      "beforeinstallprompt",
      (e: BeforeInstallPromptEvent) => {
        console.log("beforeinstallprompt fired");
        setInstallPrompt(e);
      }
    );

    return () => {
      window.removeEventListener("beforeinstallprompt", () => {
        setInstallPrompt(null);
      });
    };
  }, []);

  const intl = useIntl();

  const downloadPWA = () => {
    dispatch(setInstallState(PWAInstallState.downloading));
  };

  const installPWA = async () => {
    dispatch(setInstallState(PWAInstallState.installing));
    if (installPrompt) {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted installation");
        setTimeout(() => {
          dispatch(setInstallState(PWAInstallState.installed));
        }, 7000);
        if (window.fbq) {
          window.fbq("track", "Lead");
        }
      } else {
        dispatch(setInstallState("downloaded"));
      }
    }
  };

  const openLink = () => {
    window.open(appLink, "_blank");
  };

  const showButtonText = () => {
    switch (installState) {
      case PWAInstallState.idle:
        return intl.formatMessage({
          id: "download",
          defaultMessage: "Download",
        });

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

  return (
    <div className="flex justify-between gap-2">
      {installState === PWAInstallState.downloading && (
        <button
          className="h-9 rounded-[60px] bg-primary w-full text-white font-semibold mb-[22px] transition duration-300 active:scale-95 disabled:bg-gray-300"
          onClick={() => dispatch(setInstallState(PWAInstallState.idle))}
        >
          {intl.formatMessage({
            id: "cancel",
            defaultMessage: "Cancel",
          })}
        </button>
      )}
      <button
        className="h-9 rounded-[60px] bg-primary  w-full text-white font-semibold mb-[22px] transition duration-300 active:scale-95 disabled:bg-gray-300"
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
