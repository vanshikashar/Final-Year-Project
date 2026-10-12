
import React, { useMemo, useState } from "react";
import {
  Search,
  ShieldAlert,
  RefreshCw,
  Filter,
  AlertTriangle,
} from "lucide-react";

import AlertsTable from "../components/AlertsTable.jsx";

function Alerts({
  alerts = [],
  loading = false,
  onResolveAlert,
  onRefresh,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const title =
        alert.title || alert.type || alert.name || "";

      const message =
        alert.message || alert.description || "";

      const source =
        alert.source || alert.service || "";

      const severity = String(
        alert.severity || alert.level || "low"
      ).toLowerCase();

      const status = String(
        alert.status || "open"
      ).toLowerCase();

      const query = searchTerm.trim().toLowerCase();

      const matchesSearch = [
        title,
        message,
        source,
      ].some((value) =>
        String(value).toLowerCase().includes(query)
      );

      const matchesSeverity =
        severityFilter === "all" ||
        severity === severityFilter;

      const isResolved = [
        "resolved",
        "closed",
        "fixed",
      ].includes(status);

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
    alerts,
    searchTerm,
    severityFilter,
    statusFilter,
  ]);

  const openCount = alerts.filter((alert) => {
    const status = String(
      alert.status || "open"
    ).toLowerCase();

    return !["resolved", "closed", "fixed"].includes(
      status
    );
  }).length;

  const criticalCount = alerts.filter((alert) => {
    const severity = String(
      alert.severity || alert.level || ""
    ).toLowerCase();

    return (
      ["critical", "high"].includes(severity) &&
      !["resolved", "closed", "fixed"].includes(
        String(alert.status || "open").toLowerCase()
      )
    );
  }).length;

  return (
    <main className="alerts-page">
      <section className="alerts-page-heading">
        <div>
          <span className="alerts-page-eyebrow">
            THREAT MANAGEMENT
          </span>

          <h1>Security Alerts</h1>

          <p>
            Review suspicious activity, investigate
            anomalies, and manage security events.
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
          Refresh
        </button>
      </section>

      <section className="alerts-summary-grid">
        <div className="alerts-summary-card">
          <div className="alerts-summary-icon">
            <ShieldAlert size={19} />
          </div>

          <span>Total alerts</span>
          <strong>{alerts.length}</strong>
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
              placeholder="Search title, message, or source..."
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

        <p className="alerts-filter-result">
          Showing {filteredAlerts.length} of {alerts.length} alerts
        </p>
      </section>

      <AlertsTable
        alerts={filteredAlerts}
        loading={loading}
        onResolve={onResolveAlert}
      />
    </main>
  );
}

export default Alerts;
