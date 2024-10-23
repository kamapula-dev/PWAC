/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import { useMixpanel } from "react-mixpanel-browser";
import { useSelector, useDispatch } from "react-redux";
import {
  install,
  setInstallPrompt,
  startFakeDownload,
  stopInstalling,
} from "../../Redux/feat/InstallSlice";
import { Button } from "@mui/material";
import { CustomButton, colors } from "../styles";
import { useIntl } from "react-intl";
import { RootState } from "../../Redux/store/store";

interface Props {
  appLink: string;
}

const AnimatedButton = styled<any>(motion(Button), {
  shouldForwardProp: (prop) => prop !== "$isInstalling",
})`
  border-radius: 20px;
  border: none;
  font-family: "Roboto", sans-serif;
  font-weight: 500;
  text-transform: none;
  box-shadow: none;
  margin-bottom: 24px;
  background-color: ${(props) =>
    props.$isInstalling ? colors.background : colors.buttonBackground};
  color: ${(props) => (props.$isInstalling ? colors.disabledText : "white")};
  &:hover {
    background-color: ${(props) =>
      props.$isInstalling ? colors.background : colors.primary};
    box-shadow: none;
  }
  &:active {
    background-color: ${(props) =>
      props.$isInstalling ? colors.background : colors.primary};
  }
`;

const InstallButton: React.FC<Props> = ({ appLink }) => {
  const [isInstalled, setIsInstalled] = useState(false);
  const installPrompt = useSelector(
    (state: RootState) => state.install.installPrompt
  );
  const isInstalling = useSelector(
    (state: RootState) => state.install.isInstalling
  );
  const isDownloaded = useSelector(
    (state: RootState) => state.install.isDownloaded
  );
  const isDownloading = useSelector(
    (state: RootState) => state.install.fakeDownload
  );

  const mixpanel = useMixpanel();
  const dispatch = useDispatch();
  const intl = useIntl();

  const trackEvent = (eventName: string) => {
    if (mixpanel) {
      mixpanel.track(eventName);
    }
  };

  useEffect(() => {
    const handleAppInstalled = () => {
      if (mixpanel) {
        mixpanel.track("landing_callback_pwa_installed");
        setTimeout(() => {
          setIsInstalled(true);
          dispatch(stopInstalling());
        }, 10000);
      }
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [dispatch, mixpanel]);

  const downloadPWA = () => {
    if (mixpanel) {
      mixpanel.track("landing_btn_download_pressed");
    }
    dispatch(startFakeDownload());
  };

  const installPWA = async () => {
    if (installPrompt) {
      trackEvent("landing_btn_install_pressed");
      dispatch(install());
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted installation");
      } else {
        dispatch(stopInstalling());
      }
      dispatch(setInstallPrompt(null));
    }
  };

  const openLink = () => {
    trackEvent("landing_btn_open_pressed");
    window.open(appLink, "_blank");
  };

  if (isDownloaded && isInstalled) {
    return (
      <CustomButton fullWidth onClick={openLink}>
        {intl.formatMessage({ id: "open" })}
      </CustomButton>
    );
  }

  if (!isDownloaded && !isInstalled) {
    return (
      <AnimatedButton
        fullWidth
        onClick={!isDownloading ? downloadPWA : undefined}
        $isInstalling={isDownloading}
        disabled={isDownloading}
      >
        {isDownloading
          ? intl.formatMessage({
              id: "downloading",
              defaultMessage: "Downloading",
            })
          : intl.formatMessage({ id: "download", defaultMessage: "Download" })}
      </AnimatedButton>
    );
  }

  if (isDownloaded && !isInstalled) {
    return (
      <AnimatedButton
        fullWidth
        onClick={!isInstalling ? installPWA : undefined}
        $isInstalling={isInstalling}
        disabled={isInstalling}
      >
        {isInstalling
          ? intl.formatMessage({ id: "installing" })
          : intl.formatMessage({ id: "install" })}
      </AnimatedButton>
    );
  }
};

export default InstallButton;
