import { defineConfig } from "@playwright/test";

// Assumes the API server (PORT=3001) and the Vite dev server (5173) are already
// running locally — start them with `pnpm dev` from the repo root before `pnpm e2e`.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: { baseURL: "http://localhost:5173", headless: true },
});
