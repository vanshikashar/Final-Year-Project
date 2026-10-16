
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function CpuChart({
  data = [],
  title = "CPU Utilization Over Time",
}) {
  const chartData = Array.isArray(data)
    ? data
        .filter(
          (point) =>
            Number.isFinite(Number(point.cpu)) &&
            (point.time || point.timestamp)
        )
        .map((point) => ({
          time: point.time || point.timestamp,
          cpu: Number(point.cpu),
        }))
    : [];

  const hasData = chartData.length > 0;

  return (
    <section className="cpu-chart-card">
      <div className="cpu-chart-header">
        <div>
          <h3>{title}</h3>
          <p>Reported CPU utilization over time</p>
        </div>

        <span className="chart-live-badge">
          <span className="status-dot" />
          {hasData ? "Data available" : "Awaiting data"}
        </span>
      </div>

      <div
        className="cpu-chart-container"
        style={{ minHeight: 260 }}
      >
        {hasData ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={chartData}
              margin={{
                top: 12,
                right: 16,
                left: 0,
                bottom: 4,
              }}
            >
              <defs>
                <linearGradient
                  id="cpuGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#6685ff"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="#6685ff"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#263449"
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="time"
                stroke="#8293ad"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                domain={[0, 100]}
                stroke="#8293ad"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
                axisLine={false}
                tickLine={false}
                width={48}
              />

              <Tooltip
                contentStyle={{
                  background: "#111b2e",
                  border: "1px solid #293951",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
                formatter={(value) => [
                  `${value}%`,
                  "CPU Usage",
                ]}
              />

              <Area
                type="monotone"
                dataKey="cpu"
                name="CPU Usage"
                stroke="#6685ff"
                strokeWidth={3}
                fill="url(#cpuGradient)"
                activeDot={{ r: 5, fill: "#6685ff" }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div
            className="dashboard-empty-state"
            role="status"
          >
            No CPU history is available yet. Refresh the
            dashboard after metric records have been received.
          </div>
        )}
      </div>

      <div className="cpu-chart-footer">
        <span>CPU usage (%)</span>
        <span>
          {hasData
            ? `${chartData.length} recorded data point(s)`
            : "Waiting for recorded metrics"}
        </span>
      </div>
    </section>
  );
}
