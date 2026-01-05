const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true, minlength: 5, maxlength: 200 },
  content: { type: String, required: true, minlength: 20 },
  tags: { 
    type: [String], 
    default: [], 
    set: tags => tags.map(tag => tag.toLowerCase()) 
  },
  published: { type: Boolean, default: false },
  publishedAt: { type: Date, default: null },
  file: { type: String, default: null },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  siteCode: { type: String, required: true },
  deleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Post", PostSchema);
