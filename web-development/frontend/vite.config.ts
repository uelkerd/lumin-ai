import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Set up any path aliases you might need
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000, // Same port as CRA for consistency
  },
  build: {
    outDir: "build", // Same output directory as CRA for consistency
  },
});
