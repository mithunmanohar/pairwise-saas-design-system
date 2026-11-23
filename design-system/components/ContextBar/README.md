What the assistant can see, above the composer: the page, the selected entity, filters, the ownership scope, the runtime scope, the time range and the person's access.

**Consumer provides:** `items` (`AssistantContextItem`: `kind`, `label`, optional `entity`, `path`, `detail`, `removable`), `onRemove`, `available` + `onAdd` for "Add", `scope` (ScopePicker's nodes, value and onChange), `max` (chips before "+N more", default 3).

- Chips are icon + word, never a colour. Ownership and runtime scope are separate items, as in the top bar.
- "+N more" / "All context" opens a list of every item with its kind, path (as in table path lines) and detail. The ownership scope can be changed there with the existing `ScopePicker`; the full tree never appears in the panel.
- The page and the person's access are sent with every question and can't be removed (`removable: false`). Say plainly what the assistant may do: "Read only".
- Pages declare their items with `useAssistantContext`.
