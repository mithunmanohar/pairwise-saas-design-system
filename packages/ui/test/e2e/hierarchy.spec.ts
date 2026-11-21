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

test.describe("TreeView", () => {
  test("arrows move focus without changing the scope; Enter selects; Right/Left expand and collapse", async ({ page }) => {
    await open(page, "explorer");
    const tree = page.getByRole("treegrid", { name: "Organisation" });
    const ai = tree.getByRole("row", { name: /^AI transformation/ });
    await expect(ai).toHaveAttribute("aria-selected", "true");
    await ai.focus();
    await page.keyboard.press("ArrowDown");
    await expect(tree.getByRole("row", { name: /^Forecasting platform/ })).toBeFocused();
    await expect(page.getByTestId("scope")).toHaveText("in-ai");
    await page.keyboard.press("ArrowDown");
    await expect(tree.getByRole("row", { name: /^Recommendation engine/ })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("scope")).toHaveText("pr-rec");
    await page.keyboard.press("ArrowRight");
    await expect(tree.getByRole("row", { name: /^Repositories/ })).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await expect(tree.getByRole("row", { name: /^Repositories/ })).toHaveCount(0);
    await expect(tree.getByRole("row", { name: /^Recommendation engine/ })).toHaveAttribute("aria-level", "5");
  });
  test("children load on expand, with a loading row", async ({ page }) => {
    await open(page, "explorer");
    const tree = page.getByRole("treegrid", { name: "Organisation" });
    await tree.getByRole("button", { name: "Expand Forecasting platform" }).click();
    await expect(tree.getByText("Loading…")).toBeVisible();
    await expect(tree.getByRole("row", { name: /^Pipelines/ })).toBeVisible();
    await expect(tree.getByRole("row", { name: /^Pipelines/ })).toContainText("1");
  });
  test("filter keeps matches and their ancestors; no access is greyed and disabled", async ({ page }) => {
    await open(page, "explorer");
    await page.getByRole("textbox", { name: "Search organisation" }).fill("risk");
    const tree = page.getByRole("treegrid", { name: "Organisation" });
    await expect(tree.getByRole("row")).toHaveText([/Example Company/, /Data and analytics/, /ML engineering/, /Fraud detection/, /Finance and risk/]);
    await expect(tree.getByRole("row", { name: /Finance and risk/ })).toHaveAttribute("aria-disabled", "true");
    await page.getByRole("textbox", { name: "Search organisation" }).fill("zzz");
    await expect(page.getByText("No match for “zzz”.")).toBeVisible();
  });
});

test.describe("ScopePicker and SplitView", () => {
  test("search shows each match's path; picking changes the scope and returns focus to the chip", async ({ page }) => {
    await open(page, "explorer");
    const chip = page.getByRole("button", { name: /^Ownership scope: AI transformation/ });
    await chip.click();
    const pop = page.getByRole("dialog", { name: "Ownership scope" });
    await expect(pop.getByRole("button", { name: "Up to ML engineering" })).toBeVisible();
    await pop.getByRole("combobox", { name: "Search ownership scope" }).fill("fraud");
    await expect(pop.getByRole("option", { name: /^Fraud detection/ })).toContainText("Example Company › Data and analytics › ML engineering");
    await expect(pop.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await expect(pop).toBeHidden();
    await expect(page.getByTestId("scope")).toHaveText("in-fraud");
    await expect(page.getByRole("button", { name: /^Ownership scope: Fraud detection/ })).toBeFocused();
  });
  test("Up to parent and Whole organisation", async ({ page }) => {
    await open(page, "explorer");
    await page.getByRole("button", { name: /^Ownership scope/ }).click();
    await page.getByRole("button", { name: "Up to ML engineering" }).click();
    await expect(page.getByTestId("scope")).toHaveText("sq-ml");
    await page.getByRole("button", { name: /^Ownership scope/ }).click();
    await page.getByRole("button", { name: "Whole organisation" }).click();
    await expect(page.getByTestId("scope")).toHaveText("org");
    await expect(page.getByRole("button", { name: /^Ownership scope: Whole organisation/ })).toBeVisible();
  });
  test("the tree pane collapses; when narrow it opens in a drawer", async ({ page }) => {
    await open(page, "explorer");
    await page.getByRole("button", { name: "Hide organisation" }).click();
    await expect(page.getByRole("treegrid")).toHaveCount(0);
    await page.getByRole("button", { name: "Show organisation" }).click();
    await expect(page.getByRole("treegrid")).toBeVisible();
    await page.getByRole("button", { name: "Toggle narrow" }).click();
    await page.getByRole("button", { name: "Show organisation" }).click();
    await expect(page.getByRole("dialog", { name: "Organisation" }).getByRole("treegrid")).toBeVisible();
  });
});

test.describe("DataTable List and Tree views", () => {
  test("List shows each row's path below the scope; direct rows say so", async ({ page }) => {
    await open(page, "tree-table");
    const row = page.getByRole("row", { name: /forecasting-train/ });
    await expect(row).toContainText("Forecasting platform›forecast-models");
    await expect(page.getByRole("row", { name: /data-quality/ })).toContainText("Owned by the initiative");
    await expect(page.getByRole("radio", { name: "List" })).toHaveAttribute("aria-checked", "true");
  });
  test("Tree groups by path with rollups; expanding reaches the pipelines; expand and collapse all", async ({ page }) => {
    await open(page, "tree-table");
    await page.getByRole("radio", { name: "Tree" }).click();
    const fc = page.getByRole("row", { name: /Forecasting platform/ });
    await expect(fc).toContainText("Project · 3 pipelines");
    await expect(fc).toContainText("1 failed");
    await expect(fc).toContainText("$4.9k");
    await expect(page.getByRole("row", { name: /Recommendation engine/ })).toContainText("All passed");
    await expect(page.getByRole("row", { name: /forecasting-train/ })).toHaveCount(0);
    await page.getByRole("button", { name: "Expand Forecasting platform, 3 pipelines" }).click();
    await expect(page.getByRole("row", { name: /forecast-models/ })).toContainText("Repository · 2 pipelines");
    await page.getByRole("button", { name: "Expand all" }).click();
    await expect(page.getByRole("row", { name: /forecasting-train/ })).toBeVisible();
    await expect(page.getByRole("row", { name: /reco-index/ })).toBeVisible();
    await page.getByRole("button", { name: "Collapse all" }).click();
    await expect(page.getByRole("row", { name: /reco-index/ })).toHaveCount(0);
    await expect(page.getByRole("row", { name: /data-quality/ })).toBeVisible();
  });
  test("ScopeNote's Direct only narrows to what the scope owns itself", async ({ page }) => {
    await open(page, "tree-table");
    await expect(page.getByText("Showing AI transformation and its 2 projects")).toBeVisible();
    await page.getByRole("radio", { name: "Direct only" }).click();
    await expect(page.locator("tbody tr")).toHaveCount(1);
  });
});
