import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { RootState } from "../../Redux/store/store";
import { getInstallState } from "../../Redux/feat/InstallSlice";
import { PWAInstallState } from "../../shared/models";
import VerifiedIcon from "../../shared/icons/VerifiedIcon";

export default function InstallationProgress({
  developerName,
  isVerified,
  hasPaidContent,
  dark,
  mainThemeColor,
  testDesign,
}: {
  developerName: string;
  isVerified: boolean;
  hasPaidContent: boolean;
  dark: boolean;
  mainThemeColor?: string;
  testDesign?: boolean;
}) {
  const intl = useIntl();

  const isInstalling = useSelector(
    (state: RootState) =>
      getInstallState(state.install) === PWAInstallState.installing,
  );

  const fakeDownloadProgress = useSelector(
    (state: RootState) => state.install.fakeDownloadProgress,
  );

  return isInstalling ? (
    <div
      className={`mt-1 flex flex-col ${!!(testDesign ? "" : "gap-[3px]")} text-sm`}
    >
      <div style={dark ? { color: "#DFDFDF" } : {}} className="text-black">
        {fakeDownloadProgress}
      </div>
      {isVerified && (
        <div
          style={
            mainThemeColor
              ? { color: mainThemeColor }
              : dark
                ? { color: "#A8C8FB" }
                : {}
          }
          className="flex gap-0.5 items-center text-[11px] text-gray-500 justify-center"
        >
          <VerifiedUserOutlinedIcon
            sx={{
              fontSize: 12,
              color: mainThemeColor || (dark ? "#A8C8FB" : "#1357CD"),
            }}
          />
          {intl.formatMessage({ id: "verified" })}
        </div>
      )}
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 items-center">
        <div
          style={
            mainThemeColor
              ? { color: mainThemeColor }
              : dark
                ? { color: "#A8C8FB" }
                : {}
          }
          className="text-sm whitespace-nowrap text-[#1357CD]"
        >
          {developerName}
        </div>
        <VerifiedIcon
          color={mainThemeColor || (dark ? "#A8C8FB" : "#1357CD")}
        />
      </div>
      {hasPaidContent && (
        <div
          style={dark ? { color: "#DFDFDF" } : {}}
          className="flex gap-1 text-[8px] text-[#444444] items-center"
        >
          <div className="text-[10px]">
            {intl.formatMessage({
              id: "noAds",
              defaultMessage: "No ads",
            })}
          </div>
          <div
            style={dark ? { background: "#DFDFDF" } : {}}
            className="rounded-full w-0.5 h-0.5 bg-[#444444]"
          />
          <div className="text-[10px]">
            {intl.formatMessage({
              id: "noPaidContent",
              defaultMessage: "No paid content",
            })}
          </div>
        </div>
      )}
    </div>
  );
}
