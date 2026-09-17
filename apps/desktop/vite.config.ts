import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repoRoot = path.resolve(__dirname, "../..");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@cw/domain": path.resolve(repoRoot, "packages/domain/src"),
      "@cw/measurement": path.resolve(repoRoot, "packages/measurement/src"),
      "@cw/garments": path.resolve(repoRoot, "packages/garments/src"),
      "@cw/renderer": path.resolve(repoRoot, "packages/renderer/src"),
      "@cw/recommender": path.resolve(repoRoot, "packages/recommender/src"),
      "@cw/importer": path.resolve(repoRoot, "packages/importer/src"),
      "@cw/testing": path.resolve(repoRoot, "packages/testing/src")
    }
  },
  server: {
    host: "127.0.0.1",
    port: 1420,
    strictPort: true
  },
  clearScreen: false,
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    target: "es2020",
    minify: process.env.TAURI_DEBUG ? false : "esbuild",
    sourcemap: Boolean(process.env.TAURI_DEBUG)
  }
});
