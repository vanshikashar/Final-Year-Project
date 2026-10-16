
const mongoose = require("mongoose");

const metricSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true, index: true },
  source: { type: String, required: true },
  cpu: { type: Number, min: 0, max: 100 },
  memory: { type: Number, min: 0, max: 100 },
  request_count: { type: Number, min: 0 },
  failed_logins: { type: Number, min: 0 },
  network_traffic: { type: Number, min: 0 },
  error_count: { type: Number, min: 0 }
}, { timestamps: true, collection: "metrics" });

module.exports = mongoose.model("Metric", metricSchema);
