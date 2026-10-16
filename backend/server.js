const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/auth");
const crypto = require("crypto");
require("dotenv").config();

// ==================== MODELS & SERVICES ====================

const Log = require("./models/Log");
const Metric = require("./models/Metric");
const Alert = require("./models/Alert");
const { processEvent } = require("./services/eventProcessor");

const app = express();

const PORT = Number(process.env.PORT) || 5000;

const ML_SERVICE_URL = (
  process.env.ML_SERVICE_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

// ==================== MIDDLEWARE ====================

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

app.use(express.json({ limit: "100kb" }));

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

const ingestionLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

app.use("/api/auth", authRoutes);

// ==================== API KEY AUTHENTICATION ====================

function requireIngestionKey(req, res, next) {
  const expected = process.env.INGEST_API_KEY;
  const supplied = req.get("x-api-key");

  if (!expected || !supplied) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);

  if (
    expectedBuffer.length !== suppliedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)
  ) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  return next();
}

// ==================== BASIC ROUTES ====================

app.get("/", (req, res) => {
  return res.json({
    status: "ok",
    service: "cloud-security-api",
  });
});

app.get("/api/test", (req, res) => {
  return res.json({
    message: "Backend test successful",
  });
});

// ==================== HEALTH CHECK ====================

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "cloud-security-api",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

// ==================== ML HEALTH CHECK ====================

app.get("/api/ml-health", async (req, res) => {
  try {
    const healthUrl = ML_SERVICE_URL + "/health";

    const response = await axios.get(healthUrl, {
      timeout: 5000,
    });

    return res.status(200).json({
      status: "ok",
      service: "ml-service",
      mlService: response.data,
    });
  } catch (error) {
    console.error("ML health check failed:", error.message);
    console.error("Error code:", error.code);
    console.error("HTTP status:", error.response?.status);
    console.error("Response data:", error.response?.data);

    return res.status(502).json({
      status: "error",
      service: "ml-service",
      message: "The backend could not reach the ML health endpoint.",
      code: error.code || null,
    });
  }
});

// ==================== EVENT INGESTION ====================

app.post(
  "/api/events",
  ingestionLimiter,
  requireIngestionKey,
  async (req, res) => {
    try {
      const result = await processEvent(req.body);

      return res.status(201).json({
        message: "Event processed",
        eventId: result.log._id,
        ml: result.ml,
        alertCount: result.alerts.length,
        alerts: result.alerts,
      });
    } catch (error) {
      const message = error.message || "";

      if (
        error.name === "ValidationError" ||
        error.name === "CastError" ||
        message.startsWith("Invalid ") ||
        message.startsWith("source") ||
        message.startsWith("metrics.") ||
        message.includes("required") ||
        message.includes("allowed lengths") ||
        message.includes("must be between")
      ) {
        return res.status(400).json({
          error: message,
        });
      }

      console.error("Event processing failed:", message);

      return res.status(500).json({
        error: "Event processing failed",
      });
    }
  }
);

// ==================== DIRECT ML PREDICTION ====================

app.post("/api/detect", async (req, res) => {
  try {
    console.log("Calling ML service at:", ML_SERVICE_URL + "/predict");

    const response = await axios.post(
      ML_SERVICE_URL + "/predict",
      req.body,
      {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("ML prediction request failed:", error.message);
    console.error("Error code:", error.code);
    console.error("HTTP status:", error.response?.status);
    console.error("Response data:", error.response?.data);

    if (error.response) {
      return res.status(502).json({
        error: "ML service returned an error",
        mlStatus: error.response.status,
        details: error.response.data,
      });
    }

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        error: "ML service request timed out",
      });
    }

    return res.status(502).json({
      error: "ML service unavailable",
      message:
        "Could not connect to the ML service. Check its URL and whether it is running.",
      code: error.code || null,
    });
  }
});

// ==================== LOGS API ====================

app.get("/api/logs", async (req, res) => {
  try {
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 20)
    );

    const logs = await Log.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return res.json({
      count: logs.length,
      logs: logs,
    });
  } catch (error) {
    console.error("Logs query failed:", error.message);

    return res.status(500).json({
      error: "Could not fetch logs",
    });
  }
});

// ==================== METRICS API ====================

app.get("/api/metrics", async (req, res) => {
  try {
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 20)
    );

    const metrics = await Metric.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return res.json({
      count: metrics.length,
      metrics: metrics,
    });
  } catch (error) {
    console.error("Metrics query failed:", error.message);

    return res.status(500).json({
      error: "Could not fetch metrics",
    });
  }
});

// ==================== ALERTS API ====================

app.get("/api/alerts", async (req, res) => {
  try {
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 20)
    );

    const severityOrder = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    const alerts = await Alert.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    alerts.sort((a, b) => {
      const severityDifference =
        (severityOrder[b.severity] || 0) -
        (severityOrder[a.severity] || 0);

      if (severityDifference !== 0) {
        return severityDifference;
      }

      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    return res.json({
      count: alerts.length,
      alerts: alerts,
    });
  } catch (error) {
    console.error("Alerts query failed:", error.message);

    return res.status(500).json({
      error: "Could not fetch alerts",
    });
  }
});

// ==================== UPDATE ALERT STATUS ====================

app.patch("/api/alerts/:id/status", async (req, res) => {
  const allowedStatuses = ["open", "acknowledged", "resolved"];

  if (!allowedStatuses.includes(req.body.status)) {
    return res.status(400).json({
      error: "status must be open, acknowledged, or resolved",
    });
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      error: "Invalid alert ID",
    });
  }

  try {
    const updatedAlert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: req.body.status,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedAlert) {
      return res.status(404).json({
        error: "Alert not found",
      });
    }

    return res.json({
      message: "Alert status updated",
      alert: updatedAlert,
    });
  } catch (error) {
    console.error("Alert update failed:", error.message);

    return res.status(500).json({
      error: "Could not update alert",
    });
  }
});

// ==================== SERVER STARTUP ====================

async function startServer() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  if (!process.env.INGEST_API_KEY) {
    throw new Error("INGEST_API_KEY is missing");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  console.log("MongoDB Atlas connected successfully");
  console.log("ML service URL:", ML_SERVICE_URL);

  app.listen(PORT, "0.0.0.0", () => {
    console.log("Backend running on port " + PORT);
  });
}

startServer().catch((error) => {
  console.error("Backend startup failed:", error.message);
  process.exit(1);
});