const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

const router = express.Router();

function createToken(user) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
  }

  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "8h", issuer: "sentinelops-api", audience: "sentinelops-web" }
  );
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}

function requireAuth(req, res, next) {
  const header = req.get("authorization") || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Sign in to continue." });
  }

  try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "sentinelops-api",
      audience: "sentinelops-web",
    });
    return next();
  } catch {
    return res.status(401).json({ error: "Your session expired. Please sign in again." });
  }
}

router.post("/signup", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({ error: "Name must be between 2 and 80 characters." });
    }
    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({ error: "Enter a valid email address." });
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ error: "Password must be 8–128 characters long." });
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    const token = createToken(user);

    return res.status(201).json({ message: "Account created.", token, user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }
    console.error("Signup failed:", error.message);
    return res.status(500).json({ error: "Could not create account." });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = createToken(user);
    return res.json({ message: "Signed in.", token, user: publicUser(user) });
  } catch (error) {
    console.error("Signin failed:", error.message);
    return res.status(500).json({ error: "Could not sign in." });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.auth.sub)) {
      return res.status(401).json({ error: "Invalid session." });
    }

    const user = await User.findById(req.auth.sub).lean();
    if (!user) {
      return res.status(401).json({ error: "Account no longer exists." });
    }

    return res.json({ user: publicUser(user) });
  } catch (error) {
    console.error("Session check failed:", error.message);
    return res.status(500).json({ error: "Could not validate session." });
  }
});

module.exports = router;
