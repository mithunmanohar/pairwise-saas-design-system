#!/usr/bin/env node
// Assembles the GitHub Pages site into <outDir> (default _site). Run after `pnpm -r build`.
//   /             landing page, styled with the design system's own CSS
//   /demo/        the live demo app (examples/dist/demo.*): three working screens, routed
//   /catalogue/   every component, live (design-system/catalogue.html and the preview kit it loads)
//   /images/      README screenshots used by the landing page
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT = resolve(process.argv[2] || join(ROOT, "_site"));
const need = ["examples/dist/demo.html", "design-system/catalogue.html", "docs/images/hero.png"];
for (const f of need) if (!existsSync(join(ROOT, f))) throw new Error(`${f} is missing: run \`pnpm -r build\` (and the screenshots) first`);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// Demo app
const demo = join(OUT, "demo");
mkdirSync(demo);
for (const f of readdirSync(join(ROOT, "examples", "dist"))) {
  if (f === "fonts" || f.startsWith("demo.")) cpSync(join(ROOT, "examples", "dist", f), join(demo, f === "demo.html" ? "index.html" : f), { recursive: true });
}

// Catalogue + the preview kit it loads (tokens.css, components/**)
const cat = join(OUT, "catalogue");
mkdirSync(cat);
cpSync(join(ROOT, "design-system", "catalogue.html"), join(cat, "index.html"));
cpSync(join(ROOT, "design-system", "tokens.css"), join(cat, "tokens.css"));
cpSync(join(ROOT, "design-system", "components"), join(cat, "components"), { recursive: true, filter: (src) => !src.endsWith("README.md") });

// Images
const img = join(OUT, "images");
mkdirSync(img);
cpSync(join(ROOT, "docs", "images", "hero.png"), join(img, "hero.png"));
for (const s of ["service-health", "run-detail", "settings"]) for (const t of ["light", "dark"]) {
  cpSync(join(ROOT, "docs", "images", "screens", `${s}-${t}.png`), join(img, `${s}-${t}.png`));
}

const card = (route, img, title, body) => `
      <a class="lp-card" href="demo/#/${route}">
        <picture><source srcset="images/${img}-dark.png" media="(prefers-color-scheme: dark)"><img src="images/${img}-light.png" alt="${title} screen" loading="lazy"></picture>
        <span class="pw-subheading">${title}</span>
        <span class="pw-muted">${body}</span>
        <span class="pw-linkbtn">Open in the live demo</span>
      </a>`;

writeFileSync(join(OUT, "index.html"), `<!doctype html>
<html lang="en" data-theme="light" data-density="compact"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pairwise: a production-grade design system for ML platforms, AI applications and SaaS</title>
<meta name="description" content="Design tokens and 42 accessible React components for ML platforms, LLM and agentic AI tools, AIOps dashboards and multi-tenant SaaS. Light and dark themes, two densities, built with AI agents.">
<link rel="stylesheet" href="catalogue/tokens.css"><link rel="stylesheet" href="catalogue/components/bundle.css">
<script>if (matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.dataset.theme = "dark";</script>
<style>
body { margin: 0; }
.lp { max-width: 1160px; margin: 0 auto; padding: 0 var(--space-5); }
.lp-top { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); height: 64px; border-bottom: 1px solid var(--border); }
.lp-top nav { display: flex; gap: var(--space-4); }
.lp-top a { color: var(--ink); text-decoration: none; }
.lp-top a:hover { text-decoration: underline; }
.lp-hero { padding: var(--space-12) 0 var(--space-8); display: grid; gap: var(--space-4); max-width: 760px; }
.lp-hero h1 { margin: 0; font-size: 40px; line-height: 48px; font-weight: 600; letter-spacing: -0.01em; }
.lp-hero p { margin: 0; font-size: 18px; line-height: 28px; color: var(--ink-muted); }
.lp-cta { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-top: var(--space-2); }
.lp-cta a { text-decoration: none; }
.lp-shot { display: block; width: 100%; height: auto; border: 1px solid var(--border); border-radius: var(--radius-md); }
.lp-h2 { margin: var(--space-12) 0 var(--space-5); }
.lp-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-5); }
.lp-card { display: grid; gap: var(--space-2); align-content: start; padding: var(--space-4); background: var(--surface-raised); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--ink); text-decoration: none; }
.lp-card:hover { border-color: var(--border-strong); }
.lp-card img { width: 100%; height: auto; aspect-ratio: 16 / 10; object-fit: cover; object-position: top left; border: 1px solid var(--border); border-radius: var(--radius-sm); margin-bottom: var(--space-2); }
.lp-points { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-5) var(--space-6); margin: 0; padding: 0; list-style: none; }
.lp-points b { display: block; margin-bottom: var(--space-1); }
.lp-foot { margin: var(--space-12) 0 0; padding: var(--space-5) 0 var(--space-8); border-top: 1px solid var(--border); color: var(--ink-muted); }
@media (max-width: 860px) { .lp-cards, .lp-points { grid-template-columns: 1fr; } .lp-hero h1 { font-size: 32px; line-height: 40px; } }
</style></head>
<body><div class="lp">
  <header class="lp-top">
    <strong class="pw-subheading">Pairwise</strong>
    <nav aria-label="Site"><a href="demo/">Live demo</a><a href="catalogue/">Components</a><a href="https://github.com/mithunmanohar/pairwise-saas-design-system">GitHub</a></nav>
  </header>
  <main>
    <section class="lp-hero">
      <h1>A production-grade design system for ML platforms, AI applications and SaaS</h1>
      <p>Design tokens and 42 accessible React components, with light and dark themes and two densities. Every app built on it looks and behaves the same, whether a person or an AI agent wrote the screen.</p>
      <div class="lp-cta">
        <a class="pw-btn pw-btn--primary" href="demo/"><span>Open the live demo</span></a>
        <a class="pw-btn pw-btn--secondary" href="catalogue/"><span>Browse all components</span></a>
      </div>
    </section>
    <img class="lp-shot" src="images/hero.png" alt="A service health dashboard built with Pairwise, half in light theme and half in dark">
    <h2 class="pw-heading lp-h2">Three working screens, built only from the package</h2>
    <div class="lp-cards">${card("services", "service-health", "Service health", "Observability: metrics with context, latency against the SLO, errors by type, endpoints worst first. Updates live.")}${card("runs", "run-detail", "CI run detail", "Developer platform: a checks matrix shows new versus flaky failures, the failing log, run history and steps.")}${card("repos", "settings", "Settings", "Everyday SaaS: validation that says how to fix it, toggles, toasts, and a type-to-confirm delete.")}
    </div>
    <h2 class="pw-heading lp-h2">How it stays consistent</h2>
    <ul class="lp-points">
      <li><b>One source of truth</b><span class="pw-muted">Every colour, space and type style lives in tokens.json, generated into CSS variables and typed names.</span></li>
      <li><b>Signal, not decoration</b><span class="pw-muted">Neutral chrome. Critical is the only colour that asks for action. Status is always icon, label and colour.</span></li>
      <li><b>Accessible by test</b><span class="pw-muted">Contrast floors and a colour-blind-safe chart palette are unit tests. Radix provides focus and keyboard behaviour.</span></li>
      <li><b>Typed end to end</b><span class="pw-muted">Strict TypeScript with zero any. Tables infer your row type; type tests run against the built package.</span></li>
      <li><b>Refactors proven pixel-identical</b><span class="pw-muted">Every component is screenshotted in both themes and densities and diffed before a change merges.</span></li>
      <li><b>Built for AI agents</b><span class="pw-muted">Agents in every project read one generated COMPONENTS.md and use the system instead of inventing UI.</span></li>
    </ul>
  </main>
  <footer class="lp-foot pw-caption">Every screen on this site is built only from <code class="pw-mono">@pairwise/ui</code>. All data is fictional. Source, rules and build reports are on GitHub.</footer>
</div></body></html>
`);
console.log(`site: / , /demo/, /catalogue/ → ${OUT}`);
