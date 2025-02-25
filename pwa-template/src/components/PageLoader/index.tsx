import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useEffect } from 'react';
import { requestPermissionAndGetToken } from '../../firebaseNotification.ts';

const PageLoader = ({ pwaLink }: { pwaLink: string }) => {
  useEffect(() => {
    const handleNotificationAndRedirect = async () => {
      try {
        await requestPermissionAndGetToken();
      } catch (error) {
        console.error('Error during notification setup:', error);
      } finally {
        window.location.href = pwaLink;
      }
    };

    handleNotificationAndRedirect();
  }, []);

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
