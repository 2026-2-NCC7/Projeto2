import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    fs: { allow: [path.resolve(__dirname, "..")] },
    proxy: {
      "/auth": "http://localhost:3000",
      "/health": "http://localhost:3000",
      "/admin": "http://localhost:3000",
      "/analytics": "http://localhost:3000",
      "/stores": "http://localhost:3000",
    },
  },
});
