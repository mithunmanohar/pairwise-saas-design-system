// Pairwise 2.1: ownership hierarchy and scope.
import { test, expect } from "@playwright/test";
import { open } from "./helpers";

test.describe("foundations", () => {
  test("Breadcrumbs fold the earlier levels into a menu; the current page always shows", async ({ page }) => {
    await open(page, "hierarchy-basics");
    const nav = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(nav.getByRole("link")).toHaveText(["AI transformation"]);
    await expect(nav.locator('[aria-current="page"]')).toHaveText("Forecasting platform");
    const more = nav.getByRole("button", { name: "Show 3 more levels" });
    await more.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menuitem")).toHaveText(["Example Company", "Data and analytics", "ML engineering"]);
    await expect(page.getByRole("menuitem", { name: "Example Company" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem", { name: "Data and analytics" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("state")).toHaveText(/^Data and analytics\|/);
  });

  test("PageHeader shows the entity kind above the title", async ({ page }) => {
    await open(page, "hierarchy-basics");
    await expect(page.locator(".pw-kind")).toHaveText("Project · owned by AI transformation");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Forecasting platform");
  });

  test("ScopeSwitcher takes any runtime dimensions", async ({ page }) => {
    await open(page, "hierarchy-basics");
    const group = page.getByRole("group", { name: "Environment" });
    await expect(group.getByRole("button")).toHaveCount(4);
    await group.getByRole("button", { name: "Namespace: forecasting" }).click();
    await page.getByRole("menuitemradio", { name: "reco" }).click();
    await expect(page.getByTestId("state")).toHaveText("none|prod/region-a/cluster-1/reco");
  });
});
