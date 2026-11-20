import { test, expect } from "@playwright/test";
import { open } from "./helpers";

test.describe("Modal", () => {
  test("moves focus in, traps Tab, closes on Escape and returns focus to the opener", async ({ page }) => {
    await open(page, "modal");
    const opener = page.getByRole("button", { name: "Delete branch" });
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Delete feature/add-retry?" });
    await expect(dialog).toBeVisible();
    // Radix marks everything outside the dialog aria-hidden instead of setting aria-modal.
    await expect(page.getByRole("button", { name: "Delete branch" })).toHaveCount(1);
    expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
    for (let i = 0; i < 6; i++) { await page.keyboard.press("Tab"); expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true); }
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });
});

test.describe("Drawer", () => {
  test("is a labelled modal dialog; the close button and Escape both return focus", async ({ page }) => {
    await open(page, "drawer");
    const opener = page.getByRole("button", { name: "Open run" });
    await opener.click();
    const drawer = page.getByRole("dialog", { name: "run_8f3k2" });
    await expect(drawer).toBeVisible();
    await drawer.getByRole("button", { name: "Close" }).first().click();
    await expect(drawer).toBeHidden();
    await expect(opener).toBeFocused();
    await opener.press("Enter");
    await expect(drawer).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(opener).toBeFocused();
  });
});

test.describe("ActionMenu", () => {
  test("opens from the keyboard, moves with arrows, selects with Enter and returns focus", async ({ page }) => {
    await open(page, "action-menu");
    const trigger = page.getByRole("button", { name: "Actions for run_8f3k2" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Re-run" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem", { name: "Copy link" })).toBeFocused();
    await page.keyboard.press("End");
    await expect(page.getByRole("menuitem", { name: "Cancel run" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(menu).toBeHidden();
    await expect(page.getByTestId("last")).toHaveText("Cancel run");
    await expect(trigger).toBeFocused();
  });
});
