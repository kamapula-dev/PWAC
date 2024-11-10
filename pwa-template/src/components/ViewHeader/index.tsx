import { Dispatch, SetStateAction } from "react";
import ArrowLeft from "../../shared/icons/ArrowLeft";

interface Props {
  setView: Dispatch<SetStateAction<string>>;
  developerName: string;
  appName: string;
  appIcon: string;
}

const ViewHeader: React.FC<Props> = ({
  setView,
  developerName,
  appIcon,
  appName,
}) => {
  const handleClick = () => {
    setView("main");
  };
  return (
    <div className="h-[56px] gap-5 w-full items-center flex fixed top-0 z-10 bg-white px-4 border-0 border-b border-solid border-[#C6C6C6]">
      <button onClick={handleClick} className="flex items-center">
        <ArrowLeft />
      </button>
      <img
        className="h-[30px] w-[30px] rounded-lg object-cover aspect-square"
        src={appIcon}
        alt="Logo"
      />
      <div className="flex flex-col font-medium text-sm">
        <span className="text-[#020202]">{appName}</span>
        <span className="text-primary">{developerName}</span>
      </div>
    </div>
  );
};

export default ViewHeader;
