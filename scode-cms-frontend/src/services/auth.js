// src/services/auth.js
import { API_BASE_URL } from "../config.js";

export async function login(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, { // remove extra /api
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  // store token and siteCode for auth
  localStorage.setItem("token", data.token);
  localStorage.setItem("siteCode", data.siteCode);

  return data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("siteCode");
  window.location.href = "/login";
}

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}
