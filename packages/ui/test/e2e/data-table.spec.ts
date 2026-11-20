import { test, expect } from "@playwright/test";
import { open } from "./helpers";

test("sorts by a column and announces the order", async ({ page }) => {
  await open(page, "data-table");
  const header = page.getByRole("columnheader", { name: /Duration/ });
  await expect(header).not.toHaveAttribute("aria-sort", /./);
  await header.getByRole("button").click();
  await expect(header).toHaveAttribute("aria-sort", "descending");
  await header.getByRole("button").click();
  await expect(header).toHaveAttribute("aria-sort", "ascending");
  const first = await page.locator("tbody tr").first().locator("td").nth(4).innerText();
  expect(first).toBe("1000 ms");
});

test("expands a row with its labelled button and opens a row with Enter", async ({ page }) => {
  await open(page, "data-table");
  const name = (await page.getByRole("button", { name: /^Expand run_/ }).first().getAttribute("aria-label"))!.replace("Expand ", "");
  await page.getByRole("button", { name: "Expand " + name }).click();
  await expect(page.getByRole("button", { name: "Collapse " + name })).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText(/^Logs for run_/)).toBeVisible();
  const row = page.locator("tbody tr.is-click").first();
  await row.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("opened")).not.toHaveText("none");
});

test("pages through rows", async ({ page }) => {
  await open(page, "data-table");
  await expect(page.getByText("1–5 of 12")).toBeVisible();
  await expect(page.getByRole("button", { name: "Previous page" })).toBeDisabled();
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.getByText("6–10 of 12")).toBeVisible();
});
