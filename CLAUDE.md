# CLAUDE.md: Pairwise design system

**Pairwise** is a design system, built as a side project. Its job is that every app built on it looks and
behaves the same, and nobody builds their own buttons, tables or forms. **Keep it minimal**: build what a project needs
now, not what a public design system might need. The current work list is `TASKS.md`.

## Naming
- Product: Pairwise ("Pairwise design system" in prose). npm scope: `@pairwise`. CSS class prefix: `pw-`.

## Repo map
- `packages/ui/`: `@pairwise/ui`, the package apps install (ESM + generated types).
  - `src/*.tsx`: components (React, automatic JSX). No `any`; `DataTable<Row>` is generic. `core.tsx` (actions, status, overlays, search, tabs), `forms.tsx` (Field + basic controls), `inputs.tsx` (RadioGroup, Combobox, dates, InlineEdit, FileUpload), `display.tsx` (KeyValueList, Avatar, ProgressBar), `data.tsx` (DataTable incl. List/Tree views, Pagination, charts), `hierarchy.tsx` (TreeView, ScopePicker, SplitView, ScopeNote), `shell.tsx`, `actions.tsx`, `toast.tsx`.
  - `src/types.ts`: public prop contracts. The published `.d.ts` is generated from source.
  - `src/format.ts`: locale helper (`PairwiseProvider`, `useFormat`, `createFormatter`).
  - `src/tokens.ts`: **generated**, don't edit.
  - `src/styles.css`: component CSS (tokens only).
  - `scripts/`: `build-tokens.mjs`, `color.mjs`, `copy-css.mjs`, `lint-tokens-only.mjs`, `build-preview.mjs` (esbuild, dev-only: package → preview kit), `build-catalogue.mjs` (catalogue + `dist/COMPONENTS.md`).
  - `CHANGELOG.md`: one entry per release. Bump `version` in `package.json` with it (fix = patch, new component/prop = minor, breaking = major).
  - `test/tokens.test.mjs`: contrast, colour-blind ΔE and generator tests. `test/types/consumer.tsx`: type tests against `dist/`.
  - `test/e2e/`: Playwright behaviour, keyboard and axe tests in Chromium (`pnpm test:e2e`). `fixtures.tsx` holds small compositions mounted by `harness.tsx`; `a11y.spec.ts` runs axe on every card and fixture in both themes. `a11y-known.json` is a shrinking ledger of old violations: never add to it.
- `design-system/`: rules and the component catalogue.
  - `README.md`, `GUIDELINES.md`, `DECISIONS.md`: rules and rationale. Keep them in sync with code.
  - `tokens.json`: **the single source of truth** for every colour, space, radius, size and type style.
  - `components/<Name>/preview.html` + `README.md`: one card per component. They feed the catalogue and `dist/COMPONENTS.md`.
  - `catalogue.html`: **generated** browsable page of every component (open from disk).
  - `tokens.css`, `components/bundle.js`, `bundle.css`, `components/fonts/`: **generated** on every package build so the cards show the package's code. Don't edit.
- `scripts/capture-previews.mjs`: optional before/after screenshots and pixel diff of the cards (needs a global Playwright).
- `scripts/pack-release.mjs` + `.github/workflows/release.yml`: pushing tag `vX.Y.Z` publishes the built package to tag `ui-vX.Y.Z`, which projects install with `pnpm add github:mithunmanohar/pairwise-saas-design-system#ui-vX.Y.Z`. `.github/workflows/ci.yml` runs `pnpm run ci` + `pnpm check:generated` on every PR.
- `examples/`: workspace package. `src/screens/` holds the demo app's pages (overview, resource explorer, services + service health, incidents + incident, deployments, CI runs + run detail, repositories + settings, usage and cost, access, administration), built only from `@pairwise/ui` (type-checked in CI); `src/data.ts` is the shared fictional data and `src/org.ts` the fictional ownership tree that owns it (Example Company → function → squad → initiative → project). The ownership scope is in the URL (`#/services?scope=in-ai`) and every capability page filters by it. `src/entries/demo.tsx` is the routed live demo (`#/services/checkout-api` etc.), dark by default, with live data, a theme/density/font switch and personal preferences under the account button, saved in the browser; the organization default font is set in Administration (`?frozen=1` stops live updates, `?controls=0` hides the switch, `?theme=light`, `?font=inter`, `?state=drawer|modal|toast|invite|declare|prefs` opens a demo state). `scripts/screenshots.mjs` regenerates every image in `docs/images/` for the README from the demo routes, dark first, including phone captures (`pnpm -C examples screenshots`; needs a global Playwright). Re-run it after visible component changes.
- `scripts/build-site.mjs` + `.github/workflows/pages.yml`: the GitHub Pages site (landing page, `/demo/`, `/catalogue/`), published on every push to `main` to the `gh-pages` branch by `scripts/publish-pages.mjs` (git only; Pages source: "Deploy from a branch", gh-pages). `.github/workflows/pr-preview.yml` publishes each same-repo pull request's build to `/pr-preview/pr-<n>/` (`build-site.mjs --preview`), comments the link on the PR, and removes it on close. The live site is kept as it is.
- `README.md`: the public showcase. Every claim in it must stay true and checkable in the repo.

## Rules
- **Tokens only** in component CSS. No raw colours (the lint fails on them).
- **Visible changes to existing components:** say so in the PR with before/after screenshots. Ask the user first only for big ones.
- **Ask before:** adding a dependency, or renaming or removing a public prop. Licences: MIT, Apache-2.0 or OFL only.
- **Accessibility:** WCAG 2.2 AA. Text ≥ 4.8:1, non-text ≥ 3:1 in both themes; categorical chart colours worst adjacent ΔE ≥ 11 (enforced by the tests). Behaviour comes from Radix (overlays, menus, tabs, toasts, form controls), cmdk (search, commands, combobox), react-day-picker (calendars) and React Aria Components (trees only); don't hand-roll focus, keyboard or dismissal logic. axe must find nothing on any card or demo page.
- **Sample content is fictional:** `example-org`, Example Company, `sample-repo`, `feature/add-retry`, `run_8f3k2`, Dev A…J. GitHub may be named directly. Never use a real company's name for the sample organisation.
- **Ownership hierarchy** (GUIDELINES "Ownership, scope and hierarchy"): the full tree appears only in the Resource Explorer and the scope picker; other pages show the current scope once and paths below it. Ownership and runtime scope stay separate.
- Don't build components speculatively. A new component goes into the package when a second project needs it (Pairwise 2.0's scope and the deferred list are in DECISIONS #24 and TASKS.md). Every new component gets a preview card + README (with a `group` from the catalogue's list), an e2e fixture with keyboard tests, and passes axe; the preview build fails if a card has no matching component in the package.
- **Motion and layers:** durations and z-index come from the `motion` and `layer` tokens only (the lint fails otherwise); everything must work with reduced motion.

## Visual rules in one paragraph
Flat neutral chrome with no accent hue. `status-critical` is the only colour that asks for action. Status is always icon + label + colour, and healthy is quiet (icon + text, no tint). Entity kinds (company, squad, initiative, project…) are icon + word, never a colour. Avatars and progress use neutral fills, never a per-person or decorative colour. Radius: 4 px for controls, 6 px for containers, 0 inside grids. Panels have a border and no shadow; floating layers have a shadow and no border. Focus: a 2 px ink ring offset 2 px. Atkinson Hyperlegible Next for UI text by default; apps or people can pick another font preset with `data-font` on `<html>` (`inter`, `plex`, `system`, from `tokens.json`). Mono only for identifiers and code. Sentence case, no emoji. Two densities, set once on `<html>`: compact (32 px rows) and comfortable (40 px).

## Commands
```sh
pnpm install
pnpm run ci            # build → typecheck → lint → test → test:e2e (`pnpm ci` is a pnpm built-in; use `run`)
pnpm test:e2e          # Playwright + axe only (after a build)
pnpm check:generated   # fails if a build changed generated files that weren't committed
pnpm capture capture <dir> [--widths 1440,1024,390]; pnpm capture diff <before> <after> <diffDir>   # optional screenshots
```

## How to work
- Work through `TASKS.md` step by step. After each step, report briefly: what changed, how you checked it, what you need decided.
- Never commit with type errors or failing tests. Commit the generated preview files with the source change.
