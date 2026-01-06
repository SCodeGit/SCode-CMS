// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { logout } from "../services/auth";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/posts")
      .then(setPosts)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>My Site Content</h2>
      <button onClick={logout}>Logout</button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && posts.length === 0 && <p>No posts yet.</p>}

      {posts.map(p => (
        <div key={p._id}>
          <h3>{p.title}</h3>
          <p>{p.content}</p>
        </div>
      ))}
    </div>
  );
}
