// toast("Saved") from anywhere; <Toaster /> once near the app root renders them on Radix Toast.
// The region is always mounted (an empty live region), so the first toast is announced. Critical toasts are
// assertive and stay until closed; others hide after 6 s. Hovering or focusing a toast, or leaving the window,
// pauses the timer. F8 moves focus to the toasts; a toast can be swiped away on touch screens.
import * as React from "react";
import * as RToast from "@radix-ui/react-toast";
import type { ToastOptions, ToasterProps } from "./types";
import { cx, Button } from "./core";
import { Icon } from "./icons";

type Item = ToastOptions & { id: number };
let items: Item[] = [];
let nextId = 1;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
const snapshot = () => items;

/** Show a toast. Returns its id. `toast.dismiss(id)` hides one; `toast.dismiss()` hides all. */
export const toast = Object.assign(
  (opts: ToastOptions | string): number => {
    const id = nextId++;
    items = [...items, { ...(typeof opts === "string" ? { title: opts } : opts), id }];
    emit();
    return id;
  },
  { dismiss: (id?: number) => { items = id == null ? [] : items.filter((t) => t.id !== id); emit(); } },
);

function ToastItem({ t }: { t: Item }) {
  const tone = t.tone || "info";
  const duration = t.duration !== undefined ? t.duration : tone === "critical" ? null : 6000;
  return (
    <RToast.Root className={cx("pw-toast", "pw-toast--" + tone)} type={tone === "critical" ? "foreground" : "background"} duration={duration ?? Infinity}
      onOpenChange={(open) => { if (!open) toast.dismiss(t.id); }}>
      <Icon name={tone} />
      <div className="pw-toast__txt">
        <RToast.Title className="pw-body-strong">{t.title}</RToast.Title>
        {t.body ? <RToast.Description className="pw-muted">{t.body}</RToast.Description> : null}
      </div>
      {t.action ? (
        <RToast.Action asChild altText={t.action}>
          <button type="button" className="pw-linkbtn" onClick={() => { t.onAction && t.onAction(); }}>{t.action}</button>
        </RToast.Action>
      ) : null}
      <RToast.Close asChild><Button size="sm" variant="ghost" icon="x" aria-label="Close" /></RToast.Close>
    </RToast.Root>
  );
}

export function Toaster({ max = 3, contained }: ToasterProps) {
  const list = React.useSyncExternalStore(subscribe, snapshot, snapshot);
  return (
    <RToast.Provider swipeDirection="right" label="Notification">
      {list.slice(-max).map((t) => <ToastItem key={t.id} t={t} />)}
      <RToast.Viewport className={cx("pw-toasts", !contained && "is-fixed")} label="Notifications ({hotkey})" />
    </RToast.Provider>
  );
}
