import { API_BASE_URL } from "../config.js";

// Helper function for GET requests
export const getRequest = async (endpoint, token) => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });
  return res.json();
};

// Helper function for POST requests (JSON)
export const postRequest = async (endpoint, data, token) => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

// Helper function for POST requests (FormData / file uploads)
export const postFormRequest = async (endpoint, formData, token) => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }) // no content-type, browser sets it automatically
    },
    body: formData
  });
  return res.json();
};

// ===== AUTH =====
export const loginUser = (credentials) => postRequest("/auth/login", credentials);
export const registerUser = (data) => postRequest("/auth/register", data);

// ===== POSTS =====
export const getPosts = (token) => getRequest("/posts", token);
export const getPost = (id, token) => getRequest(`/posts/${id}`, token);

// Create post (supports file upload)
export const createPost = (data, token) => {
  if (data.file) {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    return postFormRequest("/posts", formData, token);
  } else {
    return postRequest("/posts", data, token);
  }
};
