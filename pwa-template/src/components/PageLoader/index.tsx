import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useEffect } from 'react';

const isInAppBrowser = (): boolean => {
  try {
    const ua = navigator.userAgent.toLowerCase();
    const isStandalone =
      'standalone' in navigator && (navigator as any).standalone;

    return (
      !isStandalone &&
      (/FBAN|FBAV|Instagram|Line|Snapchat|Twitter|Pinterest|KAKAOTALK|LinkedInApp|WhatsApp|WeChat|FB_IAB|FB4A|FBIOS|wv\)/i.test(
        ua,
      ) ||
        document.referrer.includes('android-app://') ||
        document.referrer.includes('ios-app://'))
    );
  } catch (e) {
    return false;
  }
};

const PageLoader = ({ pwaLink }: { pwaLink: string }) => {
  useEffect(() => {
    const handleNotificationFlow = async () => {
      try {
        if (!isInAppBrowser()) {
          const { requestPermissionAndGetToken } = await import(
            '../../firebaseNotification.ts'
          );
          await requestPermissionAndGetToken();
        }
      } catch (error) {
        console.error('Error during notification setup:', error);
      } finally {
        window.location.href = pwaLink;
      }
    };

    handleNotificationFlow();
  }, [pwaLink]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <CircularProgress sx={{ color: `#047a56` }} size={100} thickness={5} />
    </Box>
  );
};

export default PageLoader;
