import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: "./",
  publicDir:
    mode === "review-phase2"
      ? ".local-review-phase2-8/public"
      : mode === "review"
        ? ".local-review/public"
        : "public",
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
  },
}));

