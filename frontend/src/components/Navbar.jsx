
import React, { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  Bell,
  RefreshCw,
  Menu,
  Cloud,
  CircleHelp,
  LogOut,
  User,
  X,
} from "lucide-react";

function Navbar({
  title = "Dashboard",
  connected = false,
  loading = false,
  onRefresh,
  onMenuClick,
  alertCount = 0,
  alerts = [],
  onLogout,
}) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const navbarRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        navbarRef.current &&
        !navbarRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setActiveDropdown(null);
        setShowHelp(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const toggleDropdown = (name) => {
    setActiveDropdown((current) =>
      current === name ? null : name
    );
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  return (
    <>
      <header className="app-navbar" ref={navbarRef}>
        <div className="navbar-left">
          <button
            type="button"
            className="navbar-menu-button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <Menu size={21} />
          </button>

          <div className="navbar-brand-icon">
            <ShieldCheck size={23} />
          </div>

          <div className="navbar-brand-text">
            <strong>
              Sentinel<span>Ops</span>
            </strong>
            <small>Cloud Security Intelligence</small>
          </div>

          <div className="navbar-divider" />

          <div className="navbar-page">
            <Cloud size={16} />
            <span>{title}</span>
          </div>
        </div>

        <div className="navbar-right">
          {/* API Status */}
          <div
            className={`navbar-connection ${
              connected ? "connected" : "disconnected"
            }`}
          >
            <span className="navbar-status-dot" />
            <span>
              {connected ? "API Connected" : "API Disconnected"}
            </span>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            className={`navbar-icon-button ${
              loading ? "navbar-loading" : ""
            }`}
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh dashboard"
            aria-label="Refresh dashboard"
          >
            <RefreshCw size={17} />
          </button>

          {/* Notification Button */}
          <div className="navbar-action-wrapper">
            <button
              type="button"
              className="navbar-icon-button navbar-notification"
              onClick={() => toggleDropdown("notifications")}
              aria-expanded={activeDropdown === "notifications"}
              aria-label="View notifications"
            >
              <Bell size={18} />

              {alertCount > 0 && (
                <span className="navbar-notification-count">
                  {alertCount > 99 ? "99+" : alertCount}
                </span>
              )}
            </button>

            {activeDropdown === "notifications" && (
              <div className="navbar-dropdown">
                <h3>Security Notifications</h3>

                <p className="dropdown-subtitle">
                  {alertCount} unresolved security alerts
                </p>

                {alerts.length > 0 ? (
                  alerts.slice(0, 5).map((alert, index) => (
                    <div
                      className="notification-item"
                      key={alert.id || index}
                    >
                      <strong>
                        {alert.title ||
                          alert.message ||
                          "Security Alert"}
                      </strong>
                      <small>
                        {alert.severity || "Alert"}
                      </small>
                    </div>
                  ))
                ) : (
                  <p className="dropdown-empty">
                    No notification details available.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Help Button */}
          <button
            type="button"
            className="navbar-help-button"
            onClick={() => {
              setActiveDropdown(null);
              setShowHelp(true);
            }}
            title="Help"
            aria-label="Open help"
          >
            <CircleHelp size={18} />
          </button>

          {/* Profile Button */}
          <div className="navbar-action-wrapper">
            <button
              type="button"
              className="navbar-user"
              onClick={() => toggleDropdown("profile")}
              aria-expanded={activeDropdown === "profile"}
              aria-label="Open administrator profile"
            >
              VS
            </button>

            {activeDropdown === "profile" && (
              <div className="navbar-dropdown profile-dropdown">
                <div className="profile-info">
                  <User size={20} />
                  <div>
                    <strong>Administrator</strong>
                    <small>SentinelOps User</small>
                  </div>
                </div>

                <button
                  type="button"
                  className="dropdown-action"
                  onClick={() => {
                    setActiveDropdown(null);
                    if (onLogout) {
                      onLogout();
                    } else {
                      alert("Logout is not configured yet.");
                    }
                  }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Help Modal */}
      {showHelp && (
        <div
          className="navbar-modal-overlay"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="navbar-help-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sentinel-help-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowHelp(false)}
              aria-label="Close help"
            >
              <X size={20} />
            </button>

            <CircleHelp size={32} />

            <h2 id="sentinel-help-title">
              SentinelOps Help
            </h2>

            <p>Cloud Security Intelligence Dashboard</p>

            <div className="help-details">
              <p><strong>Dashboard:</strong> Monitor cloud metrics.</p>
              <p><strong>Alerts:</strong> Review security alerts.</p>
              <p><strong>Logs:</strong> View system activity.</p>
              <p><strong>ML Detection:</strong> Identify anomalies.</p>
              <p><strong>Pipeline:</strong> Monitor CI/CD activity.</p>
            </div>

            <button
              type="button"
              className="help-close-button"
              onClick={() => setShowHelp(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
