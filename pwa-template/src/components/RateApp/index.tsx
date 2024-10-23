import { useIntl } from "react-intl";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import {
  ButtonTitle,
  RateAppHeader,
  RateContainer,
  RateStarsContainer,
  RatingText,
  WriteReview,
} from "../styles";
import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import { Button, Grid } from "@mui/material";
import RateInstallButton from "./RateInstallButton";
import { useMixpanel } from "react-mixpanel-browser";

const RateApp = () => {
  const intl = useIntl();
  const mixpanel = useMixpanel();
  const [modal, setModal] = useState(false);

  const handleOpen = () => {
    mixpanel?.track("landing_btn_rating_pressed");
    setModal(true);
  };

  const handleClose = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    setModal(false);
  };

  return (
    <>
      <RateContainer onClick={handleOpen}>
        <RateAppHeader>
          <ButtonTitle>{intl.formatMessage({ id: "rateTitle" })}</ButtonTitle>
          <RatingText>{intl.formatMessage({ id: "ratingText" })}</RatingText>
        </RateAppHeader>
        <RateStarsContainer>
          {Array(5)
            .fill(null)
            .map((_, index) => (
              <StarBorderOutlinedIcon key={index} />
            ))}
        </RateStarsContainer>
        <WriteReview>{intl.formatMessage({ id: "writeReview" })}</WriteReview>
      </RateContainer>
      <Dialog open={modal} onClose={handleClose}>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {intl.formatMessage({ id: "installRequired" })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Grid container>
            <Grid item xs={5}>
              <Button
                variant="text"
                color="error"
                fullWidth
                onClick={handleClose}
              >
                {intl.formatMessage({ id: "cancel" })}
              </Button>
            </Grid>
            <Grid item xs={2} />
            <Grid item xs={5}>
              <RateInstallButton appLink="/" />
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RateApp;
