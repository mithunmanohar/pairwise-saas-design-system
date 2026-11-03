# CLAUDE.md: Pairwise design system

**Pairwise** is a design system, built as a side project. Its job is that every app built on it looks and
behaves the same, and nobody builds their own buttons, tables or forms. **Keep it minimal**: build what a project needs
now, not what a public design system might need. The current work list is `TASKS.md`.

## Naming
- Product: Pairwise ("Pairwise design system" in prose). npm scope: `@pairwise`. CSS class prefix: `pw-`.

## Repo map
- `packages/ui/`: `@pairwise/ui`, the package apps install (ESM + generated types).
  - `src/*.tsx`: components (React, automatic JSX). No `any`; `DataTable<Row>` is generic.
  - `src/types.ts`: public prop contracts. The published `.d.ts` is generated from source.
  - `src/format.ts`: locale helper (`PairwiseProvider`, `useFormat`, `createFormatter`).
  - `src/tokens.ts`: **generated**, don't edit.
  - `src/styles.css`: component CSS (tokens only).
  - `scripts/`: `build-tokens.mjs`, `color.mjs`, `copy-css.mjs`, `lint-tokens-only.mjs`, `build-preview.mjs` (esbuild, dev-only: package → preview kit), `build-catalogue.mjs` (catalogue + `dist/COMPONENTS.md`).
  - `CHANGELOG.md`: one entry per release. Bump `version` in `package.json` with it (fix = patch, new component/prop = minor, breaking = major).
  - `test/tokens.test.mjs`: contrast, colour-blind ΔE and generator tests. `test/types/consumer.tsx`: type tests against `dist/`.
- `design-system/`: rules and the component catalogue.
  - `README.md`, `GUIDELINES.md`, `DECISIONS.md`: rules and rationale. Keep them in sync with code.
  - `tokens.json`: **the single source of truth** for every colour, space, radius, size and type style.
  - `components/<Name>/preview.html` + `README.md`: one card per component. They feed the catalogue and `dist/COMPONENTS.md`.
  - `catalogue.html`: **generated** browsable page of every component (open from disk).
  - `tokens.css`, `components/bundle.js`, `bundle.css`, `components/fonts/`: **generated** on every package build so the cards show the package's code. Don't edit.
- `scripts/capture-previews.mjs`: optional before/after screenshots and pixel diff of the cards (needs a global Playwright).
- `scripts/pack-release.mjs` + `.github/workflows/release.yml`: pushing tag `vX.Y.Z` publishes the built package to tag `ui-vX.Y.Z`, which projects install with `pnpm add github:mithunmanohar/pairwise-saas-design-system#ui-vX.Y.Z`. `.github/workflows/ci.yml` runs `pnpm run ci` + `pnpm check:generated` on every PR.
- `examples/`: workspace package. `src/screens/` holds three example screens built only from `@pairwise/ui` (type-checked in CI); `src/entries/` holds one page per screen plus `demo.tsx`, the routed live demo with live data and a theme/density switch (`?frozen=1` stops live updates). `scripts/screenshots.mjs`, which regenerates every image in `docs/images/` for the README (`pnpm -C examples screenshots`; needs a global Playwright). Re-run it after visible component changes.
- `scripts/build-site.mjs` + `.github/workflows/pages.yml`: the GitHub Pages site (landing page, `/demo/`, `/catalogue/`), deployed on every push to `main`.
- `README.md`: the public showcase. Every claim in it must stay true and checkable in the repo.

## Rules
- **Tokens only** in component CSS. No raw colours (the lint fails on them).
- **Visible changes to existing components:** say so in the PR with before/after screenshots. Ask the user first only for big ones.
- **Ask before:** adding a dependency, or renaming or removing a public prop. Licences: MIT, Apache-2.0 or OFL only.
- **Accessibility:** WCAG 2.2 AA. Text ≥ 4.8:1, non-text ≥ 3:1 in both themes; categorical chart colours worst adjacent ΔE ≥ 11 (enforced by the tests). Use Radix for overlays and form controls where focus and keyboard handling matter.
- **Sample content is fictional:** `example-org`, `sample-repo`, `feature/add-retry`, `run_8f3k2`, Dev A…J. GitHub may be named directly.
- Don't build components speculatively. A new component goes into the package when a second project needs it. Every new component gets a preview card + README (with a `group` from the catalogue's list); the preview build fails if a card has no matching component in the package.

## Visual rules in one paragraph
Flat neutral chrome with no accent hue. `status-critical` is the only colour that asks for action. Status is always icon + label + colour, and healthy is quiet (icon + text, no tint). Radius: 4 px for controls, 6 px for containers, 0 inside grids. Panels have a border and no shadow; floating layers have a shadow and no border. Focus: a 2 px ink ring offset 2 px. Atkinson Hyperlegible Next for UI text; Mono only for identifiers and code. Sentence case, no emoji. Two densities, set once on `<html>`: compact (32 px rows) and comfortable (40 px).

## Commands
```sh
pnpm install
pnpm run ci            # build → typecheck → lint → test (`pnpm ci` is a pnpm built-in; use `run`)
pnpm check:generated   # fails if a build changed generated files that weren't committed
pnpm capture capture <dir>; pnpm capture diff <before> <after> <diffDir>   # optional screenshots
```

## How to work
- Work through `TASKS.md` step by step. After each step, report briefly: what changed, how you checked it, what you need decided.
- Never commit with type errors or failing tests. Commit the generated preview files with the source change.
