// Small display components: a key–value details list, avatars and a progress bar.
import * as React from "react";
import * as RAvatar from "@radix-ui/react-avatar";
import * as RProgress from "@radix-ui/react-progress";
import type { KeyValueListProps, AvatarProps, AvatarGroupProps, ProgressBarProps } from "./types";
import { cx, Skeleton, StatusDot } from "./core";
import { CopyButton } from "./actions";
import { Icon } from "./icons";

/* ---------- KeyValueList ---------- */
// A <dl> of labelled facts: an object's details in a drawer, a page header's fields, a settings summary.
// layout "rows" (label left, value right, a hairline between), "grid" (label above value, in columns) or "inline"
// (fields in a wrapping line, as in PageHeader). Missing values show "–" (read as "None"). `copy` adds a copy button.
const isEmpty = (v: React.ReactNode) => v == null || v === "" || v === false;
export function KeyValueList({ items, layout = "rows", columns = 2, loading, className, label }: KeyValueListProps) {
  return (
    <dl className={cx(layout === "inline" ? "pw-fields" : "pw-kv", "pw-kv--" + layout, className)} aria-label={label} aria-busy={loading || undefined}
      style={layout === "grid" ? ({ "--pw-kv-cols": columns } as React.CSSProperties) : undefined}>
      {items.map((it) => (
        <div key={it.label} className="pw-kv__item">
          <dt>{it.label}</dt>
          <dd className={cx(it.mono && "pw-mono")}>
            {loading ? <Skeleton w="60%" /> : isEmpty(it.value) ? <><span aria-hidden="true">–</span><span className="pw-sr">None</span></> : it.value}
            {!loading && it.copy ? <CopyButton value={it.copy} label={"Copy " + it.label.toLowerCase()} /> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- Avatar ---------- */
// A person or team: their image, or initials on a neutral fill (no colour coding: Signal keeps chroma for status).
// Named by `name` unless `decorative` (when the name is already written next to it).
const initialsOf = (name: string) => {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "", b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : parts[0]?.[1] ?? "";
  return (a + b).toUpperCase();
};
// `icon` replaces the initials, e.g. for the assistant: still a neutral fill, never a per-agent colour.
const AV_ICON = { 20: 12, 28: 16, 32: 16, 36: 20 } as const;
export function Avatar({ name, src, size = 28, status, decorative, initials, icon }: AvatarProps) {
  return (
    <span className={cx("pw-av", "pw-av--" + size)} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : name + (status ? ", " + status : "")} aria-hidden={decorative || undefined}>
      <RAvatar.Root className="pw-av__root">
        {src ? <RAvatar.Image className="pw-av__img" src={src} alt="" /> : null}
        <RAvatar.Fallback className="pw-av__fb" delayMs={src ? 300 : 0}>{icon ? <Icon name={icon} size={AV_ICON[size]} /> : initials || initialsOf(name)}</RAvatar.Fallback>
      </RAvatar.Root>
      {status ? <span className="pw-av__status" aria-hidden="true"><StatusDot status={status} /></span> : null}
    </span>
  );
}
/** Overlapping avatars with a "+N" for the rest. The group is named "Dev A, Dev B and 3 others". */
export function AvatarGroup({ people, max = 4, size = 28, label }: AvatarGroupProps) {
  const shown = people.slice(0, max), rest = people.slice(max);
  const names = people.map((p) => p.name);
  const auto = names.length <= max ? names.join(", ") : `${shown.map((p) => p.name).join(", ")} and ${rest.length} other${rest.length === 1 ? "" : "s"}`;
  return (
    <span className={cx("pw-avgroup", "pw-av--" + size)} role="img" aria-label={label ? `${label}: ${auto}` : auto}>
      {shown.map((p) => <Avatar key={p.name} name={p.name} src={p.src} size={size} decorative />)}
      {rest.length ? <span className={cx("pw-av", "pw-av--" + size, "pw-av--more")} aria-hidden="true" title={rest.map((p) => p.name).join(", ")}><span className="pw-av__root"><span className="pw-av__fb">+{rest.length}</span></span></span> : null}
    </span>
  );
}

/* ---------- ProgressBar ---------- */
// Determinate (value 0..max) or indeterminate (value null). Radix sets role="progressbar" and the aria-value*;
// the visible label names it and the value text ("42 %", or your `valueText`) is what screen readers read.
export function ProgressBar({ value, max = 100, label, hideLabel, valueText, tone = "ink", hint, showValue = true }: ProgressBarProps) {
  const id = React.useId();
  const indeterminate = value == null;
  const pct = indeterminate ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  const text = valueText ?? (indeterminate ? undefined : Math.round(pct) + " %");
  return (
    <div className={cx("pw-progress", "pw-progress--" + tone, indeterminate && "is-indeterminate")}>
      <div className={cx("pw-progress__h", hideLabel && "pw-sr")}>
        <span id={id} className="pw-progress__label">{label}</span>
        {showValue && text ? <span className="pw-caption pw-muted pw-num" aria-hidden="true">{text}</span> : null}
      </div>
      <RProgress.Root className="pw-progress__track" value={indeterminate ? null : value} max={max} aria-labelledby={id} getValueLabel={() => text ?? ""}>
        <RProgress.Indicator className="pw-progress__fill" style={indeterminate ? undefined : { transform: `translateX(-${100 - pct}%)` }} />
      </RProgress.Root>
      {hint ? <div className="pw-caption pw-muted">{hint}</div> : null}
    </div>
  );
}
