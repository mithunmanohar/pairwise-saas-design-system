#!/usr/bin/env node
// Component CSS must use tokens, never raw colour values. Fails on hex, rgb(), hsl() or named colours
// outside tokens.css. Raw px lengths are reported (not failed) until they are moved to spacing tokens.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(PKG, "src", "styles.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const NAMED = /:\s*[^;]*\b(red|blue|green|black|white|gray|grey|orange|purple|yellow)\b/gi;
const colours = [...css.matchAll(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/gi)].map((m) => m[0]).concat([...css.matchAll(NAMED)].map((m) => m[1]));
const px = (css.replace(/var\([^)]*\)/g, "").match(/\b\d+(\.\d+)?px\b/g) || []).length;
if (px) console.log(`note: ${px} raw px lengths remain in styles.css (allowed for now)`);
if (colours.length) { console.error(`${colours.length} raw colour value(s) in styles.css: ${[...new Set(colours)].join(", ")}`); process.exit(1); }
console.log("lint: tokens-only colours OK");
