// Pairwise 2.2: the assistant. Keyboard, focus, live regions and the content parts, in real Chromium.
import { test, expect, type Page } from "@playwright/test";
import { open, axe, describeViolations, THEMES } from "./helpers";

const panel = (page: Page) => page.getByRole("dialog", { name: "Assistant" });
const composer = (page: Page) => page.getByRole("textbox", { name: "Ask the assistant" });
async function openPanel(page: Page) {
  await open(page, "assistant-shell");
  await page.getByRole("button", { name: "Assistant" }).click();
  await expect(composer(page)).toBeFocused();
}

test.describe("assistant panel", () => {
  test.use({ viewport: { width: 1440, height: 800 } }); // docked at 1280 px and wider
  test("Ctrl+I toggles the docked panel; focus goes to the composer and back to where it was", async ({ page }) => {
    await open(page, "assistant-shell");
    const launcher = page.getByRole("button", { name: "Assistant" });
    await expect(launcher).toHaveAttribute("aria-keyshortcuts", "Control+I Meta+I");
    await launcher.focus();
    await page.keyboard.press("Control+i");
    await expect(panel(page)).toBeVisible();
    await expect(composer(page)).toBeFocused();
    await expect(launcher).toHaveAttribute("aria-expanded", "true");
    // Docked, not modal: the page stays usable beside it.
    await expect(page.locator("header.pw-topbar")).not.toHaveAttribute("aria-hidden", "true");
    await page.getByRole("button", { name: "Page button" }).click();
    await expect(panel(page)).toBeVisible();
    // Escape on the page doesn't close it; Escape inside it does, and focus returns.
    await page.keyboard.press("Escape");
    await expect(panel(page)).toBeVisible();
    await composer(page).focus();
    await page.keyboard.press("Escape");
    await expect(panel(page)).toBeHidden();
    await expect(launcher).toBeFocused();
    await expect(launcher).toHaveAttribute("aria-expanded", "false");
    await page.keyboard.press("Control+i");
    await expect(composer(page)).toBeFocused();
    await page.keyboard.press("Control+i");
    await expect(panel(page)).toBeHidden();
  });

  test("an answer streams without being announced, then is announced once; feedback toggles", async ({ page }) => {
    await openPanel(page);
    const status = panel(page).locator('[role="status"][aria-live="polite"]').last();
    await expect(page.getByText("Ask about what you're looking at")).toBeVisible();
    await composer(page).fill("Why is checkout slow?");
    await page.keyboard.press("Enter");
    await expect(composer(page)).toHaveValue("");
    const convo = panel(page).getByRole("list", { name: "Conversation" });
    await expect(convo.getByText("Why is checkout slow?")).toBeVisible();
    await expect(page.getByRole("button", { name: "Stop" })).toBeVisible();
    await expect(convo.locator('[aria-busy="true"]')).toHaveCount(1);
    await expect(status).toHaveText("");
    await expect(status).toHaveText("Assistant replied: checkout-api is degraded.");
    await expect(convo.locator('[aria-busy="true"]')).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
    await convo.getByRole("link", { name: "Source 1: checkout-api latency" }).click();
    await expect(page.locator("body")).toHaveAttribute("data-source", "s1");
    await expect(convo.getByText("Added:", { exact: false })).toHaveCount(1);
    const helpful = page.getByRole("button", { name: "Helpful", exact: true });
    await helpful.click();
    await expect(helpful).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Not helpful" }).click();
    await expect(helpful).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByRole("button", { name: "Not helpful" })).toHaveAttribute("aria-pressed", "true");
  });

  test("Stop ends the answer as stopped and offers Regenerate", async ({ page }) => {
    await openPanel(page);
    await composer(page).fill("Why?");
    await page.keyboard.press("Enter");
    await page.getByRole("button", { name: "Stop" }).click();
    await expect(panel(page).getByText("Stopped", { exact: true })).toBeVisible();
    await expect(panel(page).locator('[role="status"][aria-live="polite"]').last()).toHaveText("Response stopped.");
    await expect(page.getByRole("button", { name: "Regenerate" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Helpful", exact: true })).toHaveCount(0);
  });

  test("an empty prompt is refused with a message; Shift+Enter adds a line", async ({ page }) => {
    await openPanel(page);
    await page.keyboard.press("Enter");
    await expect(composer(page)).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("Type a question first.")).toBeVisible();
    await page.keyboard.type("one");
    await expect(page.getByText("Type a question first.")).toHaveCount(0);
    await page.keyboard.press("Shift+Enter");
    await page.keyboard.type("two");
    await expect(composer(page)).toHaveValue("one\ntwo");
  });

  test("@ lists mentions: arrows move, Enter inserts; Escape closes the list, not the panel", async ({ page }) => {
    await openPanel(page);
    await page.keyboard.type("Why is @");
    const list = page.getByRole("listbox", { name: "Mentions" });
    await expect(list.getByRole("option")).toHaveCount(3);
    await expect(list.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowDown");
    await expect(list.getByRole("option", { name: /ranker-model/ })).toHaveAttribute("aria-selected", "true");
    await expect(composer(page)).toHaveAttribute("aria-activedescendant", /.+/);
    await page.keyboard.press("Enter");
    await expect(composer(page)).toHaveValue("Why is @ranker-model ");
    await expect(list).toBeHidden();
    await expect(composer(page)).toBeFocused();
    await page.keyboard.type("and @che");
    await expect(page.getByRole("listbox", { name: "Mentions" }).getByRole("option")).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox", { name: "Mentions" })).toBeHidden();
    await expect(panel(page)).toBeVisible();
    await expect(composer(page)).toBeFocused();
  });

  test("/ at the start lists commands", async ({ page }) => {
    await openPanel(page);
    await page.keyboard.type("/sum");
    const list = page.getByRole("listbox", { name: "Commands" });
    await expect(list.getByRole("option")).toHaveText([/\/summarise/]);
    await page.keyboard.press("Enter");
    await expect(composer(page)).toHaveValue("/summarise ");
  });

  test("context: chips are icon + word, removable; all context lists every item; add from the page", async ({ page }) => {
    await openPanel(page);
    const ctx = page.getByRole("group", { name: "Context the assistant can see" });
    await expect(ctx.getByRole("listitem")).toHaveCount(3);
    await expect(ctx.getByRole("button", { name: "Remove Services from context" })).toHaveCount(0); // the page can't be removed
    await ctx.getByRole("button", { name: "Remove prod / region-a from context" }).click();
    await ctx.getByRole("button", { name: "+1 more" }).click();
    const inspector = page.getByRole("dialog", { name: "Context the assistant can see" });
    await expect(inspector.getByText("Your access")).toBeVisible();
    await expect(inspector.getByText("The assistant can read; it can't change anything.")).toBeVisible();
    await expect(inspector.getByRole("button", { name: /Change ownership scope/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(inspector).toBeHidden();
    await expect(panel(page)).toBeVisible();
    await ctx.getByRole("button", { name: "Add" }).click();
    await expect(page.getByRole("combobox", { name: "Add context" })).toBeFocused();
    await page.keyboard.type("checkout");
    await page.keyboard.press("Enter");
    await expect(ctx.getByRole("listitem")).toHaveCount(3);
    await expect(ctx.getByRole("button", { name: "+2 more" })).toBeVisible();
  });

  test("Report opens a dialog with a reason; Copy and About are there", async ({ page }) => {
    await openPanel(page);
    await composer(page).fill("Why?");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy answer" })).toBeVisible();
    await page.getByRole("button", { name: "About" }).click();
    await expect(page.getByRole("dialog", { name: "About this answer" }).getByText("metrics.query, deploys.list")).toBeVisible();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "More actions for this answer" }).click();
    await page.getByRole("menuitem", { name: "Report a problem" }).click();
    const dlg = page.getByRole("dialog", { name: "Report a problem with this answer" });
    await expect(dlg).toBeVisible();
    await dlg.getByRole("radio", { name: "Out of date" }).click();
    await dlg.getByRole("button", { name: "Send report" }).click();
    await expect(dlg).toBeHidden();
    await expect(page.locator("body")).toHaveAttribute("data-report", "Out of date");
  });

  test("Expand covers the content, which becomes inert; Dock returns it", async ({ page }) => {
    await openPanel(page);
    await page.getByRole("button", { name: "Expand" }).click();
    await expect(panel(page)).toHaveClass(/is-expanded/);
    await expect(page.locator("main#main")).toHaveAttribute("inert", "");
    await page.getByRole("button", { name: "Dock beside the page" }).click();
    await expect(page.locator("main#main")).not.toHaveAttribute("inert", "");
  });

  test("below 1280 px the panel is a modal drawer", async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 760 });
    await openPanel(page);
    await expect(page.locator(".pw-layer .pw-asst")).toBeVisible();
    await expect(page.locator("header.pw-topbar")).toHaveAttribute("aria-hidden", "true");
    await expect(page.getByRole("button", { name: "Expand" })).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(panel(page)).toBeHidden();
    await expect(page.getByRole("button", { name: "Assistant" })).toBeFocused();
  });

  test("Ask the assistant from a row menu opens the panel with the row as extra context", async ({ page }) => {
    await open(page, "assistant-shell");
    await page.getByRole("button", { name: "Actions for checkout-api" }).click();
    await page.getByRole("menuitem", { name: "Ask the assistant" }).click();
    await expect(panel(page)).toBeVisible();
    await expect(page.getByTestId("ask")).toHaveText("Why is checkout-api slow?|page,own,rt,time,perm,svc:checkout-api");
  });
});

test.describe("content parts", () => {
  test("Markdown renders Pairwise elements; raw HTML and images are never rendered", async ({ page }) => {
    await open(page, "assistant-content");
    const md = page.locator(".pw-md").first();
    await expect(md.getByRole("heading", { level: 3 })).toHaveText("Latency by region");
    await expect(md.getByRole("region", { name: "Table" }).getByRole("row")).toHaveCount(3);
    await expect(md.locator("script, img")).toHaveCount(0);
    await expect(md.getByRole("link", { name: "diagram" })).toHaveAttribute("href", "https://example.com/diagram.png");
    await expect(md.getByRole("button", { name: "Copy yaml" })).toBeVisible();
    await md.getByRole("link", { name: "docs" }).click();
    await expect(page.getByTestId("opened")).toHaveText("https://example.com/runbook");
  });

  test("Citation, SourceList, ResourceCard and Disclosure work by keyboard", async ({ page }) => {
    await open(page, "assistant-content");
    await page.getByRole("link", { name: "Source 1: Deploy run_8f3k2" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("opened")).toHaveText("cite-1");
    const sources = page.locator(".pw-sources summary");
    await sources.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("list", { name: "Sources" }).getByRole("listitem")).toHaveCount(2);
    await page.getByRole("link", { name: "checkout-api" }).first().click();
    await expect(page.getByTestId("opened")).toHaveText("b");
    const card = page.getByRole("article", { name: "Web app checkout-api" });
    await expect(card.getByText("Degraded")).toBeVisible();
    await card.getByRole("button", { name: "Actions for checkout-api" }).click();
    await page.getByRole("menuitem", { name: "Ask the assistant" }).click();
    await expect(page.getByTestId("opened")).toHaveText("ask");
    const disc = page.locator(".pw-disc:not(.pw-sources) summary");
    await disc.focus();
    await page.keyboard.press("Space");
    await expect(page.getByText("Read the latency series, then the deploys.")).toBeVisible();
  });

  test("CodeBlock diff marks lines in words; Avatar icon is named; FileUpload as a button", async ({ page }) => {
    await open(page, "assistant-content");
    const code = page.getByRole("region", { name: "config.yaml" }).or(page.locator('pre[aria-label="config.yaml"]'));
    await expect(code).toContainText("Removed: timeout: 2s");
    await expect(code).toContainText("Added: timeout: 5s");
    await expect(page.getByRole("img", { name: "Assistant" })).toBeVisible();
    const attach = page.getByRole("button", { name: "Attach files" });
    await expect(attach).toBeVisible();
    const chooser = page.waitForEvent("filechooser");
    await attach.click();
    await (await chooser).setFiles([]);
    await page.locator('input[type="file"]').evaluate((el) => {
      const input = el as HTMLInputElement, dt = new DataTransfer();
      dt.items.add(new File(["ok"], "build.log", { type: "text/plain" }));
      input.files = dt.files; input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await expect(page.getByRole("list", { name: "Attach files: files" }).getByText("build.log")).toBeVisible();
  });
});

test.describe("assistant accessibility", () => {
  test.use({ viewport: { width: 1440, height: 800 } });
  for (const theme of THEMES) {
    test(`axe finds nothing with a conversation, sources, mentions and the context inspector open (${theme})`, async ({ page }) => {
      await open(page, "assistant-shell", { theme });
      await page.getByRole("button", { name: "Assistant" }).click();
      expect(describeViolations(await axe(page))).toBe("");
      await composer(page).fill("Why?");
      await page.keyboard.press("Enter");
      expect(describeViolations(await axe(page))).toBe(""); // while streaming
      await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
      await page.locator(".pw-sources summary").click();
      expect(describeViolations(await axe(page))).toBe("");
      await page.getByRole("button", { name: "Expand" }).click();
      expect(describeViolations(await axe(page))).toBe("");
      await page.getByRole("button", { name: "Dock beside the page" }).click();
      await composer(page).focus();
      await page.keyboard.type("@");
      await expect(page.getByRole("listbox", { name: "Mentions" })).toBeVisible();
      expect(describeViolations(await axe(page))).toBe("");
      await page.keyboard.press("Escape");
      await page.getByRole("button", { name: "+2 more" }).click();
      expect(describeViolations(await axe(page))).toBe("");
    });
  }
  test("the overlay drawer and the phone layout have no axe violations", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await open(page, "assistant-shell", { theme: "dark" });
    await page.getByRole("button", { name: "Assistant" }).click();
    await composer(page).fill("Why?");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
    expect(describeViolations(await axe(page))).toBe("");
  });
});
