import type { ButtonProps, StatusBadgeProps, StatusDotProps, SeverityMarkProps, TrendProps, TooltipProps, MenuSelectProps, TimeRangePickerProps, ScopeSwitcherProps, GlobalSearchProps, FilterBarProps, BreadcrumbsProps, TabsProps, PanelProps, MetricProps, StateBlockProps, AlertBannerProps, ToastProps, DrawerProps, ModalProps, SparklineProps, SkeletonProps, ToastRegionProps, Option, Scope, SearchItem, Status } from "./types";
import { createFormatter } from "./format";
const timeZoneLabel = () => createFormatter({ locale: navigator.language, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, currency: "USD" }).timeZoneLabel();
import { Icon } from "./icons";
import * as React from "react";
import { Fragment } from "react";
const { useState, useRef, useEffect, useId, useCallback, useMemo } = React;

export const cx = (...a: Array<string | false | null | undefined | 0>) => a.filter(Boolean).join(" ");

/* ---------- Button ---------- */
export function Button({ variant = "secondary", size, icon, iconRight, loading, disabled, className, children, forceState, ...rest }: ButtonProps) {
  return (
    <button {...rest} type={rest.type || "button"} disabled={disabled || loading} aria-busy={loading || undefined}
      className={cx("pw-btn", "pw-btn--" + variant, size === "sm" && "pw-btn--sm", !children && "pw-btn--icon", forceState && "is-" + forceState, className)}>
      {loading ? <span className="pw-spin" aria-hidden="true" /> : icon ? <Icon name={icon} /> : null}
      {children ? <span>{children}</span> : null}
      {iconRight ? <Icon name={iconRight} /> : null}
    </button>
  );
}

/* ---------- Status ---------- */
const STATUS_LABEL: Record<Status, string> = { critical: "Critical", warning: "Warning", healthy: "Healthy", unknown: "No data", info: "Running" };
export function StatusBadge({ status = "unknown", label, emphasis, size, className }: StatusBadgeProps) {
  // emphasis: filled tint for critical/warning by default; healthy/unknown/info always outline (healthy is quiet)
  const filled = emphasis !== undefined ? emphasis : status === "critical" || status === "warning";
  return (
    <span className={cx("pw-badge", "pw-badge--" + status, filled && "is-filled", size === "sm" && "pw-badge--sm", className)}>
      <Icon name={status} size={size === "sm" ? 12 : 14} />
      <span>{label || STATUS_LABEL[status]}</span>
    </span>
  );
}
export function StatusDot({ status = "unknown", label }: StatusDotProps) {
  return <span className={cx("pw-sdot", "pw-badge--" + status)} title={label || STATUS_LABEL[status]}><Icon name={status} size={12} /><span className="pw-sr">{label || STATUS_LABEL[status]}</span></span>;
}
const SEV: Record<SeverityMarkProps["level"], [Status, number]> = { 1: ["critical", 4], 2: ["critical", 3], 3: ["warning", 2], 4: ["unknown", 1] };
export function SeverityMark({ level = 3, showLabel = true, count }: SeverityMarkProps) {
  const [tone, n] = SEV[level];
  return (
    <span className={cx("pw-sev", "pw-sev--" + (count === 0 ? "zero" : tone))} aria-label={"Severity " + level + (count != null ? ", " + count : "")}>
      <span className="pw-sev__bars" aria-hidden="true">{[0, 1, 2, 3].map((i) => <i key={i} className={i < n ? "on" : ""} />)}</span>
      {showLabel ? <span>SEV{level}</span> : null}
      {count != null ? <b>{count}</b> : null}
    </span>
  );
}

/* ---------- Trend ---------- */
// direction from sign; goodness from polarity: "up-bad" (latency, errors, cost) | "up-good" | "neutral"
export function Trend({ value, unit = "%", polarity = "up-bad", window: win, threshold = 2, breach }: TrendProps) {
  const dir = Math.abs(value) < threshold ? "flat" : value > 0 ? "up" : "down";
  const bad = dir !== "flat" && ((polarity === "up-bad" && dir === "up") || (polarity === "up-good" && dir === "down"));
  const tone = bad ? (breach ? "critical" : "warning") : "neutral";
  const glyph = dir === "up" ? "▲" : dir === "down" ? "▼" : "▬";
  return (
    <span className={cx("pw-trend", "pw-trend--" + tone)}>
      <span aria-hidden="true">{glyph}</span>
      <span className="pw-num">{dir === "flat" ? "±" : ""}{Math.abs(value).toLocaleString("en", { maximumFractionDigits: 1 })}{unit}</span>
      {win ? <span className="pw-muted">vs {win}</span> : null}
      <span className="pw-sr">{bad ? "worse" : dir === "flat" ? "no change" : "better or neutral"}</span>
    </span>
  );
}

/* ---------- Tooltip ---------- */
export function Tooltip({ content, children, side = "top", forceOpen }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const show = forceOpen || open;
  return (
    <span className="pw-tipwrap" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
      {React.cloneElement(children, { "aria-describedby": show ? id : undefined })}
      {show ? <span role="tooltip" id={id} className={cx("pw-tip", "pw-tip--" + side)}>{content}</span> : null}
    </span>
  );
}

/* ---------- Popover (internal) ---------- */
export function usePopover<T extends HTMLElement = HTMLDivElement>() {
  const [open, setOpen] = useState(false);
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);
  return { open, setOpen, ref };
}

/* ---------- Menu select (used by scope, filters) ---------- */
// Options may be plain strings; a missing label falls back to the value.
const toOption = (o: string | Option): Option & { label: string } => (typeof o === "string" ? { value: o, label: o } : { ...o, label: o.label ?? o.value });
export function MenuSelect({ label, value, options, onChange, icon, disabled, width, prefix, forceOpen, quiet }: MenuSelectProps) {
  const { open, setOpen, ref } = usePopover();
  const isOpen = forceOpen || open;
  const opts = options.map(toOption);
  const cur = opts.find((o) => o.value === value);
  const curLabel = cur ? cur.label : value;
  return (
    <div className="pw-menusel" ref={ref}>
      <button type="button" className={cx("pw-field", quiet && "pw-field--quiet", isOpen && "is-open")} aria-haspopup="listbox" aria-expanded={isOpen} aria-label={label + ": " + curLabel} disabled={disabled} onClick={() => setOpen(!open)} style={width ? { minWidth: width } : undefined}>
        {icon ? <Icon name={icon} /> : null}
        {prefix ? <span className="pw-field__pre">{prefix}</span> : null}
        <span className="pw-field__val">{curLabel}</span>
        <Icon name="chevron-down" size={14} />
      </button>
      {isOpen ? (
        <ul role="listbox" aria-label={label} className="pw-pop pw-list">
          {opts.map((o) => {
            const v = o.value; const sel = v === value;
            return (
              <li key={v} role="option" aria-selected={sel} tabIndex={0} className={cx("pw-list__item", sel && "is-selected")}
                onClick={() => { onChange && onChange(v); setOpen(false); }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange && onChange(v); setOpen(false); } }}>
                <span className="pw-list__check">{sel ? <Icon name="check" size={14} /> : null}</span>
                <span>{o.label}</span>
                {o.meta ? <span className="pw-muted pw-list__meta">{o.meta}</span> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/* ---------- Time range picker ---------- */
export const TIME_RANGES = [
  { value: "15m", label: "Last 15 min" }, { value: "1h", label: "Last 1 hour" }, { value: "6h", label: "Last 6 hours" },
  { value: "24h", label: "Last 24 hours" }, { value: "7d", label: "Last 7 days" }, { value: "30d", label: "Last 30 days" },
  { value: "mtd", label: "Month to date" }, { value: "6mo", label: "Last 6 months" },
];
const REFRESH = [{ value: "off", label: "Off" }, { value: "30s", label: "30 s" }, { value: "1m", label: "1 min" }, { value: "5m", label: "5 min" }];
export function TimeRangePicker({ value = "1h", refresh = "30s", onChange, onRefreshChange, onCopy, ranges = TIME_RANGES, forceOpen, disabled, absolute }: TimeRangePickerProps) {
  const { open, setOpen, ref } = usePopover();
  const isOpen = forceOpen || open;
  const cur = ranges.find((r) => r.value === value);
  const [copied, setCopied] = useState(false);
  return (
    <div className="pw-time" ref={ref}>
      <button type="button" className={cx("pw-field", isOpen && "is-open")} aria-haspopup="dialog" aria-expanded={isOpen} onClick={() => setOpen(!open)} disabled={disabled}>
        <Icon name="clock" />
        <span className="pw-field__val">{absolute || (cur ? cur.label : value)}</span>
        {refresh !== "off" ? <span className="pw-time__live" title={"Auto-refresh every " + refresh}><Icon name="refresh" size={12} />{refresh}</span> : null}
        <Icon name="chevron-down" size={14} />
      </button>
      {isOpen ? (
        <div role="dialog" aria-label="Time range" className="pw-pop pw-time__pop">
          <div className="pw-time__cols">
            <div>
              <div className="pw-caption pw-muted pw-pop__h">Relative</div>
              <ul role="listbox" aria-label="Relative ranges" className="pw-list pw-list--flat">
                {ranges.map((r) => (
                  <li key={r.value} role="option" tabIndex={0} aria-selected={r.value === value} className={cx("pw-list__item", r.value === value && "is-selected")}
                    onClick={() => { onChange && onChange(r.value); setOpen(false); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { onChange && onChange(r.value); setOpen(false); } }}>
                    <span className="pw-list__check">{r.value === value ? <Icon name="check" size={14} /> : null}</span>{r.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pw-time__abs">
              <div className="pw-caption pw-muted pw-pop__h">Absolute ({timeZoneLabel()})</div>
              <label className="pw-lab">From<input className="pw-input pw-num" defaultValue="2026-10-29 13:58" /></label>
              <label className="pw-lab">To<input className="pw-input pw-num" defaultValue="2026-10-29 14:58" /></label>
              <Button size="sm" onClick={() => setOpen(false)}>Apply</Button>
              <div className="pw-caption pw-muted pw-pop__h" style={{ marginTop: 12 }}>Auto-refresh</div>
              <div className="pw-seg" role="radiogroup" aria-label="Auto-refresh">
                {REFRESH.map((r) => <button key={r.value} type="button" role="radio" aria-checked={r.value === refresh} className={cx("pw-seg__b", r.value === refresh && "is-on")} onClick={() => onRefreshChange && onRefreshChange(r.value)}>{r.label}</button>)}
              </div>
              <button type="button" className="pw-linkbtn" onClick={() => { setCopied(true); onCopy && onCopy(value); setTimeout(() => setCopied(false), 1500); }}>
                <Icon name="copy" size={14} />{copied ? "Range copied" : "Copy range to paste elsewhere"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Scope switcher ---------- */
export function ScopeSwitcher({ scope, options, onChange, compact }: ScopeSwitcherProps) {
  // scope: {env, cloud, cluster}; options: {env:[], cloud:[], cluster:[]}
  const set = (k: keyof Scope) => (v: string) => onChange && onChange({ ...scope, [k]: v });
  return (
    <div className={cx("pw-scope", compact && "is-compact")} role="group" aria-label="Scope">
      <MenuSelect quiet label="Environment" value={scope.env} options={options.env} onChange={set("env")} />
      <span className="pw-scope__sep" aria-hidden="true">/</span>
      <MenuSelect quiet label="Cloud" value={scope.cloud} options={options.cloud} onChange={set("cloud")} />
      {!compact ? <Fragment><span className="pw-scope__sep" aria-hidden="true">/</span><MenuSelect quiet label="Cluster" value={scope.cluster} options={options.cluster} onChange={set("cluster")} /></Fragment> : null}
    </div>
  );
}

/* ---------- Global search ---------- */
export function GlobalSearch({ items = [], onSelect, placeholder = "Search repositories, runs, files", forceQuery }: GlobalSearchProps) {
  const [q, setQ] = useState(forceQuery || "");
  const [focus, setFocus] = useState(!!forceQuery);
  const [hi, setHi] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); inputRef.current?.focus(); } };
    document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k);
  }, []);
  const res = q ? items.filter((i) => (i.label + " " + (i.kind || "")).toLowerCase().includes(q.toLowerCase())).slice(0, 7) : [];
  const pick = (i: SearchItem) => { onSelect && onSelect(i); setQ(""); setFocus(false); };
  return (
    <div className="pw-search" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocus(false); }}>
      <Icon name="search" />
      <input ref={inputRef} className="pw-search__in" role="combobox" aria-expanded={focus && res.length > 0} aria-controls="pw-search-res" aria-label="Search"
        placeholder={placeholder} value={q} onFocus={() => setFocus(true)} onChange={(e) => { setQ(e.target.value); setHi(0); }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setHi(Math.min(hi + 1, res.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setHi(Math.max(hi - 1, 0)); }
          const sel = res[hi]; if (e.key === "Enter" && sel) pick(sel);
          if (e.key === "Escape") { setQ(""); e.currentTarget.blur(); }
        }} />
      <kbd className="pw-kbd">⌘K</kbd>
      {focus && q ? (
        <ul id="pw-search-res" role="listbox" className="pw-pop pw-list pw-search__res">
          {res.length ? res.map((i, n) => (
            <li key={i.label} role="option" aria-selected={n === hi} tabIndex={-1} className={cx("pw-list__item", n === hi && "is-active")} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(i)}>
              {i.status ? <StatusDot status={i.status} /> : <span className="pw-list__check" />}
              <span className="pw-mono">{i.label}</span><span className="pw-muted pw-list__meta">{i.kind}</span>
            </li>
          )) : <li className="pw-list__empty pw-muted">No match for “{q}”. Try a pod hash, DAG id or incident number.</li>}
        </ul>
      ) : null}
    </div>
  );
}

/* ---------- Filter bar ---------- */
export function FilterBar({ filters = [], values = {}, onChange, query, onQuery, queryPlaceholder = "Filter by name", onClear, count, children }: FilterBarProps) {
  const active = Object.keys(values).filter((k) => values[k] && values[k] !== "all");
  return (
    <div className="pw-filterbar" role="search">
      <div className="pw-filterbar__q"><Icon name="filter" /><input className="pw-input pw-input--bare" aria-label={queryPlaceholder} placeholder={queryPlaceholder} value={query || ""} onChange={(e) => onQuery && onQuery(e.target.value)} /></div>
      {filters.map((f) => (
        <MenuSelect key={f.key} label={f.label} prefix={f.label} value={values[f.key] || "all"} options={[{ value: "all", label: "All" }, ...f.options]} onChange={(v) => onChange && onChange({ ...values, [f.key]: v })} />
      ))}
      {children}
      <span className="pw-filterbar__end">
        {count != null ? <span className="pw-caption pw-muted pw-num">{count}</span> : null}
        {active.length || query ? <button type="button" className="pw-linkbtn" onClick={onClear}>Clear {active.length + (query ? 1 : 0)}</button> : null}
      </span>
    </div>
  );
}

/* ---------- Breadcrumbs ---------- */
export function Breadcrumbs({ items = [], onNavigate }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="pw-crumbs">
      <ol>
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i}>
              {last ? <span aria-current="page" className={cx(it.mono && "pw-mono")}>{it.label}</span>
                : <a href={it.href || "#"} className={cx(it.mono && "pw-mono")} onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate(it); } }}>{it.label}</a>}
              {!last ? <span className="pw-crumbs__sep" aria-hidden="true">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ---------- Tabs ---------- */
export function Tabs({ tabs = [], value, onChange, size }: TabsProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  return (
    <div role="tablist" className={cx("pw-tabs", size === "sm" && "pw-tabs--sm")}>
      {tabs.map((t, i) => {
        const on = t.value === value;
        return (
          <button key={t.value} ref={(el: HTMLButtonElement | null) => (refs.current[i] = el)} role="tab" type="button" aria-selected={on} tabIndex={on ? 0 : -1} disabled={t.disabled}
            className={cx("pw-tab", on && "is-on")} onClick={() => onChange && onChange(t.value)}
            onKeyDown={(e) => {
              const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return;
              const n = (i + d + tabs.length) % tabs.length; refs.current[n]?.focus(); const next = tabs[n]; if (onChange && next) onChange(next.value);
            }}>
            {t.label}{t.count != null ? <span className={cx("pw-tab__count", t.tone && "pw-tone--" + t.tone)}>{t.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Panel (data surface) ---------- */
export function Panel({ title, meta, actions, children, flush, className, footer, id }: PanelProps) {
  return (
    <section className={cx("pw-panel", flush && "pw-panel--flush", className)} aria-labelledby={title && id ? id : undefined}>
      {title || actions ? (
        <header className="pw-panel__h">
          <div className="pw-panel__t"><h3 id={id} className="pw-subheading">{title}</h3>{meta ? <span className="pw-caption pw-muted">{meta}</span> : null}</div>
          {actions ? <div className="pw-panel__a">{actions}</div> : null}
        </header>
      ) : null}
      <div className="pw-panel__b">{children}</div>
      {footer ? <footer className="pw-panel__f">{footer}</footer> : null}
    </section>
  );
}

/* ---------- Metric (KPI) ---------- */
export function Metric({ label, scope, value, unit, delta, target, status, statusLabel, freshness, action, onAction, spark, state = "ready", compact }: MetricProps) {
  if (state === "loading") return <div className="pw-metric is-loading" aria-busy="true"><Skeleton w="40%" /><Skeleton w="60%" h={28} /><Skeleton w="50%" /></div>;
  return (
    <div className={cx("pw-metric", compact && "pw-metric--compact", state === "degraded" && "is-degraded", state === "error" && "is-error")}>
      <div className="pw-metric__h"><span className="pw-body-strong">{label}</span>{scope ? <span className="pw-muted pw-caption">{scope}</span> : null}</div>
      {state === "error" ? (
        <div className="pw-metric__err"><StatusBadge status="unknown" label="Couldn’t load" /><span className="pw-caption pw-muted">Query timed out after 30 s.</span></div>
      ) : (
        <Fragment>
          <div className="pw-metric__v">
            <span className="pw-figure">{value}</span>
            {unit ? <span className="pw-muted">{unit}</span> : null}
            {spark ? <Sparkline points={spark.points} threshold={spark.threshold} tone={status} width={96} height={28} /> : null}
          </div>
          <div className="pw-metric__d">
            {status === "critical" || status === "warning" ? <StatusBadge status={status} label={statusLabel} /> : null}
            {delta ? <Trend {...delta} breach={status === "critical"} /> : null}
          </div>
          <div className="pw-metric__d">
            {target ? <span className="pw-caption pw-muted">{target}</span> : null}
          </div>
        </Fragment>
      )}
      {(freshness || action) ? (
        <div className="pw-metric__f">
          {state === "degraded" ? <span className="pw-caption pw-tone--warning"><Icon name="warning" size={12} /> {freshness}</span> : freshness ? <span className="pw-caption pw-muted">{freshness}</span> : <span />}
          {action ? <button type="button" className="pw-linkbtn" onClick={onAction}>{action}<Icon name="chevron-right" size={14} /></button> : null}
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Skeleton & state templates ---------- */
export function Skeleton({ w = "100%", h: ht = 12, style }: SkeletonProps) { return <span className="pw-skel" style={{ width: w, height: ht, ...style }} aria-hidden="true" />; }

const STATE_DEF: Record<Exclude<StateBlockProps["kind"], "loading">, { icon: string; title: string }> = {
  empty: { icon: "unknown", title: "Nothing here yet" },
  error: { icon: "critical", title: "Couldn’t load this view" },
  "no-access": { icon: "lock", title: "You don’t have access" },
  degraded: { icon: "warning", title: "Showing partial data" },
};
export function StateBlock({ kind = "empty", title, body, action, onAction, secondary, onSecondary, detail, rows = 4, inline }: StateBlockProps) {
  if (kind === "loading") {
    return (
      <div className={cx("pw-state", "pw-state--loading", inline && "is-inline")} aria-busy="true" aria-live="polite">
        <span className="pw-sr">Loading</span>
        {Array.from({ length: rows }).map((_, i) => <div key={i} className="pw-state__skrow"><Skeleton w={(28 + ((i * 37) % 40)) + "%"} /><Skeleton w="14%" /><Skeleton w="10%" /></div>)}
      </div>
    );
  }
  const d = STATE_DEF[kind];
  return (
    <div className={cx("pw-state", "pw-state--" + kind, inline && "is-inline")} role={kind === "error" ? "alert" : undefined}>
      <span className={cx("pw-state__icon", kind === "error" && "pw-tone--critical", kind === "degraded" && "pw-tone--warning")}><Icon name={d.icon} size={20} /></span>
      <div className="pw-state__txt">
        <div className="pw-body-strong">{title || d.title}</div>
        {body ? <div className="pw-muted">{body}</div> : null}
        {detail ? <code className="pw-state__detail">{detail}</code> : null}
        {action || secondary ? <div className="pw-state__acts">{action ? <Button variant="secondary" size="sm" onClick={onAction}>{action}</Button> : null}{secondary ? <button type="button" className="pw-linkbtn" onClick={onSecondary}>{secondary}</button> : null}</div> : null}
      </div>
    </div>
  );
}

/* ---------- Alert banner & toast ---------- */
export function AlertBanner({ tone = "critical", title, children, action, onAction, onDismiss, meta }: AlertBannerProps) {
  const icon = tone === "healthy" ? "healthy" : tone;
  return (
    <div className={cx("pw-banner", "pw-banner--" + tone)} role={tone === "critical" ? "alert" : "status"}>
      <Icon name={icon} />
      <div className="pw-banner__txt"><span className="pw-body-strong">{title}</span>{children ? <span> {children}</span> : null}{meta ? <span className="pw-caption pw-muted pw-banner__meta">{meta}</span> : null}</div>
      {action ? <Button size="sm" variant="secondary" onClick={onAction}>{action}</Button> : null}
      {onDismiss ? <Button size="sm" variant="ghost" icon="x" aria-label="Dismiss" onClick={onDismiss} /> : null}
    </div>
  );
}
export function Toast({ tone = "info", title, body, action, onAction, onClose }: ToastProps) {
  return (
    <div className={cx("pw-toast", "pw-toast--" + tone)} role="status" aria-live="polite">
      <Icon name={tone} />
      <div className="pw-toast__txt"><div className="pw-body-strong">{title}</div>{body ? <div className="pw-muted">{body}</div> : null}</div>
      {action ? <button type="button" className="pw-linkbtn" onClick={onAction}>{action}</button> : null}
      {onClose ? <Button size="sm" variant="ghost" icon="x" aria-label="Close" onClick={onClose} /> : null}
    </div>
  );
}
export function ToastRegion({ children }: ToastRegionProps) { return <div className="pw-toasts" aria-live="polite">{children}</div>; }

/* ---------- Drawer & modal ---------- */
function useFocusTrap<T extends HTMLElement>(open: boolean, onClose?: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!open || !el) return;
    const prev = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const f = el.querySelector<HTMLElement>("button, [href], input, [tabindex='0']"); f && f.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose && onClose();
      if (e.key === "Tab") {
        const all = el.querySelectorAll<HTMLElement>("button:not([disabled]), [href], input, [tabindex='0']");
        const first = all[0], last = all[all.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    el.addEventListener("keydown", key);
    return () => { el.removeEventListener("keydown", key); prev && prev.focus(); };
  }, [open]);
  return ref;
}
export function Drawer({ open, title, subtitle, onClose, children, footer, width, contained }: DrawerProps) {
  const ref = useFocusTrap<HTMLElement>(open, onClose);
  if (!open) return null;
  return (
    <div className={cx("pw-layer", contained && "is-contained")}>
      <div className="pw-scrim pw-scrim--light" onClick={onClose} />
      <aside ref={ref} className="pw-drawer" role="dialog" aria-modal="true" aria-label={title} style={width ? { width } : undefined}>
        <header className="pw-drawer__h"><div><div className="pw-heading">{title}</div>{subtitle ? <div className="pw-caption pw-muted">{subtitle}</div> : null}</div><Button variant="ghost" icon="x" aria-label="Close" onClick={onClose} /></header>
        <div className="pw-drawer__b">{children}</div>
        {footer ? <footer className="pw-drawer__f">{footer}</footer> : null}
      </aside>
    </div>
  );
}
export function Modal({ open, title, onClose, children, actions, contained, tone }: ModalProps) {
  const ref = useFocusTrap<HTMLDivElement>(open, onClose);
  if (!open) return null;
  return (
    <div className={cx("pw-layer", "pw-layer--center", contained && "is-contained")}>
      <div className="pw-scrim" onClick={onClose} />
      <div ref={ref} className="pw-modal" role={tone === "critical" ? "alertdialog" : "dialog"} aria-modal="true" aria-label={title}>
        <header className="pw-modal__h"><div className="pw-heading">{title}</div><Button variant="ghost" icon="x" aria-label="Close" onClick={onClose} /></header>
        <div className="pw-modal__b">{children}</div>
        {actions ? <footer className="pw-modal__f">{actions}</footer> : null}
      </div>
    </div>
  );
}

/* ---------- Sparkline (also used by Metric) ---------- */
export function Sparkline({ points = [], width = 120, height = 28, threshold, tone, label }: SparklineProps) {
  if (!points.length) return null;
  const max = Math.max(...points, threshold || 0) * 1.08, min = Math.min(...points, 0);
  const sx = (i: number) => 1 + (i * (width - 2)) / (points.length - 1);
  const sy = (v: number) => height - 2 - ((v - min) / (max - min || 1)) * (height - 4);
  const d = points.map((v, i) => (i ? "L" : "M") + sx(i).toFixed(1) + "," + sy(v).toFixed(1)).join("");
  const last = points[points.length - 1] ?? 0;
  return (
    <svg className="pw-spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label || `Trend, latest ${last}`}>
      {threshold != null ? <line x1="0" x2={width} y1={sy(threshold)} y2={sy(threshold)} className="pw-spark__thr" /> : null}
      <path d={d} className="pw-spark__l" />
      <circle cx={sx(points.length - 1)} cy={sy(last)} r="4" className={cx("pw-spark__dot", tone && "pw-fill--" + tone)} />
    </svg>
  );
}
