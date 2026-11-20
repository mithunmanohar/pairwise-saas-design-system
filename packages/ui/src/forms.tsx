// Form controls. Native <input>/<textarea>; Radix for Select, Checkbox and Switch (keyboard, focus, ARIA).
// Every control is built on Field: a visible label, an optional hint, an optional error (status-critical + icon + text,
// with aria-invalid and aria-describedby) and an optional "Required" marker. Controls forward their ref to the element
// that takes focus, so form libraries (react-hook-form register / Controller) can focus the first invalid field.
import * as React from "react";
import * as RSelect from "@radix-ui/react-select";
import * as RCheckbox from "@radix-ui/react-checkbox";
import * as RSwitch from "@radix-ui/react-switch";
import type { TextInputProps, TextareaProps, SelectProps, CheckboxProps, SwitchProps, FieldProps, FieldControlProps, Option } from "./types";
import { cx } from "./core";
import { Icon } from "./icons";

/** Ids and ARIA wiring for one control. Used by Field and by controls that lay out their own label (Checkbox, Switch). */
export function useField(idProp: string | undefined, hint?: string, error?: string) {
  const auto = React.useId();
  const id = idProp || "pw" + auto.replace(/[^a-zA-Z0-9]/g, "");
  const hintId = hint ? id + "-hint" : undefined;
  const errId = error ? id + "-err" : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  return { id, hintId, errId, describedBy, invalid: error ? true : undefined };
}

function Notes({ hint, error, hintId, errId }: { hint?: string; error?: string; hintId?: string; errId?: string }) {
  return (
    <>
      {hint ? <div id={hintId} className="pw-formfield__hint">{hint}</div> : null}
      {error ? <div id={errId} className="pw-formfield__error"><Icon name="critical" size={12} /><span>{error}</span></div> : null}
    </>
  );
}

// Visible marker only: aria-required already tells screen readers, so the word is hidden from them.
const Req = () => <span className="pw-formfield__req" aria-hidden="true">Required</span>;

/* ---------- Field ---------- */
/**
 * Label, hint, error and "Required" marker around any control. `children` receives the props to spread on the
 * focusable element: `<Field label="Owner">{(p) => <MyPicker {...p} />}</Field>`.
 */
export function Field({ label, hideLabel, hint, error, required, id: idProp, className, children }: FieldProps & { id?: string; className?: string; children: (control: FieldControlProps) => React.ReactNode }) {
  const f = useField(idProp, hint, error);
  return (
    <div className={cx("pw-formfield", className)}>
      <label htmlFor={f.id} className={cx("pw-formfield__label", hideLabel && "pw-sr")}>{label}{required ? <Req /> : null}</label>
      {children({ id: f.id, "aria-describedby": f.describedBy, "aria-invalid": f.invalid, "aria-required": required || undefined })}
      <Notes hint={hint} error={error} hintId={f.hintId} errId={f.errId} />
    </div>
  );
}

/* ---------- TextInput ---------- */
export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(function TextInput({ label, hideLabel, hint, error, id, className, type = "text", required, ...rest }, ref) {
  return (
    <Field label={label} hideLabel={hideLabel} hint={hint} error={error} required={required} id={id}>
      {(p) => <input ref={ref} type={type} className={cx("pw-input", className)} required={required} {...p} {...rest} />}
    </Field>
  );
});

/* ---------- Textarea ---------- */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, hideLabel, hint, error, id, className, rows = 4, required, ...rest }, ref) {
  return (
    <Field label={label} hideLabel={hideLabel} hint={hint} error={error} required={required} id={id}>
      {(p) => <textarea ref={ref} rows={rows} className={cx("pw-input pw-textarea", className)} required={required} {...p} {...rest} />}
    </Field>
  );
});

/* ---------- Select ---------- */
const toOption = (o: string | Option): Option & { label: string } => (typeof o === "string" ? { value: o, label: o } : { ...o, label: o.label ?? o.value });
export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(function Select({ label, hideLabel, hint, error, options, value, defaultValue, onChange, placeholder = "Select…", disabled, required, name, id, className }, ref) {
  return (
    <Field label={label} hideLabel={hideLabel} hint={hint} error={error} required={required} id={id}>
      {(p) => (
        <RSelect.Root value={value} defaultValue={defaultValue} onValueChange={onChange} disabled={disabled} required={required} name={name}>
          <RSelect.Trigger ref={ref} className={cx("pw-field pw-select", className)} {...p}>
            <span className="pw-field__val"><RSelect.Value placeholder={placeholder} /></span>
            <RSelect.Icon asChild><span className="pw-select__icon"><Icon name="chevron-down" size={14} /></span></RSelect.Icon>
          </RSelect.Trigger>
          <RSelect.Portal>
            <RSelect.Content position="popper" sideOffset={4} className="pw-select__content">
              <RSelect.Viewport>
                {options.map(toOption).map((o) => (
                  <RSelect.Item key={o.value} value={o.value} disabled={o.disabled} className="pw-list__item">
                    <span className="pw-list__check"><RSelect.ItemIndicator><Icon name="check" size={14} /></RSelect.ItemIndicator></span>
                    <RSelect.ItemText>{o.label}</RSelect.ItemText>
                    {o.meta ? <span className="pw-muted pw-list__meta">{o.meta}</span> : null}
                  </RSelect.Item>
                ))}
              </RSelect.Viewport>
            </RSelect.Content>
          </RSelect.Portal>
        </RSelect.Root>
      )}
    </Field>
  );
});

/* ---------- Checkbox ---------- */
// `checked="indeterminate"` shows a dash (some, not all, are selected: a table's select-all). Clicking it checks.
export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox({ label, hint, error, checked, defaultChecked, onChange, disabled, required, name, value, id: idProp, hideLabel }, ref) {
  const f = useField(idProp, hint, error);
  return (
    <div className="pw-formfield">
      <div className="pw-check">
        <RCheckbox.Root ref={ref} id={f.id} className="pw-check__box" checked={checked} defaultChecked={defaultChecked} onCheckedChange={(c) => onChange && onChange(c === true)}
          disabled={disabled} required={required} name={name} value={value} aria-invalid={f.invalid} aria-describedby={f.describedBy}>
          <RCheckbox.Indicator className="pw-check__ind"><Icon name={checked === "indeterminate" ? "minus" : "check"} size={12} /></RCheckbox.Indicator>
        </RCheckbox.Root>
        <label htmlFor={f.id} className={cx("pw-check__label", hideLabel && "pw-sr")}>{label}{required ? <Req /> : null}</label>
      </div>
      <Notes hint={hint} error={error} hintId={f.hintId} errId={f.errId} />
    </div>
  );
});

/* ---------- Switch ---------- */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(function Switch({ label, hint, error, checked, defaultChecked, onChange, disabled, name, id: idProp }, ref) {
  const f = useField(idProp, hint, error);
  return (
    <div className="pw-formfield">
      <div className="pw-check">
        <RSwitch.Root ref={ref} id={f.id} className="pw-switch" checked={checked} defaultChecked={defaultChecked} onCheckedChange={onChange} disabled={disabled} name={name}
          aria-invalid={f.invalid} aria-describedby={f.describedBy}>
          <RSwitch.Thumb className="pw-switch__thumb" />
        </RSwitch.Root>
        <label htmlFor={f.id} className="pw-check__label">{label}</label>
      </div>
      <Notes hint={hint} error={error} hintId={f.hintId} errId={f.errId} />
    </div>
  );
});
