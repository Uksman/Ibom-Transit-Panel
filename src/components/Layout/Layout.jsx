import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaTachometerAlt,
  FaBus,
  FaMap,
  FaTicketAlt,
  FaCaravan,
  FaUsers,
  FaBell,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import "./Layout.css";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close sidebar when clicking on a nav item on mobile
  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { path: "/dashboard", name: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/buses", name: "Buses", icon: <FaBus /> },
    { path: "/routes", name: "Routes", icon: <FaMap /> },
    { path: "/bookings", name: "Bookings", icon: <FaTicketAlt /> },
    { path: "/hirings", name: "Hirings", icon: <FaCaravan /> },
    { path: "/users", name: "Users", icon: <FaUsers /> },
    { path: "/notifications", name: "Notifications", icon: <FaBell /> },
  ];

  // Find the current page's name based on the pathname
  const currentPage =
    menuItems.find((item) => item.path === location.pathname)?.name ||
    "Ibom Transit";

  return (
    <div className="layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2>Ibom Transit</h2>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${
                location.pathname === item.path ? "active" : ""
              }`}
              onClick={handleNavClick}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-text">{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            {sidebarOpen && (
              <div>
                <p className="user-name">{user?.name}</p>
                <p className="user-role">{user?.role}</p>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            {sidebarOpen ? "Logout" : <FaSignOutAlt />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`main-content ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <header className="main-header">
          {isMobile && (
            <button
              className="mobile-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
          )}
          <h1>{currentPage}</h1>
        </header>

        <main className="main-body">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
