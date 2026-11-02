
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");
require("dotenv").config();

// ==================== MODELS & SERVICES ====================
// Your current model filename is models/alert.js.
// Use the same Alert model in eventProcessor.js.

const Log = require("./models/Log");
const Metric = require("./models/Metric");
const Alert = require("./models/Alert");
const { processEvent } = require("./services/eventProcessor");

const app = express();
app.get("/api/test", (req, res) => {
  console.log("TEST ENDPOINT REACHED");
  res.json({ message: "Backend test successful" });
});
const PORT = Number(process.env.PORT) || 5000;



// ==================== MIDDLEWARE ====================

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

app.use(express.json({ limit: "100kb" }));

const ingestionLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// ==================== API KEY AUTHENTICATION ====================


function requireIngestionKey(req, res, next) {
  console.log("POST /api/events reached API-key middleware");

  const expected = process.env.INGEST_API_KEY;
  const supplied = req.get("x-api-key");

  console.log("API key configured:", Boolean(expected));
  console.log("API key received:", Boolean(supplied));
  console.log(
    "API key matches:",
    Boolean(expected && supplied && expected === supplied)
  );

  if (!expected || !supplied) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);

  if (
    expectedBuffer.length !== suppliedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)
  ) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return next();
}


// ==================== HEALTH CHECK ====================

app.get("/api/health", (req, res) => {
  return res.json({
    status: "ok",
    service: "cloud-security-api",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

// ==================== EVENT INGESTION ====================
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

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
        return res.status(400).json({ error: message });
      }

      console.error("Event processing failed:", message);

      return res.status(500).json({
        error: "Event processing failed",
      });
    }
  }
);

// ==================== DIRECT ML TEST ====================

app.post("/api/detect", async (req, res) => {
  try {
    const mlUrl =
      process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

    const response = await axios.post(
      `${mlUrl}/predict`,
      req.body,
      { timeout: 5000 }
    );

    return res.json(response.data);
  } catch (error) {
    console.error(
      "ML request failed:",
      error.response?.data || error.message
    );

    return res.status(502).json({
      error: "ML service unavailable",
      message: "Check that the Python ML service is running on port 8000.",
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

    return res.json({ count: logs.length, logs });
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

    return res.json({ count: metrics.length, metrics });
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

    alerts.sort(
      (a, b) =>
        (severityOrder[b.severity] || 0) -
          (severityOrder[a.severity] || 0) ||
        new Date(b.timestamp) - new Date(a.timestamp)
    );

    return res.json({ count: alerts.length, alerts });
  } catch (error) {
    console.error("Alerts query failed:", error.message);

    return res.status(500).json({
      error: "Could not fetch alerts",
    });
  }
});

// Update alert status.
app.patch("/api/alerts/:id/status", async (req, res) => {
  const allowedStatuses = ["open", "acknowledged", "resolved"];

  if (!allowedStatuses.includes(req.body.status)) {
    return res.status(400).json({
      error: "status must be open, acknowledged, or resolved",
    });
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid alert ID" });
  }

  try {
    const updatedAlert = await Alert.findByIdAndUpdate(
      req.params.id,
      { $set: { status: req.body.status } },
      { new: true, runValidators: true }
    );

    if (!updatedAlert) {
      return res.status(404).json({ error: "Alert not found" });
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
    throw new Error("MONGODB_URI is missing from backend/.env");
  }

  if (!process.env.INGEST_API_KEY) {
    throw new Error("INGEST_API_KEY is missing from backend/.env");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB Atlas connected successfully");

  app.listen(PORT, "127.0.0.1", () => {
    console.log(`Backend running at http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer().catch((error) => {
  console.error("Backend startup failed:", error.message);
  process.exit(1);
});
