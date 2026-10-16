
import { useCallback, useEffect, useRef, useState } from "react";

import Sidebar from "./components/sidebar.jsx";
import Navbar from "./components/Navbar.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Alerts from "./pages/Alerts.jsx";
import Logs from "./pages/Logs.jsx";
import Pipeline from "./pages/Pipeline.jsx";
import AuthGate from "./auth/AuthGate.jsx";
import { LogOut, UserRound, PanelsTopLeft, Radio, ShieldAlert, RefreshCw } from "lucide-react";

import {
  getHealth,
  getMetrics,
  getAlerts,
  getLogs,
  updateAlertStatus,
  detectAnomaly,
} from "./services/api.js";

const NAV_ITEMS = [
  "Overview",
  "Security Alerts",
  "System Metrics",
  "Application Logs",
  "ML Detection",
  "DevOps Pipeline",
  "My Account",
];

const INITIAL_METRICS = {
  cpu: 0,
  memory: 0,
  requests: 0,
  anomalies: 0,
  failedLogins: 0,
  networkTraffic: 0,
  errorCount: 0,
};

const PROJECT_URL =
  "https://github.com/vanshikashar/Final-Year-Project";

const isResolved = (alert) =>
  ["resolved", "closed"].includes(
    String(alert?.status || "").toLowerCase()
  );

function normalizeArray(response, key) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.[key])) return response[key];
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function normalizeMetrics(response, alerts = []) {
  const source = response?.metrics ?? response?.data ?? response;
  let latest = source;

  if (Array.isArray(source)) {
    latest = [...source].sort(
      (a, b) =>
        new Date(b.timestamp || b.createdAt || 0).getTime() -
        new Date(a.timestamp || a.createdAt || 0).getTime()
    )[0];
  } else if (Array.isArray(source?.metrics)) {
    latest = [...source.metrics].sort(
      (a, b) =>
        new Date(b.timestamp || b.createdAt || 0).getTime() -
        new Date(a.timestamp || a.createdAt || 0).getTime()
    )[0];
  }

  if (!latest || typeof latest !== "object") {
    return {
      ...INITIAL_METRICS,
      anomalies: alerts.filter((alert) => !isResolved(alert)).length,
    };
  }

  return {
    cpu: Number(latest.cpu ?? latest.cpuUsage ?? 0),
    memory: Number(latest.memory ?? latest.memoryUsage ?? 0),
    requests: Number(
      latest.request_count ??
        latest.requestCount ??
        latest.requests ??
        0
    ),
    anomalies: alerts.filter((alert) => !isResolved(alert)).length,
    failedLogins: Number(
      latest.failed_logins ?? latest.failedLogins ?? 0
    ),
    networkTraffic: Number(
      latest.network_traffic ?? latest.networkTraffic ?? 0
    ),
    errorCount: Number(
      latest.error_count ?? latest.errorCount ?? 0
    ),
  };
}

export default function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("sentinelopsTheme");
    return savedTheme === "light" ? "light" : "dark";
  });

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("sentinelopsTheme", nextTheme);
  };

  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [cpuHistory, setCpuHistory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [detectionResult, setDetectionResult] = useState(null);

  const alertsRef = useRef([]);

  alertsRef.current = alerts;

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);

    try {
      const results = await Promise.allSettled([
        getHealth(),
        getMetrics(),
        getAlerts(),
        getLogs(),
      ]);

      const [healthResult, metricsResult, alertsResult, logsResult] =
        results;

      const health =
        healthResult.status === "fulfilled"
          ? healthResult.value
          : null;

      const isHealthy =
        health?.status === "ok" &&
        health?.database === "connected";

      setConnected(Boolean(isHealthy));

      const nextAlerts =
        alertsResult.status === "fulfilled"
          ? normalizeArray(alertsResult.value, "alerts")
          : null;

      const nextLogs =
        logsResult.status === "fulfilled"
          ? normalizeArray(logsResult.value, "logs")
          : null;

      const alertsToUse = nextAlerts ?? alertsRef.current;

      if (nextAlerts !== null) {
        alertsRef.current = nextAlerts;
        setAlerts(nextAlerts);
      }

      if (nextLogs !== null) {
        setLogs(nextLogs);
      }

      if (metricsResult.status === "fulfilled") {
        const nextMetrics = normalizeMetrics(
          metricsResult.value,
          alertsToUse
        );

        setMetrics(nextMetrics);

        setCpuHistory((previous) => {
          const point = {
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            cpu: nextMetrics.cpu,
          };

          return [...previous, point].slice(-12);
        });
      } else if (nextAlerts !== null) {
        setMetrics((previous) => ({
          ...previous,
          anomalies: alertsToUse.filter(
            (alert) => !isResolved(alert)
          ).length,
        }));
      }

      const failedNames = results
        .map((result, index) =>
          result.status === "rejected"
            ? ["health", "metrics", "alerts", "logs"][index]
            : null
        )
        .filter(Boolean);

      if (failedNames.length > 0) {
        setErrorMessage(
          `Some API requests failed: ${failedNames.join(", ")}.`
        );
      } else {
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Dashboard refresh failed:", error);
      setErrorMessage("Could not refresh dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleResolveAlert = async (alertId) => {
    if (!alertId) return;

    try {
      await updateAlertStatus(alertId, "resolved");

      setAlerts((previous) => {
        const updated = previous.map((alert) =>
          String(alert._id || alert.id) === String(alertId)
            ? { ...alert, status: "resolved" }
            : alert
        );

        alertsRef.current = updated;
        return updated;
      });

      setMetrics((previous) => ({
        ...previous,
        anomalies: Math.max(0, previous.anomalies - 1),
      }));
    } catch (error) {
      console.error("Unable to resolve alert:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Could not resolve the alert. Check the backend PATCH endpoint."
      );
    }
  };

  const handleRunDetection = async () => {
    if (detecting) return;

    setDetecting(true);
    setDetectionResult(null);
    setErrorMessage("");

    try {
      const result = await detectAnomaly({
        cpu: Number(metrics.cpu) || 0,
        memory: Number(metrics.memory) || 0,
        request_count: Number(metrics.requests) || 0,
        failed_logins: Number(metrics.failedLogins) || 0,
        network_traffic: Number(metrics.networkTraffic) || 0,
        error_count: Number(metrics.errorCount) || 0,
      });

      setDetectionResult(result);

      await fetchDashboardData();
    } catch (error) {
      console.error("Anomaly detection failed:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Detection failed. Check that POST /api/detect is available."
      );
    } finally {
      setDetecting(false);
    }
  };

  const navigateTo = (page) => {
    if (NAV_ITEMS.includes(page)) {
      setActivePage(page);
      setSidebarOpen(false);
      setErrorMessage("");
    }
  };

  const unresolvedAlerts = alerts.filter(
    (alert) => !isResolved(alert)
  );

  const renderPage = () => {
    switch (activePage) {
      case "Overview":
        return (
          <Dashboard
            metrics={metrics}
            alerts={alerts}
            cpuHistory={cpuHistory}
            loading={loading}
            onResolveAlert={handleResolveAlert}
          />
        );

      case "Security Alerts":
        return (
          <Alerts
            alerts={alerts}
            loading={loading}
            onResolveAlert={handleResolveAlert}
            onRefresh={fetchDashboardData}
          />
        );

      case "Application Logs":
        return (
          <Logs
            logs={logs}
            loading={loading}
            onRefresh={fetchDashboardData}
          />
        );

      case "System Metrics":
        return (
          <section className="placeholder-page">
            <h1>System Metrics</h1>
            <p>Latest metrics returned by your backend.</p>

            <div className="placeholder-metrics">
              <div>
                <span>CPU Usage</span>
                <strong>{metrics.cpu}%</strong>
              </div>

              <div>
                <span>Memory Usage</span>
                <strong>{metrics.memory}%</strong>
              </div>

              <div>
                <span>Requests Processed</span>
                <strong>{metrics.requests.toLocaleString()}</strong>
              </div>

              <div>
                <span>Failed Logins</span>
                <strong>{metrics.failedLogins}</strong>
              </div>

              <div>
                <span>Network Traffic</span>
                <strong>{metrics.networkTraffic}</strong>
              </div>

              <div>
                <span>Error Count</span>
                <strong>{metrics.errorCount}</strong>
              </div>
            </div>

            <button
              type="button"
              className="detection-button"
              onClick={fetchDashboardData}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh Metrics"}
            </button>
          </section>
        );

      case "ML Detection":
        return (
          <section className="placeholder-page">
            <h1>ML Anomaly Detection</h1>

            <p>
              Submit the latest system metrics to your backend
              anomaly-detection endpoint.
            </p>

            <div className="detection-info">
              <span>Unresolved Security Alerts</span>
              <strong>{unresolvedAlerts.length}</strong>

              <button
                type="button"
                className="detection-button"
                onClick={handleRunDetection}
                disabled={detecting}
              >
                {detecting
                  ? "Running Detection..."
                  : "Run Anomaly Detection"}
              </button>

              {detectionResult !== null && (
                <div className="detection-result-container">
                  <h3>Detection Response</h3>
                  <pre className="detection-result">
                    {JSON.stringify(detectionResult, null, 2)}
                  </pre>
                </div>
              )}

              <small>
                The result comes from the backend response and its
                connected ML detection service.
              </small>
            </div>
          </section>
        );

      case "DevOps Pipeline":
        return (
          <Pipeline
            loading={loading}
            onRefresh={fetchDashboardData}
          />
        );

      case "My Account":
        return (
          <section className="account-page">
            <header className="account-page-header">
              <h1>My Account</h1>
              <p>Manage your profile and platform integration settings.</p>
            </header>

            <div className="account-panel">
              <div className="account-profile-banner">
                <div className="account-avatar" aria-hidden="true">
                  {(localStorage.getItem("userName") || "User")
                    .trim()
                    .split(/\\s+/)
                    .slice(0, 2)
                    .map((part) => part.charAt(0).toUpperCase())
                    .join("")}
                </div>
                <div>
                  <h2 className="account-profile-name">
                    {localStorage.getItem("userName") || "User"}
                  </h2>
                  <span className="account-role">Platform Administrator</span>
                </div>
              </div>

              <div className="account-info-grid">
                <div className="account-info-card">
                  <div className="account-info-icon">
                    <UserRound size={22} />
                  </div>
                  <div>
                    <div className="account-info-label">Username</div>
                    <div className="account-info-value">
                      {localStorage.getItem("userName") || "User"}
                    </div>
                  </div>
                </div>

                <div className="account-info-card">
                  <div className="account-info-icon">
                    <PanelsTopLeft size={22} />
                  </div>
                  <div>
                    <div className="account-info-label">Active Application</div>
                    <div className="account-info-value">
                      Cloud Security DevOps Platform
                    </div>
                  </div>
                </div>

                <div className="account-info-card">
                  <div className="account-info-icon">
                    <Radio size={22} />
                  </div>
                  <div>
                    <div className="account-info-label">Backend Connection</div>
                    <span
                      className={`account-status ${
                        connected
                          ? "account-status-connected"
                          : "account-status-neutral"
                      }`}
                    >
                      {connected ? "Connected" : "Unavailable"}
                    </span>
                  </div>
                </div>

                <div className="account-info-card">
                  <div className="account-info-icon">
                    <ShieldAlert size={22} />
                  </div>
                  <div>
                    <div className="account-info-label">
                      Unresolved Security Alerts
                    </div>
                    <span className="account-status account-status-neutral">
                      {unresolvedAlerts.length} Active Alerts
                    </span>
                  </div>
                </div>
              </div>

              <div className="account-actions">
                <button
                  type="button"
                  className="account-action-button account-logout-button"
                  onClick={() => {
                    const confirmed = window.confirm(
                      "Are you sure you want to log out?"
                    );
                    if (confirmed) {
                      window.dispatchEvent(new Event("sentinelops:logout"));
                    }
                  }}
                >
                  <LogOut size={18} />
                  Logout
                </button>

                <button
                  type="button"
                  className="account-action-button account-refresh-button"
                  onClick={fetchDashboardData}
                  disabled={loading}
                >
                  <RefreshCw size={17} className={loading ? "spin" : ""} />
                  {loading ? "Refreshing..." : "Refresh Account Status"}
                </button>
              </div>
            </div>
          </section>
        );

      default:
        return (
          <section className="placeholder-page">
            <h1>Page not found</h1>
            <p>Select a page from the sidebar.</p>
          </section>
        );
    }
  };

 return (
  <AuthGate>
    <div className={`app-layout theme-${theme}`}>
      <Sidebar
        activePage={activePage}
        onNavigate={navigateTo}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        alertCount={unresolvedAlerts.length}
      />

      <div className="app-main">
        <Navbar
          title={activePage}
          connected={connected}
          loading={loading || detecting}
          onRefresh={fetchDashboardData}
          onMenuClick={() =>
            setSidebarOpen((previous) => !previous)
          }
          alerts={alerts}
          onNavigate={navigateTo}
        />

        <main className="app-content">
          {errorMessage && (
            <div className="app-error-message" role="alert">
              <span>{errorMessage}</span>

              <button
                type="button"
                onClick={() => setErrorMessage("")}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          <div className="theme-switcher">
            <button
              type="button"
              className="theme-toggle-button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode"}
            </button>
          </div>

          {renderPage()}
        </main>
      </div>
    </div>
  </AuthGate>
  );
}

