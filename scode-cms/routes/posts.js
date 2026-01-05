const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const auth = require("../middleware/auth"); // your auth middleware
const permit = require("../middleware/permit"); // your permit middleware
const multer = require("multer");
const path = require("path");

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + Date.now() + ext);
  }
});
const upload = multer({ storage });

// CREATE POST
router.post("/", auth, permit("admin","editor"), upload.single("file"), async (req,res)=>{
  try {
    const { title, content, tags, published } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const post = new Post({
      title, content, tags, published, file: fileUrl,
      author: req.user.id,
      siteCode: req.user.siteCode // LOCK TO SITE
    });

    await post.save();
    res.status(201).json({ message: "Post created", post });
  } catch(err){
    res.status(400).json({error: err.message});
  }
});

// GET ALL POSTS FOR THIS SITE
router.get("/", auth, async (req,res)=>{
  try {
    const posts = await Post.find({ siteCode: req.user.siteCode }).populate("author","username email role");
    res.json(posts);
  } catch(err){
    res.status(500).json({error: err.message});
  }
});

// UPDATE & DELETE same logic: only affect posts with req.user.siteCode

module.exports = router;
