
import { useMemo, useState } from "react";
import { Search, RefreshCw, FileText } from "lucide-react";

function Logs({ logs = [], loading = false, onRefresh }) {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return logs.filter((log) => {
      const message = String(log.message || "");
      const source = String(log.source || log.service || "");
      const event = String(log.eventType || log.event || "");
      const status = String(log.status || "");
      const text = `${message} ${source} ${event} ${status}`.toLowerCase();

      const matchesSearch = !query || text.includes(query);

      const failed =
        status.toLowerCase() === "failed" ||
        status.toLowerCase() === "error" ||
        event.toLowerCase().includes("error") ||
        event.toLowerCase().includes("failed") ||
        Number(log.metrics?.error_count ?? log.metrics?.errorCount ?? 0) > 0;

      const matchesLevel =
        level === "all" ||
        (level === "error" && failed) ||
        (level === "success" && status.toLowerCase() === "success") ||
        (level === "failed" && status.toLowerCase() === "failed");

      return matchesSearch && matchesLevel;
    });
  }, [logs, search, level]);

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
          <span className="dashboard-eyebrow">SYSTEM ACTIVITY</span>
          <h1>Application Logs</h1>
          <p>Search and review events returned by your backend.</p>
        </div>

        <button
          type="button"
          className="logs-refresh-button"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw size={16} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="logs-summary">
        <div>
          <span>Total logs</span>
          <strong>{logs.length}</strong>
        </div>
        <div>
          <span>Failed events</span>
          <strong>
            {logs.filter(
              (log) => String(log.status || "").toLowerCase() === "failed"
            ).length}
          </strong>
        </div>
        <div>
          <span>Displayed</span>
          <strong>{filteredLogs.length}</strong>
        </div>
      </div>

      <div className="logs-panel">
        <div className="logs-toolbar">
          <div className="logs-search">
            <Search size={17} />
            <input
              type="search"
              placeholder="Search message, source, or event..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

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
                const status = String(log.status || "unknown").toLowerCase();

                return (
                  <tr key={log._id || log.id || `${log.timestamp}-${index}`}>
                    <td className="logs-time">
                      {formatTime(log.timestamp || log.createdAt)}
                    </td>
                    <td>{log.source || log.service || "—"}</td>
                    <td>{log.eventType || log.event || "Event"}</td>
                    <td>
                      <span className={`logs-status status-${status}`}>
                        {status}
                      </span>
                    </td>
                    <td className="logs-message">
                      {log.message || "No message provided"}
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="logs-empty">
                    <FileText size={25} />
                    <strong>No matching logs</strong>
                    <span>
                      Try another search or change the selected filter.
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="logs-footer">
          Showing {filteredLogs.length} of {logs.length} log entries
        </div>
      </div>
    </section>
  );
}

export default Logs;
