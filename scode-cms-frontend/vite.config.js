// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allows external hosts
  },
  preview: {
    allowedHosts: ["scode-cms-frontend-hrs3.onrender.com"]
  }
});
