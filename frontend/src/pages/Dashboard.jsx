
import React from "react";
import MetricCard from "../components/MetricCard.jsx";
import CpuChart from "../components/CpuChart.jsx";
import AlertsTable from "../components/AlertsTable.jsx";

function formatMetric(value, decimals = 1) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "N/A";
  }

  return Number.isInteger(number)
    ? number.toLocaleString()
    : number.toFixed(decimals);
}

function Dashboard({
  metrics = {},
  alerts = [],
  cpuHistory = [],
  loading = false,
  connected = false,
  onResolveAlert,
  onRefresh,
}) {
  const cpu = metrics.cpu ?? metrics.cpuUsage;
  const memory = metrics.memory ?? metrics.memoryUsage;

  const requests =
    metrics.requests ??
    metrics.requestCount ??
    metrics.request_count;

  const anomalies =
    metrics.anomalies ??
    metrics.anomalyCount;

  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const safeCpuHistory = Array.isArray(cpuHistory)
    ? cpuHistory
    : [];

  const unresolvedAlerts = safeAlerts.filter(
    (alert) =>
      !["resolved", "closed"].includes(
        String(alert?.status ?? "").toLowerCase()
      )
  );

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <span className="dashboard-eyebrow">
            CLOUD SECURITY OVERVIEW
          </span>

          <h1>
            Security Dashboard
            <span className="dashboard-title-dot">.</span>
          </h1>

          <p>
            Monitor infrastructure, review security events,
            and inspect anomaly detection results.
          </p>
        </div>

        <div
          className="dashboard-monitor-status"
          role="status"
          aria-live="polite"
        >
          <span
            className="dashboard-live-dot"
            style={{
              backgroundColor: connected
                ? "#16a34a"
                : "#dc2626",
            }}
          />

          {connected ? "Backend connected" : "Backend unavailable"}
        </div>
      </section>

      <section
        className="dashboard-metrics-grid"
        aria-label="Infrastructure metrics"
      >
        <MetricCard
          title="CPU Utilization"
          value={formatMetric(cpu)}
          unit={cpu == null ? "" : "%"}
          type="cpu"
          description="Latest reported CPU usage"
        />

        <MetricCard
          title="Memory Usage"
          value={formatMetric(memory)}
          unit={memory == null ? "" : "%"}
          type="memory"
          description="Latest reported memory usage"
        />

        <MetricCard
          title="Requests Processed"
          value={formatMetric(requests, 0)}
          type="requests"
          description="Reported request count"
        />

        <MetricCard
          title="Unresolved Alerts"
          value={formatMetric(anomalies ?? unresolvedAlerts.length, 0)}
          type="anomalies"
          description="Alerts requiring attention"
        />
      </section>

      <section className="dashboard-chart-section">
        <CpuChart
          data={safeCpuHistory}
          title="CPU Utilization Over Time"
        />

        {!safeCpuHistory.length && (
          <p className="dashboard-empty-state">
            {loading
              ? "Loading CPU history..."
              : "No CPU history available yet. Refresh after metrics are received."}
          </p>
        )}
      </section>

      <section className="dashboard-alerts-section">
        <div className="dashboard-section-heading">
          <div>
            <h2>Recent Security Alerts</h2>
            <p>
              {unresolvedAlerts.length} unresolved alert(s)
            </p>
          </div>

          {onRefresh && (
            <button
              type="button"
              className="detection-button"
              onClick={onRefresh}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          )}
        </div>

        {loading && safeAlerts.length === 0 ? (
          <p role="status">Loading security alerts...</p>
        ) : safeAlerts.length === 0 ? (
          <p className="dashboard-empty-state">
            No security alerts have been returned by the backend.
          </p>
        ) : (
          <AlertsTable
            alerts={safeAlerts}
            onResolve={onResolveAlert}
            loading={loading}
          />
        )}
      </section>

      <footer className="dashboard-footer">
        <span>
          AI-Powered Smart Cloud Security &amp; DevOps Intelligence
        </span>

        <span>
          Displayed information depends on available backend data.
        </span>
      </footer>
    </div>
  );
}

export default Dashboard;
