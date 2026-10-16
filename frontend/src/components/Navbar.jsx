import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import {
  Bell,
  CircleHelp,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  UserRound,
  X,
  CheckCircle2,
  Search,
  ChartNoAxesCombined,
  Link as LinkIcon,
  MessageSquare,
  Activity,
  BookOpen,
  GitBranch,
} from "lucide-react";
import "./Navbar.css";

const PROJECT_URL = "https://github.com/vanshikashar/Final-Year-Project";
const SUPPORT_URL = `${PROJECT_URL}/issues`;

const resolved = (alert) =>
  ["resolved", "closed"].includes(
    String(alert?.status || "").toLowerCase()
  );

const helpLinks = [
  {
    title: "System Metrics Guide",
    description: "Understand CPU, memory, and request metrics.",
    page: "System Metrics",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Security Alerts FAQ",
    description: "Review alerts, severity levels, and statuses.",
    page: "Security Alerts",
    icon: Bell,
  },
  {
    title: "API Integration Reference",
    description: "Open the project repository and API notes.",
    page: "API Integration",
    icon: LinkIcon,
    external: true,
  },
  {
    title: "Application Logs Guide",
    description: "Learn how to inspect application events.",
    page: "Application Logs",
    icon: BookOpen,
  },
  {
    title: "ML Detection Guide",
    description: "Run and interpret anomaly predictions.",
    page: "ML Detection",
    icon: Activity,
  },
  {
    title: "DevOps Pipeline Guide",
    description: "Review build and deployment status.",
    page: "DevOps Pipeline",
    icon: GitBranch,
  },
];

export default function Navbar({
  title = "Overview",
  connected = false,
  loading = false,
  onRefresh,
  onMenuClick,
  alertCount = 0,
  alerts = [],
  onNavigate,
}) {
  const [activePanel, setActivePanel] = useState(null);
  const [readIds, setReadIds] = useState([]);
  const [helpSearch, setHelpSearch] = useState("");
  const [userName] = useState(() => {
    try {
      return localStorage.getItem("userName") || "User";
    } catch {
      return "User";
    }
  });

  const panelRef = useRef(null);

  const notifications = alerts
    .filter((alert) => !resolved(alert))
    .slice(0, 10);

  const unreadCount = notifications.filter(
    (alert, index) =>
      !readIds.includes(String(alert._id || alert.id || index))
  ).length;

  const filteredHelpLinks = helpLinks.filter((item) => {
    const query = helpSearch.trim().toLowerCase();
    return (
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        !event.target.closest(".help-side-panel")
      ) {
        setActivePanel(null);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setActivePanel(null);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function togglePanel(panel) {
    setActivePanel((current) => (current === panel ? null : panel));
  }

  function markAllRead() {
    setReadIds(
      notifications.map((alert, index) =>
        String(alert._id || alert.id || index)
      )
    );
  }

  function navigate(page) {
    setActivePanel(null);
    if (onNavigate) onNavigate(page);
  }

  function openHelpLink(item) {
    if (item.external) {
      window.open(PROJECT_URL, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(item.page);
  }

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="navbar-menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          title="Open navigation menu"
        >
          <span aria-hidden="true">☰</span>
        </button>

        <div className="navbar-heading">
          <h2>{title}</h2>
          <span
            className={
              connected
                ? "connection-status connected"
                : "connection-status disconnected"
            }
          >
            <span className="status-dot" />
            {connected ? "System connected" : "Connection unavailable"}
          </span>
        </div>
      </div>

      <div className="navbar-actions" ref={panelRef}>
        {onRefresh && (
          <button
            type="button"
            className="navbar-icon-button"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh dashboard"
            aria-label="Refresh dashboard"
          >
            ↻
          </button>
        )}

        <button
          type="button"
          className="navbar-icon-button notification-button"
          onClick={() => togglePanel("notifications")}
          aria-label={`Notifications, ${unreadCount} unread`}
          aria-expanded={activePanel === "notifications"}
          title="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          className="navbar-icon-button"
          onClick={() => {
            setHelpSearch("");
            togglePanel("help");
          }}
          aria-label="Help and support"
          aria-expanded={activePanel === "help"}
          title="Help and support"
        >
          <CircleHelp size={20} />
        </button>

        <button
          type="button"
          className="navbar-profile-button"
          onClick={() => togglePanel("account")}
          aria-label="Open account menu"
          aria-expanded={activePanel === "account"}
          title="Account"
        >
          {userName.slice(0, 2).toUpperCase()}
          <ChevronDown size={13} />
        </button>

        {activePanel === "notifications" && (
          <section
            className="navbar-popover notification-panel"
            aria-label="Notifications"
          >
            <div className="popover-heading">
              <div>
                <h3>Notifications</h3>
                <p>{unreadCount} unread notifications</p>
              </div>
              <button
                type="button"
                className="popover-close"
                onClick={() => setActivePanel(null)}
                aria-label="Close notifications"
              >
                <X size={18} />
              </button>
            </div>

            {notifications.length > 0 ? (
              <>
                <div className="notification-list">
                  {notifications.map((alert, index) => {
                    const id = String(alert._id || alert.id || index);
                    const isRead = readIds.includes(id);

                    return (
                      <button
                        type="button"
                        className={`notification-item ${isRead ? "read" : ""}`}
                        key={id}
                        onClick={() => {
                          setReadIds((previous) =>
                            previous.includes(id) ? previous : [...previous, id]
                          );
                          navigate("Security Alerts");
                        }}
                      >
                        <span className="notification-symbol">
                          <ShieldCheck size={19} />
                        </span>
                        <span className="notification-content">
                          <strong>
                            {alert.title ||
                              alert.message ||
                              alert.type ||
                              "Security alert"}
                          </strong>
                          <span>
                            {alert.description ||
                              alert.message ||
                              `Severity: ${alert.severity || "unknown"}`}
                          </span>
                          <small>
                            {alert.timestamp || alert.createdAt
                              ? new Date(
                                  alert.timestamp || alert.createdAt
                                ).toLocaleString()
                              : "Recent alert"}
                          </small>
                        </span>
                        {!isRead && <span className="unread-dot" />}
                      </button>
                    );
                  })}
                </div>

                <div className="popover-footer">
                  <button type="button" onClick={markAllRead}>
                    Mark all as read
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("Security Alerts")}
                  >
                    View all alerts
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-notifications">
                <CheckCircle2 size={30} />
                <strong>You're all caught up</strong>
                <p>No unresolved security alerts.</p>
              </div>
            )}
          </section>
        )}

        {activePanel === "account" && (
          <section
            className="navbar-popover account-panel"
            aria-label="Account menu"
          >
            <div className="account-summary">
              <div className="account-avatar">
                {userName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <strong>{userName}</strong>
                <span>Dashboard user</span>
              </div>
            </div>

            <button
              type="button"
              className="account-menu-item"
              onClick={() => navigate("My Account")}
            >
              <UserRound size={18} />
              My Account
            </button>

            <button
              type="button"
              className="account-menu-item"
              onClick={() => {
                setActivePanel(null);
                window.open(PROJECT_URL, "_blank", "noopener,noreferrer");
              }}
            >
              <ExternalLink size={18} />
              Project repository
            </button>
          </section>
        )}
      </div>

      {activePanel === "help" && (
        <>
          <button
            type="button"
            className="help-panel-backdrop"
            aria-label="Close help panel"
            onClick={() => setActivePanel(null)}
          />
          <aside className="help-side-panel" aria-label="Help and support">
            <div className="help-side-header">
              <div>
                <h2>Help &amp; Support</h2>
                <p>Find guidance for using SentinelOps.</p>
              </div>
              <button
                type="button"
                className="help-side-close"
                onClick={() => setActivePanel(null)}
                aria-label="Close help and support"
              >
                <X size={19} />
              </button>
            </div>

            <label className="help-search">
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                value={helpSearch}
                onChange={(event) => setHelpSearch(event.target.value)}
                placeholder="Search documentation..."
                aria-label="Search documentation"
              />
              {helpSearch && (
                <button
                  type="button"
                  onClick={() => setHelpSearch("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </label>

            <h3 className="help-quick-links-title">Quick links</h3>

            <div className="help-quick-links">
              {filteredHelpLinks.length ? (
                filteredHelpLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      type="button"
                      className="help-quick-link"
                      key={item.title}
                      onClick={() => openHelpLink(item)}
                    >
                      <span className="help-quick-link-icon">
                        <Icon size={18} />
                      </span>
                      <span className="help-quick-link-copy">
                        <strong>{item.title}</strong>
                        <small>{item.description}</small>
                      </span>
                      {item.external && <ExternalLink size={14} />}
                    </button>
                  );
                })
              ) : (
                <p className="help-no-results">
                  No documentation links match “{helpSearch}”.
                </p>
              )}
            </div>

            <div className="help-support-card">
              <div className="help-support-icon">
                <MessageSquare size={19} />
              </div>
              <div>
                <strong>Need more help?</strong>
                <p>Open a support issue in the project repository.</p>
              </div>
              <a
                className="help-contact-button"
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageSquare size={17} />
                Contact Support
                <ExternalLink size={14} />
              </a>
            </div>
          </aside>
        </>
      )}
    </header>
  );
}
