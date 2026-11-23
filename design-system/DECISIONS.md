# Decision record

The decisions behind Pairwise, in the order they were made. Each entry keeps the decision and its reason.

| # | Decision | Why |
|---|---|---|
| 1 | **One shell for every role**; role picks the landing page, permissions limit reach | Separate tools for each role drift apart. A shared shell keeps navigation, scope and time consistent, and role-based landing pages still give each person a fast front door. |
| 2 | **Signal direction**: neutral chrome, no accent hue; `status-critical` is the only colour that asks for action | When the chrome has no colour, any colour on screen is a signal. It makes "exceptions first" structural rather than a convention. |
| 3 | **Status grammar**: icon + label + colour; healthy is quiet | Meets WCAG 1.4.1 without relying on colour, and keeps the one red visible on busy screens. |
| 4 | **Severity separate from status**, shown by bar count | Status says what state a thing is in; severity says how urgent a problem is. Mixing them overloads one colour scale. |
| 5 | **Theme parity**, default follows the OS | Long sessions and night work want dark; reports and screenshots want light. Both are tested from day one. |
| 6 | **Two densities from one token set** | Working views need 32 px rows; overview pages read better at 40 px. Swapping only the spacing set keeps components identical. |
| 7 | **Atkinson Hyperlegible Next + Mono** (OFL) | Unambiguous I/l/1 and O/0 for SHAs and IDs. Open licence, self-hostable. |
| 8 | **Contrast floors**: text ≥ 4.8:1, non-text ≥ 3:1, categorical ΔE ≥ 11 | A margin above AA so rendering differences can't fail it; the ΔE floor keeps adjacent series apart for common colour-vision deficiencies. |
| 9 | **Behaviour from Radix primitives**, styled with our own classes and tokens | Accessible keyboard and focus behaviour without inheriting another system's look. Radix ships no styles and is MIT. |
| 10 | **Charts stay lightweight SVG** with a table view (was: ECharts) | Operational dashboards don't need canvas performance; no dependency to upgrade. Revisit if a project needs it. |
| 11 | **DataTable is our own** (was: TanStack Table + Virtual) | Sorting, expansion and paging cover the current projects. Revisit if a project needs virtualisation. |
| 12 | **Permissive licences only** (MIT, Apache-2.0, OFL) | No commercial or source-available dependencies in a design system that others build on. |
| 13 | **Locale-driven formatting** via `Intl`, browser locale and time zone by default | No hard-coded zone, currency or digit grouping. Indian digit grouping and a fixed FX rate with its date remain available as explicit options. |
| 14 | **Five categorical chart colours**, used in order | Two were added (purple `chart-4`, green `chart-5`) after a search that kept every adjacent pair ≥ 11 ΔE under all four vision types and kept clear of the status hues. Green is never used for status; healthy is teal and stays icon + text. |
| 15 | **No gauges or pies** for operational data | They spend area on one number and can't be compared over time; bullet bars and stacked bars can. |
| 16 | **Fonts self-hosted** from @fontsource (OFL), never a CDN | No third-party request at runtime, works offline and behind strict CSP. Glyphs render marginally differently from the CDN build (≤ 0.71 % of pixels on any card, no layout shift); accepted in Phase 2. |
| 17 | **Stable layout: switching never moves the chrome** | Changing a tab, a scope or filter value, the time range or a page must not move anything else. Selected labels reserve their bold width, menus and the time picker keep the width of their widest option, the content area reserves a stable scrollbar gutter, and figures use tabular digits (was: proportional) so live values don't jitter. Checked by measuring every switch in the demo at 1440, 1024 and 390 px, with and without classic scrollbars. |
| 18 | **Font presets, chosen by the app or the person** (`data-font`: atkinson, inter, plex, system) | Apps want their own voice and people have reading preferences. A small, tested set keeps every screen consistent: each preset swaps only `--font-sans` and `--font-mono`, all are OFL and self-hosted, and only the chosen one downloads. Atkinson stays the default for its legibility. Every demo page was checked in each preset at 1440, 1024, 390 and 360 px. |
| 19 | **Behaviour and accessibility tests in real Chromium** (`@playwright/test`, Apache-2.0) with **axe-core** (MPL-2.0) as a dev-only exception to #12 | Keyboard, focus and screen-reader semantics can only be trusted in a real browser. axe-core is the reference WCAG rules engine; it is a devDependency, never bundled or published, so consumers don't inherit its licence. Every catalogue card and e2e fixture is checked in light and dark. Existing violations are a shrinking ledger (`test/e2e/a11y-known.json`), never an allow-list. |
| 20 | **Pairwise 2.0: interaction on Radix, cmdk and react-day-picker (all MIT); the look stays ours** | Hand-rolled popovers, listboxes and tooltips had no arrow keys, focus return, typeahead or portals. Radix now covers every overlay, menu, tab, toast and form primitive. cmdk covers search, commands and comboboxes. react-day-picker covers the calendar grid. None ships styles, so Signal is unchanged; a pixel diff reviewed every visible change. |
| 21 | **shadcn/ui as patterns, not code** | Its components assume Tailwind and class-variance-authority, which would break the tokens-only CSS rule (#9) and add a second styling system. Pairwise adopts its compositions (Popover + cmdk = Combobox, Popover + DayPicker = DatePicker, `asChild` via Radix Slot) on its own classes and tokens. |
| 22 | **Motion and layer tokens** (`motion`, `layer` in tokens.json) | Durations and stacking were magic numbers spread across components, with tooltips below popovers. As tokens, they're one scale, the lint enforces them, and reduced motion is a single token override. |
| 23 | **GlobalSearch is the command palette** | One box for finding and doing (Ctrl+K). A separate palette would compete for the same shortcut and duplicate the matching and keyboard model. Commands are search items with `onRun`. |
| 24 | **Evidence-led scope for 2.0** (amended in 2.1) | New components were added where the demo already hand-built them (avatars, details lists, tag input, pagination) or where common SaaS forms need them (radio, combobox, dates, inline edit, upload). NotificationCenter, Stepper, FilterBuilder and WorkspaceSwitcher wait for a project that needs them; the account menu already switches organizations. TreeView waited too, until 2.1: an ML platform organised by ownership needed it (#25–28). |
| 25 | **Ownership scope is separate from runtime scope** (2.1) | "Which team's work" and "which environment" are independent questions: an initiative runs in prod and staging, and a cluster hosts many teams. One combined tree would force a false nesting and double the levels. So the top bar holds two labelled groups (ownership first, then runtime) plus the time range, each in the URL. |
| 26 | **Trees on React Aria Components** (Apache-2.0; 2.1) | Radix has no tree. A tree needs arrow-key focus, expand and collapse, typeahead, lazy children, disabled nodes and treegrid semantics; hand-rolling them breaks the "don't hand-roll focus or keyboard" rule. React Aria's `Tree` provides all of them and ships no styles, so Signal is unchanged. It is the first Adobe dependency, limited to trees. Selection uses toggle behaviour, so arrows move focus and only Enter, Space or a click changes the scope. |
| 27 | **The hierarchy is shown in full in two places only** (2.1) | Repeating "Company › Function › Squad › Initiative" on every page spends the top of every screen on context the person already chose. The Resource Explorer and the scope picker show the whole tree. Everywhere else shows the current node once, with its path on hover, as a folded breadcrumb on entity pages, and as a muted line *below the scope* in tables. |
| 28 | **Direct versus rolled-up numbers are always labelled** (2.1) | Rollups are only trustworthy when you can tell what they include. Pages include descendants by default (that's what a lead asks about), with Direct only one click away. Counts say both ("0 direct · 7 with everything below"), Tree-view group rows total only columns that add up ("–" otherwise), and figures that stay organisation-wide on a scoped page say so. |
| 29 | **An assistant built from Pairwise parts** (2.2) | AI must feel native: the same chrome, status grammar and ownership model as the rest of the app, not a separate chat product. Extend existing components first (TopBar, AppShell, Drawer, CodeBlock, FileUpload, Avatar), add only the assistant-specific parts, and mark AI content with an icon and a label, never a colour. Markdown comes from markdown-to-jsx (MIT). Audit, contracts and the deferred list are below. |

## 29 · The assistant: audit, proposal and what was built (2.2)

**Goal.** Product teams can add a contextual assistant to any Pairwise app (developer portal, cost dashboard, admin
tool) without designing chat layouts, response layouts, context handling or AI states. The assistant reads as
Pairwise:
- AI-authored content is marked with an icon, a label ("Assistant" or the agent's name) and its layout;
- it gets no colour, gradient, glow, shimmer or sparkle;
- risk and permission reuse the status grammar;
- the full ownership tree never appears inside it.

Phase 1 (this audit and proposal) was approved with every recommendation in 29.6, and Priority 1 shipped in 2.2.0
(29.7 lists where the build differs from the proposal). Priority 2 and 3 are candidates, not commitments.

### 29.1 Audit: what already exists

| Need | Existing part | Verdict |
|---|---|---|
| Launcher, send, stop, regenerate, feedback | `Button` (icon, ghost, `loading`), icon-only `Button` + `Tooltip` | **Reuse.** Feedback toggles are Buttons with `aria-pressed`, as icon + label. |
| "Ask the assistant" on pages, rows, cards | `ActionMenu` items, `DataTable rowActions`, `PageHeader actions` | **Reuse.** An item `{ label: "Ask the assistant", icon: "assistant" }`; no new prop. |
| Command palette entry | `GlobalSearch` (cmdk) commands with `onRun`, `onQueryChange` | **Reuse.** The app adds an item `Ask the assistant: "<query>"` in an "Assistant" group from `onQueryChange`. It matches because it contains the query. No new prop. |
| Docked panel, phone panel | `Drawer` (Radix Dialog; `contained` is already non-modal), `SplitView` (tree on the left) | **Extend `Drawer`** with `docked`. `SplitView` is a page-level layout with its pane on the left. The assistant persists across pages, so it belongs in `AppShell`, not `SplitView`. |
| Shell slot | `AppShell` (nav, top bar, content) | **Extend:** an `assistant` slot. |
| Top-bar entry and activity | `TopBar` (alerts button + count) | **Extend:** an `assistant` launcher with an activity state. |
| Composer input | `Textarea` + `Field` (label, hint, error, required) | **Reuse** inside the new `PromptComposer`. |
| @mentions, slash commands, templates | `Combobox` / `GlobalSearch` (cmdk), `Popover` | **Reuse cmdk** inside `PromptComposer`. |
| Attachments | `FileUpload` (validation, item rows, retry) | **Extend:** `variant: 'button'`, so a composer gets a paperclip button instead of a dropzone, with the same rules and rows. |
| Context: scope, paths, kinds | `ScopeNote`, `ScopePicker`, `entityIcon` / `entityLabel`, `PathSegment`, `Tag` | **Reuse.** Context items are icon + word, and paths are drawn as ScopeNote's line. Changing scope opens the existing `ScopePicker`, one of the two places where the tree is allowed (#27). |
| Structured answers | `DataTable` (List view), `KeyValueList`, `Metric`, `TimeSeriesChart`, `BarChart`, `Sparkline`, `StatusBadge`, `Timeline` | **Reuse as response content.** A message body is plain children, so any of them can sit in it. Check `DataTable` at 400 px (its wrapper already scrolls). |
| Code with copy | `CodeBlock` (copy, wrap, line numbers, highlight), `CopyButton` | **Reuse.** **Extend** `CodeBlock` with `diff` for diff and config previews. |
| Author identity | `Avatar` (neutral fill, initials) | **Extend:** `icon` instead of initials, for "Assistant". Agents use initials of their name and neutral fills. |
| Working / streaming | `ProgressBar` (indeterminate; still under reduced motion), `StatusBadge` | **Reuse.** "Responding…" uses indeterminate progress plus text, with no pulsing dots or shimmer. |
| Loading, empty, error, no access | `StateBlock` (all five kinds), `Skeleton` | **Reuse** for panel and history states. |
| Report, confirm | `Modal` + `RadioGroup` + `Textarea`, the critical confirm pattern | **Reuse.** Report is a Modal. Real changes are Priority 2 and use the existing danger confirm. |
| After-the-fact feedback | `toast()` ("Copied", "Thanks, feedback sent") | **Reuse.** |
| Conversation history | `ActionMenu` (headings, `checked`), `MenuSelect` | **Reuse.** History is a menu of recent conversations, checked = current, with "Show all" opening the expanded view's list. |
| Provenance | `Popover` + `KeyValueList` | **Reuse:** an "About this answer" popover. |
| Tabs | `Tabs` | Not needed in Priority 1. It is a candidate for the expanded view's "Conversation / Activity" in Priority 2. |
| Expandable details | none (`DataTable renderExpanded` is table-only) | **Gap:** `Disclosure`. |
| Markdown | none | **Gap:** `Markdown` (needs a dependency, see 29.4). |

### 29.2 Gap analysis

**Extensions to existing components**, preferred over new ones. All are additive. No prop is renamed or removed.

- **Icons:** `assistant` (a speech bubble with a prompt mark, never a sparkle), `send`, `stop`, `attach`,
  `thumb-up`, `thumb-down`, `history`, `expand`, `collapse`.
- **`TopBar assistant`:** a launcher left of alerts. It shows an icon, plus the label "Assistant" at ≥ 1360 px. It has
  `aria-expanded`, `aria-keyshortcuts` and an activity state:
  - working: the label reads "Working…" and a status glyph, with no animation;
  - needs input: an info count badge, like alerts;
  - unread: a dot plus accessible text.
- **`AppShell assistant`:** the panel's place in the shell.
  - Docked as a right-hand column at ≥ 1280 px. A new size token, `assistant-width`, is 400 px, and the content area
    keeps the rest.
  - A modal `Drawer` below 1280 px, full width on phones.
  - `expanded` gives the panel the whole content area. The page stays mounted and `inert`, so closing restores its
    scroll.
- **`Drawer docked`:**
  - Rendered in place, not portalled.
  - Built on the same Radix Dialog with `modal={false}`, ignoring outside clicks.
  - A border and no shadow, because it is a panel, not a floating layer.
  - Radix still moves focus in on open, returns it to the launcher on close, and closes on Escape. So no focus or
    dismissal logic is hand-written.
- **`FileUpload variant: 'button'`:** the same validation and item rows behind a button.
- **`CodeBlock diff`:**
  - `+` and `−` lines get a sign column and visually hidden "Added" / "Removed".
  - Both kinds get a neutral surface tint.
  - No red and green: red is reserved for action (#2), and the sign plus text carries the meaning.
- **`Avatar icon`:** shown instead of initials, neutral fill.

**New components** (one new file, `assistant.tsx`, plus `Disclosure` and `ResourceCard` where they are generic):

1. `AssistantPanel`: the panel's chrome and states.
2. `AssistantMessage`: one turn, with its actions.
3. `PromptComposer`: the input and everything around it.
4. `ContextBar`: what the assistant can see, with add, remove and inspect.
5. `Markdown`: model text rendered as Pairwise elements.
6. `Citation` (inline) and `SourceList`: grounded answers.
7. `ResourceCard`: a referenced resource as icon + kind word, name, status, path and facts. It is generic enough for
   "Related" lists too.
8. `Disclosure`: expandable details on native `<details>` / `<summary>`, so there is no hand-written keyboard
   logic. It is also generic.
9. `AssistantProvider` + `useAssistant()` + `useAssistantContext(items)`: a small React context that holds:
   - open and expanded;
   - `ask(prompt?, extraContext?)`, which launchers, menus and the palette call;
   - the page's context items.

   It makes no model calls. The app gets `onAsk` and streams messages back as props.

Not new: metric cards (`Metric`), tables, charts and key-value answers. They are content placed inside
`AssistantMessage`.

### 29.3 Priority 1 contracts (`types.ts` style)

```ts
/* ---------- Assistant (2.2, proposed) ---------- */
/** What the assistant can see. Ownership and runtime are separate kinds and never merge into one item. */
export type AssistantContextKind = 'page' | 'entity' | 'filter' | 'ownership' | 'runtime' | 'time' | 'permission' | 'attachment';
export interface AssistantContextItem {
  id: string; kind: AssistantContextKind;
  /** "Usage and cost", "checkout-api", "env: prod", "Last 24 hours", "Read only" */ label: string;
  /** entities and ownership: icon + word from entityIcon / entityLabel */ entity?: EntityKind;
  /** the path below the ownership scope, drawn like ScopeNote's line */ path?: PathSegment[];
  /** a muted line in the inspector, e.g. "3 filters: status, owner, region" */ detail?: string;
  /** false for items the page always sends (the page, permissions); default true */ removable?: boolean;
}
export interface ContextBarProps {
  items: AssistantContextItem[]; onRemove?: (id: string) => void;
  /** offered by "Add context" (a cmdk list): entities on the page, recent resources */ available?: AssistantContextItem[];
  onAdd?: (item: AssistantContextItem) => void;
  /** the ownership item's "Change scope" opens the existing ScopePicker */ scope?: Pick<ScopePickerProps, 'nodes' | 'value' | 'onChange' | 'loadChildren'>;
  /** chips shown before "+N more" (default 3); "Context" opens an inspector listing every item */ max?: number;
}
export interface PromptSuggestion { label: string; /** what is sent or inserted (default label) */ prompt?: string; icon?: IconName; /** templates insert with the caret at the first "…" instead of sending */ insert?: boolean }
export interface PromptCommand { value: string; label: string; description?: string; group?: string; keywords?: string[]; icon?: IconName; entity?: EntityKind }
export interface PromptComposerProps extends Pick<FieldProps, 'hint' | 'error'> {
  value?: string; defaultValue?: string; onChange?: (v: string) => void;
  /** Enter sends, Shift+Enter adds a line; empty or over maxLength never sends */ onSubmit: (prompt: string) => void;
  /** a response is streaming: Send becomes Stop */ busy?: boolean; onStop?: () => void;
  /** accessible name (default "Ask the assistant") */ label?: string; placeholder?: string; maxLength?: number;
  disabled?: boolean; /** shown instead of the hint when disabled, e.g. "You have read-only access to this project" */ disabledReason?: string;
  /** chips above the input (empty conversation and follow-ups) */ suggestions?: PromptSuggestion[]; onSuggestion?: (s: PromptSuggestion) => void;
  /** a "Templates" menu */ templates?: PromptSuggestion[];
  /** typing "@": resources, people, agents (cmdk list); onMentionQuery fetches */ mentions?: PromptCommand[]; onMentionQuery?: (q: string) => void; mentionsLoading?: boolean;
  /** typing "/" at the start: commands such as /explain, /summarise */ commands?: PromptCommand[];
  /** a paperclip button: FileUpload's rules and rows */ attachments?: Pick<FileUploadProps, 'accept' | 'maxSize' | 'maxFiles' | 'files' | 'onFiles' | 'onRemove' | 'onRetry'>;
  /** a ContextBar, shown above the input */ context?: React.ReactNode;
}
export interface AssistantAuthor { name: string; kind: 'assistant' | 'agent' | 'person'; /** agents: what it does, read after the name */ description?: string; avatar?: string }
export type AssistantMessageStatus = 'streaming' | 'done' | 'stopped' | 'error';
export interface AssistantSource { id: string; title: string; /** "Runbook", "Incident", "Repository" */ kind?: string; entity?: EntityKind; href?: string; path?: PathSegment[]; excerpt?: string; updated?: string }
export interface AssistantProvenance { /** when it was generated */ generated: string; model?: string; /** the context item labels it used */ context?: string[]; /** the tools it called, by name (Priority 2 adds tool-call cards) */ tools?: string[] }
export type AssistantFeedback = 'helpful' | 'not-helpful' | null;
export interface AssistantMessageProps {
  author: AssistantAuthor; status?: AssistantMessageStatus; time?: string;
  /** Markdown, CodeBlock, DataTable, Metric, charts, ResourceCard, Disclosure… */ children?: React.ReactNode;
  /** numbered sources; <Citation n> in the body points at them */ sources?: AssistantSource[];
  /** under a streaming body (default "Responding…"); error text for status error */ statusText?: string; onRetry?: () => void;
  followUps?: PromptSuggestion[]; onFollowUp?: (s: PromptSuggestion) => void;
  /** assistant and agent messages only */ feedback?: AssistantFeedback; onFeedback?: (f: AssistantFeedback) => void;
  /** "Report" opens a Modal (reason + detail) */ onReport?: (report: { reason: string; detail: string }) => void;
  /** what Copy copies (default the text content) */ copyText?: string; onRegenerate?: () => void;
  provenance?: AssistantProvenance;
}
export interface CitationProps { /** 1-based, matches the message's sources */ n: number; /** the source's title, read as "Source 1: <title>" */ title: string; href?: string; onOpen?: () => void }
export interface SourceListProps { sources: AssistantSource[]; /** collapsed behind "3 sources" (default true) */ collapsible?: boolean; onOpen?: (s: AssistantSource) => void }
export interface MarkdownProps {
  /** model output; raw HTML and images are never rendered (images become links) */ children: string;
  /** the last block may be incomplete: an unclosed code fence renders as code */ streaming?: boolean;
  /** in-app navigation; return false to let the browser follow the link */ onLink?: (href: string) => boolean | void;
  /** the top heading level used (default 3) */ headingLevel?: 2 | 3 | 4;
}
export interface ResourceCardProps {
  kind: EntityKind; name: string; mono?: boolean; href?: string; onOpen?: () => void;
  status?: Status; statusLabel?: string; /** the path below the scope, drawn like ScopeNote's line */ path?: PathSegment[];
  /** two to four facts, KeyValueList inline layout */ facts?: KeyValueItem[]; actions?: ActionMenuEntry[];
}
export interface DisclosureProps { summary: React.ReactNode; /** muted text on the right of the summary, e.g. "4 steps" */ meta?: React.ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; children?: React.ReactNode }
export interface AssistantConversation { id: string; title: string; updated: string; /** what it is about, e.g. "checkout-api" */ about?: string }
export interface AssistantPanelProps {
  /** default "Assistant" */ title?: string;
  expanded?: boolean; onExpandedChange?: (e: boolean) => void; onClose?: () => void;
  conversations?: AssistantConversation[]; activeId?: string | null; onSelectConversation?: (id: string) => void; onNewConversation?: () => void;
  state?: 'ready' | 'loading' | 'empty' | 'error' | 'no-access'; errorDetail?: string; onRetry?: () => void;
  /** the empty state's body: what it can help with on this page */ empty?: React.ReactNode;
  /** a polite live region reads this once: "Assistant replied: …", "Response stopped" */ announcement?: string;
  /** a PromptComposer */ composer: React.ReactNode;
  /** AssistantMessage elements, oldest first */ children?: React.ReactNode;
}
/** TopBar */ export interface TopBarAssistant { open: boolean; onToggle: () => void; activity?: 'idle' | 'working' | 'needs-input' | 'unread'; /** default "Assistant" */ label?: string; /** Ctrl+I / ⌘I toggles it (default true) */ shortcut?: boolean }
//   TopBarProps.assistant?: TopBarAssistant
//   AppShellProps.assistant?: React.ReactElement<AssistantPanelProps>; assistantOpen?: boolean; onAssistantOpenChange?: (open: boolean) => void
//   DrawerProps.docked?: boolean · FileUploadProps.variant?: 'dropzone' | 'button' · CodeBlockProps.diff?: boolean · AvatarProps.icon?: IconName
export interface AssistantProviderProps {
  /** called by ask(): the prompt (if any) and the context it was asked with (page items + extras) */ onAsk?: (prompt: string | undefined, context: AssistantContextItem[]) => void;
  defaultOpen?: boolean; children?: React.ReactNode;
}
// useAssistant(): { open, setOpen, expanded, setExpanded, ask(prompt?, extra?: AssistantContextItem[]), context: AssistantContextItem[] }
// useAssistantContext(items: AssistantContextItem[]): a page declares what it shows; it is replaced on navigation
```

**What each component composes:**

| Component | Composes |
|---|---|
| `AssistantPanel` | `Drawer` (docked or modal), `Button`, `ActionMenu` (history), `StateBlock`, `Avatar`, a polite live region |
| `AssistantMessage` | `Avatar`, `StatusBadge` (stopped: unknown; error: critical), `ProgressBar` (indeterminate), `SourceList`, `Button` (follow-ups, feedback, regenerate), `CopyButton`, `ActionMenu` (report), `Modal` + `RadioGroup` + `Textarea`, `Popover` + `KeyValueList` (provenance), `toast()` |
| `PromptComposer` | `Field` + `Textarea`, cmdk (`@` and `/` lists in a `Popover`), `ActionMenu` (templates), `FileUpload variant="button"`, `Button` (send / stop) |
| `ContextBar` | `Tag`-styled chips with `entityIcon` + word, `Popover` + cmdk ("Add context"), `Popover` (inspector, ScopeNote-style path lines), `ScopePicker` |
| `Markdown` | the Markdown library's element overrides → `CodeBlock` (fences; `diff` fences use `diff`), `pw-` text styles, a plain styled table (no sorting) for GFM tables |
| `SourceList` / `Citation` | `Disclosure`, `entityIcon`, `Button` / links, ScopeNote-style path |
| `ResourceCard` | `Panel` styles, `entityIcon` + `entityLabel`, `StatusBadge`, `KeyValueList layout="inline"`, `ActionMenu` |
| `Disclosure` | native `<details>` / `<summary>`, the `chevron-right` icon |

**States and accessibility:**

| Component | States |
|---|---|
| Panel | ready, loading (skeleton messages), empty (suggestions), error (`StateBlock` + retry), no-access |
| Message | streaming (`aria-busy`, "Responding…"), done, stopped ("Stopped" + Regenerate), error (critical + Retry) |
| Composer | default, focus, busy (Stop), disabled with a reason, validation error (empty, too long, file rejected) |
| ContextBar | none, some, overflow ("+2 more"), locked items (page, permissions) |
| Launcher | idle, working, needs input, unread |

- **Screen readers:**
  - One polite live region in the panel. It announces a finished, stopped or failed response once, with its first
    sentence (≤ 140 characters).
  - Streamed tokens are never announced.
  - The message list is a plain list, not `role="log"`, so each chunk isn't read.
- **Keyboard:**
  - Ctrl+I / ⌘I toggles the panel and focuses the composer.
  - Enter sends and Shift+Enter adds a line.
  - Escape closes the `@` / `/` list first, then the panel (one layer at a time).
  - Focus returns to the launcher, or to the menu item's trigger that asked.
- **Composer key routing:** the textarea sits inside the cmdk root. While a list is open, cmdk owns the arrows and
  Enter; otherwise the textarea does. If that needs more than passing events through, the fallback is an "Insert"
  button that opens a `Combobox`. No hand-written list navigation.
- **Visual rules:**
  - Assistant and agent messages carry `Avatar icon="assistant"` (or the agent's initials) plus the name, on a flat
    surface.
  - The person's messages are right-aligned with no bubble colour.
  - Panels have a border and no shadow. 4 px controls, 6 px containers.
  - Both densities and both themes.

**Interaction patterns from the same parts:**

| Pattern | Built from |
|---|---|
| Ask | Message + `Markdown` + citations |
| Explore | `ResourceCard` list + `DataTable` List view |
| Investigate | Message + `Timeline` + `SourceList` (Priority 2 adds live activity) |
| Generate | `CodeBlock` (+ `diff`) + copy |
| Recommend | `Metric` + `ResourceCard` actions + follow-ups |
| Plan, Execute, Monitor | Priority 2 and 3 parts below, added to the same message |

**Why there is no floating action button:**
- The top bar is in the same place on every page and is keyboard reachable.
- A floating button covers table rows and collides with the toast stack, which is bottom-right.

**Why the panel docks on the right:** the left holds the nav and the explorer tree.

### 29.4 Proposed dependencies

| Need | Proposal | Licence | Cost (min + gzip, measured with esbuild) | Considered instead |
|---|---|---|---|---|
| Markdown | **`markdown-to-jsx`** 9.x | MIT | 31.6 kB, zero dependencies | `react-markdown` 10 + `remark-gfm` 4 (MIT): 50.4 kB and about 90 transitive packages. `marked` (MIT) builds an HTML string, which needs `dangerouslySetInnerHTML` and a sanitiser. Not rendering Markdown at all forces every app to convert model output. |
| Syntax highlighting | **none** | n/a | n/a | Signal has no multi-hue code theme. Code stays mono with the existing `CodeBlock`. |
| Panel resizing | **none** | n/a | n/a | Fixed widths: `assistant-width` 400 px, plus the expanded view. A resizable panel waits for a project that asks, and then uses a library. |

`markdown-to-jsx` would be used with raw HTML parsing off (`disableParsingRawHTML`) and images rendered as links.
Its element overrides map straight onto Pairwise components. The bundle cost falls only on apps that import
`Markdown`, because the package is ESM with `sideEffects: ["*.css"]`.

### 29.5 Deferred: candidates, not commitments

- **Priority 2: agents that act.**
  - Agent status and an execution timeline: `Timeline` with step kinds + `ProgressBar`.
  - Tool-call cards: `Disclosure` + `KeyValueList` for the inputs and outputs + `CodeBlock`.
  - A plan with ordered steps, impact and risk. Risk maps to status: info = read-only, warning = changes resources,
    critical = destructive. Read-only, proposed and real changes are labelled in words.
  - An approval card (approve / reject) on the existing danger confirm `Modal`.
  - Before and after: `CodeBlock diff` + `KeyValueList`.
  - A result summary: `Metric` + `StatusBadge`.
  - States: awaiting approval, running, completed, cancelled.
- **Priority 3: long-running work.**
  - An agent task list and detail: `DataTable` + a detail page.
  - Pause, resume, cancel and retry.
  - Notifications when input is needed: the launcher's activity + `toast()`. NotificationCenter stays deferred
    (#24).
  - Multi-agent handoff: an author change + a system line in the conversation.
  - Generated structured forms from a schema (`Field` controls).
  - Sharing and saving a conversation: `CopyButton` link + `Modal`.

### 29.6 Decisions at the gate (all approved as recommended)

1. **The Markdown dependency:** `markdown-to-jsx` (recommended), `react-markdown` + `remark-gfm`, or none.
2. **The shortcut:** Ctrl+I / ⌘I (recommended; Ctrl+K stays search).
3. **README screenshots:** the launcher is a visible change to the top bar on every demo page, so the screenshots
   can't stay byte-identical. The options:
   - regenerate them once, with before/after images in the PR (recommended);
   - hide the launcher in the default demo state.

   Either way, the data under the default selection stays byte-identical.
4. **`AssistantProvider` in the package** (recommended: it is what saves app teams the context plumbing), or keep it
   in the demo.

### 29.7 How the build differs from the proposal

- **AppShell takes any node in `assistant`.** It tells the panel its placement through React context, so an app can
  wrap AssistantPanel in its own component. The panel reports when it covers the content, so the shell can make the
  page inert. `placement` remains as an override.
- **Markdown takes `sources`.** "[1]" in model text becomes a `Citation`, because models write citations as text.
- **Headings in Markdown never rank above `headingLevel`** (default 3). Panels have their own heading.
- **The palette entry is a command, not a new GlobalSearch prop.** TopBar doesn't expose the search query, so "Ask
  the assistant" is a palette command (with Ctrl I shown) that opens the panel.
- **A new catalogue group, "Assistant",** holds ContextBar, PromptComposer, AssistantMessage and AssistantPanel.
  The generic parts (Markdown, Citation, SourceList, ResourceCard, Disclosure) are under "Data display".
- **The top-bar launcher changed every demo screenshot in the top-bar strip only.** This was checked by pixel diff;
  nothing else on any screen moved. The data under the default selection is unchanged.

## Known limits

- Charts are lightweight SVG with a table view. Swap to a charting library only if a project needs dense or interactive series.
- DataTable has no virtualisation or column resizing; keep it to a few hundred rows per page (or use `manual` paging),
  and only the first column can be pinned.
- Calendars are Gregorian and their labels follow the browser's locale; month names in the menus are English.
- Radix Select focuses its option one frame before it can catch Escape; tests wait that frame (people can't press
  that fast).
- TreeView doesn't virtualise. Keep a level to a few hundred children and load resource groups lazily (`loadChildren`);
  DataTable's Tree view groups the rows it is given, so page or filter on the server for large estates.
- The assistant panel has a fixed width (`assistant-width`) and doesn't resize; it expands to the content area
  instead. A resizable panel waits for a project that asks, and then uses a library.
- Markdown renders CommonMark + GFM tables through markdown-to-jsx; footnotes and HTML are not rendered as such.
- Density is inherited from `<html data-density>`; a nested `data-density="compact"` (which AppShell sets by default) does not switch a comfortable page back to compact. Kept on purpose: set density once, on `<html>`.
