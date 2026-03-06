import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://127.0.0.1:3005",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run build && npm run start -- --hostname 127.0.0.1 --port 3005",
    url: "http://127.0.0.1:3005",
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
  },
});
