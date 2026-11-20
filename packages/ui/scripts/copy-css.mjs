#!/usr/bin/env node
// Copies component CSS into dist/styles.css (density vars removed: they now come from tokens.css) and writes
// dist/fonts.css, which self-hosts the fonts via @fontsource.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTokens } from "./build-tokens.mjs";
const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
mkdirSync(join(PKG, "dist"), { recursive: true });
let css = readFileSync(join(PKG, "src", "styles.css"), "utf8");
css = css.replace(/^:root \{ --pw-row:.*\n/m, "")
  .replace(/^\[data-density="comfortable"\], \.is-comfortable \{.*\n/m, '.is-comfortable { --pw-row: var(--row-comfortable); --pw-ctl: var(--control-comfortable); --pw-cell-x: var(--space-4); }\n');
writeFileSync(join(PKG, "dist", "styles.css"), css);
// Every preset's font files (tokens.json type.fontPresets). @font-face only downloads a file when text on the page uses
// that family, so presets nobody picks cost nothing at runtime.
const files = [...new Set(loadTokens().type.fontPresets.flatMap((f) => f.files))];
writeFileSync(join(PKG, "dist", "fonts.css"), files.map((f) => `@import "${f}";`).join("\n") + "\n");
console.log("css: styles.css, fonts.css");
