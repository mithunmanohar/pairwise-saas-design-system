// Stage 3: behaviour of the components moved onto Radix and cmdk.
import { test, expect } from "@playwright/test";
import { open } from "./helpers";

test.describe("Tooltip", () => {
  test("opens on keyboard focus, describes its trigger, closes on Escape", async ({ page }) => {
    await open(page, "tooltip");
    await page.keyboard.press("Tab");
    const btn = page.getByRole("button", { name: "Re-run" });
    await expect(btn).toBeFocused();
    await expect(page.getByRole("tooltip")).toHaveText("Re-run failed checks");
    await expect(btn).toHaveAccessibleDescription("Re-run failed checks");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("tooltip")).toHaveCount(0);
  });
  test("opens on hover after a delay and renders outside the trigger's container", async ({ page }) => {
    await open(page, "tooltip");
    await page.getByRole("link", { name: "CI run" }).hover();
    await expect(page.getByRole("tooltip")).toHaveText("Opens in your CI provider");
    expect(await page.locator(".pw-tooltip").evaluate((el) => el.closest("#root") === null)).toBe(true);
  });
});

test.describe("TimeRangePicker", () => {
  test("keyboard: opens a labelled popover, arrows move without applying, Enter applies and returns focus", async ({ page }) => {
    await open(page, "time");
    const trigger = page.getByRole("button", { name: /^Time range: Last 1 hour/ });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const pop = page.getByRole("dialog", { name: "Time range" });
    await expect(pop).toBeVisible();
    const current = pop.getByRole("radio", { name: "Last 1 hour" });
    await expect(current).toHaveAttribute("aria-checked", "true");
    await current.focus();
    await page.keyboard.press("ArrowDown");
    await expect(pop.getByRole("radio", { name: "Last 6 hours" })).toBeFocused();
    await expect(page.getByTestId("state")).toHaveText(/^1h\|/);
    await page.keyboard.press("Enter");
    await expect(pop).toBeHidden();
    await expect(page.getByTestId("state")).toHaveText(/^6h\|/);
    await expect(page.getByRole("button", { name: /^Time range: Last 6 hours/ })).toBeFocused();
  });
  test("validates and applies an absolute range; copy uses it", async ({ page }) => {
    await open(page, "time");
    await page.getByRole("button", { name: /^Time range/ }).click();
    const pop = page.getByRole("dialog", { name: "Time range" });
    await pop.getByLabel("From").fill("2026-11-20 11:00");
    await pop.getByRole("button", { name: "Apply" }).click();
    await expect(pop.getByRole("alert")).toHaveText("“From” must be before “To”.");
    await expect(pop.getByLabel("From")).toHaveAttribute("aria-invalid", "true");
    await pop.getByLabel("From").fill("2026-11-20 08:00");
    await pop.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByTestId("state")).toHaveText("1h|30s|2026-11-20 08:00 – 2026-11-20 10:00|none|list");
    await page.getByRole("button", { name: /^Time range/ }).click();
    await page.getByRole("button", { name: "Copy range to paste elsewhere" }).click();
    await expect(page.getByTestId("state")).toContainText("|2026-11-20 08:00 – 2026-11-20 10:00|list");
  });
  test("auto-refresh and SegmentedControl are radio groups: arrows move, Space selects, disabled is skipped", async ({ page }) => {
    await open(page, "time");
    const view = page.getByRole("radiogroup", { name: "View" });
    await view.getByRole("radio", { name: "List" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(view.getByRole("radio", { name: "Board" })).toBeFocused();
    await page.keyboard.press("Space");
    await expect(page.getByTestId("state")).toHaveText(/\|board$/);
    await page.keyboard.press("ArrowRight");
    await expect(view.getByRole("radio", { name: "List" })).toBeFocused();
    await page.getByRole("button", { name: /^Time range/ }).click();
    await page.getByRole("radiogroup", { name: "Auto-refresh" }).getByRole("radio", { name: "Off" }).click();
    await expect(page.getByTestId("state")).toHaveText(/^1h\|off\|/);
  });
});

test.describe("GlobalSearch commands", () => {
  test("shows recent items when focused and empty", async ({ page }) => {
    await open(page, "commands");
    const box = page.getByRole("combobox", { name: "Search", exact: true });
    await box.focus();
    await expect(box).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("group", { name: "Recent" }).getByRole("option")).toHaveCount(2);
    await page.keyboard.press("Escape");
    await expect(box).toHaveAttribute("aria-expanded", "false");
    await expect(box).toBeFocused();
  });
  test("groups results, matches keywords and runs commands", async ({ page }) => {
    await open(page, "commands");
    const box = page.getByRole("combobox", { name: "Search", exact: true });
    await box.fill("alerts");
    await expect(page.getByRole("group", { name: "Commands" }).getByRole("option", { name: /Go to incidents/ })).toBeVisible();
    await expect(page.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("log")).toHaveText("run:incidents,select:Go to incidents");
    await expect(box).toHaveValue("");
    await expect(box).toHaveAttribute("aria-expanded", "false");
    await box.fill("theme");
    await expect(page.getByRole("option", { name: /Toggle theme/ })).toContainText("Switch between light and dark");
  });
  test("async results: loading state, then the server's results unfiltered", async ({ page }) => {
    await open(page, "commands");
    const box = page.getByRole("combobox", { name: "Search runs" });
    await box.fill("8f");
    await expect(page.getByRole("progressbar")).toHaveText("Searching…");
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Finish loading" }).click();
    await box.focus();
    await expect(page.getByRole("option", { name: /run_8f1/ })).toBeVisible();
  });
  test("Ctrl+K focuses the search that owns the shortcut", async ({ page }) => {
    await open(page, "commands");
    await page.getByRole("button", { name: "Finish loading" }).focus();
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("combobox", { name: "Search", exact: true })).toBeFocused();
  });
});

test.describe("Toaster", () => {
  test("the live region exists before any toast; F8 moves focus to toasts", async ({ page }) => {
    await open(page, "toast");
    await expect(page.getByRole("region", { name: /Notifications/ })).toHaveCount(1);
    await page.getByRole("button", { name: "Show info" }).click();
    await page.keyboard.press("F8");
    await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest(".pw-toasts"))).toBe(true);
  });
  test("critical toasts are announced assertively", async ({ page }) => {
    await open(page, "toast");
    await page.getByRole("button", { name: "Show error" }).click();
    await expect(page.locator('[aria-live="assertive"]')).toContainText("Couldn’t merge");
  });
});

test("Modal tone=critical is an alert dialog, described by its body; clicking outside doesn't dismiss it", async ({ page }) => {
  await open(page, "critical-modal");
  await page.getByRole("button", { name: "Delete repository" }).click();
  const dlg = page.getByRole("alertdialog", { name: "Delete sample-repo?" });
  await expect(dlg).toBeVisible();
  await expect(dlg).toHaveAccessibleDescription(/can’t be undone/);
  await page.mouse.click(5, 5);
  await expect(dlg).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dlg).toBeHidden();
  await expect(page.getByRole("button", { name: "Delete repository" })).toBeFocused();
});

test.describe("DataTable 2.0", () => {
  test("filtering to fewer rows than the current page stays on the last page (no false empty state)", async ({ page }) => {
    await open(page, "data-table");
    await page.getByRole("button", { name: "Next page" }).click();
    await page.getByRole("button", { name: "Next page" }).click();
    await expect(page.getByText("11–12 of 12")).toBeVisible();
    await page.getByRole("button", { name: "Toggle filter" }).click();
    await expect(page.getByText("No rows match")).toHaveCount(0);
    await expect(page.locator("tbody tr")).toHaveCount(3);
  });
  test("select-all is per page and indeterminate; bulk actions get the keys; clear empties", async ({ page }) => {
    await open(page, "table-plus");
    const all = page.getByRole("checkbox", { name: "Select all rows on this page" });
    await page.getByRole("checkbox", { name: /^Select run_/ }).first().click();
    await expect(all).toHaveAttribute("aria-checked", "mixed");
    await all.click();
    await expect(all).toHaveAttribute("aria-checked", "true");
    await expect(page.getByRole("status").filter({ hasText: "selected" })).toHaveText("10 selected");
    await page.getByRole("button", { name: "Re-run" }).click();
    await expect(page.getByTestId("log")).toHaveText("rerun:10");
    await page.getByRole("button", { name: "Next page" }).click();
    await expect(all).toHaveAttribute("aria-checked", "false");
    await page.getByRole("button", { name: "Clear selection" }).click();
    await expect(page.getByText("selected", { exact: false })).toHaveCount(0);
  });
  test("controlled sort reports changes; row actions are labelled per row", async ({ page }) => {
    await open(page, "table-plus");
    await expect(page.getByRole("columnheader", { name: /Duration/ })).toHaveAttribute("aria-sort", "descending");
    await page.getByRole("button", { name: "Repository" }).click();
    await expect(page.getByTestId("sort")).toHaveText("repo:asc");
    const first = (await page.locator("tbody tr td.pw-mono").first().innerText()).trim();
    await page.getByRole("button", { name: "Actions for " + first }).click();
    await page.getByRole("menuitem", { name: "Copy run id" }).click();
    await expect(page.getByTestId("log")).toHaveText("copy:" + first);
  });
  test("column visibility menu, first/last paging and page size", async ({ page }) => {
    await open(page, "table-plus");
    await expect(page.getByRole("columnheader", { name: "Status" })).toHaveCount(0);
    await page.getByRole("button", { name: "Columns" }).click();
    await expect(page.getByRole("menuitemcheckbox", { name: "Run" })).toBeDisabled();
    await page.getByRole("menuitemcheckbox", { name: "Status" }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("columnheader", { name: "Status" })).toHaveCount(1);
    await page.getByRole("button", { name: "Last page" }).click();
    await expect(page.getByText("Page 7 of 7")).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "of 63" })).toHaveText("61–63 of 63");
    await page.getByRole("button", { name: "Rows 10" }).click();
    await page.getByRole("menuitemradio", { name: "25" }).click();
    await expect(page.getByText("Page 1 of 3")).toBeVisible();
  });
});

test("Pagination: first/previous disabled on page 1, last jumps, range is announced", async ({ page }) => {
  await open(page, "pagination");
  const nav = page.getByRole("navigation", { name: "Pagination" });
  await expect(nav.getByRole("button", { name: "First page" })).toBeDisabled();
  await nav.getByRole("button", { name: "Last page" }).click();
  await expect(page.getByTestId("page")).toHaveText("13");
  await expect(nav.getByRole("status")).toHaveText("301–312 of 312");
  await expect(nav.getByRole("button", { name: "Next page" })).toBeDisabled();
});

test.describe("StatusGrid and charts", () => {
  test("StatusGrid is one Tab stop; arrows, Home/End move; Enter opens the cell", async ({ page }) => {
    await open(page, "grid");
    const grid = page.getByRole("grid", { name: "Nightly jobs by run" });
    await expect(grid.locator('[tabindex="0"]')).toHaveCount(1);
    await grid.getByRole("gridcell", { name: "daily_ingest, 01: succeeded" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(grid.getByRole("gridcell", { name: "daily_ingest, 02: succeeded after retry" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("End");
    await expect(grid.getByRole("gridcell", { name: "train_model, 04: failed" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("cell")).toHaveText("train_model:04:critical");
    const box = await grid.getByRole("gridcell").first().boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(24);
    await page.getByRole("button", { name: "Show table" }).first().click();
    await expect(page.getByRole("table", { name: "Nightly jobs by run" })).toContainText("succeeded after retry");
  });
  test("BarChart bars are keyboard buttons with values in their names, and there is a table view", async ({ page }) => {
    await open(page, "grid");
    const bar = page.getByRole("button", { name: "Tue: Passed 9, Failed 3" });
    await bar.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("cell")).toHaveText("bar:Tue");
    await page.getByRole("button", { name: "Show table" }).nth(1).click();
    await expect(page.getByRole("table", { name: "Runs per day" })).toContainText("Total");
  });
  test("Heatmap has a table view with 'no data' for gaps", async ({ page }) => {
    await open(page, "grid");
    await page.getByRole("button", { name: "Show table" }).nth(2).click();
    await expect(page.getByRole("table", { name: "Queue wait by hour" })).toContainText("no data");
  });
});

test("Tabs with panels: each tab controls its panel; disabled tabs are skipped", async ({ page }) => {
  await open(page, "tab-panels");
  const checks = page.getByRole("tab", { name: /Checks/ });
  await expect(page.getByRole("tabpanel", { name: /Checks/ })).toHaveText("3 checks passed.");
  await checks.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Logs" })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(checks).toBeFocused();
  await expect(page.getByRole("tabpanel", { name: /Checks/ })).toBeVisible();
});
