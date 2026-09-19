import { defineConfig, devices } from "@playwright/test";

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
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // Real WebKit with a phone user agent, touch and the iPhone
      // viewport: the class of bug the iOS simulator pass found
      // (design-qa-ios.md) is invisible to Chromium viewport emulation.
      // The performance spec drives CDP and stays Chromium-only.
      name: "iphone-webkit",
      use: { ...devices["iPhone 15"] },
      testMatch: [
        /monza-v2-responsive\.spec\.ts/,
        /monza-v2-preferences-and-marks\.spec\.ts/,
        /monza-v2-flow\.spec\.ts/,
        /launch-press-start\.spec\.ts/,
        /ios-regressions\.spec\.ts/,
      ],
    },
  ],
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
