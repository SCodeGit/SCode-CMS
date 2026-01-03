// src/components/PostCard.jsx
import React from "react";
import "../assets/styles.css"; // optional for styling
import { format } from "date-fns"; // optional utility for formatting dates

const PostCard = ({ post }) => {
  return (
    <div className="post-card">
      <h2 className="post-title">{post.title}</h2>

      <div className="post-meta">
        <span>By: {post.author?.username || "Unknown"}</span>
        <span>
          {post.createdAt
            ? format(new Date(post.createdAt), "PPP p")
            : ""}
        </span>
      </div>

      <p className="post-content">{post.content}</p>

      {post.tags && post.tags.length > 0 && (
        <div className="post-tags">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {post.file && (
        <div className="post-file">
          <a href={post.file} target="_blank" rel="noopener noreferrer">
            View Attachment
          </a>
        </div>
      )}

      <div className="post-status">
        Status: {post.published ? "Published ✅" : "Draft ❌"}
      </div>
    </div>
  );
};

export default PostCard;
