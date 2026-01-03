// src/pages/Dashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import { getPosts } from "../api/api";
import { AuthContext } from "../context/AuthContext";
import PostCard from "../components/PostCard";

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPosts(token);
        if (data.error) {
          setError(data.error);
        } else {
          setPosts(data);
        }
      } catch (err) {
        setError("Failed to fetch posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [token]);

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="dashboard-page">
      <h2>Dashboard</h2>
      <div className="posts-grid">
        {posts.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        )}
      </div>
    </div>
  );
};

export default Dashboard;
