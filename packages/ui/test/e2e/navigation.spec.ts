import { test, expect } from "@playwright/test";
import { open } from "./helpers";

test("Tabs: arrow keys move focus and selection, wrapping at the ends", async ({ page }) => {
  await open(page, "tabs");
  const overview = page.getByRole("tab", { name: "Overview" });
  await overview.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /Runs/ })).toBeFocused();
  await expect(page.getByRole("tab", { name: /Runs/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByTestId("tab")).toHaveText("runs");
  await page.keyboard.press("ArrowLeft");
  await expect(overview).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("tab", { name: "Settings" })).toBeFocused();
  await expect(page.getByTestId("tab")).toHaveText("settings");
  await page.keyboard.press("Home");
  await expect(overview).toBeFocused();
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "Settings" })).toBeFocused();
});

test("MenuSelect: picks an option with the mouse and closes", async ({ page }) => {
  await open(page, "menu-select");
  const trigger = page.getByRole("button", { name: "Environment: prod" });
  await trigger.click();
  await page.getByRole("menuitemradio", { name: "staging" }).click();
  await expect(page.getByTestId("env")).toHaveText("staging");
  await expect(page.getByRole("button", { name: "Environment: staging" })).toBeVisible();
});

test("MenuSelect: keyboard opens on the current value, arrows and typeahead move, Enter picks, focus returns", async ({ page }) => {
  await open(page, "menu-select");
  const trigger = page.getByRole("button", { name: "Environment: prod" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu", { name: "Environment" })).toBeVisible();
  await expect(page.getByRole("menuitemradio", { name: "prod" })).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitemradio", { name: "staging" })).toBeFocused();
  await page.keyboard.press("d");
  await expect(page.getByRole("menuitemradio", { name: "dev" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("env")).toHaveText("dev");
  await expect(page.getByRole("button", { name: "Environment: dev" })).toBeFocused();
});

test("GlobalSearch: Ctrl+K focuses, typing filters, arrows and Enter pick", async ({ page }) => {
  await open(page, "search");
  await page.keyboard.press("Control+k");
  const box = page.getByRole("combobox", { name: "Search" });
  await expect(box).toBeFocused();
  await page.keyboard.type("run_");
  await expect(page.getByRole("option")).toHaveCount(2);
  await expect(box).toHaveAttribute("aria-expanded", "true");
  // The first result is highlighted (cmdk does this the frame after the query changes) and announced.
  await expect(page.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
  await expect(box).toHaveAttribute("aria-activedescendant", (await page.getByRole("option").first().getAttribute("id"))!);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("picked")).toHaveText("run_9a1x7");
});

test("GlobalSearch: no match explains itself", async ({ page }) => {
  await open(page, "search");
  await page.getByRole("combobox", { name: "Search" }).fill("zzz");
  await expect(page.getByText("No match for “zzz”.")).toBeVisible();
});

// Typing and pressing ↓ at once must not be undone by cmdk's late "highlight the first result" reset.
test("GlobalSearch: ArrowDown straight after typing keeps the moved highlight", async ({ page }) => {
  await open(page, "search");
  const box = page.getByRole("combobox", { name: "Search" });
  await box.focus();
  await page.keyboard.type("run_", { delay: 0 });
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option").nth(1)).toHaveAttribute("aria-selected", "true");
  await page.waitForTimeout(100);
  await expect(page.getByRole("option").nth(1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("picked")).toHaveText("run_9a1x7");
});

test("Combobox: ArrowDown straight after typing keeps the moved highlight; ArrowUp can return to the first", async ({ page }) => {
  await open(page, "new-form");
  await page.getByRole("combobox", { name: "Reviewer", exact: true }).focus();
  await page.keyboard.press("d");
  const search = page.getByRole("combobox", { name: "Search reviewer" });
  await expect(search).toBeFocused();
  await page.keyboard.type("ev", { delay: 0 });
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(100);
  await expect(page.getByRole("option").nth(1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowUp");
  await expect(page.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("state")).toContainText('"owner":"dev-b"');
});
