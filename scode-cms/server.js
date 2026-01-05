require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");

// Models
const User = require("./models/User");
const Post = require("./models/Post");

// Routes (auth)
const authRoutes = require("./routes/auth");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Express app
const app = express();

// ===== MIDDLEWARE =====
app.use(bodyParser.json());
app.use(cors({ origin: "*", credentials: true }));
app.use(helmet());

// ===== STATIC FILES =====
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== FILE UPLOAD (MULTER) =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// ===== DATABASE =====
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ===== ROUTES =====
app.use("/api/auth", authRoutes);

// ===== AUTH MIDDLEWARE =====
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ===== ROLE PERMISSION =====
const permit = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
  next();
};

// ===== POSTS =====

// Create post (locked to user's siteCode)
app.post(
  "/api/posts",
  auth,
  permit("admin", "editor"),
  upload.single("file"),
  async (req, res) => {
    try {
      const post = new Post({
        ...req.body,
        author: req.user.id,
        siteCode: req.user.siteCode, // 🔑 lock to client site
        file: req.file ? `/uploads/${req.file.filename}` : null
      });
      await post.save();
      res.status(201).json(post);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Read all posts (only posts for user's site)
app.get("/api/posts", auth, async (req, res) => {
  try {
    const posts = await Post.find({ siteCode: req.user.siteCode }).populate("author", "email role siteCode");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read single post (locked to site)
app.get("/api/posts/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, siteCode: req.user.siteCode });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update post
app.put("/api/posts/:id", auth, permit("admin","editor"), async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, siteCode: req.user.siteCode },
      req.body,
      { new: true }
    );
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete post
app.delete("/api/posts/:id", auth, permit("admin","editor"), async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, siteCode: req.user.siteCode });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({ message: "Post deleted", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== START SERVER =====
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
