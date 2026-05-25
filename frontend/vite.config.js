import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 5173,
    proxy: {
      "/logout":               { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/login": {
        target: "http://127.0.0.1:8002",
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes("text/html")) return "/index.html";
        }
      },
      "/forgot-password": {
        target: "http://127.0.0.1:8002",
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes("text/html")) return "/index.html";
        }
      },
      "/reset-password": {
        target: "http://127.0.0.1:8002",
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes("text/html")) return "/index.html";
        }
      },
      "/tpo": {
        target: "http://127.0.0.1:8002",
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes("text/html")) return "/index.html";
        }
      },
      "/hr": {
        target: "http://127.0.0.1:8002",
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes("text/html")) return "/index.html";
        }
      },
      "/rounds": {
        target: "http://127.0.0.1:8002",
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes("text/html")) return "/index.html";
        }
      },
      "/mock-interview": {
        target: "http://127.0.0.1:8002",
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes("text/html")) return "/index.html";
        }
      },
      "/upload-resume":        { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/resumes":              { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/students":             { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/companies":            { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/drives":               { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/applications":         { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/apply-dream-company":  { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/apply":                { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/results":              { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/offers":               { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/placed-students":      { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/student-offers":       { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/placement-strategy":   { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/whatif-simulator":     { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/rejection-analysis":   { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/dream-applications":   { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/dream-eligible-drives":{ target: "http://127.0.0.1:8002", changeOrigin: true },
      "/dream-company":        { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/voice-chat":           { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/resume-feedback":      { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/update-student":       { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/tpo-dashboard":        { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/student-dashboard":    { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/company-dashboard":    { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/dashboard-summary":    { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/dms":                  { target: "http://127.0.0.1:8002", changeOrigin: true },
    },
  },

  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          react:  ["react", "react-dom", "react-router-dom"],
          query:  ["@tanstack/react-query"],
          charts: ["recharts"],
          icons:  ["lucide-react"],
        },
      },
    },
  },
});
