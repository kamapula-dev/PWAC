import ArrowLeft from "@icons/ArrowLeft";
import { Dispatch, SetStateAction } from "react";
import { PwaViews } from "../models";

interface Props {
  setView: Dispatch<SetStateAction<PwaViews>>;
  developerName?: string;
  appName?: string;
  appIcon: string | null;
}

const ViewHeader: React.FC<Props> = ({
  setView,
  developerName,
  appIcon,
  appName,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setView(PwaViews.Main);
  };
  return (
    <div className="h-[56px] gap-5 w-full items-center flex top-0 z-10 bg-white px-4 border-0 border-b border-solid border-[#C6C6C6]">
      <button onClick={handleClick} className="flex items-center">
        <ArrowLeft />
      </button>
      {appIcon ? (
        <img
          className="h-[30px] w-[30px] rounded-lg object-cover aspect-square"
          src={appIcon}
          alt="Logo"
        />
      ) : (
        <div className="h-[30px] w-[30px] rounded-lg bg-[#727272]" />
      )}
      <div className="flex flex-col font-medium text-sm">
        <span className="text-[#020202]">{appName ?? "Plinko ASMR"}</span>
        <span className="text-primary">
          {developerName ?? "Supercent, Inc."}
        </span>
      </div>
    </div>
  );
};

export default ViewHeader;
