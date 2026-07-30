import { defineConfig } from "@playwright/test";

const remoteBaseURL = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: remoteBaseURL ?? "http://127.0.0.1:3005",
    trace: "on-first-retry",
  },
  webServer: remoteBaseURL
    ? undefined
    : {
        command:
          "npm run build && npm run start -- --hostname 127.0.0.1 --port 3005",
        url: "http://127.0.0.1:3005",
        timeout: 240_000,
        reuseExistingServer: !process.env.CI,
      },
});
