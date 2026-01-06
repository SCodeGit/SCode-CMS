require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");

// Models
const Post = require("./models/Post");

// Routes
const authRoutes = require("./routes/auth");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is not defined in environment variables");
}

// Express app
const app = express();

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(helmet());

// ✅ CORS (SAFE + WORKS WITH LOGIN)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://scode-cms-frontend-hrs3.onrender.com"
    ],
    credentials: true
  })
);

// ===== ENSURE UPLOADS DIR EXISTS =====
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ===== STATIC FILES =====
app.use("/uploads", express.static(uploadDir));

// ===== FILE UPLOAD (MULTER) =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// ===== DATABASE =====
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });

// ===== AUTH MIDDLEWARE =====
const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token provided" });

  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ===== ROLE PERMISSION =====
const permit = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

// ===== ROUTES =====
app.use("/api/auth", authRoutes);

// ===== POSTS =====

// Create post
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
        siteCode: req.user.siteCode,
        file: req.file ? `/uploads/${req.file.filename}` : null
      });
      await post.save();
      res.status(201).json(post);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Get all posts (site-isolated)
app.get("/api/posts", auth, async (req, res) => {
  try {
    const posts = await Post.find({ siteCode: req.user.siteCode });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single post
app.get("/api/posts/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      siteCode: req.user.siteCode
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update post
app.put(
  "/api/posts/:id",
  auth,
  permit("admin", "editor"),
  async (req, res) => {
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
  }
);

// Delete post
app.delete(
  "/api/posts/:id",
  auth,
  permit("admin", "editor"),
  async (req, res) => {
    try {
      const post = await Post.findOneAndDelete({
        _id: req.params.id,
        siteCode: req.user.siteCode
      });
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.json({ message: "Post deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ===== START SERVER =====
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
