// Components working together: overlays inside a modal (Escape closes one layer at a time, focus returns to the right
// place), a date range in a filter bar, and the demo app's real flows (command palette, bulk actions, forms).
import { test, expect } from "@playwright/test";
import { open } from "./helpers";

test("inside a Modal, Escape closes the open popover first, then the modal; focus returns each time", async ({ page }) => {
  await open(page, "integration");
  await page.getByRole("button", { name: "Schedule run" }).click();
  const modal = page.getByRole("dialog", { name: "Schedule a run" });
  const repo = modal.getByRole("combobox", { name: "Repository", exact: true });
  await repo.click();
  await expect(page.getByRole("combobox", { name: "Search repository" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(modal).toBeVisible();
  await expect(repo).toBeFocused();
  const runner = modal.getByRole("combobox", { name: "Runner" });
  await runner.focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("option", { name: "linux-large" })).toBeFocused();
  // Radix Select focuses its option one effect tick before it registers its dismiss layer; a person can't press Esc
  // inside that frame, but a test can.
  await page.waitForTimeout(50);
  await page.keyboard.press("Escape");
  await expect(modal).toBeVisible();
  await expect(runner).toBeFocused();
  await modal.getByRole("button", { name: "Choose run on on a calendar" }).click();
  await expect(page.getByRole("dialog", { name: "Run on: calendar" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Run on: calendar" })).toBeHidden();
  await expect(modal.getByRole("button", { name: "Choose run on on a calendar" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
  await expect(page.getByRole("button", { name: "Schedule run" })).toBeFocused();
});

test("popovers and tooltips inside a modal stack above it and stay usable", async ({ page }) => {
  await open(page, "integration");
  await page.getByRole("button", { name: "Schedule run" }).click();
  await page.getByRole("button", { name: "About scheduling" }).focus();
  await expect(page.getByRole("tooltip")).toHaveText("Runs at 02:00 in the repository's time zone");
  await page.getByRole("dialog", { name: "Schedule a run" }).getByRole("combobox", { name: "Repository", exact: true }).click();
  await page.getByRole("option", { name: "infra" }).click();
  await expect(page.getByRole("dialog", { name: "Schedule a run" }).getByRole("combobox", { name: "Repository", exact: true })).toHaveText(/infra/);
});

test("a DateRangePicker in a FilterBar applies a preset", async ({ page }) => {
  await open(page, "integration");
  await page.getByRole("search").getByRole("button", { name: "Run dates" }).click();
  await page.getByRole("button", { name: "First week" }).click();
  await expect(page.getByTestId("state")).toContainText('"range":{"from":"2026-11-01","to":"2026-11-07"}');
});

test.describe("the demo app", () => {
  const demo = (route: string) => `/examples/dist/demo.html?frozen=1#/${route}`;
  test("the command palette navigates and runs commands", async ({ page }) => {
    await page.goto(demo("overview"));
    await page.keyboard.press("Control+k");
    await page.keyboard.type("go to incidents");
    await expect(page.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#\/incidents$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Incidents");
    const theme = await page.evaluate(() => document.documentElement.dataset.theme);
    await page.keyboard.press("Control+k");
    await page.keyboard.type("switch theme");
    await expect(page.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).not.toBe(theme);
  });
  test("recent items show on focus", async ({ page }) => {
    await page.goto(demo("overview"));
    await page.getByRole("combobox", { name: "Search" }).first().focus();
    await expect(page.getByRole("group", { name: "Recent" }).getByRole("option")).toHaveCount(3);
  });
  test("Access: select members, change their role in bulk, remove with confirmation", async ({ page }) => {
    await page.goto(demo("access"));
    const rows = page.getByRole("checkbox", { name: /^Select Dev/ });
    await rows.nth(1).click(); await rows.nth(2).click();
    await expect(page.getByRole("status").filter({ hasText: "selected" })).toHaveText("2 selected");
    await page.getByRole("button", { name: "Change role" }).click();
    await page.getByRole("menuitem", { name: "Viewer" }).click();
    await expect(page.locator(".pw-toast").getByText(/members are now Viewers/)).toBeVisible();
    await page.getByRole("button", { name: "Remove", exact: true }).click();
    const confirm = page.getByRole("alertdialog", { name: /Remove 2 members/ });
    await expect(confirm).toBeVisible();
    await confirm.getByRole("button", { name: "Remove 2 members" }).click();
    await expect(page.locator(".pw-toast").getByText("2 members removed")).toBeVisible();
  });
  test("Repository settings: topics are a creatable multi-select; code owners upload with progress and retry", async ({ page }) => {
    await page.goto(demo("repos/sample-repo"));
    const topics = page.getByRole("combobox", { name: "Topics", exact: true });
    await topics.click();
    await page.getByRole("combobox", { name: "Search topics" }).fill("flaky-tests");
    await page.getByRole("option", { name: "Create “flaky-tests”" }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Remove flaky-tests" })).toBeVisible();
    await page.locator(".pw-drop").evaluate((zone) => {
      const dt = new DataTransfer();
      dt.items.add(new File(["* @example-org/payments"], "fail-once.txt", { type: "text/plain" }));
      zone.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
    });
    await expect(page.getByRole("progressbar", { name: "Uploading fail-once.txt" })).toBeVisible();
    await expect(page.getByText("The connection dropped. Try again.")).toBeVisible();
    await page.getByRole("button", { name: "Retry" }).click();
    await expect(page.locator(".pw-toast").getByText("fail-once.txt uploaded")).toBeVisible({ timeout: 5000 });
  });
  test("Deployments: a release note is edited in place from the drawer", async ({ page }) => {
    await page.goto(demo("deploys"));
    await page.getByRole("cell", { name: "v2.14.1", exact: true }).first().click();
    const drawer = page.getByRole("dialog", { name: /checkout-api v2.14.1/ });
    await drawer.getByRole("button", { name: /^Release note:/ }).click();
    await drawer.getByRole("textbox", { name: "Release note" }).fill("Retries with backoff; rolled out to region-a.");
    await drawer.getByRole("button", { name: "Save" }).click();
    await expect(drawer.getByRole("button", { name: /Retries with backoff/ })).toBeFocused();
  });
});

test("the demo has no axe violations on its main pages (dark and light)", async ({ page }) => {
  test.setTimeout(120_000);
  const { axe } = await import("./helpers");
  const found: string[] = [];
  for (const theme of ["dark", "light"]) for (const route of ["overview", "services/checkout-api", "incidents/INC-2041", "deploys", "runs/run_8f3k2", "repos/sample-repo", "usage", "access", "admin"]) {
    await page.goto(`/examples/dist/demo.html?frozen=1&theme=${theme}#/${route}`);
    await page.waitForTimeout(300);
    for (const v of await axe(page)) found.push(`${theme} ${route}: ${v.id} → ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(", ")}`);
  }
  expect(found).toEqual([]);
});
