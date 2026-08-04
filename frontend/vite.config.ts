import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig(({ command, mode }) => {
  if (command === "build" && mode === "review") {
    throw new Error("LOCAL_REVIEW_BUILD_FORBIDDEN");
  }

  return {
    plugins: [react()],
    base: "./",
    // Mock builds are hermetic. DTO builds expose only the directory already
    // guarded by the P0 public-content and artifact scanners. Local review
    // data is served only by the local dev server from an ignored directory
    // and is never eligible for a production build.
    publicDir:
      mode === "dto"
        ? "public"
        : mode === "review"
          ? ".local-review/public"
          : false,
    test: {
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts",
      css: true,
    },
  };
});
