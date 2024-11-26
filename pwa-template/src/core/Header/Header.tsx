import { useNavigate } from "react-router-dom";
import MonsterDropdown from "../../shared/elements/Dropdown/Dropdown";
import { createAuthProvider } from "../../middlewares/authProvider";

const Header = () => {
  const navigate = useNavigate();
  const { logout } = createAuthProvider();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const dropdownItems = [
    {
      label: <span className="text-xs text-white">Имя аккаунта</span>,
      key: "account_name",
    },
    {
      label: <span className="text-xs text-red">Выйти</span>,
      key: "logout",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="min-h-[60px] flex justify-end pr-[50px]">
      <div className="flex gap-[27px] items-center">
        <span className="text-[16px] text-[#919191] font-bold">$0.00</span>
        <MonsterDropdown menu={{ items: dropdownItems }}>
          <div className="w-[34px] h-[34px] bg-[#121320] border-[3px] border-[#20223B] rounded-full cursor-pointer" />
        </MonsterDropdown>
      </div>
    </header>
  );
};

export default Header;
