import React, { Dispatch, SetStateAction } from "react";
import { useIntl } from "react-intl";
import { useMixpanel } from "react-mixpanel-browser";
import { Button, Grid } from "@mui/material";
import { ButtonTitle } from "../styles";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface Props {
  id: string;
  defaultMessage: string;
  view: string;
  setView: Dispatch<SetStateAction<string>>;
  mixPanelEvent: string;
}

const OpenSectionButton: React.FC<Props> = ({
  id,
  view,
  setView,
  mixPanelEvent,
  defaultMessage,
}) => {
  const intl = useIntl();
  const mixpanel = useMixpanel();
  console.log(defaultMessage);

  const handleSetView = () => {
    if (mixpanel) {
      mixpanel.track(mixPanelEvent);
    }
    setView(view);
  };

  return (
    <Button fullWidth sx={{ padding: 0 }} onClick={handleSetView}>
      <Grid container alignItems="center">
        <Grid item xs={10}>
          <ButtonTitle>
            {intl.formatMessage({ id, defaultMessage })}
          </ButtonTitle>
        </Grid>
        <Grid item xs={2} container justifyContent="end" alignItems="center">
          <ArrowForwardIcon sx={{ color: "rgb(32, 33, 36)" }} />
        </Grid>
      </Grid>
    </Button>
  );
};

export default OpenSectionButton;
