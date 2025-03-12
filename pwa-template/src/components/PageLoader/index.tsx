import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useEffect } from 'react';

const PageLoader = ({
  id,
  pwaLink,
  hasPushes,
}: {
  id?: string;
  pwaLink: string | null;
  hasPushes: boolean;
}) => {
  useEffect(() => {
    const requestPermission = async () => {
      if (hasPushes && id) {
        try {
          const { requestPermissionAndGetToken } = await import(
            '../../firebaseNotification.ts'
          );
          await requestPermissionAndGetToken(id);
        } catch (error) {
          console.error('Error during notification setup:', error);
        }
      }

      window.location.href = `${pwaLink}`;
    };

    requestPermission();
  }, [pwaLink, hasPushes]);

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
