
import React from "react";
import MetricCard from "../components/MetricCard.jsx";
import CpuChart from "../components/CpuChart.jsx";
import AlertsTable from "../components/AlertsTable.jsx";

function Dashboard({
  metrics = {},
  alerts = [],
  cpuHistory,
  loading = false,
  onResolveAlert,
}) {
  const cpu = metrics.cpu ?? metrics.cpuUsage ?? 42;
  const memory = metrics.memory ?? metrics.memoryUsage ?? 63;
  const requests =
    metrics.requests ?? metrics.requestCount ?? 1248;
  const anomalies =
    metrics.anomalies ?? metrics.anomalyCount ?? 7;

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
            Monitor cloud infrastructure, detect unusual
            activity, and review security events.
          </p>
        </div>

        <div className="dashboard-monitor-status">
          <span className="dashboard-live-dot" />
          Monitoring overview
        </div>
      </section>

      <section className="dashboard-metrics-grid">
        <MetricCard
          title="CPU Utilization"
          value={cpu}
          unit="%"
          type="cpu"
          description="Current CPU usage"
        />

        <MetricCard
          title="Memory Usage"
          value={memory}
          unit="%"
          type="memory"
          description="Current memory usage"
        />

        <MetricCard
          title="Requests Processed"
          value={Number(requests).toLocaleString()}
          type="requests"
          description="Reported request count"
        />

        <MetricCard
          title="Detected Anomalies"
          value={anomalies}
          type="anomalies"
          description="Reported ML detections"
        />
      </section>

      <section className="dashboard-chart-section">
        <CpuChart
          data={cpuHistory}
          title="CPU Utilization Over Time"
        />
      </section>

      <section className="dashboard-alerts-section">
        <AlertsTable
          alerts={alerts}
          onResolve={onResolveAlert}
          loading={loading}
        />
      </section>

      <footer className="dashboard-footer">
        <span>
          AI-Powered Smart Cloud Security & DevOps Intelligence
        </span>

        <span>
          Verify findings against your infrastructure logs.
        </span>
      </footer>
    </div>
  );
}

export default Dashboard;
