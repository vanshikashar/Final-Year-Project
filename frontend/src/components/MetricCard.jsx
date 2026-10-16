
import React from "react";
import {
  Activity,
  Cpu,
  Database,
  ShieldAlert,
  Network,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const iconMap = {
  cpu: Cpu,
  memory: Database,
  requests: Network,
  anomalies: ShieldAlert,
};

const colorMap = {
  cpu: "purple",
  memory: "blue",
  requests: "cyan",
  anomalies: "orange",
};

function MetricCard({
  title,
  value,
  unit = "",
  type = "cpu",
  change,
  description,
}) {
  const Icon = iconMap[type] || Activity;
  const color = colorMap[type] || "blue";
  const numericChange = Number(change);
  const hasChange =
    change !== undefined &&
    change !== null &&
    change !== "" &&
    Number.isFinite(numericChange);

  const isNegative = numericChange < 0;

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-title">{title}</span>

        <div className={`metric-icon ${color}`}>
          <Icon size={20} aria-hidden="true" />
        </div>
      </div>

      <div className="metric-value">
        <span>{value ?? "N/A"}</span>
        {unit && <small>{unit}</small>}
      </div>

      <div className="metric-card-footer">
        {hasChange && (
          <span
            className={`metric-change ${
              isNegative ? "positive" : "neutral"
            }`}
          >
            {isNegative ? (
              <TrendingDown size={14} aria-hidden="true" />
            ) : (
              <TrendingUp size={14} aria-hidden="true" />
            )}
            {Math.abs(numericChange)}%
          </span>
        )}

        <span className="metric-description">
          {description || "Latest reported value"}
        </span>
      </div>
    </div>
  );
}

export default MetricCard;
