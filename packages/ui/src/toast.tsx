// toast("Saved") from anywhere; <Toaster /> once near the app root renders them.
// Toasts hide after 6 s (critical ones stay until closed); hovering or focusing the stack pauses the timer.
import * as React from "react";
import type { ToastOptions, ToasterProps } from "./types";
import { cx, Toast } from "./core";

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

function ToastItem({ t, paused }: { t: Item; paused: boolean }) {
  const duration = t.duration !== undefined ? t.duration : t.tone === "critical" ? null : 6000;
  React.useEffect(() => {
    if (paused || duration == null) return;
    const h = window.setTimeout(() => toast.dismiss(t.id), duration);
    return () => window.clearTimeout(h);
  }, [paused, duration, t.id]);
  return <Toast tone={t.tone} title={t.title} body={t.body} action={t.action}
    onAction={() => { t.onAction && t.onAction(); toast.dismiss(t.id); }} onClose={() => toast.dismiss(t.id)} />;
}

export function Toaster({ max = 3, contained }: ToasterProps) {
  const list = React.useSyncExternalStore(subscribe, snapshot, snapshot);
  const [paused, setPaused] = React.useState(false);
  if (!list.length) return null;
  return (
    <div className={cx("pw-toasts", !contained && "is-fixed")} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false); }}>
      {list.slice(-max).map((t) => <ToastItem key={t.id} t={t} paused={paused} />)}
    </div>
  );
}
