import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig(({ command, mode }) => {
  if (command === "build" && (mode === "staging" || mode === "review")) {
    throw new Error("LOCAL_REVIEW_OR_STAGING_BUILD_FORBIDDEN");
  }

  return {
    plugins: [react()],
    base: "./",
    // Mock builds are hermetic. DTO builds expose only the directory already
    // guarded by the P0 public-content and artifact scanners. Local review and
    // staging data are served only by the local dev server from ignored
    // directories and are never eligible for a production build.
    publicDir:
      mode === "dto"
        ? "public"
        : mode === "review"
          ? ".local-review/public"
          : mode === "staging"
            ? ".local-staging/public"
            : false,
    test: {
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts",
      css: true,
    },
  };
});
