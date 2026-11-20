// Behaviour, keyboard and accessibility tests in real Chromium. The web server step bundles the fixture harness from
// the current source first, so `npx playwright test` never runs against a stale build.
import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PW_E2E_PORT || 4317);
export default defineConfig({
  testDir: "test/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    ...devices["Desktop Chrome"],
    locale: "en-US",
    timezoneId: "UTC",
    trace: "off",
  },
  webServer: { command: "node test/e2e/build-harness.mjs && node test/e2e/serve.mjs", env: { PORT: String(PORT) }, url: `http://127.0.0.1:${PORT}/package.json`, reuseExistingServer: !process.env.CI },
});
