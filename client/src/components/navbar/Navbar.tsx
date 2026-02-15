import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  useGetCurrentUserQuery,
  useLogoutMutation,
} from "../../features/auth/slice/authSlice";
import "./navbar.scss";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const { data: user, isLoading } = useGetCurrentUserQuery();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__logo">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
          </svg>
          LuxeStay
        </Link>

        <div className="navbar__nav">
          <NavLink to="/" className="navbar__link">
            Home
          </NavLink>
          <NavLink to="/hotels" className="navbar__link">
            Hotels
          </NavLink>
          {user && (
            <NavLink to="/my-bookings" className="navbar__link">
              My Bookings
            </NavLink>
          )}
          {user?.role === "ADMIN" && (
            <NavLink to="/admin/dashboard" className="navbar__link">
              Admin
            </NavLink>
          )}
        </div>

        <div className="navbar__actions">
          {isLoading ? (
            <div className="navbar__skeleton"></div>
          ) : user ? (
            <div className="navbar__user">
              <div className="navbar__avatar" onClick={toggleDropdown}>
                {user.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt={user.username} />
                ) : (
                  getInitials(user.firstName, user.lastName)
                )}
              </div>
              <div
                className={`navbar__dropdown ${dropdownOpen ? "active" : ""}`}
              >
                <Link
                  to="/profile"
                  className="navbar__dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  Profile
                </Link>
                <Link
                  to="/my-bookings"
                  className="navbar__dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
                  </svg>
                  My Bookings
                </Link>
                <button
                  className="navbar__dropdown-item danger"
                  onClick={handleLogout}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="navbar__btn-outline">
                Login
              </Link>
              <Link to="/register" className="navbar__btn">
                Sign Up
              </Link>
            </>
          )}

          <div className="navbar__mobile-toggle">
            <button onClick={toggleMobileMenu}>
              {mobileMenuOpen ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={`navbar__mobile-menu ${!mobileMenuOpen ? "hidden" : ""}`}>
        <NavLink
          to="/"
          className="navbar__mobile-link"
          onClick={toggleMobileMenu}
        >
          Home
        </NavLink>
        <NavLink
          to="/hotels"
          className="navbar__mobile-link"
          onClick={toggleMobileMenu}
        >
          Hotels
        </NavLink>
        {user && (
          <NavLink
            to="/my-bookings"
            className="navbar__mobile-link"
            onClick={toggleMobileMenu}
          >
            My Bookings
          </NavLink>
        )}
        {user?.role === "ADMIN" && (
          <NavLink
            to="/admin/dashboard"
            className="navbar__mobile-link"
            onClick={toggleMobileMenu}
          >
            Admin
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
