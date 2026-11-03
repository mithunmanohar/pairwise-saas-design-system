Buttons trigger actions. Hierarchy comes from fill, not colour.

**Variants**
- `primary` (ink fill): the one action the page exists for (Approve changes, Start run). **At most one per view.**
- `secondary` (outlined): supporting actions (View diff, Export).
- `ghost`: low-emphasis and icon-only actions in toolbars.
- `danger` (critical outline): destructive or irreversible actions (Stop run, Discard changes). Always confirm with a `Modal`.
- Link button (`.pw-linkbtn`): navigation-like actions inside text and panel footers.

**Consumer provides:** children (a verb plus an object: "Revert to a1b2c3d", not "Submit"), `variant`, `icon`, `loading`, `disabled`, `onClick`. Icon-only buttons require `aria-label`.

**States:** hover (surface-hover), focus (2 px ink ring, offset 2), active (surface-selected), disabled (ink-disabled on surface-sunken), loading (spinner replaces the icon; the button keeps its width and sets `aria-busy`).

Put generous space (`space-6`) above a page's primary action. Never place two primary buttons side by side.
