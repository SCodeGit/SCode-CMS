require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const Post = require("./models/Post");
const User = require("./models/User");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer config for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // save in uploads folder
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = file.fieldname + "-" + Date.now() + ext;
        cb(null, name);
    }
});
const upload = multer({ storage });

// Connect to MongoDB Atlas
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.log("❌ MongoDB connection error:", err));

console.log("SCode CMS backend starting...");

// ===== AUTH MIDDLEWARE =====
const auth = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

const permit = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
    next();
};

// ===== AUTH ROUTES =====

// Register
app.post("/api/auth/register", async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const user = new User({ username, email, password, role });
        await user.save();
        res.status(201).json({ 
            message: "User registered", 
            user: { id: user._id, username, email, role } 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ error: "Invalid password" });

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || "secretkey", 
            { expiresIn: "1d" }
        );
        res.json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== POST ROUTES =====

// Create a new post → only admin or editor, optional file upload
app.post("/api/posts", auth, permit("admin","editor"), upload.single("file"), async (req, res) => {
    try {
        const { title, content, tags, published } = req.body;
        const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
        const post = new Post({ title, content, tags, published, author: req.user.id, file: fileUrl });
        await post.save();
        res.status(201).json({ message: "Post created", post });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all posts → all logged-in users can view
app.get("/api/posts", auth, async (req, res) => {
    try {
        const posts = await Post.find().populate("author", "username email role");
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single post → all logged-in users can view
app.get("/api/posts/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate("author", "username email role");
        if (!post) return res.status(404).json({ error: "Post not found" });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update post → only admin or editor
app.put("/api/posts/:id", auth, permit("admin","editor"), async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!post) return res.status(404).json({ error: "Post not found" });
        res.json({ message: "Post updated", post });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete post → only admin or editor
app.delete("/api/posts/:id", auth, permit("admin","editor"), async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });
        res.json({ message: "Post deleted", post });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Start server on all interfaces
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
