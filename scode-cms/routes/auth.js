const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth"); // we'll create auth middleware separately if needed
const permit = require("../middleware/permit"); // same for roles

// ===== MANUAL CLIENT CREATION (ADMIN ONLY) =====
router.post("/create-client", auth, permit("admin"), async (req, res) => {
  try {
    const { username, email, password, role, siteCode } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already in use" });

    const user = new User({ username, email, password, role, siteCode });
    await user.save();

    res.status(201).json({
      message: "Client created successfully",
      user: { id: user._id, username, email, role, siteCode }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===== LOGIN =====
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid password" });

    // Sign JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, siteCode: user.siteCode },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, role: user.role, siteCode: user.siteCode }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
