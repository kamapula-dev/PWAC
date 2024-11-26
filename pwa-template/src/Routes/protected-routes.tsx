import { Navigate } from "react-router-dom";
import { Outlet } from "react-router";
import { useAuth } from "../middlewares/authProvider";

const ProtectedRoutes = () => {
  const { isLogged } = useAuth();
  return isLogged ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;
