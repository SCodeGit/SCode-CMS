require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");
const path = require("path");

const Post = require("./models/Post");

// 🔐 Routes
const authRoutes = require("./routes/auth");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Create app
const app = express();

// ===== MIDDLEWARE =====
app.use(bodyParser.json());
app.use(cors({
  origin: "*",
  credentials: true
}));
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
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

const permit = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

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
        file: req.file ? `/uploads/${req.file.filename}` : null
      });
      await post.save();
      res.status(201).json(post);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Read all
app.get("/api/posts", auth, async (req, res) => {
  const posts = await Post.find().populate("author", "email role");
  res.json(posts);
});

// Update
app.put("/api/posts/:id", auth, permit("admin","editor"), async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(post);
});

// Delete
app.delete("/api/posts/:id", auth, permit("admin","editor"), async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// ===== START SERVER =====
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
