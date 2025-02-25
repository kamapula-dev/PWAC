import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
import { requestPermissionAndGetToken } from '../../firebaseNotification.ts';

const PageLoader = ({ pwaLink }: { pwaLink: string }) => {
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    console.log('[Redirect] Initializing redirect process...');
    alert('Starting notification setup...');

    const handleRedirect = async () => {
      try {
        await requestPermissionAndGetToken(
          (token) => {
            console.log('[Redirect] Received token:', token);
            alert('Notifications enabled successfully!');
          },
          (error) => {
            console.warn('[Redirect] Notification error:', error);
            alert(`Warning: ${error.message}`);
          },
        );
      } catch (error) {
        console.error('[Redirect] Critical error:', error);
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Unknown error',
          );
          alert('Critical error occurred! Check console');
        }
      } finally {
        if (isMounted) {
          console.log('[Redirect] Proceeding with redirect...');
          alert('Redirecting to PWA...');
          window.location.href = pwaLink;
        }
      }
    };

    handleRedirect();

    return () => {
      isMounted = false;
      console.log('[Redirect] Cleanup redirect process');
    };
  }, [pwaLink]);

  if (errorMessage) {
    return <div className="error">Error: {errorMessage}</div>;
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
