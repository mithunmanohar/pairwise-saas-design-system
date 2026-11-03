#!/usr/bin/env node
// tokens.json → dist/tokens.css (themes × densities) + src/tokens.ts (typed names and values).
// tokens.json lives in design-system/ and is the single source of truth.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG = join(HERE, "..");
export const TOKENS_PATH = join(PKG, "..", "..", "design-system", "tokens.json");

export function loadTokens(path = TOKENS_PATH) {
  return JSON.parse(readFileSync(path, "utf8"));
}

const themeValue = (v, theme, fallback) => (typeof v === "string" ? v : v[theme] ?? v[fallback]);

export function buildCss(t) {
  const themes = t.color.themes.map((x) => x.id);
  const out = ["/* Pairwise tokens. Generated from design-system/tokens.json. Do not edit. */"];
  themes.forEach((th, i) => {
    const sel = i === 0 ? `:root, [data-theme="${th}"]` : `[data-theme="${th}"]`;
    const lines = [
      ...t.color.tokens.map((c) => `  --${c.name}: ${themeValue(c.value, th, themes[0])};`),
      ...(t.shadow?.tokens ?? []).map((s) => `  --${s.name}: ${themeValue(s.value, th, themes[0])};`),
      `  color-scheme: ${th === "dark" ? "dark" : "light"};`,
    ];
    out.push(`${sel} {\n${lines.join("\n")}\n}`);
  });
  const root = [];
  for (const fam of ["spacing", "radius", "size"]) root.push(...(t[fam]?.tokens ?? []).map((x) => `  --${x.name}: ${x.value};`));
  root.push(...Object.entries(t.type.families).map(([k, v]) => `  --font-${k}: ${v};`));
  out.push(`:root {\n${root.join("\n")}\n}`);
  // Densities: compact is the default; comfortable swaps only the spacing set used by components.
  out.push(`:root, [data-density="compact"] { --pw-row: var(--row-compact); --pw-ctl: var(--control-compact); --pw-cell-x: var(--space-3); }`);
  out.push(`[data-density="comfortable"] { --pw-row: var(--row-comfortable); --pw-ctl: var(--control-comfortable); --pw-cell-x: var(--space-4); }`);
  for (const g of t.type.groups) for (const s of g.styles) {
    const fam = s.family ?? g.family;
    out.push(`.pw-${s.name} { font-family: var(--font-${fam}); font-size: ${s.fontSize}; line-height: ${s.lineHeight}; font-weight: ${s.fontWeight}; }`);
  }
  return out.join("\n") + "\n";
}

export function buildTs(t) {
  const themes = t.color.themes.map((x) => x.id);
  const colors = Object.fromEntries(t.color.tokens.map((c) => [c.name, Object.fromEntries(themes.map((th) => [th, themeValue(c.value, th, themes[0])]))]));
  const flat = (fam) => Object.fromEntries((t[fam]?.tokens ?? []).map((x) => [x.name, x.value]));
  const q = (o) => JSON.stringify(o, null, 2);
  return `// Generated from design-system/tokens.json by scripts/build-tokens.mjs. Do not edit.
export const themes = ${JSON.stringify(themes)} as const;
export type Theme = (typeof themes)[number];
export const densities = ["compact", "comfortable"] as const;
export type Density = (typeof densities)[number];
export const color = ${q(colors)} as const;
export type ColorToken = keyof typeof color;
export const space = ${q(flat("spacing"))} as const;
export type SpaceToken = keyof typeof space;
export const radius = ${q(flat("radius"))} as const;
export type RadiusToken = keyof typeof radius;
export const size = ${q(flat("size"))} as const;
export type SizeToken = keyof typeof size;
/** CSS custom-property reference for a token, e.g. cssVar("chart-1") → "var(--chart-1)". */
export const cssVar = (name: ColorToken | SpaceToken | RadiusToken | SizeToken): string => \`var(--\${name})\`;
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const t = loadTokens();
  mkdirSync(join(PKG, "dist"), { recursive: true });
  writeFileSync(join(PKG, "dist", "tokens.css"), buildCss(t));
  writeFileSync(join(PKG, "src", "tokens.ts"), buildTs(t));
  console.log(`tokens: ${t.color.tokens.length} colours × ${t.color.themes.length} themes`);
}
