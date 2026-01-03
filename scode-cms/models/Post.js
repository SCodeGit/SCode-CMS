const mongoose = require("mongoose");

// Define the Post schema
const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },            // Post title
    content: { type: String, required: true },          // Post content
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Author reference
    tags: { type: [String], default: [] },             // Array of tags/labels
    published: { type: Boolean, default: false },      // Publish status, default is false
    file: { type: String, default: null },             // Optional uploaded file path
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Export the model
module.exports = mongoose.model("Post", PostSchema);
