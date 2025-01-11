import React, { Dispatch, SetStateAction } from "react";
import { useIntl } from "react-intl";
import ArrowRight from "../../shared/icons/ArrowRight";

interface Props {
  id: string;
  defaultMessage: string;
  view: string;
  setView: Dispatch<SetStateAction<string>>;
  dark: boolean;
}

const OpenSectionButton: React.FC<Props> = ({
  id,
  view,
  setView,
  defaultMessage,
  dark,
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
      <div
        style={dark ? { color: "#DFDFDF" } : {}}
        className="text-base font-medium leading-5 text-[#1D1D1D]"
      >
        {intl.formatMessage({ id, defaultMessage })}
      </div>
      <ArrowRight dark={dark} />
    </button>
  );
};

export default OpenSectionButton;
