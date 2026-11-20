import { test, expect } from "@playwright/test";
import { open } from "./helpers";

test("required fields show a visible marker and set aria-required; read-only fields stay focusable", async ({ page }) => {
  await open(page, "foundations");
  const name = page.getByRole("textbox", { name: "Repository name", exact: true });
  await expect(name).toHaveAttribute("aria-required", "true");
  await expect(page.getByText("Required").first()).toBeVisible();
  const ro = page.getByRole("textbox", { name: "Created by" });
  await expect(ro).toHaveAttribute("readonly", "");
  await ro.focus();
  await expect(ro).toBeFocused();
});

test("Field wires a custom control to its label, hint and required state", async ({ page }) => {
  await open(page, "foundations");
  const owner = page.getByRole("textbox", { name: "Owner" });
  await expect(owner).toHaveAccessibleDescription("A person or team.");
  await expect(owner).toHaveAttribute("aria-required", "true");
});

test("Checkbox supports an indeterminate select-all", async ({ page }) => {
  await open(page, "foundations");
  const all = page.getByRole("checkbox", { name: "Select all runs" });
  await expect(all).toHaveAttribute("aria-checked", "mixed");
  await all.click();
  await expect(all).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("checkbox", { name: "run_9a1x7" })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("checkbox", { name: "run_8f3k2" }).click();
  await expect(all).toHaveAttribute("aria-checked", "mixed");
});

test("Switch shows an error and is described by it", async ({ page }) => {
  await open(page, "foundations");
  const sw = page.getByRole("switch", { name: "Deploy on merge" });
  await expect(sw).toHaveAttribute("aria-invalid", "true");
  await expect(sw).toHaveAccessibleDescription("Only admins can turn this on.");
});

test("Button asChild renders the link with button styling", async ({ page }) => {
  await open(page, "foundations");
  const link = page.getByRole("link", { name: "Start run" });
  await expect(link).toHaveClass(/pw-btn pw-btn--primary/);
  await expect(link.locator("svg")).toHaveCount(1);
});

test("Popover moves focus in, closes on Escape and from inside, and returns focus", async ({ page }) => {
  await open(page, "foundations");
  const trigger = page.getByRole("button", { name: "Filters" });
  await trigger.click();
  const pop = page.getByRole("dialog", { name: "Run filters" });
  await expect(pop).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(await pop.evaluate((d) => d.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(pop).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.press("Enter");
  await pop.getByRole("button", { name: "Done" }).click();
  await expect(pop).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("reduced motion sets every duration token to 0 ms", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "foundations");
  const d = await page.evaluate(() => ["fast", "base", "slow"].map((k) => getComputedStyle(document.documentElement).getPropertyValue("--duration-" + k).trim()));
  expect(d).toEqual(["0ms", "0ms", "0ms"]);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const base = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--duration-base").trim());
  expect(base).toBe("160ms");
});
