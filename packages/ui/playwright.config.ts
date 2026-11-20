// Behaviour, keyboard and accessibility tests in real Chromium. `pnpm test:e2e` builds the fixture harness first.
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
  webServer: { command: "node test/e2e/serve.mjs", env: { PORT: String(PORT) }, url: `http://127.0.0.1:${PORT}/package.json`, reuseExistingServer: !process.env.CI },
});
