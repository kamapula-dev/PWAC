import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { useEffect } from "react";

const PageLoader = ({ pwaLink }: { pwaLink: string }) => {
  useEffect(() => {
    const intervalId = setInterval(() => {
      window.location.href = pwaLink;
      clearInterval(intervalId);
    }, 1000);

    return () => clearInterval(intervalId);
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
