An on/off toggle for settings that apply immediately, built on Radix Switch.

**Consumer provides:** `label`, and `checked` + `onChange(on: boolean)` (or `defaultChecked`). Optional `hint`, `disabled`, `name`.

- The label names the setting, not the state ("Auto-merge", not "Turn on auto-merge"). The track fills with ink when on.
- Inside a form that is submitted later, use `Checkbox` instead.
