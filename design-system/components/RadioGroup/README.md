One choice from a few options that should all be visible at once, each with an optional description. Built on Radix RadioGroup.

**Consumer provides:** `label`, `options` (strings or `{value, label, description, disabled}`), and `value` + `onChange` (or `defaultValue`). Optional `orientation` (`vertical` | `horizontal`), `hint`, `error`, `required`, `disabled`, `name`.

- Keyboard: Tab enters at the selected option; arrows move and select; disabled options are skipped.
- The group is named by its visible label and described by the hint and error. Each option is described by its description.
- Use RadioGroup for 2 to 5 options whose differences need words. For more options use `Select` or `Combobox`; for view switches use `SegmentedControl`.
