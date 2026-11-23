// Components working together: overlays inside a modal (Escape closes one layer at a time, focus returns to the right
// place), a date range in a filter bar, and the demo app's real flows (command palette, bulk actions, forms).
import { test, expect } from "@playwright/test";
import { open } from "./helpers";

test("inside a Modal, Escape closes the open popover first, then the modal; focus returns each time", async ({ page }) => {
  await open(page, "integration");
  await page.getByRole("button", { name: "Schedule run" }).click();
  const modal = page.getByRole("dialog", { name: "Schedule a run" });
  const repo = modal.getByRole("combobox", { name: "Repository", exact: true });
  await repo.click();
  await expect(page.getByRole("combobox", { name: "Search repository" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(modal).toBeVisible();
  await expect(repo).toBeFocused();
  const runner = modal.getByRole("combobox", { name: "Runner" });
  await runner.focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("option", { name: "linux-large" })).toBeFocused();
  // Radix Select focuses its option one effect tick before it registers its dismiss layer; a person can't press Esc
  // inside that frame, but a test can.
  await page.waitForTimeout(50);
  await page.keyboard.press("Escape");
  await expect(modal).toBeVisible();
  await expect(runner).toBeFocused();
  await modal.getByRole("button", { name: "Choose run on on a calendar" }).click();
  await expect(page.getByRole("dialog", { name: "Run on: calendar" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Run on: calendar" })).toBeHidden();
  await expect(modal.getByRole("button", { name: "Choose run on on a calendar" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
  await expect(page.getByRole("button", { name: "Schedule run" })).toBeFocused();
});

test("popovers and tooltips inside a modal stack above it and stay usable", async ({ page }) => {
  await open(page, "integration");
  await page.getByRole("button", { name: "Schedule run" }).click();
  await page.getByRole("button", { name: "About scheduling" }).focus();
  await expect(page.getByRole("tooltip")).toHaveText("Runs at 02:00 in the repository's time zone");
  await page.getByRole("dialog", { name: "Schedule a run" }).getByRole("combobox", { name: "Repository", exact: true }).click();
  await page.getByRole("option", { name: "infra" }).click();
  await expect(page.getByRole("dialog", { name: "Schedule a run" }).getByRole("combobox", { name: "Repository", exact: true })).toHaveText(/infra/);
});

test("a DateRangePicker in a FilterBar applies a preset", async ({ page }) => {
  await open(page, "integration");
  await page.getByRole("search").getByRole("button", { name: "Run dates" }).click();
  await page.getByRole("button", { name: "First week" }).click();
  await expect(page.getByTestId("state")).toContainText('"range":{"from":"2026-11-01","to":"2026-11-07"}');
});

test.describe("the demo app", () => {
  const demo = (route: string) => `/examples/dist/demo.html?frozen=1#/${route}`;
  test("the command palette navigates and runs commands", async ({ page }) => {
    await page.goto(demo("overview"));
    await page.keyboard.press("Control+k");
    await page.keyboard.type("go to incidents");
    await expect(page.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#\/incidents$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Incidents");
    const theme = await page.evaluate(() => document.documentElement.dataset.theme);
    await page.keyboard.press("Control+k");
    await page.keyboard.type("switch theme");
    await expect(page.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).not.toBe(theme);
  });
  test("recent items show on focus", async ({ page }) => {
    await page.goto(demo("overview"));
    await page.getByRole("combobox", { name: "Search" }).first().focus();
    await expect(page.getByRole("group", { name: "Recent" }).getByRole("option")).toHaveCount(3);
  });
  test("Access: select members, change their role in bulk, remove with confirmation", async ({ page }) => {
    await page.goto(demo("access"));
    const rows = page.getByRole("checkbox", { name: /^Select Dev/ });
    await rows.nth(1).click(); await rows.nth(2).click();
    await expect(page.getByRole("status").filter({ hasText: "selected" })).toHaveText("2 selected");
    await page.getByRole("button", { name: "Change role" }).click();
    await page.getByRole("menuitem", { name: "Viewer" }).click();
    await expect(page.locator(".pw-toast").getByText(/members are now Viewers/)).toBeVisible();
    await page.getByRole("button", { name: "Remove", exact: true }).click();
    const confirm = page.getByRole("alertdialog", { name: /Remove 2 members/ });
    await expect(confirm).toBeVisible();
    await confirm.getByRole("button", { name: "Remove 2 members" }).click();
    await expect(page.locator(".pw-toast").getByText("2 members removed")).toBeVisible();
  });
  test("Repository settings: topics are a creatable multi-select; code owners upload with progress and retry", async ({ page }) => {
    await page.goto(demo("repos/sample-repo"));
    const topics = page.getByRole("combobox", { name: "Topics", exact: true });
    await topics.click();
    await page.getByRole("combobox", { name: "Search topics" }).fill("flaky-tests");
    await page.getByRole("option", { name: "Create “flaky-tests”" }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Remove flaky-tests" })).toBeVisible();
    await page.locator(".pw-drop").evaluate((zone) => {
      const dt = new DataTransfer();
      dt.items.add(new File(["* @example-org/payments"], "fail-once.txt", { type: "text/plain" }));
      zone.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
    });
    await expect(page.getByRole("progressbar", { name: "Uploading fail-once.txt" })).toBeVisible();
    await expect(page.getByText("The connection dropped. Try again.")).toBeVisible();
    await page.getByRole("button", { name: "Retry" }).click();
    await expect(page.locator(".pw-toast").getByText("fail-once.txt uploaded")).toBeVisible({ timeout: 5000 });
  });
  test("the ownership scope set in the explorer carries to every page, in the URL", async ({ page }) => {
    await page.goto(demo("explorer"));
    const tree = page.getByRole("treegrid", { name: "Organisation" });
    await tree.getByRole("button", { name: "Expand Data and AI" }).click();
    await tree.getByRole("button", { name: "Expand AI platform" }).click();
    await tree.getByRole("row", { name: /^AI transformation/ }).click();
    await expect(page).toHaveURL(/#\/explorer\/overview\?scope=in-ai$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("AI transformation");
    await expect(page.getByRole("button", { name: /^Ownership scope: AI transformation/ })).toBeVisible();
    // A capability page reads the scope: only the initiative's services, each with its path below the scope.
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: /^Services/ }).click();
    await expect(page).toHaveURL(/#\/services\?scope=in-ai$/);
    await expect(page.getByText("Showing AI transformation and its 2 projects")).toBeVisible();
    const table = page.getByRole("table", { name: "Services" });
    await expect(table.locator("tbody tr")).toHaveCount(3);
    await expect(table.getByText("checkout-api")).toHaveCount(0);
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: /^Incidents/ }).click();
    await expect(page.getByRole("table", { name: "Incidents" }).locator("tbody tr")).toHaveText([/INC-2040/]);
    // The picker widens it again; the whole organisation leaves the URL clean.
    await page.getByRole("button", { name: /^Ownership scope: AI transformation/ }).click();
    await page.getByRole("dialog", { name: "Ownership scope" }).getByRole("button", { name: "Whole organisation" }).click();
    await expect(page).toHaveURL(/#\/incidents$/);
    await expect(page.getByRole("table", { name: "Incidents" }).locator("tbody tr")).toHaveCount(2);
  });
  test("a scoped table switches to Tree, rolls up by owner, and Direct only narrows it", async ({ page }) => {
    await page.goto(demo("runs?scope=fn-commerce"));
    const table = page.getByRole("table", { name: "CI runs" });
    await expect(table.locator("tbody tr").first()).toContainText(/Payments\s*›\s*Checkout reliability\s*›\s*Checkout/);
    await page.getByRole("radio", { name: "Tree" }).click();
    const payments = table.getByRole("button", { name: "Expand Payments, 3 runs" });
    await expect(payments).toBeVisible();
    await expect(table.getByRole("row", { name: /Payments/ }).first()).toContainText("1 failed");
    await payments.click();
    await expect(table.getByRole("button", { name: "Expand Checkout reliability, 3 runs" })).toBeVisible();
    await page.getByRole("radio", { name: "Direct only" }).click();
    await expect(page.getByText("Showing Commerce only, not its children")).toBeVisible();
    await expect(table.getByText("No runs match")).toBeVisible();
  });
  test("every top-bar selection changes the numbers, and the same selection shows the same numbers", async ({ page }) => {
    await page.goto(demo("overview"));
    const spend = page.locator(".pw-metric").filter({ hasText: "Spend, month to date" }).locator(".pw-metric__v");
    const value = async () => (await page.locator(".pw-metric").filter({ hasText: "Spend, month to date" }).innerText()).match(/\$[\d.]+k/)?.[0];
    const traffic = page.locator('[aria-label^="Requests per second"]').first();
    await expect(spend).toBeVisible();
    expect(await value()).toBe("$46.5k");
    await expect(traffic).toHaveAttribute("aria-label", /last hour$/);
    // Runtime scope: the numbers move, and come back exactly when the selection does.
    await page.getByRole("button", { name: "Region: region-a" }).click();
    await page.getByRole("menuitemradio", { name: "region-b" }).click();
    await expect.poll(value).not.toBe("$46.5k");
    const regionB = await value();
    await page.getByRole("button", { name: "Region: region-b" }).click();
    await page.getByRole("menuitemradio", { name: "region-a" }).click();
    await expect.poll(value).toBe("$46.5k");
    await page.getByRole("button", { name: "Region: region-a" }).click();
    await page.getByRole("menuitemradio", { name: "region-b" }).click();
    await expect.poll(value).toBe(regionB);
    // Time range: the traffic chart covers the chosen window.
    await page.getByRole("button", { name: /^Time range: Last 1 hour/ }).click();
    await page.getByRole("dialog", { name: "Time range" }).getByRole("radio", { name: "Last 6 hours" }).click();
    await page.keyboard.press("Escape");
    await expect(traffic).toHaveAttribute("aria-label", /last 6 hours$/);
    // Ownership scope: a squad spends less than the whole organisation.
    await page.goto(demo("overview?scope=sq-ai"));
    const squad = Number((await value())?.replace(/[$k]/g, ""));
    expect(squad).toBeGreaterThan(0);
    expect(squad).toBeLessThan(46.5);
  });
  test("phone: the explorer's tree opens in a drawer and closes once a node is picked", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(demo("explorer?scope=in-ai"));
    await page.getByRole("button", { name: "Show organisation" }).click();
    const drawer = page.getByRole("dialog", { name: "Organisation" });
    await drawer.getByRole("row", { name: /^Model gateway/ }).click();
    await expect(drawer).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Model gateway");
    expect(await page.evaluate(() => document.getElementById("main")!.scrollWidth)).toBeLessThanOrEqual(390);
  });
  test("Deployments: a release note is edited in place from the drawer", async ({ page }) => {
    await page.goto(demo("deploys"));
    await page.getByRole("cell", { name: "v2.14.1", exact: true }).first().click();
    const drawer = page.getByRole("dialog", { name: /checkout-api v2.14.1/ });
    await drawer.getByRole("button", { name: /^Release note:/ }).click();
    await drawer.getByRole("textbox", { name: "Release note" }).fill("Retries with backoff; rolled out to region-a.");
    await drawer.getByRole("button", { name: "Save" }).click();
    await expect(drawer.getByRole("button", { name: /Retries with backoff/ })).toBeFocused();
  });
});

test("the demo has no axe violations on its main pages (dark and light)", async ({ page }) => {
  test.setTimeout(180_000);
  const { axe } = await import("./helpers");
  const found: string[] = [];
  for (const theme of ["dark", "light"]) for (const route of ["overview", "services/checkout-api", "incidents/INC-2041", "deploys", "runs/run_8f3k2", "repos/sample-repo", "usage", "access", "admin",
    "explorer?scope=in-ai", "explorer/resources?scope=sq-ai", "explorer/financials?scope=fn-data", "services?scope=in-ai", "runs?scope=fn-commerce"]) {
    await page.goto(`/examples/dist/demo.html?frozen=1&theme=${theme}#/${route}`);
    await page.waitForTimeout(300);
    for (const v of await axe(page)) found.push(`${theme} ${route}: ${v.id} → ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(", ")}`);
  }
  expect(found).toEqual([]);
});

test.describe("the demo's assistant (2.2)", () => {
  const live = (route: string, extra = "") => `/examples/dist/demo.html?controls=0${extra}#/${route}`;
  const panel = (page: import("@playwright/test").Page) => page.getByRole("dialog", { name: "Assistant" });

  test("asks from a suggestion, streams, announces once, and keeps the conversation across pages", async ({ page }) => {
    await page.goto(live("usage"));
    await page.keyboard.press("Control+i");
    await expect(page.getByRole("textbox", { name: "Ask the assistant" })).toBeFocused();
    const ctx = page.getByRole("group", { name: "Context the assistant can see" });
    await expect(ctx.getByText("Usage and cost")).toBeVisible();
    await expect(ctx.getByText("Whole organisation")).toBeVisible();
    await panel(page).getByRole("button", { name: "Why did spend rise this month?" }).click();
    await expect(page.getByRole("button", { name: "Stop" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Assistant, working" })).toBeVisible();
    const status = panel(page).locator('[role="status"][aria-live="polite"]').last();
    await expect(status).toHaveText(/^Assistant replied: spend is \$46\.5k/);
    await expect(panel(page).getByText("$46.5k").first()).toBeVisible();
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Overview" }).click();
    await expect(panel(page)).toBeVisible();
    await expect(panel(page).getByText("Why did spend rise this month?").first()).toBeVisible();
    await expect(ctx.getByText("Overview")).toBeVisible();
  });

  test("Investigate from an incident's menu, the command palette, and the scope in context", async ({ page }) => {
    await page.goto(live("incidents/INC-2041", "&frozen=1"));
    await page.getByRole("button", { name: "More actions for INC-2041" }).click();
    await page.getByRole("menuitem", { name: "Investigate with the assistant" }).click();
    await expect(panel(page).locator(".pw-md").getByText("most likely comes from deploy")).toBeVisible();
    await expect(panel(page).getByRole("link", { name: /^Source 1: Deploy dep_9a1/ })).toBeVisible();
    await expect(panel(page).getByText("Removed:", { exact: false })).toHaveCount(1);
    await panel(page).getByRole("button", { name: "Close" }).click();
    await expect(panel(page)).toBeHidden();
    await page.getByRole("combobox", { name: "Search" }).fill("ask");
    await page.getByRole("option", { name: /Ask the assistant/ }).click();
    await expect(panel(page)).toBeVisible();
    await page.goto(live("services?scope=in-ai", "&frozen=1&state=assistant"));
    await expect(page.getByRole("group", { name: "Context the assistant can see" }).getByText("AI transformation")).toBeVisible();
  });
});

test("the demo has no axe violations with the assistant open (dark and light)", async ({ page }) => {
  test.setTimeout(120_000);
  const { axe } = await import("./helpers");
  const found: string[] = [];
  for (const theme of ["dark", "light"]) for (const route of ["overview", "usage", "incidents/INC-2041", "explorer?scope=in-ai"]) {
    await page.goto(`/examples/dist/demo.html?frozen=1&state=assistant&theme=${theme}#/${route}`);
    await expect(page.getByRole("dialog", { name: "Assistant" }).locator(".pw-msg--ai")).toHaveCount(1);
    await page.waitForTimeout(300);
    for (const v of await axe(page)) found.push(`${theme} ${route}: ${v.id} → ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(", ")}`);
  }
  expect(found).toEqual([]);
});
