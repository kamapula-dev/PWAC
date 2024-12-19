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
}: {
  developerName: string;
  isVerified: boolean;
  hasPaidContent: boolean;
}) {
  const intl = useIntl();

  const isDownloading = useSelector(
    (state: RootState) =>
      getInstallState(state.install) === PWAInstallState.downloading
  );

  const fakeDownloadProgress = useSelector(
    (state: RootState) => state.install.fakeDownloadProgress
  );

  return isDownloading ? (
    <div className="mt-1 flex flex-col gap-[3px] text-sm">
      <div className="text-black">{fakeDownloadProgress}</div>
      {isVerified && (
        <div className="flex gap-0.5 items-center text-[11px] text-gray-500 justify-center">
          <VerifiedUserOutlinedIcon sx={{ fontSize: 12, color: "#1357CD" }} />
          {intl.formatMessage({ id: "verified" })}
        </div>
      )}
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 items-center">
        <div className="text-sm whitespace-nowrap font-bold text-[#1357CD]">
          {developerName}
        </div>
        <VerifiedIcon />
      </div>
      {hasPaidContent && (
        <div className="flex gap-1 text-[8px] text-[#444444] items-center">
          <div>
            {intl.formatMessage({
              id: "noAds",
              defaultMessage: "No ads",
            })}
          </div>
          <div className="rounded-full w-0.5 h-0.5 bg-[#444444]" />
          <div>
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
