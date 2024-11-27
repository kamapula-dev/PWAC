import React, { Dispatch, SetStateAction } from "react";
import { useIntl } from "react-intl";
import ArrowRight from "../../shared/icons/ArrowRight";

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
      className="flex items-center w-full justify-between"
      onClick={handleSetView}
    >
      <div className="text-base font-medium leading-5 text-[#605D64]">
        {intl.formatMessage({ id, defaultMessage })}
      </div>
      <ArrowRight />
    </button>
  );
};

export default OpenSectionButton;
