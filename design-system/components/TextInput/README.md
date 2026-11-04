Single-line text field with a visible label.

**Consumer provides:** `label`, plus any native `<input>` props (`value`, `onChange`, `type`, `placeholder`, `required`…). Optional `hint`, `error`, `hideLabel`. The ref goes to the `<input>`.

- Always give a label. Use `hideLabel` only where the purpose is obvious from context (a search box with a placeholder).
- `error` shows in `status-critical` with an icon and text, and sets `aria-invalid` and `aria-describedby`. Say what's wrong and how to fix it.
- Width follows the container; put fields in a grid or set the parent width.
