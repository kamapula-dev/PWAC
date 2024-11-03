import { Dispatch, SetStateAction, useState } from "react";
import { useIntl } from "react-intl";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ViewHeader from "../ViewHeader";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Button, IconButton } from "@mui/material";
import { PwaContent } from "../../shared/models";

interface Props {
  setView: Dispatch<SetStateAction<string>>;
  pwaContent: PwaContent;
}

const AboutView: React.FC<Props> = ({ setView, pwaContent }) => {
  console.log(pwaContent);
  const intl = useIntl();
  const [dialog, setDialog] = useState(false);

  const handleClickOpen = () => {
    setDialog(true);
  };

  const handleClose = () => {
    setDialog(false);
  };

  const getTodayDate = () => {
    const today = new Date();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const month = monthNames[today.getMonth()];
    const day = today.getDate();
    const year = today.getFullYear();

    return `${month} ${day}, ${year}`;
  };

  return (
    <div>
      <ViewHeader
        appIcon={pwaContent.appIcon}
        id="details"
        developerName={pwaContent.developerName}
        setView={setView}
      />
      <section className="pt-[3.5em] mx-6">
        <div className="text-[1.1rem] text-main font-sans pt-4 pb-4 flex items-center">
          {intl.formatMessage({ id: "about" })}
        </div>
        <div className="text-[1rem] text-main font-sans pb-4 whitespace-pre-wrap relative text-justify">
          {pwaContent.description}
        </div>
      </section>
      <div className="bg-[#dadce0] h-[1px] w-full" />
      <div className="px-6">
        <div className="text-[1.1rem]font-sans pt-4">
          {intl.formatMessage({ id: "appInfo" })}
        </div>
        <div className="flex flex-col gap-[2em] py-[2em]">
          <div className="flex flex-row justify-between items-center">
            <span className="text-[0.9rem]">
              {intl.formatMessage({ id: "version" })}
            </span>
            <span className="text-[0.9rem]">{pwaContent.version}</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span className="text-[0.9rem]">
              {intl.formatMessage({ id: "updatedOn" })}
            </span>
            <span className="text-[0.9rem]">{getTodayDate()}</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span className="text-[0.9rem]">
              {intl.formatMessage({ id: "downloads" })}
            </span>
            <span className="text-[0.9rem]">{pwaContent.countOfDownloads}</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span className="text-[0.9rem]">
              {intl.formatMessage({ id: "downloadSize" })}
            </span>
            <span className="text-[0.9rem]">{pwaContent.size}</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span className="text-[0.9rem]">
              {intl.formatMessage({ id: "offeredBy" })}
            </span>
            <span className="text-[0.9rem]">{pwaContent.developerName}</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span className="text-[0.9rem]">
              {intl.formatMessage({ id: "releasedOn" })}
            </span>
            <span className="text-[0.9rem]">
              {intl.formatMessage({ id: "releaseDate" })}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-[#dadce0] h-[1px] w-full" />
      <div className="px-6">
        <div className="text-[1.1rem] text-main font-sans pt-4 pb-4 flex items-center justify-between">
          {intl.formatMessage({ id: "compatibilityTitle" })}
          <IconButton onClick={handleClickOpen}>
            <InfoOutlinedIcon />
          </IconButton>
        </div>
        <div className="flex flex-col gap-[2em] py-[1em]">
          <div className="flex flex-row justify-between items-center">
            <span className="text-[0.9rem]">
              {intl.formatMessage({ id: "compatibility" })}
            </span>
            <span className="text-[0.9rem]">
              {intl.formatMessage({ id: "worksOnYourDevice" })}
            </span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span className="text-[0.9rem]">
              {intl.formatMessage({ id: "version" })}
            </span>
            <span className="text-[0.9rem]">2.12.14</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span className="text-[0.9rem]">
              {intl.formatMessage({ id: "downloadSize" })}
            </span>
            <span className="text-[0.9rem]">{pwaContent.size}</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span className="text-[0.9rem]">
              {intl.formatMessage({ id: "RequiredOS" })}
            </span>
            <span className="text-[0.9rem]">
              {intl.formatMessage({ id: "OS" })}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-[#dadce0] h-[1px] w-full" />

      <Dialog
        open={dialog}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {intl.formatMessage({ id: "modalTitle" })}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {intl.formatMessage({ id: "modalText" })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>OK</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AboutView;
