
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const sampleData = [
  { time: "09:00", cpu: 25 },
  { time: "10:00", cpu: 32 },
  { time: "11:00", cpu: 28 },
  { time: "12:00", cpu: 45 },
  { time: "13:00", cpu: 38 },
  { time: "14:00", cpu: 55 },
  { time: "15:00", cpu: 20 },
];

export default function CpuChart({
  data = [],
  title = "CPU Utilization Over Time",
}) {
  // Use real history when available; otherwise show clearly labelled sample data.
  const hasRealData = Array.isArray(data) && data.length > 1;
  const chartData = hasRealData ? data : sampleData;

  return (
    <section className="cpu-chart-card">
      <div className="cpu-chart-header">
        <div>
          <h3>{title}</h3>
          <p>Cloud server performance over time</p>
        </div>

        <span className="chart-live-badge">
          <span className="status-dot" />
          Monitoring
        </span>
      </div>

      <div className="cpu-chart-container">
        <ResponsiveContainer width="100%" height="100%" minHeight={260}>
          <AreaChart
            data={chartData}
            margin={{ top: 12, right: 16, left: 0, bottom: 4 }}
          >
            <defs>
              <linearGradient
                id="cpuGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#6685ff" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6685ff" stopOpacity={0.02} />
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
              formatter={(value) => [`${value}%`, "CPU Usage"]}
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
      </div>

      <div className="cpu-chart-footer">
        <span>CPU usage (%)</span>
        <span>
          {hasRealData
            ? "Backend metric history"
            : "Illustrative sample data — waiting for history"}
        </span>
      </div>
    </section>
  );
}
