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
}: {
  developerName: string;
  isVerified: boolean;
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
    <div className="flex gap-1 items-center">
      <div className="text-sm whitespace-nowrap font-bold text-primary">
        {developerName}
      </div>
      <VerifiedIcon />
    </div>
  );
}
