import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// toast("Saved") from anywhere; <Toaster /> once near the app root renders them on Radix Toast.
// The region is always mounted (an empty live region), so the first toast is announced. Critical toasts are
// assertive and stay until closed; others hide after 6 s. Hovering or focusing a toast, or leaving the window,
// pauses the timer. F8 moves focus to the toasts; a toast can be swiped away on touch screens.
import * as React from "react";
import * as RToast from "@radix-ui/react-toast";
import { cx, Button } from "./core";
import { Icon } from "./icons";
let items = [];
let nextId = 1;
const subs = new Set();
const emit = () => subs.forEach((f) => f());
const subscribe = (f) => { subs.add(f); return () => { subs.delete(f); }; };
const snapshot = () => items;
/** Show a toast. Returns its id. `toast.dismiss(id)` hides one; `toast.dismiss()` hides all. */
export const toast = Object.assign((opts) => {
    const id = nextId++;
    items = [...items, { ...(typeof opts === "string" ? { title: opts } : opts), id }];
    emit();
    return id;
}, { dismiss: (id) => { items = id == null ? [] : items.filter((t) => t.id !== id); emit(); } });
function ToastItem({ t }) {
    const tone = t.tone || "info";
    const duration = t.duration !== undefined ? t.duration : tone === "critical" ? null : 6000;
    return (_jsxs(RToast.Root, { className: cx("pw-toast", "pw-toast--" + tone), type: tone === "critical" ? "foreground" : "background", duration: duration ?? Infinity, onOpenChange: (open) => { if (!open)
            toast.dismiss(t.id); }, children: [_jsx(Icon, { name: tone }), _jsxs("div", { className: "pw-toast__txt", children: [_jsx(RToast.Title, { className: "pw-body-strong", children: t.title }), t.body ? _jsx(RToast.Description, { className: "pw-muted", children: t.body }) : null] }), t.action ? (_jsx(RToast.Action, { asChild: true, altText: t.action, children: _jsx("button", { type: "button", className: "pw-linkbtn", onClick: () => { t.onAction && t.onAction(); }, children: t.action }) })) : null, _jsx(RToast.Close, { asChild: true, children: _jsx(Button, { size: "sm", variant: "ghost", icon: "x", "aria-label": "Close" }) })] }));
}
export function Toaster({ max = 3, contained }) {
    const list = React.useSyncExternalStore(subscribe, snapshot, snapshot);
    return (_jsxs(RToast.Provider, { swipeDirection: "right", label: "Notification", children: [list.slice(-max).map((t) => _jsx(ToastItem, { t: t }, t.id)), _jsx(RToast.Viewport, { className: cx("pw-toasts", !contained && "is-fixed"), label: "Notifications ({hotkey})" })] }));
}
//# sourceMappingURL=toast.js.map