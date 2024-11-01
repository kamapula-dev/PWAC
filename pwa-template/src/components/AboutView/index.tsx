import { Dispatch, SetStateAction, useState } from "react";
import { useIntl } from "react-intl";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ViewHeader from "../ViewHeader";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Button, IconButton } from "@mui/material";
import useSanity from "../../shared/hooks/useSanity";
import { checkLocale } from "../../shared/helpers/languages";

interface Props {
  setView: Dispatch<SetStateAction<string>>;
}

const AboutView: React.FC<Props> = ({ setView }) => {
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

  const { data } = useSanity(
    "fullDescription, size, version, countOfDownloads"
  );

  if (!data) return null;

  return (
    <div>
      <ViewHeader id="details" setView={setView} />
      <section className="pt-[3.5em] mx-6">
        <div className="text-[1.1rem] text-main font-sans pt-4 pb-4 flex items-center">
          {intl.formatMessage({ id: "about" })}
        </div>
        <div className="text-[1rem] text-main font-sans pb-4 whitespace-pre-wrap relative text-justify">
          {data?.fullDescription[checkLocale()]}
        </div>
      </section>
      <div className="bg-[#dadce0] h-[1px] w-full" />
      <div className="px-6">
        <div className="text-[1.1rem] text-main font-sans pt-4 pb-4 flex items-center">
          {intl.formatMessage({ id: "whatsNew" })}

          <FiberManualRecordIcon
            style={{
              color: `#047a56`,
              fontSize: 12,
              marginLeft: "6px",
            }}
          />
        </div>
        <div className="text-[1rem] text-main font-sans pb-4 whitespace-pre-wrap relative text-justify">
          {intl.formatMessage({ id: "newBonuses" })}
        </div>
      </div>
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
            <span className="text-[0.9rem]">{data.version}</span>
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
            <span className="text-[0.9rem]">{data.countOfDownloads}</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span className="text-[0.9rem]">
              {intl.formatMessage({ id: "downloadSize" })}
            </span>
            <span className="text-[0.9rem]">{data.size}</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <span className="text-[0.9rem]">
              {intl.formatMessage({ id: "offeredBy" })}
            </span>
            <span className="text-[0.9rem]">Nine Dev</span>
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
            <span className="text-[0.9rem]">15,23 MB</span>
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
