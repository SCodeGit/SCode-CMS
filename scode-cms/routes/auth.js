 const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/* =========================
   REGISTER
========================= */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role, siteCode } = req.body;

    if (!siteCode) {
      return res.status(400).json({ error: "Site code required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const user = new User({
      username,
      email,
      password,
      role,
      siteCode
    });

    await user.save();

    res.status(201).json({
      message: "User registered",
      user: {
        email: user.email,
        role: user.role,
        siteCode: user.siteCode
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   LOGIN
========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password, siteCode } = req.body;

    const user = await User.findOne({ email, siteCode });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials or site code" });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        siteCode: user.siteCode
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        role: user.role,
        siteCode: user.siteCode
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
