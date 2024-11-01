import React, { Dispatch, SetStateAction } from "react";
import { useIntl } from "react-intl";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface Props {
  id: string;
  defaultMessage: string;
  view: string;
  setView: Dispatch<SetStateAction<string>>;
}

const OpenSectionButton: React.FC<Props> = ({
  id,
  view,
  setView,
  defaultMessage,
}) => {
  const intl = useIntl();

  const handleSetView = () => {
    setView(view);
  };

  return (
    <button
      className="p-0 !m-0 flex items-center w-full justify-between"
      onClick={handleSetView}
    >
      <div className="text-base font-medium leading-5 text-[#636b6f]">
        {intl.formatMessage({ id, defaultMessage })}
      </div>
      <ArrowForwardIcon sx={{ color: "rgb(32, 33, 36)" }} />
    </button>
  );
};

export default OpenSectionButton;
