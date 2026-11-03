# @pairwise/ui

Tokens, styles and React components for the Pairwise design system.

```sh
pnpm add @pairwise/ui react react-dom
```

```tsx
import "@pairwise/ui/fonts.css";
import "@pairwise/ui/tokens.css";
import "@pairwise/ui/styles.css";
import { PairwiseProvider, AppShell, Button } from "@pairwise/ui";

document.documentElement.dataset.theme = "light";     // or "dark"
document.documentElement.dataset.density = "compact"; // or "comfortable"

export function App() {
  return (
    <PairwiseProvider /* locale, timeZone and currency default to the browser */>
      <Button variant="primary">Approve changes</Button>
    </PairwiseProvider>
  );
}
```

Rules and rationale: `design-system/README.md`, `GUIDELINES.md`, `DECISIONS.md` in the repo.
