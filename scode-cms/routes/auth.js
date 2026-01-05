const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// MANUAL client creation (by admin)
router.post("/create-client", async (req, res) => {
  try {
    const { username, email, password, role, siteCode } = req.body;

    // Optional: check if admin
    // if(req.user.role !== "admin") return res.status(403).json({error: "Forbidden"});

    const user = new User({ username, email, password, role, siteCode });
    await user.save();

    res.status(201).json({
      message: "Client created",
      user: { id: user._id, username, email, role, siteCode }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role, siteCode: user.siteCode },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", token, siteCode: user.siteCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
