import { Dispatch, SetStateAction } from "react";
import ArrowLeft from "../../shared/icons/ArrowLeft";

interface Props {
  setView: Dispatch<SetStateAction<string>>;
  developerName: string;
  appName: string;
  appIcon: string;
  dark: boolean;
  mainThemeColor?: string;
}

const ViewHeader: React.FC<Props> = ({
  setView,
  developerName,
  appIcon,
  appName,
  dark,
  mainThemeColor,
}) => {
  const handleClick = () => {
    setView("main");
  };
  return (
    <div
      style={
        dark
          ? { background: "rgb(19, 19, 19)", borderBottom: "1px solid #434343" }
          : {}
      }
      className="h-[56px] gap-5 w-full items-center flex fixed top-0 z-10 bg-white px-4 border-0 border-b border-solid border-[#C6C6C6]"
    >
      <button onClick={handleClick} className="flex items-center">
        <ArrowLeft dark={dark} />
      </button>
      <img
        className="h-[30px] w-[30px] rounded-lg object-cover aspect-square"
        src={appIcon}
        alt="Logo"
      />
      <div className="flex flex-col font-medium text-sm">
        <span
          style={dark ? { color: "#DFDFDF" } : {}}
          className="text-[#020202]"
        >
          {appName}
        </span>
        <span
          style={
            mainThemeColor
              ? { color: mainThemeColor }
              : dark
                ? { color: "#A8C8FB" }
                : {}
          }
          className="text-[#1357CD]"
        >
          {developerName}
        </span>
      </div>
    </div>
  );
};

export default ViewHeader;
