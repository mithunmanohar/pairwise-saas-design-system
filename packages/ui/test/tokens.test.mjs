import { test } from "node:test";
import assert from "node:assert/strict";
import { loadTokens, buildCss, buildTs } from "../scripts/build-tokens.mjs";
import { contrast, deltaE2000, simulate, worstAdjacentDeltaE } from "../scripts/color.mjs";

const t = loadTokens();
const themes = t.color.themes.map((x) => x.id);
const val = (name, th) => { const c = t.color.tokens.find((x) => x.name === name); assert.ok(c, `missing token ${name}`); return typeof c.value === "string" ? c.value : c.value[th]; };
const SURFACES = ["surface", "surface-raised", "surface-sunken", "surface-overlay"];
const VISIONS = ["normal", "protan", "deutan", "tritan"];
const categorical = t.color.tokens.map((c) => c.name).filter((n) => /^chart-\d+$/.test(n));

test("generated CSS has every colour in every theme, plus both densities", () => {
  const css = buildCss(t);
  for (const th of themes) assert.match(css, new RegExp(`\\[data-theme="${th}"\\]`));
  for (const c of t.color.tokens) assert.equal(css.split(`--${c.name}:`).length - 1, themes.length, c.name);
  assert.match(css, /\[data-density="comfortable"\]/);
  assert.doesNotMatch(css, /undefined/);
});

test("generated TS exports typed token names", () => {
  const ts = buildTs(t);
  for (const c of t.color.tokens) assert.ok(ts.includes(`"${c.name}"`), c.name);
  assert.match(ts, /export type ColorToken = keyof typeof color;/);
});

test("contrast helper matches the WCAG reference values", () => {
  assert.equal(contrast("#000000", "#ffffff").toFixed(2), "21.00");
  assert.equal(contrast("#777777", "#ffffff").toFixed(2), "4.48");
});

test("CIEDE2000 is zero for identical colours and symmetric", () => {
    assert.equal(deltaE2000("#336699", "#336699"), 0);
  assert.equal(deltaE2000("#336699", "#993366").toFixed(6), deltaE2000("#993366", "#336699").toFixed(6));
});

test("CVD simulation is the identity for normal vision and changes reds for protanopia", () => {
  assert.equal(simulate("#b42318", "normal"), "#b42318");
  assert.notEqual(simulate("#b42318", "protan"), "#b42318");
});

for (const th of themes) {
  test(`text tokens reach 4.8:1 on every surface (${th})`, () => {
    for (const s of SURFACES) for (const ink of ["ink", "ink-muted", "status-critical", "status-warning"]) {
      const r = contrast(val(ink, th), val(s, th));
      assert.ok(r >= 4.8, `${ink} on ${s} (${th}) = ${r.toFixed(2)}`);
    }
  });

  test(`non-text tokens reach 3:1 on every surface (${th})`, () => {
    for (const s of SURFACES) for (const n of ["border-strong", "focus-ring", ...categorical]) {
      const r = contrast(val(n, th), val(s, th));
      assert.ok(r >= 3, `${n} on ${s} (${th}) = ${r.toFixed(2)}`);
    }
  });

  test(`categorical chart colours: worst adjacent ΔE ≥ 11 across colour-vision types (${th})`, () => {
    const seq = [...categorical, "chart-other"].map((n) => val(n, th));
    const w = worstAdjacentDeltaE(seq);
    assert.ok(w.value >= 11, `worst ${w.value.toFixed(1)} between ${w.pair} (${w.vision})`);
  });


}
