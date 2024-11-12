import { Button } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { useIntl } from "react-intl";

const StartAgainView = ({ pwaLink }: { pwaLink: string }) => {
  const intl = useIntl();

  const handleClick = () => {
    window.location.href = pwaLink;
  };

  return (
    <Box
      sx={{
        height: "100vh",
      }}
    >
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        style={{ minHeight: "100vh" }}
      >
        <Grid item xs={6}>
          <Button fullWidth variant="contained" onClick={handleClick}>
            {intl.formatMessage({ id: "startAgain" })}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StartAgainView;
