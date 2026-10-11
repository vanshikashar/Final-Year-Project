
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      default: "unknown",
      trim: true,
    },
    sourceIp: {
      type: String,
      default: null,
      trim: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    metrics: {
      cpu: { type: Number, min: 0, max: 100 },
      memory: { type: Number, min: 0, max: 100 },
      request_count: { type: Number, min: 0 },
      failed_logins: { type: Number, min: 0 },
      network_traffic: { type: Number, min: 0 },
      error_count: { type: Number, min: 0 },
    },
  },
  {
    timestamps: true,
    collection: "logs",
  }
);

module.exports =
  mongoose.models.Log || mongoose.model("Log", logSchema);
