import { Modal } from "antd";
import { useEffect, useState } from "react";
import GooglePlayLogo from "../../shared/icons/GooglePlayLogo";
import { PwaContent, PWAInstallState } from "../../shared/models";
import { useIntl } from "react-intl";
import InstallButton from "../InstallButton";
import { BeforeInstallPromptEvent } from "../../App";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store/store";
import { getInstallState } from "../../Redux/feat/InstallSlice";
import GooglePlayDark from "../../shared/icons/GooglePlayDark";

const ModalMenu = ({
  showAppHeader,
  title,
  content,
  buttonText,
  pwaContent,
  installPrompt,
  dark,
  mainThemeColor,
  installButtonTextColor,
}: {
  showAppHeader?: boolean;
  title?: string;
  content?: string;
  buttonText?: string;
  pwaContent: PwaContent;
  installPrompt: BeforeInstallPromptEvent | null;
  dark: boolean;
  mainThemeColor?: string;
  installButtonTextColor?: string;
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const intl = useIntl();

  const installState = useSelector((state: RootState) =>
    getInstallState(state.install),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsModalVisible((prev) => {
        if (PWAInstallState.idle === installState) {
          return true;
        }
        return prev;
      });
    }, 7000);

    return () => clearTimeout(timer);
  }, [installState]);

  return (
    <Modal
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      closable
      footer={null}
      width={304}
      className={dark ? "dark-theme" : ""}
    >
      <div className={`${dark ? "bg-[#303030]" : "bg-white"}`}>
        <div className={`flex justify-center mb-3 `}>
          {dark ? <GooglePlayDark /> : <GooglePlayLogo />}
        </div>
        <div
          className={`${
            dark ? "text-[#DFDFDF]" : "text-[#5F6368]"
          } flex justify-center mb-3`}
        >
          {intl.formatMessage({
            id: "recommended",
            defaultMessage: "Recommended by",
          })}
          &nbsp;
          <span className="text-[#34A853] font-medium">Google Play</span>
        </div>
        {showAppHeader && (
          <div
            style={{ boxShadow: "0px 2px 2px 0px #0000003D" }}
            className={`p-4 flex gap-4 items-center rounded-xl mb-4 ${
              dark ? "bg-[#131313]" : "bg-white"
            }`}
          >
            <img
              src={pwaContent.appIcon}
              alt="app icon"
              width={70}
              height={70}
              className="rounded-xl w-[70px] h-[70px] object-fill"
            />
            <div>
              <div
                className={`font-bold text-base leading-[19px] mb-1 ${
                  dark ? "text-[#DFDFDF]" : "text-[#020202]"
                }`}
              >
                {pwaContent.appName}
              </div>
              <div
                className={`font-bold text-xs ${
                  mainThemeColor
                    ? `text-[${mainThemeColor}]`
                    : dark
                      ? "text-[#A8C8FB]"
                      : "text-[#1357CD]"
                } leading-[14px] mb-2`}
              >
                {pwaContent.developerName}
              </div>
              {pwaContent.hasPaidContentTitle && (
                <div
                  className={`text-[8px] ${
                    dark ? "text-[#DFDFDF]" : "text-[#444444]"
                  }`}
                >
                  {intl.formatMessage({
                    id: "noAds",
                    defaultMessage: "No ads",
                  })}
                  &nbsp;
                  {intl.formatMessage({
                    id: "noPaidContent",
                    defaultMessage: "No paid content",
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        <div
          className={`${
            dark ? "text-[#DFDFDF]" : "text-[#49454F]"
          } text-sm font-bold text-center mb-2 leading-4`}
        >
          {title}
        </div>
        <div
          className={`${
            dark ? "text-[#DFDFDF]" : "text-[#49454F]"
          } mb-5 text-center text-xs leading-4`}
        >
          {content}
        </div>
        <InstallButton
          mainThemeColor={mainThemeColor}
          installButtonTextColor={installButtonTextColor}
          customText={buttonText}
          dark={dark}
          id={pwaContent._id}
          pixel={pwaContent?.pixel}
          appLink="/"
          installPrompt={installPrompt}
        />
      </div>
    </Modal>
  );
};

export default ModalMenu;
