
const express = require("express");
const mongoose = require("mongoose");
const Alert = require("../models/Alert");

const router = express.Router();

// GET /api/alerts
// Retrieve the latest 100 alerts.
router.get("/", async (req, res) => {
  try {
    const alerts = await Alert.find()
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error("Fetch alerts error:", error.message);

    return res.status(500).json({
      success: false,
      error: "Failed to fetch alerts",
    });
  }
});

// GET /api/alerts/:id
// Retrieve one alert by MongoDB ID.
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid alert ID",
      });
    }

    const alert = await Alert.findById(req.params.id).lean();

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: "Alert not found",
      });
    }

    return res.status(200).json({
      success: true,
      alert,
    });
  } catch (error) {
    console.error("Fetch alert error:", error.message);

    return res.status(500).json({
      success: false,
      error: "Failed to fetch alert",
    });
  }
});

// PATCH /api/alerts/:id/status
// Update an alert's status.
router.patch("/:id/status", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid alert ID",
      });
    }

    const allowedStatuses = ["open", "acknowledged", "resolved"];
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Status must be open, acknowledged, or resolved",
      });
    }

    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: "Alert not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Alert status updated",
      alert,
    });
  } catch (error) {
    console.error("Update alert error:", error.message);

    return res.status(500).json({
      success: false,
      error: "Failed to update alert status",
    });
  }
});

module.exports = router;
