/* eslint-disable @typescript-eslint/no-explicit-any */
import CircularProgress from '@mui/material/CircularProgress';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import {
  getInstallState,
  setFakeDownloadProgress,
  setInstallState,
} from '../../Redux/feat/InstallSlice';

import { RootState } from '../../Redux/store/store';
import { PWAInstallState } from '../../shared/models';

function AppLogo({ logoUrl }: { logoUrl: string }) {
  const installState = useSelector((state: RootState) =>
    getInstallState(state.install),
  );
  const fakeDownloadProgress = useSelector(
    (state: RootState) => state.install.fakeDownloadProgress,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const fakeInstall = async () => {
      let progress = 0;
      const totalDuration = 17500;
      const intervalTime = 1000;
      const steps = totalDuration / intervalTime;
      const increment = 100 / steps;

      const interval = setInterval(async () => {
        if ('getInstalledRelatedApps' in navigator) {
          const relatedApps = await (
            navigator as any
          ).getInstalledRelatedApps();
          if (relatedApps.length > 0) {
            clearInterval(interval);
            dispatch(setFakeDownloadProgress(99));

            setTimeout(() => {
              dispatch(setFakeDownloadProgress(100));
              dispatch(setInstallState(PWAInstallState.installed));
            }, 3000);
            return;
          }
        }

        progress += increment;
        progress = Math.min(progress, 100);
        dispatch(setFakeDownloadProgress(Math.floor(progress)));

        if (progress >= 100) {
          clearInterval(interval);
          dispatch(setInstallState(PWAInstallState.installed));
        }
      }, intervalTime);
    };

    try {
      if (installState === PWAInstallState.installing) {
        fakeInstall().catch((err) =>
          console.error('Unhandled error in fakeInstall:', err),
        );
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  }, [installState]);

  const showPermanentCircularProgress =
    installState === PWAInstallState.installing;

  return (
    <>
      {showPermanentCircularProgress ? (
        <div className="relative flex justify-center items-center w-[70px] h-[70px] mr-4">
          <div className="w-14 h-14 rounded-full overflow-hidden relative">
            <img
              src={logoUrl}
              alt="App logo"
              className="w-full h-full object-cover"
            />
          </div>

          <CircularProgress
            value={+fakeDownloadProgress.split('%')[0] || 0}
            variant={
              installState === PWAInstallState.installing
                ? 'determinate'
                : 'indeterminate'
            }
            size={60}
            thickness={2}
            sx={{
              position: 'absolute',
              color: '#1357CD',
            }}
          />
        </div>
      ) : (
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
