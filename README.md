# @pairwise/ui

Tokens, styles and React components for the Pairwise design system. Use these instead of building your own buttons,
tables, forms or overlays, so every project looks and behaves the same.

## Getting started

**1. Install** a released version from GitHub (React 18 or 19). You need read access to the design system repo.

```sh
pnpm add github:mithunmanohar/pairwise-saas-design-system#ui-v1.0.0
```

npm and yarn work the same way (`npm install github:…#ui-v1.0.0`). To update later, run the same command with the new
version; `CHANGELOG.md` says what changed.

**2. Import the CSS once**, in your app entry, in this order:

```tsx
import "@pairwise/ui/fonts.css";   // Atkinson Hyperlegible Next + Mono, self-hosted
import "@pairwise/ui/tokens.css";  // colours, spacing, type; both themes and densities
import "@pairwise/ui/styles.css";  // component styles (pw- classes)
```

**3. Set theme and density on `<html>`**, once. Both have defaults (light, compact), so this is optional.

```html
<html data-theme="dark" data-density="comfortable">
```

**4. Wrap the app in `PairwiseProvider`** (locale, time zone and currency default to the browser), and render `<Toaster />` once if you use `toast()`:

```tsx
import { PairwiseProvider, Toaster, toast, Button, TextInput } from "@pairwise/ui";

export function App() {
  return (
    <PairwiseProvider>
      <form onSubmit={(e) => { e.preventDefault(); toast("Branch created"); }}>
        <TextInput label="Branch name" placeholder="feature/add-retry" />
        <Button variant="primary" type="submit">Create branch</Button>
      </form>
      <Toaster />
    </PairwiseProvider>
  );
}
```

## What's in it

- **Actions and status:** Button, ActionMenu, CopyButton, StatusBadge, StatusDot, SeverityMark, Trend, Tag, Icon
- **Forms:** TextInput, Textarea, Select, Checkbox, Switch, MenuSelect (compact filter menu), FilterBar, TimeRangePicker
- **Navigation and layout:** AppShell, SideNav, TopBar, PageHeader, Breadcrumbs, Tabs, Panel, GlobalSearch, ScopeSwitcher
- **Feedback and overlays:** AlertBanner, `toast()` + Toaster, Toast, StateBlock, Skeleton, Tooltip, Modal, Drawer
- **Data:** DataTable, Metric, Timeline, RunStrip, StatusGrid, BulletBar, CodeBlock (code and logs)
- **Charts:** TimeSeriesChart, BarChart, Sparkline, Heatmap, Legend
- **Helpers:** `cx`, `useFormat` / `createFormatter` (from `@pairwise/ui/format`), typed token names and values (`@pairwise/ui/tokens`)

Browse them all, live: open `design-system/catalogue.html` from the repo in a browser. Every component's usage notes and
props are also in `dist/COMPONENTS.md` inside the installed package. The rules (colour, status, writing, charts) are in
`design-system/README.md`.

## Using it with AI coding tools

AI tools will invent their own buttons and colours unless told not to. Paste this into each project's `CLAUDE.md`
(or `AGENTS.md`, `.cursorrules`, …):

```md
## UI: Pairwise design system
- All UI uses `@pairwise/ui`. Before building any UI, read `node_modules/@pairwise/ui/dist/COMPONENTS.md`.
- Don't create your own buttons, inputs, selects, checkboxes, tables, menus, modals, drawers, toasts, tabs or badges,
  and don't add another UI library (MUI, shadcn/ui, Chakra, Tailwind component kits).
- Layout and spacing in your own CSS use the Pairwise variables only, e.g. `var(--space-4)`, `var(--surface-raised)`,
  `var(--border)`, `var(--ink-muted)`, `var(--radius-md)`. Never hard-code colours.
- Status is always `StatusBadge` (icon + label + colour). Sentence case, no emoji.
- If a component you need doesn't exist, use the closest one and add a `TODO(pairwise):` comment instead of building
  a new one here.
```

## Using tokens in your own CSS

Only when no component fits. Use the variables, never raw values:

```css
.my-panel { background: var(--surface-raised); border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--space-4); }
```

## Missing something?

Open an issue or PR on this repo instead of building a one-off in your project. A component is added here once a second
project needs it. Changes ship as a new version; each project updates when it's ready.
