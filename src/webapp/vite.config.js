import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    fs: {
      allow: [path.resolve(__dirname, "..")],
    },
    proxy: {
      "/stores": "http://localhost:3000",
      "/auth": "http://localhost:3000",
      "/lists": "http://localhost:3000",
      "/health": "http://localhost:3000",
      "/analytics": "http://localhost:3000",
    },
  },
});
