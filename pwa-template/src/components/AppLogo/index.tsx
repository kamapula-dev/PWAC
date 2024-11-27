import CircularProgress from "@mui/material/CircularProgress";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {
  getInstallState,
  setFakeDownloadProgress,
  setInstallState,
} from "../../Redux/feat/InstallSlice";

import { RootState } from "../../Redux/store/store";
import { PWAInstallState } from "../../shared/models";

function AppLogo({ logoUrl }: { logoUrl: string }) {
  const installState = useSelector((state: RootState) =>
    getInstallState(state.install)
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const fakeInstall = async () => {
      let progress = 0;
      const startTime = Date.now();

      const interval = setInterval(() => {
        const randomIncrement = Math.random() * (30 - 10) + 10;
        progress += randomIncrement;
        progress = Math.min(progress, 100);
        progress = Math.floor(progress);

        dispatch(setFakeDownloadProgress(progress));
        const elapsedTime = (Date.now() - startTime) / 1100;

        if (progress >= 100 && elapsedTime >= 6) {
          clearInterval(interval);
          dispatch(setInstallState(PWAInstallState.downloaded));
        }
      }, 1100);
    };
    if (installState === PWAInstallState.downloading) {
      fakeInstall();
    }
  }, [installState]);

  const showPermanentCircularProgress =
    installState === PWAInstallState.downloading ||
    installState === PWAInstallState.installing;
  const showLogo =
    installState === PWAInstallState.idle ||
    installState === PWAInstallState.installed ||
    installState === PWAInstallState.downloaded;

  return (
    <>
      {showPermanentCircularProgress && (
        <div className="relative flex justify-center items-center w-[70px] h-[70px] mr-4">
          <div className="w-14 h-14 rounded-full overflow-hidden relative">
            <img
              src={logoUrl}
              alt="App logo"
              className="w-full h-full object-cover"
            />
          </div>

          <CircularProgress
            disableShrink
            size={58}
            thickness={2}
            sx={{
              position: "absolute",
              color: "#00875F",
            }}
          />
        </div>
      )}
      {showLogo && (
        <div className="relative block overflow-hidden w-[70px] h-[70px] rounded-xl mr-5">
          <img
            src={logoUrl}
            alt="App logo"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </>
  );
}

export default AppLogo;
