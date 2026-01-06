// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { getPosts } from "../api/api";
import { logout } from "../services/auth";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      logout();
      return;
    }

    getPosts(token)
      .then(setPosts)
      .catch(err => setError(err.message || "Failed to load posts"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>My Site Content</h2>
        <button onClick={logout} style={{ padding: "5px 10px" }}>Logout</button>
      </header>

      {loading && <p>Loading posts...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && posts.length === 0 && <p>No posts yet.</p>}

      <div style={{ marginTop: "20px" }}>
        {posts.map(p => (
          <div key={p._id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px", borderRadius: "5px" }}>
            <h3>{p.title}</h3>
            <p>{p.content}</p>
            {p.file && (
              <a href={p.file} target="_blank" rel="noopener noreferrer">
                Download attachment
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
