
import {
  LayoutDashboard,
  ShieldAlert,
  Activity,
  FileText,
  BrainCircuit,
  GitBranch,
  ShieldCheck,
  X,
} from "lucide-react";

const navigationItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Security Alerts", icon: ShieldAlert },
  { label: "System Metrics", icon: Activity },
  { label: "Application Logs", icon: FileText },
  { label: "ML Detection", icon: BrainCircuit },
  { label: "DevOps Pipeline", icon: GitBranch },
];

export default function Sidebar({
  activePage = "Overview",
  onNavigate = () => {},
  open = true,
  onClose = () => {},
  alertCount = 0,
}) {
  return (
    <>
      {open && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`app-sidebar ${
          open ? "sidebar-open" : "sidebar-closed"
        }`}
        aria-label="Main navigation"
      >
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <ShieldCheck size={24} />
          </div>

          <div className="sidebar-brand-text">
            <strong>SentinelOps</strong>
            <span>Cloud Security Intelligence</span>
          </div>

          <button
            type="button"
            className="sidebar-close-button"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav
          className="sidebar-navigation"
          aria-label="Workspace navigation"
        >
          {navigationItems.map(({ label, icon: Icon }) => (
            <button
              type="button"
              key={label}
              className={`sidebar-nav-item ${
                activePage === label ? "active" : ""
              }`}
              onClick={() => onNavigate(label)}
              aria-current={
                activePage === label ? "page" : undefined
              }
            >
              <Icon size={19} />
              <span>{label}</span>

              {label === "Security Alerts" &&
                Number(alertCount) > 0 && (
                  <span className="sidebar-alert-count">
                    {alertCount}
                  </span>
                )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-security-icon">
            <ShieldCheck size={20} />
          </div>
          <div>
            <strong>Security Workspace</strong>
            <span>Monitoring dashboard</span>
          </div>
        </div>
      </aside>
    </>
  );
}
