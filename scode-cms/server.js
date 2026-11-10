require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");

const authRoutes = require("./routes/auth");
const postsRoutes = require("./routes/posts");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URLS = (process.env.FRONTEND_URL || "")
  .split(",")
  .map(url => url.trim())
  .filter(Boolean);

if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is not defined in environment variables");
}

if (!MONGO_URI) {
  throw new Error("❌ MONGO_URI is not defined in environment variables");
}

const app = express();
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, "uploads");
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  ...FRONTEND_URLS
];

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadDir));

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "scode-cms" });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Universal CMS API is running",
    features: ["auth", "roles", "siteCode isolation", "file uploads"]
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
