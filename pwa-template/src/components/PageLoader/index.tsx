import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
import { requestPermissionAndGetToken } from '../../firebaseNotification.ts';

const PageLoader = ({ pwaLink }: { pwaLink: string }) => {
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    let redirectTimer: NodeJS.Timeout | null = null;

    const handleNotificationFlow = async () => {
      try {
        const result = await requestPermissionAndGetToken();

        // Редиректим сразу если:
        // 1. Диалог не был показан в этой сессии
        // 2. Разрешение уже было получено ранее
        if (!result.dialogShown) {
          if (isMounted) window.location.href = pwaLink;
        }
      } catch (error) {
        console.error('Error during notification setup:', error);
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Unknown error',
          );
          redirectTimer = setTimeout(() => {
            window.location.href = pwaLink;
          }, 5000);
        }
      }
    };

    handleNotificationFlow();

    return () => {
      isMounted = false;
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [pwaLink]);

  if (errorMessage) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        flexDirection="column"
      >
        <div style={{ color: '#ff0000', marginBottom: 20 }}>{errorMessage}</div>
        <CircularProgress sx={{ color: `#047a56` }} size={100} thickness={5} />
      </Box>
    );
  }

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
