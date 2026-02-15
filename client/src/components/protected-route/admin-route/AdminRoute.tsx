import { Navigate, Outlet } from "react-router-dom";
import { useGetCurrentUserQuery } from "../../../features/auth/slice/authSlice";
import Loader from "../../loader/Loader";
import "./adminRoute.scss";
import Sidebar from "../../../features/admin/components/sidebar/Sidebar";

const AdminRoute = () => {
  const { data: user, isLoading } = useGetCurrentUserQuery();

  if (isLoading) {
    return <Loader fullscreen text="Verifying permissions..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-layout" style={{ display: "flex" }}>
      <Sidebar />
      <div className="admin-content" style={{ flex: 1, padding: "2rem" }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminRoute;
