import { useNavigate } from "react-router-dom";
import MenuItem from "./MenuItem";

const Sidebar = () => {
  const navigate = useNavigate();
  return (
    <div className="min-w-[250px] h-full bg-[#121320] pt-[70px] px-5">
      <div className="flex justify-center font-normal font-reemkufi text-[18px] text-[#00FF11] leading-[27px] mb-[95px]">
        Monster PWA
      </div>
      <MenuItem text="Мои PWA" onClick={() => navigate("/")} />
    </div>
  );
};

export default Sidebar;
