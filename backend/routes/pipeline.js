
const express = require("express");
const jwt = require("jsonwebtoken");
const {
  CodePipelineClient,
  ListPipelineExecutionsCommand,
  GetPipelineStateCommand,
  StartPipelineExecutionCommand,
} = require("@aws-sdk/client-codepipeline");

const router = express.Router();

const client = new CodePipelineClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

const allowedPipelines = (
  process.env.CODEPIPELINE_NAMES ||
  "fyp-develop-pipeline,fyp-main-pipeline"
)
  .split(",")
  .map((name) => name.trim())
  .filter(Boolean);

function verifyLogin(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");

  if (!token || !process.env.JWT_SECRET) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function validatePipeline(req, res, next) {
  const name = req.query.name || req.body?.name || allowedPipelines[0];

  if (!allowedPipelines.includes(name)) {
    return res.status(400).json({ error: "Unknown pipeline name" });
  }

  req.pipelineName = name;
  next();
}

router.get("/", validatePipeline, async (req, res) => {
  try {
    const name = req.pipelineName;

    const [executionData, stateData] = await Promise.all([
      client.send(
        new ListPipelineExecutionsCommand({
          pipelineName: name,
          maxResults: 10,
        })
      ),
      client.send(new GetPipelineStateCommand({ name })),
    ]);

    const runs = (executionData.pipelineExecutionSummaries || []).map(
      (execution) => {
        const status = execution.status || "Not Started";

        return {
          id: execution.pipelineExecutionId,
          branch:
            execution.sourceRevisions?.[0]?.revisionSummary || "—",
          commit:
            execution.sourceRevisions?.[0]?.revisionId?.slice(0, 7) || "—",
          trigger: execution.trigger?.triggerType || "Unknown",
          status,
          duration:
            execution.startTime && execution.lastUpdateTime
              ? `${Math.max(
                  0,
                  Math.round(
                    (new Date(execution.lastUpdateTime) -
                      new Date(execution.startTime)) /
                      1000
                  )
                )} sec`
              : "—",
          time: execution.startTime
            ? new Date(execution.startTime).toLocaleString()
            : "—",
        };
      }
    );

    const latestStatus = runs[0]?.status || "Not Started";

    const stages = (stateData.stageStates || []).map((stage) => {
      const actionStatuses = (stage.actionStates || [])
        .map((action) => action.latestExecution?.status)
        .filter(Boolean);

      let status = "Pending";

      if (actionStatuses.some((value) => value === "Failed")) {
        status = "Failed";
      } else if (actionStatuses.some((value) => value === "InProgress")) {
        status = "Running";
      } else if (
        actionStatuses.length > 0 &&
        actionStatuses.every((value) => value === "Succeeded")
      ) {
        status = "Success";
      }

      return {
        name: stage.stageName,
        detail: "Live status reported by AWS CodePipeline",
        status,
      };
    });

    return res.json({
      name,
      status: latestStatus,
      stages,
      runs,
    });
  } catch (error) {
    console.error("Pipeline status failed:", {
  name: error.name,
  message: error.message,
  region: process.env.AWS_REGION || "ap-south-1",
  pipelines: allowedPipelines,
});

    return res.status(502).json({
      error: "Unable to retrieve AWS CodePipeline status",
      detail: error.name === "AccessDeniedException"
        ? "Check the backend IAM permissions."
        : "Check AWS credentials, region, pipeline name, and AWS logs.",
    });
  }
});

router.post("/run", verifyLogin, validatePipeline, async (req, res) => {
  try {
    const result = await client.send(
      new StartPipelineExecutionCommand({
        name: req.pipelineName,
      })
    );

    return res.status(202).json({
      message: "Pipeline execution requested",
      name: req.pipelineName,
      executionId: result.pipelineExecutionId,
    });
  } catch (error) {
    console.error("Pipeline start failed:", error.name, error.message);

    return res.status(502).json({
      error: "Unable to start AWS CodePipeline",
      detail: error.name === "AccessDeniedException"
        ? "The backend IAM role needs StartPipelineExecution permission."
        : error.message,
    });
  }
});

module.exports = router;
