// axe-core (WCAG 2.0–2.2 A/AA rules) on every catalogue card and every e2e fixture, in light and dark.
//
// a11y-known.json is a ratchet, not an allow-list to grow: it records the violations that existed when these tests were
// added (Pairwise 2.0, stage 1). A violation not listed fails. A listed one that no longer occurs also fails, so the
// file only ever shrinks; delete its entry when you fix it. The goal is an empty file.
import { test, expect } from "@playwright/test";
import { axe, THEMES, open } from "./helpers";
import known from "./a11y-known.json" with { type: "json" };
import { fixtures } from "./fixtures";

const KNOWN = known as Record<string, string[]>;

function compare(found: Record<string, string[]>, scope: (k: string) => boolean) {
  const added: string[] = [], fixed: string[] = [];
  for (const [k, ids] of Object.entries(found)) for (const id of ids) if (!(KNOWN[k] || []).includes(id)) added.push(`${k}: ${id}`);
  for (const [k, ids] of Object.entries(KNOWN)) if (scope(k)) for (const id of ids) if (!(found[k] || []).includes(id)) fixed.push(`${k}: ${id}`);
  return { added, fixed };
}

for (const theme of THEMES) {
  test(`catalogue cards have no new axe violations (${theme})`, async ({ page, request }) => {
    test.setTimeout(120_000);
    const cards: string[] = await (await request.get("/__cards")).json();
    const found: Record<string, string[]> = {};
    const detail: string[] = [];
    for (const card of cards) {
      await page.goto(`/__card/${card}?th=${theme}&dn=compact`);
      await page.waitForLoadState("networkidle");
      const v = await axe(page);
      if (v.length) {
        found[`card:${card}:${theme}`] = [...new Set(v.map((x) => x.id))].sort();
        detail.push(...v.map((x) => `card:${card}:${theme} ${x.id}: ${x.help} → ${x.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(", ")}`));
      }
    }
    const { added, fixed } = compare(found, (k) => k.startsWith("card:") && k.endsWith(":" + theme));
    expect(added, "new violations:\n" + detail.filter((d) => added.some((a) => d.startsWith(a.replace(": ", " ")))).join("\n")).toEqual([]);
    expect(fixed, "fixed: remove these from a11y-known.json").toEqual([]);
  });

  test(`fixtures have no new axe violations (${theme})`, async ({ page }) => {
    const found: Record<string, string[]> = {};
    for (const name of Object.keys(fixtures)) {
      await open(page, name, { theme });
      const v = await axe(page);
      if (v.length) found[`fixture:${name}:${theme}`] = [...new Set(v.map((x) => x.id))].sort();
    }
    const { added, fixed } = compare(found, (k) => k.startsWith("fixture:") && k.endsWith(":" + theme));
    expect(added, "new violations").toEqual([]);
    expect(fixed, "fixed: remove these from a11y-known.json").toEqual([]);
  });
}
