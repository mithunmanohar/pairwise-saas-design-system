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
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("tab", { name: "Settings" })).toBeFocused();
  await expect(page.getByTestId("tab")).toHaveText("settings");
});

test("MenuSelect: picks an option and closes", async ({ page }) => {
  await open(page, "menu-select");
  const trigger = page.getByRole("button", { name: "Environment: prod" });
  await trigger.click();
  await page.getByRole("option", { name: "staging" }).click();
  await expect(page.getByTestId("env")).toHaveText("staging");
  await expect(page.getByRole("button", { name: "Environment: staging" })).toBeVisible();
});

test("GlobalSearch: Ctrl+K focuses, typing filters, arrows and Enter pick", async ({ page }) => {
  await open(page, "search");
  await page.keyboard.press("Control+k");
  const box = page.getByRole("combobox", { name: "Search" });
  await expect(box).toBeFocused();
  await page.keyboard.type("run_");
  await expect(page.getByRole("option")).toHaveCount(2);
  await expect(box).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("picked")).toHaveText("run_9a1x7");
});

test("GlobalSearch: no match explains itself", async ({ page }) => {
  await open(page, "search");
  await page.getByRole("combobox", { name: "Search" }).fill("zzz");
  await expect(page.getByText("No match for “zzz”.")).toBeVisible();
});
