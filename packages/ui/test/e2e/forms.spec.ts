import { test, expect } from "@playwright/test";
import { open } from "./helpers";

test("TextInput wires its label, hint and error", async ({ page }) => {
  await open(page, "form");
  const input = page.getByLabel("Branch");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(input).toHaveAccessibleDescription("Created from main. A branch with this name already exists.");
});

test("Select opens from the keyboard and picks with arrows and Enter", async ({ page }) => {
  await open(page, "form");
  const trigger = page.getByRole("combobox", { name: "Repository" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("listbox")).toBeVisible();
  await expect(page.getByRole("option", { name: "sample-repo" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: "docs-site" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("state")).toHaveText("docs-site|false|true");
  await expect(trigger).toBeFocused();
});

test("Checkbox and Switch toggle with Space", async ({ page }) => {
  await open(page, "form");
  await page.getByRole("checkbox", { name: "Require approval" }).focus();
  await page.keyboard.press("Space");
  await page.getByRole("switch", { name: "Auto-merge" }).focus();
  await page.keyboard.press("Space");
  await expect(page.getByTestId("state")).toHaveText("sample-repo|true|false");
  await expect(page.getByRole("checkbox", { name: "Require approval" })).toHaveAttribute("aria-checked", "true");
});
