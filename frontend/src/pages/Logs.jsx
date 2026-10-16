
import { useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  FileText,
  ArrowDownUp,
} from "lucide-react";

const getStatus = (log) =>
  String(log?.status || "unknown").toLowerCase();

const getEvent = (log) =>
  String(log?.eventType || log?.event || "").toLowerCase();

const isFailedLog = (log) => {
  const status = getStatus(log);
  const event = getEvent(log);

  return (
    ["failed", "error", "failure"].includes(status) ||
    event.includes("error") ||
    event.includes("failed") ||
    Number(
      log?.metrics?.error_count ??
      log?.metrics?.errorCount ??
      log?.error_count ??
      log?.errorCount ??
      0
    ) > 0
  );
};

function Logs({ logs = [], loading = false, onRefresh }) {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const safeLogs = Array.isArray(logs) ? logs : [];

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return safeLogs
      .filter((log) => {
        const searchableValues = [
          log.message,
          log.source,
          log.service,
          log.eventType,
          log.event,
          log.status,
          log.ip,
          log.ipAddress,
          log.sourceIp,
          log.source_ip,
          log.user,
          log.userId,
          log._id,
        ];

        const text = searchableValues
          .map((value) => String(value ?? ""))
          .join(" ")
          .toLowerCase();

        const matchesSearch = !query || text.includes(query);
        const status = getStatus(log);
        const failed = isFailedLog(log);

        const matchesLevel =
          level === "all" ||
          (level === "error" && failed) ||
          (level === "failed" &&
            ["failed", "failure"].includes(status)) ||
          (level === "success" && status === "success");

        return matchesSearch && matchesLevel;
      })
      .sort((a, b) => {
        const aTime = new Date(
          a.timestamp || a.createdAt || 0
        ).getTime();

        const bTime = new Date(
          b.timestamp || b.createdAt || 0
        ).getTime();

        return sortOrder === "newest"
          ? bTime - aTime
          : aTime - bTime;
      });
  }, [safeLogs, search, level, sortOrder]);

  const failedCount = safeLogs.filter(isFailedLog).length;

  const formatTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleString();
  };

  return (
    <section className="logs-page">
      <div className="logs-heading">
        <div>
          <span className="dashboard-eyebrow">
            SYSTEM ACTIVITY
          </span>
          <h1>Application Logs</h1>
          <p>
            Search, filter, and investigate events returned
            by your backend.
          </p>
        </div>

        <button
          type="button"
          className="logs-refresh-button"
          onClick={onRefresh}
          disabled={loading || !onRefresh}
        >
          <RefreshCw
            size={16}
            className={loading ? "alerts-refresh-spin" : ""}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="logs-summary">
        <div>
          <span>Total logs</span>
          <strong>{safeLogs.length}</strong>
        </div>

        <div>
          <span>Failed / error events</span>
          <strong>{failedCount}</strong>
        </div>

        <div>
          <span>Displayed</span>
          <strong>{filteredLogs.length}</strong>
        </div>
      </div>

      <div className="logs-panel">
        <div className="logs-toolbar">
          <label className="logs-search">
            <Search size={17} />
            <input
              type="search"
              placeholder="Search message, source, event, or IP..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <select
            aria-label="Filter logs by status"
            value={level}
            onChange={(event) => setLevel(event.target.value)}
          >
            <option value="all">All events</option>
            <option value="error">Errors</option>
            <option value="failed">Failed</option>
            <option value="success">Success</option>
          </select>

          <button
            type="button"
            className="logs-refresh-button"
            onClick={() =>
              setSortOrder((previous) =>
                previous === "newest" ? "oldest" : "newest"
              )
            }
            aria-label={`Sort by ${sortOrder === "newest" ? "oldest" : "newest"} first`}
          >
            <ArrowDownUp size={16} />
            {sortOrder === "newest" ? "Newest first" : "Oldest first"}
          </button>
        </div>

        <div className="logs-table-wrapper">
          <table className="logs-table">
            <thead>
              <tr>
                <th>TIME</th>
                <th>SOURCE</th>
                <th>EVENT</th>
                <th>STATUS</th>
                <th>MESSAGE</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.map((log, index) => {
                const status = getStatus(log);
                const safeStatus = status.replace(
                  /[^a-z0-9_-]/g,
                  "-"
                );

                return (
                  <tr
                    key={
                      log._id ||
                      log.id ||
                      `${log.timestamp || log.createdAt || "log"}-${index}`
                    }
                  >
                    <td className="logs-time">
                      {formatTime(log.timestamp || log.createdAt)}
                    </td>

                    <td>{log.source || log.service || "—"}</td>

                    <td>{log.eventType || log.event || "Event"}</td>

                    <td>
                      <span className={`logs-status status-${safeStatus}`}>
                        {status}
                      </span>
                    </td>

                    <td className="logs-message">
                      {log.message || log.description || "No message provided"}
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="logs-empty">
                    <FileText size={25} />
                    <strong>
                      {loading ? "Loading logs..." : "No matching logs"}
                    </strong>
                    <span>
                      {loading
                        ? "Waiting for the backend response."
                        : "Try another search or change the selected filter."}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="logs-footer">
          Showing {filteredLogs.length} of {safeLogs.length} log entries
        </div>
      </div>
    </section>
  );
}

export default Logs;
