
import { useState } from "react";
import {
  GitBranch,
  Play,
  RefreshCw,
  CheckCircle2,
  Clock3,
  XCircle,
  Circle,
  Package,
  ShieldCheck,
  Container,
  Cloud,
  Rocket,
  Terminal,
  Activity,
} from "lucide-react";

const pipelineStages = [
  {
    name: "Clone Repository",
    detail: "Fetch source code from Git",
    icon: GitBranch,
  },
  {
    name: "Compile & Build",
    detail: "Compile application and dependencies",
    icon: Package,
  },
  {
    name: "Run Tests",
    detail: "Execute automated tests",
    icon: CheckCircle2,
  },
  {
    name: "Code Quality",
    detail: "Analyze code with SonarQube",
    icon: ShieldCheck,
  },
  {
    name: "Security Scan",
    detail: "Scan code and image with Trivy",
    icon: ShieldCheck,
  },
  {
    name: "Build Docker Image",
    detail: "Package application into a container",
    icon: Container,
  },
  {
    name: "Push Image",
    detail: "Publish image to container registry",
    icon: Package,
  },
  {
    name: "Infrastructure",
    detail: "Provision infrastructure using Terraform",
    icon: Cloud,
  },
  {
    name: "Deploy Application",
    detail: "Deploy application to the target environment",
    icon: Rocket,
  },
];

const initialRuns = [
  {
    id: "#PIPE-001",
    branch: "main",
    commit: "a81c9f2",
    trigger: "Manual",
    status: "Not Started",
    duration: "—",
    time: "Not run",
  },
];

const getStatusIcon = (status) => {
  if (status === "Success") return <CheckCircle2 size={16} />;
  if (status === "Running") return <RefreshCw size={16} />;
  if (status === "Failed") return <XCircle size={16} />;
  if (status === "Pending") return <Clock3 size={16} />;
  return <Circle size={16} />;
};

export default function Pipeline({
  onRunPipeline,
  onRefresh,
  loading = false,
  pipelineStatus = "Not Started",
  stages = [],
  runs,
}) {
  const [selectedRun, setSelectedRun] = useState(null);

  const hasStageData = Array.isArray(stages) && stages.length > 0;
  const displayedStages = hasStageData
    ? stages.map((stage, index) => ({
        ...pipelineStages[index],
        ...stage,
        name: stage.name || stage.stage || pipelineStages[index]?.name || `Stage ${index + 1}`,
        detail: stage.detail || stage.description || pipelineStages[index]?.detail || "",
      }))
    : pipelineStages;

  const displayedRuns = Array.isArray(runs) && runs.length > 0
    ? runs
    : initialRuns;

  const normalizedStatus = String(pipelineStatus).toLowerCase();

  const overallStatus =
    normalizedStatus.includes("success") || normalizedStatus.includes("passed")
      ? "Success"
      : normalizedStatus.includes("running") || normalizedStatus.includes("progress")
      ? "Running"
      : normalizedStatus.includes("fail") || normalizedStatus.includes("error")
      ? "Failed"
      : "Not Started";

  const handleRun = () => {
    if (onRunPipeline) {
      onRunPipeline();
    }
  };

  return (
    <section className="pipeline-page">
      <div className="pipeline-page-header">
        <div>
          <div className="pipeline-eyebrow">
            <GitBranch size={15} />
            CONTINUOUS INTEGRATION & DEPLOYMENT
          </div>

          <h1>DevOps Pipeline</h1>

          <p>
            Review CI/CD stages, code quality checks, security scans,
            and deployment activity.
          </p>
        </div>

        <div className="pipeline-header-actions">
          <button
            type="button"
            className="pipeline-refresh-button"
            onClick={onRefresh}
            disabled={loading || !onRefresh}
          >
            <RefreshCw
              size={16}
              className={loading ? "pipeline-spinning" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            className="pipeline-run-button"
            onClick={handleRun}
            disabled={loading || !onRunPipeline}
            title={
              onRunPipeline
                ? "Start a pipeline using your connected backend"
                : "Pipeline execution has not been connected yet"
            }
          >
            <Play size={16} />
            Run Pipeline
          </button>
        </div>
      </div>

      <div className="pipeline-summary-grid">
        <div className="pipeline-summary-card">
          <div className="pipeline-summary-icon pipeline-purple">
            <GitBranch size={20} />
          </div>
          <div>
            <span>Pipeline Stages</span>
            <strong>{displayedStages.length}</strong>
          </div>
        </div>

        <div className="pipeline-summary-card">
          <div className="pipeline-summary-icon pipeline-green">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span>Overall Status</span>
            <strong className={`pipeline-summary-status status-${overallStatus.toLowerCase().replace(" ", "-")}`}>
              {overallStatus}
            </strong>
          </div>
        </div>

        <div className="pipeline-summary-card">
          <div className="pipeline-summary-icon pipeline-blue">
            <Activity size={20} />
          </div>
          <div>
            <span>Pipeline Runs</span>
            <strong>{Array.isArray(runs) ? runs.length : 0}</strong>
          </div>
        </div>

        <div className="pipeline-summary-card">
          <div className="pipeline-summary-icon pipeline-orange">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span>Security Checks</span>
            <strong>Trivy + SonarQube</strong>
          </div>
        </div>
      </div>

      <div className="pipeline-section-card">
        <div className="pipeline-section-header">
          <div>
            <h2>Pipeline Workflow</h2>
            <p>
              {hasStageData
                ? "Stage information received from the application."
                : "Planned CI/CD workflow. Live execution status is not connected yet."}
            </p>
          </div>

          <span className={`pipeline-status-badge status-${overallStatus.toLowerCase().replace(" ", "-")}`}>
            {getStatusIcon(overallStatus)}
            {overallStatus}
          </span>
        </div>

        <div className="pipeline-stage-list">
          {displayedStages.map((stage, index) => {
            const stageStatus = String(stage.status || "Pending");
            const Icon = stage.icon || pipelineStages[index]?.icon || Terminal;
            const statusKey = stageStatus.toLowerCase().replace(/\s+/g, "-");

            return (
              <div className="pipeline-stage-row" key={stage.id || stage.name || index}>
                <div className="pipeline-stage-connector">
                  <div className={`pipeline-stage-icon stage-${statusKey}`}>
                    <Icon size={18} />
                  </div>
                  {index !== displayedStages.length - 1 && (
                    <div className={`pipeline-stage-line stage-line-${statusKey}`} />
                  )}
                </div>

                <div className="pipeline-stage-content">
                  <div className="pipeline-stage-title-row">
                    <h3>{stage.name}</h3>

                    <span className={`pipeline-stage-status status-${statusKey}`}>
                      {getStatusIcon(
                        ["success", "running", "failed", "pending"].includes(statusKey)
                          ? stageStatus
                          : "Pending"
                      )}
                      {stageStatus}
                    </span>
                  </div>

                  <p>{stage.detail}</p>

                  {stage.duration && (
                    <span className="pipeline-stage-duration">
                      <Clock3 size={13} />
                      {stage.duration}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!hasStageData && (
          <div className="pipeline-demo-note">
            <InfoIcon />
            <span>
              These stages describe the planned workflow; they do not confirm
              that a pipeline has executed or that a deployment has succeeded.
            </span>
          </div>
        )}
      </div>

      <div className="pipeline-section-card pipeline-runs-card">
        <div className="pipeline-section-header">
          <div>
            <h2>Recent Pipeline Runs</h2>
            <p>Execution history provided by your application, when available.</p>
          </div>
        </div>

        <div className="pipeline-runs-wrapper">
          <table className="pipeline-runs-table">
            <thead>
              <tr>
                <th>RUN ID</th>
                <th>BRANCH</th>
                <th>COMMIT</th>
                <th>TRIGGER</th>
                <th>STATUS</th>
                <th>DURATION</th>
                <th>TIME</th>
              </tr>
            </thead>

            <tbody>
              {displayedRuns.map((run, index) => {
                const status = run.status || "Not Started";
                const statusKey = String(status).toLowerCase().replace(/\s+/g, "-");

                return (
                  <tr
                    key={run.id || run._id || index}
                    onClick={() => setSelectedRun(run)}
                    className="pipeline-run-row"
                  >
                    <td className="pipeline-run-id">
                      {run.id || run._id || `#PIPE-${index + 1}`}
                    </td>
                    <td>{run.branch || "—"}</td>
                    <td>
                      <code>{run.commit || run.commitId || "—"}</code>
                    </td>
                    <td>{run.trigger || "—"}</td>
                    <td>
                      <span className={`pipeline-stage-status status-${statusKey}`}>
                        {getStatusIcon(status)}
                        {status}
                      </span>
                    </td>
                    <td>{run.duration || "—"}</td>
                    <td>{run.time || run.createdAt || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selectedRun && (
          <div className="pipeline-run-details">
            <div>
              <strong>
                Run details: {selectedRun.id || selectedRun._id || "Pipeline run"}
              </strong>
              <p>
                {selectedRun.message ||
                  selectedRun.description ||
                  "No additional run details are available."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedRun(null)}
              className="pipeline-close-details"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function InfoIcon() {
  return (
    <span className="pipeline-info-icon" aria-hidden="true">
      i
    </span>
  );
}
