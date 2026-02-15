import { Navigate, Outlet } from "react-router-dom";
import { useGetCurrentUserQuery } from "../../../features/auth/slice/authSlice";
import Loader from "../../loader/Loader";
import "./authRoute.scss";

const AuthRoute = () => {
  const { data: user, isLoading } = useGetCurrentUserQuery();

  if (isLoading) {
    return <Loader fullscreen text="Loading..." />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AuthRoute;
