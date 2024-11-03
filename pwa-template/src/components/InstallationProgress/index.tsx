import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { RootState } from "../../Redux/store/store";
import { getInstallState } from "../../Redux/feat/InstallSlice";
import { PWAInstallState } from "../../shared/models";

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
    <div className="mt-1 flex flex-col gap-[3px]">
      <div className="text-black">{fakeDownloadProgress}</div>
      {isVerified && (
        <div className="flex gap-0.5 items-center text-[11px] text-gray-500">
          <VerifiedUserOutlinedIcon sx={{ fontSize: 10, color: "green" }} />
          {intl.formatMessage({ id: "verified" })}
        </div>
      )}
    </div>
  ) : (
    <div className="font-roboto pt-[5px] text-customGreen">
      <span className="text-[13px] whitespace-nowrap font-bold mr-[15px]">
        {developerName}
      </span>
      <span className="text-[13px] whitespace-nowrap font-bold">Casino</span>
    </div>
  );
}
