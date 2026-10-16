
import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import MetricCard from "../components/MetricCard.jsx";

function MetricChart({ title, data, dataKey, color }) {
  const validData = Array.isArray(data)
  ? data.filter(
      (point) =>
        point?.time &&
        point[dataKey] !== null &&
        point[dataKey] !== undefined &&
        Number.isFinite(Number(point[dataKey]))
    )
  : [];

  return (
    <section className="cpu-chart-card">
      <div className="cpu-chart-header">
        <div>
          <h3>{title}</h3>
          <p>Recorded application metric history</p>
        </div>
      </div>

      {validData.length === 0 ? (
        <div className="dashboard-empty-state">
          No recorded history available yet.
        </div>
      ) : (
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={validData}>
              <defs>
                <linearGradient
                  id={`gradient-${dataKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#263449"
                strokeDasharray="4 4"
              />
              <XAxis
                dataKey="time"
                stroke="#8293ad"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#8293ad"
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, title]}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                fill={`url(#gradient-${dataKey})`}
                strokeWidth={2}
                connectNulls={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default function Metrics({
  metrics = {},
  cpuHistory = [],
  loading = false,
  onRefresh,
}) {
  const history = Array.isArray(cpuHistory) ? cpuHistory : [];

  const memoryHistory = history.map((point) => ({
    time: point.time,
    memory: Number.isFinite(Number(point.memory))
      ? Number(point.memory)
      : null,
  })).filter((point) => point.memory !== null);

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <span className="dashboard-eyebrow">
            INFRASTRUCTURE OBSERVABILITY
          </span>
          <h1>System Metrics<span className="dashboard-title-dot">.</span></h1>
          <p>
            Monitor CPU, memory, traffic, and application performance
            using reported backend data.
          </p>
        </div>

        <button
          type="button"
          className="detection-button"
          onClick={onRefresh}
          disabled={loading || !onRefresh}
        >
          {loading ? "Refreshing..." : "Refresh Metrics"}
        </button>
      </section>

      <section className="dashboard-metrics-grid">
        <MetricCard
          title="CPU Utilization"
          value={metrics.cpu ?? "N/A"}
          unit={metrics.cpu == null ? "" : "%"}
          type="cpu"
          description="Latest reported CPU usage"
        />

        <MetricCard
          title="Memory Usage"
          value={metrics.memory ?? "N/A"}
          unit={metrics.memory == null ? "" : "%"}
          type="memory"
          description="Latest reported memory usage"
        />

        <MetricCard
          title="Requests Processed"
          value={metrics.requests ?? "N/A"}
          type="requests"
          description="Reported request count"
        />

        <MetricCard
          title="Application Errors"
          value={metrics.errorCount ?? "N/A"}
          type="anomalies"
          description="Reported error count"
        />
      </section>

      <section className="dashboard-chart-section">
        <MetricChart
          title="CPU Utilization"
          data={history}
          dataKey="cpu"
          color="#6685ff"
        />
      </section>

      <section className="dashboard-chart-section">
        <MetricChart
          title="Memory Utilization"
          data={memoryHistory}
          dataKey="memory"
          color="#22c5e5"
        />
      </section>

      <section className="cpu-chart-card">
        <h3>Additional System Information</h3>
        <div className="placeholder-metrics">
          <div>
            <span>Failed Logins</span>
            <strong>{metrics.failedLogins ?? "N/A"}</strong>
          </div>
          <div>
            <span>Network Traffic</span>
            <strong>{metrics.networkTraffic ?? "N/A"}</strong>
          </div>
        </div>
        <p className="dashboard-empty-state">
          These values depend on the fields returned by your backend.
        </p>
      </section>
    </div>
  );
}
