import { test, expect } from "@playwright/test";
import { open } from "./helpers";

test("toast() shows a message and hides it after its duration", async ({ page }) => {
  await page.clock.install();
  await open(page, "toast");
  await page.getByRole("button", { name: "Show info" }).click();
  await expect(page.getByText("Link copied")).toBeVisible();
  await page.clock.runFor(6500);
  await expect(page.getByText("Link copied")).toBeHidden();
});

test("critical toasts stay until closed", async ({ page }) => {
  await page.clock.install();
  await open(page, "toast");
  await page.getByRole("button", { name: "Show error" }).click();
  await page.clock.runFor(20000);
  await expect(page.getByText("Couldn’t merge")).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByText("Couldn’t merge")).toBeHidden();
});

test("the action runs and dismisses the toast; at most three show", async ({ page }) => {
  await open(page, "toast");
  await page.getByRole("button", { name: "Show undo" }).click();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByText("Run re-queued")).toBeHidden();
  await expect(page.getByText("Undone")).toBeVisible();
  for (let i = 0; i < 4; i++) await page.getByRole("button", { name: "Show info" }).click();
  await expect(page.locator(".pw-toast")).toHaveCount(3);
});
