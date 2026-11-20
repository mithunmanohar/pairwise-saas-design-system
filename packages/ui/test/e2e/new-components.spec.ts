// Stage 4: the new components.
import { test, expect } from "@playwright/test";
import { open } from "./helpers";

const state = async (page: import("@playwright/test").Page) => JSON.parse(await page.getByTestId("state").innerText());

test("RadioGroup: labelled group, arrows select and skip disabled, descriptions read", async ({ page }) => {
  await open(page, "new-form");
  const group = page.getByRole("radiogroup", { name: "Plan" });
  await expect(group).toHaveAccessibleDescription("You can change this later.");
  await expect(group.getByRole("radio", { name: "Team" })).toHaveAccessibleDescription("10 runners");
  await group.getByRole("radio", { name: "Team" }).focus();
  // Radix selects on arrow keys while the key is down (it moves focus a tick later), as when a person presses it.
  await page.keyboard.down("ArrowDown"); await page.waitForTimeout(50); await page.keyboard.up("ArrowDown");
  await expect(group.getByRole("radio", { name: "Free" })).toBeFocused();
  await expect(page.getByTestId("state")).toContainText('"plan":"free"');
  await expect(group.getByRole("radio", { name: "Enterprise" })).toBeDisabled();
});

test("Combobox (single): typing opens and filters, the highlight is announced, Enter picks, clear works", async ({ page }) => {
  await open(page, "new-form");
  const trigger = page.getByRole("combobox", { name: "Reviewer", exact: true });
  await expect(trigger).toHaveAttribute("aria-required", "true");
  await trigger.focus();
  await page.keyboard.press("c");
  const search = page.getByRole("combobox", { name: "Search reviewer" });
  await expect(search).toBeFocused();
  await expect(search).toHaveValue("c");
  await search.fill("dev c");
  await expect(page.getByRole("option")).toHaveCount(1);
  await expect(search).toHaveAttribute("aria-activedescendant", (await page.getByRole("option").first().getAttribute("id"))!);
  await page.keyboard.press("Enter");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveText(/Dev C/);
  expect((await state(page)).owner).toBe("dev-c");
  await page.getByRole("button", { name: "Clear reviewer" }).click();
  expect((await state(page)).owner).toBe(null);
  await expect(trigger).toBeFocused();
});

test("Combobox (multiple): stays open, toggles, creates, removes with tags and Backspace", async ({ page }) => {
  await open(page, "new-form");
  const trigger = page.getByRole("combobox", { name: "Topics", exact: true });
  await trigger.click();
  const pop = page.getByRole("dialog", { name: "Topics" });
  await pop.getByRole("option", { name: "docs" }).click();
  await expect(pop).toBeVisible();
  await expect(pop.getByRole("option", { name: "docs" })).toHaveAttribute("aria-checked", "true");
  await pop.getByRole("combobox", { name: "Search topics" }).fill("security");
  await pop.getByRole("option", { name: "Create “security”" }).click();
  expect((await state(page)).topics).toEqual(["ci", "docs", "security"]);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page.getByRole("button", { name: "Remove ci" }).click();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Backspace");
  expect((await state(page)).topics).toEqual(["docs"]);
  await expect(page.getByRole("list", { name: "Selected topics" }).getByRole("listitem")).toHaveCount(1);
});

test("DatePicker: typed dates are checked; the calendar opens on the date and picks with the keyboard", async ({ page }) => {
  await open(page, "new-form");
  const input = page.getByRole("textbox", { name: "Due date" });
  await input.fill("2026-13-01"); await input.press("Enter");
  await expect(input).toHaveAccessibleDescription("Use the format YYYY-MM-DD.");
  await input.fill("2026-10-30"); await input.press("Enter");
  await expect(input).toHaveAccessibleDescription("Choose 2026-11-01 or later.");
  await input.fill("2026-11-25"); await input.press("Enter");
  await expect(input).toHaveAccessibleDescription("That date isn’t available.");
  await input.fill("2026-11-24"); await input.press("Enter");
  await expect(input).not.toHaveAttribute("aria-invalid", "true");
  expect((await state(page)).due).toBe("2026-11-24");
  await page.getByRole("button", { name: "Choose due date on a calendar" }).click();
  const cal = page.getByRole("dialog", { name: "Due date: calendar" });
  await expect(cal.getByRole("button", { name: /November 24, 2026, selected/ })).toBeFocused();
  await expect(cal.getByRole("button", { name: /November 25, 2026, unavailable/ })).toBeDisabled();
  await page.keyboard.press("ArrowRight"); // 25 is disabled: day-picker skips it
  await page.keyboard.press("Enter");
  await expect(cal).toBeHidden();
  expect((await state(page)).due).toBe("2026-11-26");
  await expect(input).toBeFocused();
});

test("DateRangePicker: presets apply at once; a drafted range needs Apply; too-long ranges are blocked", async ({ page }) => {
  await open(page, "new-form");
  const trigger = page.getByRole("button", { name: "Billing period" });
  await trigger.click();
  await page.getByRole("group", { name: "Presets" }).getByRole("button", { name: "November" }).click();
  expect((await state(page)).range).toEqual({ from: "2026-11-01", to: "2026-11-30" });
  await expect(trigger).toHaveText(/2026-11-01 – 2026-11-30/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  const pop = page.getByRole("dialog", { name: "Billing period" });
  await pop.getByRole("button", { name: "Cancel" }).click();
  await expect(pop).toBeHidden();
  await expect(trigger).toBeFocused();
  expect((await state(page)).range.to).toBe("2026-11-30");
  // A drafted range longer than maxDays (45) can't be applied.
  await trigger.click();
  await pop.getByRole("button", { name: /November 1, 2026/ }).click();
  await pop.getByRole("button", { name: /December 31, 2026/ }).click();
  await expect(pop.getByRole("status").filter({ hasText: "days or fewer" })).toHaveText("Choose 45 days or fewer.");
  await expect(pop.getByRole("button", { name: "Apply" })).toBeDisabled();
});

test("KeyValueList: labelled facts, copy buttons, and missing values read as None", async ({ page }) => {
  await open(page, "details");
  const dl = page.getByRole("list", { name: "Run details" }).or(page.locator("dl[aria-label='Run details']"));
  await expect(dl).toContainText("run_8f3k2");
  await expect(page.getByRole("button", { name: "Copy run" })).toBeVisible();
  await expect(page.locator("dd").filter({ hasText: "None" })).toHaveCount(1);
});

test("InlineEdit: Enter edits, Esc restores, validation and async errors keep it open, focus returns", async ({ page }) => {
  await open(page, "details");
  const view = page.getByRole("button", { name: /^Repository name: sample-repo ?, edit$/ });
  await view.focus(); await page.keyboard.press("Enter");
  const field = page.getByRole("textbox", { name: "Repository name" });
  await expect(field).toBeFocused();
  await field.fill("Bad Name"); await page.keyboard.press("Enter");
  await expect(field).toHaveAccessibleDescription("Use lowercase letters, digits and dashes.");
  await field.fill("taken"); await page.keyboard.press("Enter");
  await expect(field).toHaveAccessibleDescription("That name is taken.");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: /^Repository name: sample-repo ?, edit$/ })).toBeFocused();
  await page.keyboard.press("Enter");
  await page.getByRole("textbox", { name: "Repository name" }).fill("retry-lab");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("button", { name: /^Repository name: retry-lab ?, edit$/ })).toBeFocused();
});

test("Avatars and progress have useful names and values", async ({ page }) => {
  await open(page, "details");
  await expect(page.getByRole("img", { name: "Reviewers: Dev A, Dev B, Dev C and 2 others" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Dev F, critical" })).toContainText("DF");
  const rollout = page.getByRole("progressbar", { name: "Rollout" });
  await expect(rollout).toHaveAttribute("aria-valuenow", "3");
  await expect(rollout).toHaveAttribute("aria-valuemax", "12");
  await expect(rollout).toHaveAttribute("aria-valuetext", "3 of 12 replicas");
  await expect(page.getByRole("progressbar", { name: "Indexing" })).not.toHaveAttribute("aria-valuenow", /./);
});

test("FileUpload: the button opens the picker; dropped files are checked for type and size; retry and remove work", async ({ page }) => {
  await open(page, "upload");
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Choose files" }).click();
  await (await chooser).setFiles([]);
  await page.locator(".pw-drop").evaluate((zone) => {
    const dt = new DataTransfer();
    dt.items.add(new File(["{}"], "report.json", { type: "application/json" }));
    dt.items.add(new File(["x"], "photo.png", { type: "image/png" }));
    dt.items.add(new File([new Uint8Array(1024 * 1024 + 1)], "huge.txt", { type: "text/plain" }));
    zone.dispatchEvent(new DragEvent("dragover", { dataTransfer: dt, bubbles: true, cancelable: true }));
    zone.dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
  });
  const list = page.getByRole("list", { name: "Attachments: files" });
  await expect(list.getByText("report.json")).toBeVisible();
  await expect(list.getByText("Not an accepted type (.json,.txt).")).toBeVisible();
  await expect(list.getByText("Larger than 1 MB.")).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "1 file added." })).toHaveCount(1);
  await expect(page.getByRole("progressbar", { name: "Uploading sbom.json" })).toHaveAttribute("aria-valuenow", "40");
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByRole("progressbar", { name: "Uploading notes.txt" })).toBeVisible();
  await page.getByRole("button", { name: "Dismiss photo.png" }).click();
  await page.getByRole("button", { name: "Remove sbom.json" }).click();
  await expect(list.getByText("photo.png")).toHaveCount(0);
  await expect(list.getByText("sbom.json")).toHaveCount(0);
});
