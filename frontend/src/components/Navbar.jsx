
import React from "react";
import {
  ShieldCheck,
  Bell,
  RefreshCw,
  Menu,
  Cloud,
  CircleHelp,
} from "lucide-react";

function Navbar({
  title = "Dashboard",
  connected = false,
  loading = false,
  onRefresh,
  onMenuClick,
  alertCount = 0,
}) {
  return (
    <header className="app-navbar">
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

        <button
          type="button"
          className={`navbar-icon-button ${
            loading ? "navbar-loading" : ""
          }`}
          onClick={onRefresh}
          disabled={loading}
          title="Refresh dashboard data"
          aria-label="Refresh dashboard data"
        >
          <RefreshCw size={17} />
        </button>

        <button
          type="button"
          className="navbar-icon-button navbar-notification"
          title={`${alertCount} security alerts`}
          aria-label={`${alertCount} security alerts`}
        >
          <Bell size={18} />

          {alertCount > 0 && (
            <span className="navbar-notification-count">
              {alertCount > 99 ? "99+" : alertCount}
            </span>
          )}
        </button>

        <button
          type="button"
          className="navbar-help-button"
          title="Cloud security dashboard"
          aria-label="Cloud security dashboard information"
        >
          <CircleHelp size={18} />
        </button>

        <div className="navbar-user" title="Administrator">
          VS
        </div>
      </div>
    </header>
  );
}

export default Navbar;
