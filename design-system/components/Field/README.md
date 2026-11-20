The label, hint, error and "Required" marker that every form control shares. TextInput, Textarea, Select, Checkbox and Switch are built on it; use it directly to put any other control into a form.

**Consumer provides:** `label` and a render function as children, which receives the props to spread on the focusable element: `id`, `aria-describedby`, `aria-invalid` and `aria-required`. Optional `hint`, `error`, `required`, `hideLabel` and `id`.

```tsx
<Field label="Retention" hint="Days to keep run logs." error={err}>
  {(p) => <input className="pw-input" type="number" {...p} />}
</Field>
```

- `required` shows a muted "Required" after the label and sets `aria-required`. The visible word is hidden from screen readers, which already announce "required".
- `error` is shown in `status-critical` with an icon. It sets `aria-invalid` and is read after the hint.
- `readOnly` inputs get the sunken surface and stay focusable and copyable. Use `disabled` only when the value doesn't apply.
- Every control forwards its ref to the focusable element, so form libraries (for example react-hook-form `register` or `Controller`) can focus the first invalid field.
- Checkbox takes `checked="indeterminate"` for a select-all that covers some, not all, rows.
