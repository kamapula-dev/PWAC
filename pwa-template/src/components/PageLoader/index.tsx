import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { useEffect } from "react";

const PageLoader = ({
  id,
  pwaLink,
  hasPushes,
  dark,
  mainThemeColor,
  offerPreloader,
}: {
  id?: string;
  pwaLink: string | null;
  hasPushes: boolean;
  dark: boolean;
  mainThemeColor?: string;
  offerPreloader?: { background?: string; loader?: string };
}) => {
  useEffect(() => {
    const requestPermission = async () => {
      if (hasPushes && id) {
        try {
          const { requestPermissionAndGetToken } = await import(
            "../../firebaseNotification.ts"
          );
          await requestPermissionAndGetToken(id);
        } catch (error) {
          console.error("Error during notification setup:", error);
        }
      }

      window.location.href = `${pwaLink}`;
    };

    requestPermission();
  }, [pwaLink, hasPushes, id]);

  console.log(offerPreloader?.background, "offerPreloader?.background");

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <style>{`body{background-color: ${offerPreloader?.background ? offerPreloader?.background : dark ? "#131313" : "#FFFFFF"};}`}</style>

      <CircularProgress
        sx={{ color: offerPreloader?.loader || mainThemeColor || `#047a56` }}
        size={100}
        thickness={5}
      />
    </Box>
  );
};

export default PageLoader;
