import { expect, type Page } from "@playwright/test";

export type Theme = "light" | "dark";
export const THEMES: Theme[] = ["light", "dark"];

/** Opens a fixture from fixtures.tsx. */
export async function open(page: Page, fixture: string, opts: { theme?: Theme; density?: "compact" | "comfortable" } = {}) {
  const q = new URLSearchParams({ fixture, theme: opts.theme || "light", density: opts.density || "compact" });
  await page.goto(`/packages/ui/test/e2e/.harness/index.html?${q}`);
  await expect(page.locator("#root > *").first()).toBeVisible();
}

export interface AxeViolation { id: string; impact: string | null; help: string; nodes: { target: string[] }[] }

/** Runs axe-core (WCAG 2.0–2.2 A and AA rules) on the page and returns the violations. */
export async function axe(page: Page, include?: string): Promise<AxeViolation[]> {
  if (!(await page.evaluate(() => "axe" in window))) await page.addScriptTag({ path: "node_modules/axe-core/axe.min.js" });
  return page.evaluate(async (sel) => {
    const w = window as unknown as { axe: { run: (ctx: unknown, opts: unknown) => Promise<{ violations: AxeViolation[] }> } };
    const r = await w.axe.run(sel ? { include: [sel] } : document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] }, resultTypes: ["violations"] });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map((n) => ({ target: n.target })) }));
  }, include);
}

/** Short, readable summary for assertion messages. */
export const describeViolations = (v: AxeViolation[]) => v.map((x) => `${x.id} (${x.impact}): ${x.help} → ${x.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(", ")}`).join("\n");
