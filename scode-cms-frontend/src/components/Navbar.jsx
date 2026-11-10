// src/components/Navbar.jsx
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.png"; // import your logo

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <img src={logo} alt="SCode Logo" style={styles.logo} />
        <span style={{ marginLeft: "0.5rem" }}>SCode CMS</span>
      </div>
      <div style={styles.links}>
        {user ? (
          <>
            <span style={styles.user}>Hello, {user.username}</span>
            <button style={styles.button} onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <a href="/login" style={styles.link}>
              Login
            </a>
            <a href="/register" style={styles.link}>
              Register
            </a>
          </>
        )}
      </div>
    </nav>
  );
};

// Inline styles (you can move to CSS later)
const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    backgroundColor: "#282c34",
    color: "#fff",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: "1.5rem",
  },
  logo: {
    width: "40px",
    height: "40px",
    objectFit: "contain",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  link: {
    color: "#61dafb",
    textDecoration: "none",
    fontWeight: "bold",
  },
  user: {
    marginRight: "1rem",
  },
  button: {
    padding: "0.3rem 0.8rem",
    cursor: "pointer",
    backgroundColor: "#61dafb",
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
  },
};

export default Navbar;
