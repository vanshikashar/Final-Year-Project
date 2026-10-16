
const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, index: true },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Log",
    default: null
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "low"
  },
  detectionType: {
    type: String,
    enum: ["rule", "ml", "combined"],
    required: true
  },
  recommendation: { type: String, required: true },
  evidence: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: {
    type: String,
    enum: ["open", "acknowledged", "resolved"],
    default: "open"
  }
}, { timestamps: true, collection: "alerts" });

module.exports = mongoose.model("Alert", alertSchema);
