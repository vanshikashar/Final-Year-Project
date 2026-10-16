
import React, { useMemo, useState } from "react";
import {
  Search,
  ShieldAlert,
  RefreshCw,
  Filter,
  AlertTriangle,
  X,
} from "lucide-react";

import AlertsTable from "../components/AlertsTable.jsx";

const RESOLVED_STATUSES = ["resolved", "closed", "fixed"];

function getStatus(alert) {
  return String(alert?.status || "open").toLowerCase();
}

function getSeverity(alert) {
  return String(
    alert?.severity || alert?.level || "low"
  ).toLowerCase();
}

function Alerts({
  alerts = [],
  loading = false,
  onResolveAlert,
  onRefresh,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionError, setActionError] = useState("");

  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  const filteredAlerts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return safeAlerts.filter((alert) => {
      const searchableValues = [
        alert.title,
        alert.type,
        alert.name,
        alert.message,
        alert.description,
        alert.source,
        alert.service,
        alert.ip,
        alert.ipAddress,
        alert.sourceIp,
        alert.source_ip,
        alert._id,
        alert.id,
      ];

      const matchesSearch =
        !query ||
        searchableValues.some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );

      const severity = getSeverity(alert);
      const status = getStatus(alert);
      const isResolved = RESOLVED_STATUSES.includes(status);

      const matchesSeverity =
        severityFilter === "all" ||
        severity === severityFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && !isResolved) ||
        (statusFilter === "resolved" && isResolved);

      return (
        matchesSearch &&
        matchesSeverity &&
        matchesStatus
      );
    });
  }, [
    safeAlerts,
    searchTerm,
    severityFilter,
    statusFilter,
  ]);

  const openCount = safeAlerts.filter(
    (alert) => !RESOLVED_STATUSES.includes(getStatus(alert))
  ).length;

  const criticalCount = safeAlerts.filter((alert) => {
    return (
      ["critical", "high"].includes(getSeverity(alert)) &&
      !RESOLVED_STATUSES.includes(getStatus(alert))
    );
  }).length;

  async function handleResolve(alertId) {
    if (!alertId || !onResolveAlert) return;

    setActionError("");

    try {
      await onResolveAlert(alertId);
    } catch (error) {
      setActionError(
        error?.message || "Unable to resolve this alert."
      );
    }
  }

  return (
    <main className="alerts-page">
      <section className="alerts-page-heading">
        <div>
          <span className="alerts-page-eyebrow">
            THREAT MANAGEMENT
          </span>

          <h1>Security Alerts</h1>

          <p>
            Review suspicious activity, investigate anomalies,
            and manage security events.
          </p>
        </div>

        <button
          type="button"
          className="alerts-refresh-button"
          onClick={onRefresh}
          disabled={loading || !onRefresh}
        >
          <RefreshCw
            size={16}
            className={loading ? "alerts-refresh-spin" : ""}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </section>

      <section className="alerts-summary-grid">
        <div className="alerts-summary-card">
          <div className="alerts-summary-icon">
            <ShieldAlert size={19} />
          </div>
          <span>Total alerts</span>
          <strong>{safeAlerts.length}</strong>
          <small>Events returned by the API</small>
        </div>

        <div className="alerts-summary-card">
          <div className="alerts-summary-icon warning">
            <AlertTriangle size={19} />
          </div>
          <span>Open alerts</span>
          <strong>{openCount}</strong>
          <small>Awaiting resolution</small>
        </div>

        <div className="alerts-summary-card">
          <div className="alerts-summary-icon danger">
            <ShieldAlert size={19} />
          </div>
          <span>High priority</span>
          <strong>{criticalCount}</strong>
          <small>Open high or critical events</small>
        </div>
      </section>

      <section className="alerts-filter-panel">
        <div className="alerts-filter-title">
          <Filter size={17} />
          <strong>Filter security events</strong>
        </div>

        <div className="alerts-filter-controls">
          <label className="alerts-search">
            <Search size={17} />

            <input
              type="search"
              placeholder="Search title, IP, message, or source..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </label>

          <select
            aria-label="Filter by severity"
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(event.target.value)
            }
          >
            <option value="all">All severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <p className="alerts-filter-result" aria-live="polite">
          Showing {filteredAlerts.length} of {safeAlerts.length} alerts
        </p>
      </section>

      {actionError && (
        <div className="app-error-message" role="alert">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError("")}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {!loading && safeAlerts.length === 0 ? (
        <section className="alerts-filter-panel">
          <h3>No security alerts returned</h3>
          <p>
            The API returned no alert records. Refresh or check
            the backend if you expected to see alerts.
          </p>
        </section>
      ) : !loading && filteredAlerts.length === 0 ? (
        <section className="alerts-filter-panel">
          <h3>No matching alerts</h3>
          <p>
            Try changing your search term or clearing the filters.
          </p>
          <button
            type="button"
            className="alerts-refresh-button"
            onClick={() => {
              setSearchTerm("");
              setSeverityFilter("all");
              setStatusFilter("all");
            }}
          >
            Clear filters
          </button>
        </section>
      ) : (
        <AlertsTable
          alerts={filteredAlerts}
          loading={loading}
          onResolve={handleResolve}
        />
      )}
    </main>
  );
}

export default Alerts;
