import { Outlet } from "react-router";
import Header from "./Header/Header";
import Sidebar from "./Sidebar/Sidebar";

const Layout = () => {
  return (
    <div className="flex h-screen bg-[#161724]">
      <Sidebar />
      <div className="flex flex-col w-full overflow-auto">
        <Header />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
