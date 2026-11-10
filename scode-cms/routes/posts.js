const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const router = express.Router();

const Post = require("../models/Post");
const auth = require("../middleware/auth");
const permit = require("../middleware/permit");

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

router.post("/", auth, permit("admin", "editor"), upload.single("file"), async (req, res) => {
  try {
    const { title, content, tags, published } = req.body;
    const post = new Post({
      title,
      content,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(",")) : [],
      published: published === "true" || published === true,
      file: req.file ? `/uploads/${req.file.filename}` : null,
      author: req.user.id,
      siteCode: req.user.siteCode
    });

    await post.save();
    res.status(201).json({ message: "Post created", post });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find({ siteCode: req.user.siteCode }).populate("author", "username email role");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, siteCode: req.user.siteCode }).populate("author", "username email role");
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", auth, permit("admin", "editor"), async (req, res) => {
  try {
    const { title, content, tags, published } = req.body;

    const updateData = {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : tags.split(",") }),
      ...(published !== undefined && { published: published === "true" || published === true })
    };

    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, siteCode: req.user.siteCode },
      updateData,
      { new: true }
    );

    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", auth, permit("admin", "editor"), async (req, res) => {
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
});

module.exports = router;
