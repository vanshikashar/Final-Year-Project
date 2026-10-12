
import React from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";

function formatTime(timestamp) {
  if (!timestamp) return "Time unavailable";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Time unavailable";
  }

  return date.toLocaleString();
}

function getSeverityClass(severity) {
  const value = String(severity || "low").toLowerCase();

  if (value === "critical") return "critical";
  if (value === "high") return "high";
  if (value === "medium") return "medium";

  return "low";
}

function AlertsTable({
  alerts = [],
  onResolve,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="alerts-card">
        <h3>Security Alerts</h3>
        <p className="alerts-message">Loading security alerts...</p>
      </div>
    );
  }

  return (
    <div className="alerts-card">
      <div className="alerts-header">
        <div>
          <div className="alerts-heading">
            <ShieldAlert size={20} />
            <h3>Security Alerts</h3>
          </div>

          <p>Monitor and manage suspicious activity</p>
        </div>

        <span className="alerts-count">
          {alerts.length} Events
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="alerts-empty">
          <ShieldCheck size={32} />

          <h4>No security alerts</h4>

          <p>
            No alerts were returned by the backend.
          </p>
        </div>
      ) : (
        <div className="alerts-table-wrapper">
          <table className="alerts-table">
            <thead>
              <tr>
                <th>SECURITY EVENT</th>
                <th>SOURCE</th>
                <th>SEVERITY</th>
                <th>TIME</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {alerts.map((alert, index) => {
                const id = alert._id || alert.id || index;

                const title =
                  alert.title ||
                  alert.type ||
                  alert.name ||
                  "Security event";

                const source =
                  alert.source ||
                  alert.service ||
                  "Cloud platform";

                const severity = getSeverityClass(
                  alert.severity || alert.level
                );

                const status = String(
                  alert.status || "open"
                ).toLowerCase();

                const resolved = [
                  "resolved",
                  "closed",
                  "fixed",
                ].includes(status);

                const timestamp =
                  alert.createdAt ||
                  alert.timestamp ||
                  alert.time;

                return (
                  <tr key={id}>
                    <td>
                      <div className="alert-event">
                        <div
                          className={`alert-event-icon ${severity}`}
                        >
                          <AlertTriangle size={17} />
                        </div>

                        <div>
                          <strong>{title}</strong>

                          <span>
                            {alert.message ||
                              alert.description ||
                              "No additional details"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>{source}</td>

                    <td>
                      <span
                        className={`severity-badge ${severity}`}
                      >
                        {severity}
                      </span>
                    </td>

                    <td>
                      <span className="alert-time">
                        <Clock size={13} />
                        {formatTime(timestamp)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`alert-status ${
                          resolved ? "resolved" : "open"
                        }`}
                      >
                        {resolved ? "Resolved" : status}
                      </span>
                    </td>

                    <td>
                      {resolved ? (
                        <span className="resolved-action">
                          <CheckCircle2 size={15} />
                          Done
                        </span>
                      ) : onResolve ? (
                        <button
                          className="resolve-alert-button"
                          onClick={() => onResolve(alert)}
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="muted-action">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AlertsTable;
