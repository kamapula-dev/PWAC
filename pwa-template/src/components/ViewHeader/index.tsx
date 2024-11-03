import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useIntl } from "react-intl";
import { Dispatch, SetStateAction } from "react";

interface Props {
  setView: Dispatch<SetStateAction<string>>;
  id: string;
  developerName: string;
  appIcon: string;
}

const ViewHeader: React.FC<Props> = ({
  setView,
  id,
  developerName,
  appIcon,
}) => {
  const intl = useIntl();

  const handleClick = () => {
    setView("main");
  };
  return (
    <div className="h-[3.5em] w-full items-center flex fixed top-0 z-10 bg-white">
      <IconButton size="large" onClick={handleClick}>
        <ArrowBackIcon sx={{ color: "rgb(32, 33, 36)", fontSize: 24 }} />
      </IconButton>
      <img
        className="h-[calc(100%-1.5em)] mr-5 rounded-lg object-cover aspect-square"
        src={appIcon}
        alt="Logo"
      />
      <div className="flex flex-col">
        <span className="overflow-hidden whitespace-nowrap text-ellipsis font-medium leading-[1.3rem] text-[0.8rem]">
          {developerName}
        </span>
        <span className="font-normal text-[0.8em]">
          {intl.formatMessage({ id })}
        </span>
      </div>
    </div>
  );
};

export default ViewHeader;
