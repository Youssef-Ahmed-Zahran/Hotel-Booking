import { NavLink } from "react-router-dom";
import { useGetCurrentUserQuery } from "../../../auth/slice/authSlice";
import "./sidebar.scss";

const Sidebar = () => {
  const { data: user } = useGetCurrentUserQuery();

  const navItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
        </svg>
      ),
    },
    {
      path: "/admin/hotels",
      label: "Hotels",
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" />
        </svg>
      ),
    },
    {
      path: "/admin/apartments",
      label: "Apartments",
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M17 11V3H7v4H3v14h18V11h-4zm-8-6h2v2H9V5zm6 0h2v2h-2V5zM7 19H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2z" />
        </svg>
      ),
    },
    {
      path: "/admin/rooms",
      label: "Rooms",
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" />
        </svg>
      ),
    },
    {
      path: "/admin/amenities",
      label: "Amenities",
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M2 21h20c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2h-2V7c0-1.1-.9-2-2-2h-4V3c0-.55-.45-1-1-1s-1 .45-1 1v2H8c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2zM18 11h2v8h-2v-8zm-6-4h4v12h-4V7zm-6 2h4v10H6V9z" />
        </svg>
      ),
    },
    {
      path: "/admin/bookings",
      label: "Bookings",
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2.01.9-2.01 2L3 19c0 1.1.99 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9 2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
        </svg>
      ),
    },
    {
      path: "/admin/reviews",
      label: "Reviews",
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ),
    },
    {
      path: "/admin/users",
      label: "Users",
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__header">
        <h2 className="admin-sidebar__title">Admin Panel</h2>
      </div>

      <nav className="admin-sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `admin-sidebar__link ${isActive ? "active" : ""}`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__user-info">
              <span className="admin-sidebar__user-name">
                {user.firstName} {user.lastName}
              </span>
              <span className="admin-sidebar__user-role">{user.role}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
