
const axios = require("axios");
const Log = require("../models/Log");
const Metric = require("../models/Metric");
const Alert = require("../models/Alert");

const WINDOW_MS =
  Math.max(1, Number(process.env.WINDOW_SECONDS) || 60) * 1000;

const FAILED_THRESHOLD =
  Math.max(1, Number(process.env.FAILED_LOGIN_THRESHOLD) || 5);

const TRAFFIC_THRESHOLD =
  Math.max(1, Number(process.env.TRAFFIC_THRESHOLD) || 100);

// In-memory frequency maps for the first local version.
// For production or multiple backend instances, use a shared store.
const failedLoginEvents = new Map();
const requestEvents = new Map();

function pruneWindow(map, key, now) {
  const events = (map.get(key) || [])
    .filter((time) => now - time < WINDOW_MS);

  map.set(key, events);
  return events;
}

function normalizeEvent(input) {
  const timestamp = input.timestamp
    ? new Date(input.timestamp)
    : new Date();

  if (Number.isNaN(timestamp.getTime())) {
    throw new Error("Invalid timestamp");
  }

  const source = String(input.source || "application").trim();
  const eventType = String(input.eventType || "").trim().toLowerCase();
  const status = String(input.status || "").trim().toLowerCase();
  const sourceIp = input.sourceIp
    ? String(input.sourceIp).trim()
    : null;
  const message = String(input.message || "");

  if (!source || !eventType || !status) {
    throw new Error("source, eventType, and status are required");
  }

  if (source.length > 100 || eventType.length > 80 ||
      status.length > 40 || message.length > 2000) {
    throw new Error("Event fields exceed allowed lengths");
  }

  if (sourceIp && sourceIp.length > 64) {
    throw new Error("sourceIp is too long");
  }

  const raw = input.metrics || {};
  const metrics = {
    cpu: raw.cpu ?? 0,
    memory: raw.memory ?? 0,
    request_count: raw.request_count ?? 0,
    failed_logins: raw.failed_logins ?? 0,
    network_traffic: raw.network_traffic ?? 0,
    error_count: raw.error_count ?? 0
  };

  for (const [key, value] of Object.entries(metrics)) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new Error(`metrics.${key} must be a non-negative number`);
    }
  }

  if (metrics.cpu > 100 || metrics.memory > 100) {
    throw new Error("CPU and memory must be between 0 and 100");
  }

  return {
    timestamp,
    source,
    eventType,
    status,
    sourceIp,
    message,
    metrics
  };
}

async function createAlert(data) {
  return Alert.create(data);
}

async function processEvent(input) {
  const event = normalizeEvent(input);

  // 1. Persist the normalized event.
  const log = await Log.create(event);

  // 2. Persist a metrics snapshot.
  await Metric.create({
    timestamp: event.timestamp,
    source: event.source,
    ...event.metrics
  });

  const now = Date.now();
  const rules = [];
  const ip = event.sourceIp || "unknown";

  // 3. Failed-login frequency counting + sliding window.
  if (
    event.eventType === "failed_login" ||
    event.eventType === "login_failure" ||
    (event.eventType === "login" && event.status === "failed")
  ) {
    const times = failedLoginEvents.get(ip) || [];
    times.push(now);
    failedLoginEvents.set(ip, times);

    const recent = pruneWindow(failedLoginEvents, ip, now);

    if (recent.length >= FAILED_THRESHOLD) {
      rules.push({
        title: "Repeated failed login attempts",
        message: `${recent.length} failed logins from ${ip} within the configured window.`,
        severity: recent.length >= FAILED_THRESHOLD * 2 ? "critical" : "high",
        recommendation: "Review authentication logs and apply appropriate account or source-IP protections.",
        evidence: {
          sourceIp: ip,
          count: recent.length,
          windowSeconds: WINDOW_MS / 1000
        }
      });
    }
  }

  // 4. Request-rate sliding window.
  if (event.eventType === "request") {
    const times = requestEvents.get(ip) || [];
    times.push(now);
    requestEvents.set(ip, times);

    const recent = pruneWindow(requestEvents, ip, now);
    const configuredThreshold = TRAFFIC_THRESHOLD;

    if (recent.length >= configuredThreshold) {
      rules.push({
        title: "Request-rate spike",
        message: `${recent.length} requests from ${ip} within the configured window.`,
        severity: "high",
        recommendation: "Inspect request patterns, access logs, and rate-limit signals before blocking traffic.",
        evidence: {
          sourceIp: ip,
          count: recent.length,
          windowSeconds: WINDOW_MS / 1000
        }
      });
    }
  }

  // 5. Independent metric-based security rules.
  if (event.metrics.failed_logins >= FAILED_THRESHOLD) {
    rules.push({
      title: "High failed-login metric",
      message: `The reported failed-login count is ${event.metrics.failed_logins}.`,
      severity: event.metrics.failed_logins >= FAILED_THRESHOLD * 2
        ? "critical" : "high",
      recommendation: "Investigate the relevant authentication events and validate the reporting window.",
      evidence: event.metrics
    });
  }

  if (event.metrics.cpu >= 90 || event.metrics.memory >= 90) {
    rules.push({
      title: "High resource utilization",
      message: "CPU or memory usage has reached at least 90%.",
      severity: "medium",
      recommendation: "Inspect system load, running processes, and recent deployment changes.",
      evidence: event.metrics
    });
  }

  if (event.metrics.error_count >= 10) {
    rules.push({
      title: "Elevated application errors",
      message: `The event reports ${event.metrics.error_count} errors.`,
      severity: "medium",
      recommendation: "Inspect application logs, error types, and recent releases.",
      evidence: event.metrics
    });
  }

  // 6. Call the Python ML service.
  let mlResult = null;

  try {
    const mlUrl =
      process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

    const response = await axios.post(
      `${mlUrl}/predict`,
      event.metrics,
      { timeout: 5000 }
    );

    mlResult = response.data;
  } catch (error) {
    // The event remains stored even if ML is temporarily unavailable.
    console.error("ML prediction unavailable:", error.message);
  }

  const createdAlerts = [];

  // 7. Persist independent rule alerts.
  for (const rule of rules) {
    createdAlerts.push(await createAlert({
      eventId: log._id,
      ...rule,
      detectionType: "rule"
    }));
  }

  // 8. Persist an ML alert if the model flags an anomaly.
  if (mlResult?.is_anomaly) {
    createdAlerts.push(await createAlert({
      eventId: log._id,
      title: "ML-detected anomaly",
      message: "The Isolation Forest model classified the submitted metrics as anomalous.",
      severity: mlResult.severity || "medium",
      detectionType: "ml",
      recommendation: mlResult.recommendation || "Review the event and supporting metrics.",
      evidence: {
        score: mlResult.score,
        metrics: event.metrics
      }
    }));
  }

  return {
    log,
    ml: mlResult,
    alerts: createdAlerts
  };
}

module.exports = { processEvent };
