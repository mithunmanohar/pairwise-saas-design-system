// Form controls. Native <input>/<textarea>; Radix for Select, Checkbox and Switch (keyboard, focus, ARIA).
// Every control takes a visible label, an optional hint and an optional error (status-critical + icon + text,
// with aria-invalid and aria-describedby).
import * as React from "react";
import * as RSelect from "@radix-ui/react-select";
import * as RCheckbox from "@radix-ui/react-checkbox";
import * as RSwitch from "@radix-ui/react-switch";
import type { TextInputProps, TextareaProps, SelectProps, CheckboxProps, SwitchProps, Option } from "./types";
import { cx } from "./core";
import { Icon } from "./icons";

function useField(idProp: string | undefined, hint?: string, error?: string) {
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

/* ---------- TextInput ---------- */
export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(function TextInput({ label, hideLabel, hint, error, id: idProp, className, type = "text", ...rest }, ref) {
  const f = useField(idProp, hint, error);
  return (
    <div className="pw-formfield">
      <label htmlFor={f.id} className={cx("pw-formfield__label", hideLabel && "pw-sr")}>{label}</label>
      <input ref={ref} id={f.id} type={type} className={cx("pw-input", className)} aria-invalid={f.invalid} aria-describedby={f.describedBy} {...rest} />
      <Notes hint={hint} error={error} hintId={f.hintId} errId={f.errId} />
    </div>
  );
});

/* ---------- Textarea ---------- */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, hideLabel, hint, error, id: idProp, className, rows = 4, ...rest }, ref) {
  const f = useField(idProp, hint, error);
  return (
    <div className="pw-formfield">
      <label htmlFor={f.id} className={cx("pw-formfield__label", hideLabel && "pw-sr")}>{label}</label>
      <textarea ref={ref} id={f.id} rows={rows} className={cx("pw-input pw-textarea", className)} aria-invalid={f.invalid} aria-describedby={f.describedBy} {...rest} />
      <Notes hint={hint} error={error} hintId={f.hintId} errId={f.errId} />
    </div>
  );
});

/* ---------- Select ---------- */
const toOption = (o: string | Option): Option & { label: string } => (typeof o === "string" ? { value: o, label: o } : { ...o, label: o.label ?? o.value });
export function Select({ label, hideLabel, hint, error, options, value, defaultValue, onChange, placeholder = "Select…", disabled, required, name, id: idProp, className }: SelectProps) {
  const f = useField(idProp, hint, error);
  return (
    <div className="pw-formfield">
      <label htmlFor={f.id} className={cx("pw-formfield__label", hideLabel && "pw-sr")}>{label}</label>
      <RSelect.Root value={value} defaultValue={defaultValue} onValueChange={onChange} disabled={disabled} required={required} name={name}>
        <RSelect.Trigger id={f.id} className={cx("pw-field pw-select", className)} aria-invalid={f.invalid} aria-describedby={f.describedBy}>
          <span className="pw-field__val"><RSelect.Value placeholder={placeholder} /></span>
          <RSelect.Icon asChild><span className="pw-select__icon"><Icon name="chevron-down" size={14} /></span></RSelect.Icon>
        </RSelect.Trigger>
        <RSelect.Portal>
          <RSelect.Content position="popper" sideOffset={4} className="pw-select__content">
            <RSelect.Viewport>
              {options.map(toOption).map((o) => (
                <RSelect.Item key={o.value} value={o.value} className="pw-list__item">
                  <span className="pw-list__check"><RSelect.ItemIndicator><Icon name="check" size={14} /></RSelect.ItemIndicator></span>
                  <RSelect.ItemText>{o.label}</RSelect.ItemText>
                  {o.meta ? <span className="pw-muted pw-list__meta">{o.meta}</span> : null}
                </RSelect.Item>
              ))}
            </RSelect.Viewport>
          </RSelect.Content>
        </RSelect.Portal>
      </RSelect.Root>
      <Notes hint={hint} error={error} hintId={f.hintId} errId={f.errId} />
    </div>
  );
}

/* ---------- Checkbox ---------- */
export function Checkbox({ label, hint, error, checked, defaultChecked, onChange, disabled, required, name, value, id: idProp }: CheckboxProps) {
  const f = useField(idProp, hint, error);
  return (
    <div className="pw-formfield">
      <div className="pw-check">
        <RCheckbox.Root id={f.id} className="pw-check__box" checked={checked} defaultChecked={defaultChecked} onCheckedChange={(c) => onChange && onChange(c === true)}
          disabled={disabled} required={required} name={name} value={value} aria-invalid={f.invalid} aria-describedby={f.describedBy}>
          <RCheckbox.Indicator className="pw-check__ind"><Icon name="check" size={12} /></RCheckbox.Indicator>
        </RCheckbox.Root>
        <label htmlFor={f.id} className="pw-check__label">{label}</label>
      </div>
      <Notes hint={hint} error={error} hintId={f.hintId} errId={f.errId} />
    </div>
  );
}

/* ---------- Switch ---------- */
export function Switch({ label, hint, checked, defaultChecked, onChange, disabled, name, id: idProp }: SwitchProps) {
  const f = useField(idProp, hint);
  return (
    <div className="pw-formfield">
      <div className="pw-check">
        <RSwitch.Root id={f.id} className="pw-switch" checked={checked} defaultChecked={defaultChecked} onCheckedChange={onChange} disabled={disabled} name={name} aria-describedby={f.describedBy}>
          <RSwitch.Thumb className="pw-switch__thumb" />
        </RSwitch.Root>
        <label htmlFor={f.id} className="pw-check__label">{label}</label>
      </div>
      <Notes hint={hint} hintId={f.hintId} />
    </div>
  );
}
