import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// Form controls. Native <input>/<textarea>; Radix for Select, Checkbox and Switch (keyboard, focus, ARIA).
// Every control is built on Field: a visible label, an optional hint, an optional error (status-critical + icon + text,
// with aria-invalid and aria-describedby) and an optional "Required" marker. Controls forward their ref to the element
// that takes focus, so form libraries (react-hook-form register / Controller) can focus the first invalid field.
import * as React from "react";
import * as RSelect from "@radix-ui/react-select";
import * as RCheckbox from "@radix-ui/react-checkbox";
import * as RSwitch from "@radix-ui/react-switch";
import { cx } from "./core";
import { Icon } from "./icons";
/** Ids and ARIA wiring for one control. Used by Field and by controls that lay out their own label (Checkbox, Switch). */
export function useField(idProp, hint, error) {
    const auto = React.useId();
    const id = idProp || "pw" + auto.replace(/[^a-zA-Z0-9]/g, "");
    const hintId = hint ? id + "-hint" : undefined;
    const errId = error ? id + "-err" : undefined;
    const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
    return { id, hintId, errId, describedBy, invalid: error ? true : undefined };
}
function Notes({ hint, error, hintId, errId }) {
    return (_jsxs(_Fragment, { children: [hint ? _jsx("div", { id: hintId, className: "pw-formfield__hint", children: hint }) : null, error ? _jsxs("div", { id: errId, className: "pw-formfield__error", children: [_jsx(Icon, { name: "critical", size: 12 }), _jsx("span", { children: error })] }) : null] }));
}
// Visible marker only: aria-required already tells screen readers, so the word is hidden from them.
const Req = () => _jsx("span", { className: "pw-formfield__req", "aria-hidden": "true", children: "Required" });
/* ---------- Field ---------- */
/**
 * Label, hint, error and "Required" marker around any control. `children` receives the props to spread on the
 * focusable element: `<Field label="Owner">{(p) => <MyPicker {...p} />}</Field>`.
 */
export function Field({ label, hideLabel, hint, error, required, id: idProp, className, children }) {
    const f = useField(idProp, hint, error);
    return (_jsxs("div", { className: cx("pw-formfield", className), children: [_jsxs("label", { htmlFor: f.id, className: cx("pw-formfield__label", hideLabel && "pw-sr"), children: [label, required ? _jsx(Req, {}) : null] }), children({ id: f.id, "aria-describedby": f.describedBy, "aria-invalid": f.invalid, "aria-required": required || undefined }), _jsx(Notes, { hint: hint, error: error, hintId: f.hintId, errId: f.errId })] }));
}
/* ---------- TextInput ---------- */
export const TextInput = React.forwardRef(function TextInput({ label, hideLabel, hint, error, id, className, type = "text", required, ...rest }, ref) {
    return (_jsx(Field, { label: label, hideLabel: hideLabel, hint: hint, error: error, required: required, id: id, children: (p) => _jsx("input", { ref: ref, type: type, className: cx("pw-input", className), required: required, ...p, ...rest }) }));
});
/* ---------- Textarea ---------- */
export const Textarea = React.forwardRef(function Textarea({ label, hideLabel, hint, error, id, className, rows = 4, required, ...rest }, ref) {
    return (_jsx(Field, { label: label, hideLabel: hideLabel, hint: hint, error: error, required: required, id: id, children: (p) => _jsx("textarea", { ref: ref, rows: rows, className: cx("pw-input pw-textarea", className), required: required, ...p, ...rest }) }));
});
/* ---------- Select ---------- */
const toOption = (o) => (typeof o === "string" ? { value: o, label: o } : { ...o, label: o.label ?? o.value });
export const Select = React.forwardRef(function Select({ label, hideLabel, hint, error, options, value, defaultValue, onChange, placeholder = "Select…", disabled, required, name, id, className }, ref) {
    return (_jsx(Field, { label: label, hideLabel: hideLabel, hint: hint, error: error, required: required, id: id, children: (p) => (_jsxs(RSelect.Root, { value: value, defaultValue: defaultValue, onValueChange: onChange, disabled: disabled, required: required, name: name, children: [_jsxs(RSelect.Trigger, { ref: ref, className: cx("pw-field pw-select", className), ...p, children: [_jsx("span", { className: "pw-field__val", children: _jsx(RSelect.Value, { placeholder: placeholder }) }), _jsx(RSelect.Icon, { asChild: true, children: _jsx("span", { className: "pw-select__icon", children: _jsx(Icon, { name: "chevron-down", size: 14 }) }) })] }), _jsx(RSelect.Portal, { children: _jsx(RSelect.Content, { position: "popper", sideOffset: 4, className: "pw-select__content", children: _jsx(RSelect.Viewport, { children: options.map(toOption).map((o) => (_jsxs(RSelect.Item, { value: o.value, disabled: o.disabled, className: "pw-list__item", children: [_jsx("span", { className: "pw-list__check", children: _jsx(RSelect.ItemIndicator, { children: _jsx(Icon, { name: "check", size: 14 }) }) }), _jsx(RSelect.ItemText, { children: o.label }), o.meta ? _jsx("span", { className: "pw-muted pw-list__meta", children: o.meta }) : null] }, o.value))) }) }) })] })) }));
});
/* ---------- Checkbox ---------- */
// `checked="indeterminate"` shows a dash (some, not all, are selected: a table's select-all). Clicking it checks.
export const Checkbox = React.forwardRef(function Checkbox({ label, hint, error, checked, defaultChecked, onChange, disabled, required, name, value, id: idProp, hideLabel }, ref) {
    const f = useField(idProp, hint, error);
    return (_jsxs("div", { className: "pw-formfield", children: [_jsxs("div", { className: "pw-check", children: [_jsx(RCheckbox.Root, { ref: ref, id: f.id, className: "pw-check__box", checked: checked, defaultChecked: defaultChecked, onCheckedChange: (c) => onChange && onChange(c === true), disabled: disabled, required: required, name: name, value: value, "aria-invalid": f.invalid, "aria-describedby": f.describedBy, children: _jsx(RCheckbox.Indicator, { className: "pw-check__ind", children: _jsx(Icon, { name: checked === "indeterminate" ? "minus" : "check", size: 12 }) }) }), _jsxs("label", { htmlFor: f.id, className: cx("pw-check__label", hideLabel && "pw-sr"), children: [label, required ? _jsx(Req, {}) : null] })] }), _jsx(Notes, { hint: hint, error: error, hintId: f.hintId, errId: f.errId })] }));
});
/* ---------- Switch ---------- */
export const Switch = React.forwardRef(function Switch({ label, hint, error, checked, defaultChecked, onChange, disabled, name, id: idProp }, ref) {
    const f = useField(idProp, hint, error);
    return (_jsxs("div", { className: "pw-formfield", children: [_jsxs("div", { className: "pw-check", children: [_jsx(RSwitch.Root, { ref: ref, id: f.id, className: "pw-switch", checked: checked, defaultChecked: defaultChecked, onCheckedChange: onChange, disabled: disabled, name: name, "aria-invalid": f.invalid, "aria-describedby": f.describedBy, children: _jsx(RSwitch.Thumb, { className: "pw-switch__thumb" }) }), _jsx("label", { htmlFor: f.id, className: "pw-check__label", children: label })] }), _jsx(Notes, { hint: hint, error: error, hintId: f.hintId, errId: f.errId })] }));
});
//# sourceMappingURL=forms.js.map