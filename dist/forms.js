import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// Form controls. Native <input>/<textarea>; Radix for Select, Checkbox and Switch (keyboard, focus, ARIA).
// Every control takes a visible label, an optional hint and an optional error (status-critical + icon + text,
// with aria-invalid and aria-describedby).
import * as React from "react";
import * as RSelect from "@radix-ui/react-select";
import * as RCheckbox from "@radix-ui/react-checkbox";
import * as RSwitch from "@radix-ui/react-switch";
import { cx } from "./core";
import { Icon } from "./icons";
function useField(idProp, hint, error) {
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
/* ---------- TextInput ---------- */
export const TextInput = React.forwardRef(function TextInput({ label, hideLabel, hint, error, id: idProp, className, type = "text", ...rest }, ref) {
    const f = useField(idProp, hint, error);
    return (_jsxs("div", { className: "pw-formfield", children: [_jsx("label", { htmlFor: f.id, className: cx("pw-formfield__label", hideLabel && "pw-sr"), children: label }), _jsx("input", { ref: ref, id: f.id, type: type, className: cx("pw-input", className), "aria-invalid": f.invalid, "aria-describedby": f.describedBy, ...rest }), _jsx(Notes, { hint: hint, error: error, hintId: f.hintId, errId: f.errId })] }));
});
/* ---------- Textarea ---------- */
export const Textarea = React.forwardRef(function Textarea({ label, hideLabel, hint, error, id: idProp, className, rows = 4, ...rest }, ref) {
    const f = useField(idProp, hint, error);
    return (_jsxs("div", { className: "pw-formfield", children: [_jsx("label", { htmlFor: f.id, className: cx("pw-formfield__label", hideLabel && "pw-sr"), children: label }), _jsx("textarea", { ref: ref, id: f.id, rows: rows, className: cx("pw-input pw-textarea", className), "aria-invalid": f.invalid, "aria-describedby": f.describedBy, ...rest }), _jsx(Notes, { hint: hint, error: error, hintId: f.hintId, errId: f.errId })] }));
});
/* ---------- Select ---------- */
const toOption = (o) => (typeof o === "string" ? { value: o, label: o } : { ...o, label: o.label ?? o.value });
export function Select({ label, hideLabel, hint, error, options, value, defaultValue, onChange, placeholder = "Select…", disabled, required, name, id: idProp, className }) {
    const f = useField(idProp, hint, error);
    return (_jsxs("div", { className: "pw-formfield", children: [_jsx("label", { htmlFor: f.id, className: cx("pw-formfield__label", hideLabel && "pw-sr"), children: label }), _jsxs(RSelect.Root, { value: value, defaultValue: defaultValue, onValueChange: onChange, disabled: disabled, required: required, name: name, children: [_jsxs(RSelect.Trigger, { id: f.id, className: cx("pw-field pw-select", className), "aria-invalid": f.invalid, "aria-describedby": f.describedBy, children: [_jsx("span", { className: "pw-field__val", children: _jsx(RSelect.Value, { placeholder: placeholder }) }), _jsx(RSelect.Icon, { asChild: true, children: _jsx("span", { className: "pw-select__icon", children: _jsx(Icon, { name: "chevron-down", size: 14 }) }) })] }), _jsx(RSelect.Portal, { children: _jsx(RSelect.Content, { position: "popper", sideOffset: 4, className: "pw-select__content", children: _jsx(RSelect.Viewport, { children: options.map(toOption).map((o) => (_jsxs(RSelect.Item, { value: o.value, className: "pw-list__item", children: [_jsx("span", { className: "pw-list__check", children: _jsx(RSelect.ItemIndicator, { children: _jsx(Icon, { name: "check", size: 14 }) }) }), _jsx(RSelect.ItemText, { children: o.label }), o.meta ? _jsx("span", { className: "pw-muted pw-list__meta", children: o.meta }) : null] }, o.value))) }) }) })] }), _jsx(Notes, { hint: hint, error: error, hintId: f.hintId, errId: f.errId })] }));
}
/* ---------- Checkbox ---------- */
export function Checkbox({ label, hint, error, checked, defaultChecked, onChange, disabled, required, name, value, id: idProp }) {
    const f = useField(idProp, hint, error);
    return (_jsxs("div", { className: "pw-formfield", children: [_jsxs("div", { className: "pw-check", children: [_jsx(RCheckbox.Root, { id: f.id, className: "pw-check__box", checked: checked, defaultChecked: defaultChecked, onCheckedChange: (c) => onChange && onChange(c === true), disabled: disabled, required: required, name: name, value: value, "aria-invalid": f.invalid, "aria-describedby": f.describedBy, children: _jsx(RCheckbox.Indicator, { className: "pw-check__ind", children: _jsx(Icon, { name: "check", size: 12 }) }) }), _jsx("label", { htmlFor: f.id, className: "pw-check__label", children: label })] }), _jsx(Notes, { hint: hint, error: error, hintId: f.hintId, errId: f.errId })] }));
}
/* ---------- Switch ---------- */
export function Switch({ label, hint, checked, defaultChecked, onChange, disabled, name, id: idProp }) {
    const f = useField(idProp, hint);
    return (_jsxs("div", { className: "pw-formfield", children: [_jsxs("div", { className: "pw-check", children: [_jsx(RSwitch.Root, { id: f.id, className: "pw-switch", checked: checked, defaultChecked: defaultChecked, onCheckedChange: onChange, disabled: disabled, name: name, "aria-describedby": f.describedBy, children: _jsx(RSwitch.Thumb, { className: "pw-switch__thumb" }) }), _jsx("label", { htmlFor: f.id, className: "pw-check__label", children: label })] }), _jsx(Notes, { hint: hint, hintId: f.hintId })] }));
}
//# sourceMappingURL=forms.js.map