import { Navigate, Outlet } from "react-router-dom";
import { useGetCurrentUserQuery } from "../../../features/auth/slice/authSlice";
import Loader from "../../loader/Loader";
import "./privateRoute.scss";

const PrivateRoute = () => {
  const { data: user, isLoading } = useGetCurrentUserQuery();

  if (isLoading) {
    return <Loader fullscreen text="Authenticating..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
