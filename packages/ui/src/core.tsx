import type { IconName, PopoverProps, ButtonProps, StatusBadgeProps, StatusDotProps, SeverityMarkProps, TrendProps, TooltipProps, SegmentedControlProps, MenuSelectProps, ScopeDimension, BreadcrumbItem, TimeRangePickerProps, ScopeSwitcherProps, GlobalSearchProps, FilterBarProps, BreadcrumbsProps, TabsProps, PanelProps, MetricProps, StateBlockProps, AlertBannerProps, ToastProps, DrawerProps, ModalProps, SparklineProps, SkeletonProps, ToastRegionProps, Option, Scope, SearchItem, Status } from "./types";
import { createFormatter } from "./format";
const timeZoneLabel = () => createFormatter({ locale: navigator.language, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, currency: "USD" }).timeZoneLabel();
import { Icon } from "./icons";
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as RPopover from "@radix-ui/react-popover";
import * as RTooltip from "@radix-ui/react-tooltip";
import * as DM from "@radix-ui/react-dropdown-menu";
import * as RToggle from "@radix-ui/react-toggle-group";
import * as RTabs from "@radix-ui/react-tabs";
import { Command } from "cmdk";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { Fragment } from "react";
const { useState, useRef, useEffect, useId, useCallback, useMemo } = React;

export const cx = (...a: Array<string | false | null | undefined | 0>) => a.filter(Boolean).join(" ");

/* ---------- Button ---------- */
// Forwards its ref so it can be the trigger of a menu or popover. `asChild` styles its single child instead (e.g. a
// router link): <Button asChild variant="primary"><a href="/runs/new">Start run</a></Button>.
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = "secondary", size, icon, iconRight, loading, disabled, className, children, forceState, asChild, ...rest }, ref) {
  const cls = cx("pw-btn", "pw-btn--" + variant, size === "sm" && "pw-btn--sm", !children && "pw-btn--icon", forceState && "is-" + forceState, className);
  const lead = loading ? <span className="pw-spin" aria-hidden="true" /> : icon ? <Icon name={icon} /> : null;
  const trail = iconRight ? <Icon name={iconRight} /> : null;
  if (asChild) {
    return (
      <Slot ref={ref} {...rest} className={cls} aria-disabled={disabled || loading || undefined} aria-busy={loading || undefined}>
        {lead}<Slottable>{children}</Slottable>{trail}
      </Slot>
    );
  }
  return (
    <button ref={ref} {...rest} type={rest.type || "button"} disabled={disabled || loading} aria-busy={loading || undefined} className={cls}>
      {lead}{children ? <span>{children}</span> : null}{trail}
    </button>
  );
});

/* ---------- Popover (Radix Popover) ---------- */
// Non-modal floating panel for filters, details and small forms. Radix handles focus (moves in, returns to the
// trigger), Escape, outside click, collision and the portal. Close it from inside with <PopoverClose>.
export function Popover({ trigger, children, label, open, defaultOpen, onOpenChange, side = "bottom", align = "start", width, forceOpen, className }: PopoverProps) {
  return (
    <RPopover.Root open={forceOpen || open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <RPopover.Trigger asChild>{trigger}</RPopover.Trigger>
      <RPopover.Portal>
        <RPopover.Content className={cx("pw-popover", className)} side={side} align={align} sideOffset={6} collisionPadding={8} aria-label={label} style={width ? { width } : undefined}>
          {children}
        </RPopover.Content>
      </RPopover.Portal>
    </RPopover.Root>
  );
}
/** Wraps an element inside a Popover so activating it closes the popover: <PopoverClose><Button>Done</Button></PopoverClose>. */
export function PopoverClose({ children }: { children: React.ReactElement }) { return <RPopover.Close asChild>{children}</RPopover.Close>; }

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

/* ---------- Tooltip (Radix Tooltip) ---------- */
// Radix adds the delay, collision handling, the portal (so the rail's scroll area can't clip it), Escape, and
// aria-describedby on the trigger. Tooltips in one TooltipProvider share a "skip delay": moving from one to the next
// opens it at once. AppShell provides one; a Tooltip outside any provider brings its own.
const TipScope = React.createContext(false);
export function TooltipProvider({ children, delay = 400 }: { children?: React.ReactNode; /** ms before a tooltip opens (default 400) */ delay?: number }) {
  return <RTooltip.Provider delayDuration={delay} skipDelayDuration={300}><TipScope.Provider value={true}>{children}</TipScope.Provider></RTooltip.Provider>;
}
export function Tooltip({ content, children, side = "top", forceOpen }: TooltipProps) {
  const scoped = React.useContext(TipScope);
  const tip = (
    <RTooltip.Root open={forceOpen ? true : undefined}>
      <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
      <RTooltip.Portal>
        <RTooltip.Content className="pw-tooltip" side={side} sideOffset={6} collisionPadding={8}>{content}</RTooltip.Content>
      </RTooltip.Portal>
    </RTooltip.Root>
  );
  return scoped ? tip : <TooltipProvider>{tip}</TooltipProvider>;
}

/* ---------- Stable widths (internal) ---------- */
// Controls whose text changes (a menu's value, the time range, the selected tab) must not resize and push their
// neighbours. Fit shows `current` but reserves the width of the widest of `all`; Reserve keeps room for the bold
// (selected) weight of a label. The reserving copies are visibility: hidden, so screen readers skip them.
function Fit({ current, all }: { current: string; all: string[] }) {
  const texts = Array.from(new Set([current, ...all]));
  return <span className="pw-fit">{texts.map((t) => <span key={t} className={t === current ? undefined : "pw-fit__ghost"} aria-hidden={t === current ? undefined : true}>{t}</span>)}</span>;
}
const Reserve = ({ text }: { text: string }) => <span className="pw-reserve" data-text={text}>{text}</span>;

/* ---------- Menu select (used by scope, filters) ---------- */
// A compact picker for toolbars: a menu of choices on Radix DropdownMenu (arrow keys, typeahead, Home/End, focus
// returns to the trigger, portal). The trigger keeps the width of the widest option (Fit), so switching never moves
// its neighbours. Its accessible name is its visible text (prefix, or a hidden "Label:", then the value), so speech
// input users can say what they see.
// Options may be plain strings; a missing label falls back to the value.
const toOption = (o: string | Option): Option & { label: string } => (typeof o === "string" ? { value: o, label: o } : { ...o, label: o.label ?? o.value });
export function MenuSelect({ label, value, options, onChange, icon, disabled, width, prefix, forceOpen, quiet }: MenuSelectProps) {
  const [open, setOpen] = useState(false);
  const isOpen = forceOpen || open;
  const opts = options.map(toOption);
  const cur = opts.find((o) => o.value === value);
  const curLabel = cur ? cur.label : value;
  return (
    <DM.Root open={isOpen} onOpenChange={setOpen} modal={forceOpen ? false : undefined}>
      <DM.Trigger asChild disabled={disabled}>
        <button type="button" className={cx("pw-field", quiet && "pw-field--quiet", isOpen && "is-open")} style={width ? { minWidth: width } : undefined}>
          {icon ? <Icon name={icon} /> : null}
          {prefix ? <span className="pw-field__pre">{prefix}</span> : <span className="pw-sr">{label}: </span>}
          <span className="pw-field__val"><Fit current={curLabel} all={opts.map((o) => o.label)} /></span>
          <Icon name="chevron-down" size={14} />
        </button>
      </DM.Trigger>
      <DM.Portal>
        <DM.Content className="pw-menu pw-menusel" align="start" sideOffset={6} collisionPadding={8} loop aria-label={label}>
          <DM.RadioGroup value={value} onValueChange={(v) => onChange && onChange(v)}>
            {opts.map((o) => (
              <DM.RadioItem key={o.value} value={o.value} disabled={o.disabled} className={cx("pw-list__item", o.value === value && "is-selected")}>
                <span className="pw-list__check"><DM.ItemIndicator><Icon name="check" size={14} /></DM.ItemIndicator></span>
                <span>{o.label}</span>
                {o.meta ? <span className="pw-muted pw-list__meta">{o.meta}</span> : null}
              </DM.RadioItem>
            ))}
          </DM.RadioGroup>
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}

/* ---------- Segmented control (Radix ToggleGroup, single) ---------- */
// A few mutually exclusive options shown at once: view modes, auto-refresh, chart range. A radio group: Tab enters
// at the selected option, arrows move, Space or Enter selects. Selected labels reserve their bold width.
export function SegmentedControl({ label, value, defaultValue, onChange, options, disabled, size }: SegmentedControlProps) {
  const [inner, setInner] = useState(defaultValue ?? "");
  const cur = value ?? inner;
  return (
    <RToggle.Root type="single" className={cx("pw-seg", size === "sm" && "pw-seg--sm")} aria-label={label} value={cur} disabled={disabled}
      onValueChange={(v) => { if (!v) return; setInner(v); onChange && onChange(v); }}>
      {options.map(toOption).map((o) => (
        <RToggle.Item key={o.value} value={o.value} disabled={o.disabled} className={cx("pw-seg__b", o.value === cur && "is-on")}><Reserve text={o.label} /></RToggle.Item>
      ))}
    </RToggle.Root>
  );
}

/* ---------- Time range picker ---------- */
export const TIME_RANGES = [
  { value: "15m", label: "Last 15 min" }, { value: "1h", label: "Last 1 hour" }, { value: "6h", label: "Last 6 hours" },
  { value: "24h", label: "Last 24 hours" }, { value: "7d", label: "Last 7 days" }, { value: "30d", label: "Last 30 days" },
  { value: "mtd", label: "Month to date" }, { value: "6mo", label: "Last 6 months" },
];
const REFRESH = [{ value: "off", label: "Off" }, { value: "30s", label: "30 s" }, { value: "1m", label: "1 min" }, { value: "5m", label: "5 min" }];
// Absolute ranges are typed as "YYYY-MM-DD HH:mm" in the browser's time zone (shown in the heading).
const pad2 = (n: number) => String(n).padStart(2, "0");
const localStamp = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
const STAMP = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
export function TimeRangePicker({ value = "1h", refresh = "30s", onChange, onRefreshChange, onCopy, ranges = TIME_RANGES, forceOpen, disabled, absolute, defaultAbsolute, onAbsoluteChange }: TimeRangePickerProps) {
  const [open, setOpen] = useState(false);
  const isOpen = forceOpen || open;
  const cur = ranges.find((r) => r.value === value);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const [from, setFrom] = useState(() => defaultAbsolute?.from ?? localStamp(new Date(Date.now() - 3600e3)));
  const [to, setTo] = useState(() => defaultAbsolute?.to ?? localStamp(new Date()));
  const [absErr, setAbsErr] = useState<string | null>(null);
  const errId = useId();
  const apply = () => {
    const f = from.trim(), t = to.trim();
    if (!STAMP.test(f) || !STAMP.test(t)) return setAbsErr("Use the format YYYY-MM-DD HH:mm.");
    if (f >= t) return setAbsErr("“From” must be before “To”.");
    setAbsErr(null); onAbsoluteChange && onAbsoluteChange({ from: f, to: t }); setOpen(false);
  };
  const copy = () => { setCopied(true); onCopy && onCopy(absolute || value); window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setCopied(false), 1500); };
  const absProps = { "aria-invalid": absErr ? true : undefined, "aria-describedby": absErr ? errId : undefined } as const;
  const shown = absolute || (cur ? cur.label ?? cur.value : value);
  return (
    <RPopover.Root open={isOpen} onOpenChange={setOpen}>
      <RPopover.Trigger asChild disabled={disabled}>
        <button type="button" className={cx("pw-field pw-time", isOpen && "is-open")}>
          <Icon name="clock" />
          <span className="pw-sr">Time range: </span>
          <span className="pw-field__val"><Fit current={shown} all={ranges.map((r) => r.label ?? r.value)} /></span>
          <span className="pw-time__live" title={refresh === "off" ? "Auto-refresh off" : "Auto-refresh every " + refresh}><Icon name={refresh === "off" ? "pause" : "refresh"} size={12} /><span className="pw-sr">, auto-refresh </span><Fit current={refresh} all={REFRESH.map((r) => r.value)} /></span>
          <Icon name="chevron-down" size={14} />
        </button>
      </RPopover.Trigger>
      <RPopover.Portal>
        <RPopover.Content className="pw-popover pw-time__pop" align="end" sideOffset={6} collisionPadding={8} aria-label="Time range">
          <div className="pw-time__cols">
            <div>
              <div className="pw-caption pw-muted pw-pop__h" id={errId + "-rel"}>Relative</div>
              <RToggle.Root type="single" orientation="vertical" loop className="pw-list pw-list--flat pw-time__rel" aria-labelledby={errId + "-rel"} value={absolute ? "" : value}
                onValueChange={(v) => { if (v) { onChange && onChange(v); setOpen(false); } }}>
                {ranges.map((r) => (
                  <RToggle.Item key={r.value} value={r.value} className={cx("pw-list__item", !absolute && r.value === value && "is-selected")}>
                    <span className="pw-list__check">{!absolute && r.value === value ? <Icon name="check" size={14} /> : null}</span>{r.label ?? r.value}
                  </RToggle.Item>
                ))}
              </RToggle.Root>
            </div>
            <div className="pw-time__abs">
              <div className="pw-caption pw-muted pw-pop__h">Absolute ({timeZoneLabel()})</div>
              <label className="pw-lab">From<input className="pw-input pw-num" value={from} onChange={(e) => setFrom(e.target.value)} onKeyDown={(e) => e.key === "Enter" && apply()} {...absProps} /></label>
              <label className="pw-lab">To<input className="pw-input pw-num" value={to} onChange={(e) => setTo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && apply()} {...absProps} /></label>
              {absErr ? <div id={errId} className="pw-formfield__error pw-time__err" role="alert"><Icon name="critical" size={12} /><span>{absErr}</span></div> : null}
              <Button size="sm" onClick={apply}>Apply</Button>
              <div className="pw-caption pw-muted pw-pop__h" style={{ marginTop: 12 }}>Auto-refresh</div>
              <SegmentedControl label="Auto-refresh" value={refresh} options={REFRESH} onChange={(v) => onRefreshChange && onRefreshChange(v)} />
              <button type="button" className="pw-linkbtn" onClick={copy}>
                <Icon name="copy" size={14} />{copied ? "Range copied" : "Copy range to paste elsewhere"}
              </button>
            </div>
          </div>
        </RPopover.Content>
      </RPopover.Portal>
    </RPopover.Root>
  );
}

/* ---------- Scope switcher ---------- */
export function ScopeSwitcher({ scope, options, onChange, compact, dimensions, label = "Environment" }: ScopeSwitcherProps) {
  // Runtime scope: where things run. `dimensions` takes any set; the 1.x scope/options pair is environment / cloud / cluster.
  const set = (k: keyof Scope) => (v: string) => { if (scope) onChange && onChange({ ...scope, [k]: v }); };
  const dims: ScopeDimension[] = dimensions ?? (scope && options ? [
    { key: "env", label: "Environment", value: scope.env, options: options.env, onChange: set("env") },
    { key: "cloud", label: "Cloud", value: scope.cloud, options: options.cloud, onChange: set("cloud") },
    { key: "cluster", label: "Cluster", value: scope.cluster, options: options.cluster, onChange: set("cluster") },
  ] : []);
  const shown = compact ? dims.slice(0, 2) : dims;
  return (
    <div className={cx("pw-scope", compact && "is-compact")} role="group" aria-label={label}>
      {shown.map((d, i) => (
        <Fragment key={d.key}>
          {i ? <span className="pw-scope__sep" aria-hidden="true">/</span> : null}
          <MenuSelect quiet label={d.label} value={d.value} options={d.options} onChange={d.onChange} />
        </Fragment>
      ))}
    </div>
  );
}

/* ---------- Global search and commands (cmdk) ---------- */
// One box for finding things and running commands. cmdk provides the combobox/listbox semantics, the active option
// (aria-activedescendant), arrow keys, Home/End and Enter. Items with `onRun` are commands; `group` sections the
// results; `recent` shows when the box is focused and empty. Filtering is local (every word must match the label,
// kind, description or keywords; label prefixes rank first) unless `filter={false}`, for results you fetch yourself
// in `onQueryChange` (show `loading` meanwhile).
// Ctrl+K (⌘K on Apple devices) focuses the most recently mounted search; only one listener is ever attached.
const isApple = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
const searchStack: Array<React.RefObject<HTMLInputElement>> = [];
let shortcutBound = false;
function bindSearchShortcut() {
  if (shortcutBound || typeof document === "undefined") return;
  shortcutBound = true;
  document.addEventListener("keydown", (e) => {
    if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "k") return;
    const top = searchStack[searchStack.length - 1]?.current;
    if (top) { e.preventDefault(); top.focus(); top.select(); }
  });
}
const searchHay = (i: SearchItem) => [i.label, i.kind, i.description, ...(i.keywords || [])].filter(Boolean).join(" ").toLowerCase();
function searchRank(i: SearchItem, terms: string[]): number {
  const hay = searchHay(i);
  if (!terms.every((t) => hay.includes(t))) return -1;
  const label = i.label.toLowerCase(), t0 = terms[0] || "";
  return label.startsWith(t0) ? 0 : label.includes(t0) ? 1 : 2;
}
/**
 * cmdk always reports aria-expanded="true", and leaves aria-activedescendant empty for the item it highlights first.
 * Keep both true to what is on screen so screen readers announce the highlighted option. (Shared with Combobox.)
 * Returns a ref callback for the cmdk list: it attaches whenever the list mounts (also inside a portal).
 */
/**
 * Owns cmdk's highlighted item (GlobalSearch, Combobox). cmdk highlights the first result in an effect after each
 * keystroke; when someone types and presses ↓ quickly, that late reset used to pull the highlight back to the first
 * result. Here the automatic "first result" is accepted only until the person moves the highlight (arrows,
 * Home/End, PageUp/PageDown or the pointer); a new query starts over. Pass the keys of the results in order.
 */
const NAV_KEYS = ["ArrowDown", "ArrowUp", "Home", "End", "PageDown", "PageUp"];
export function useCmdkHighlight(keys: string[]) {
  const [value, setValue] = useState("");
  const moved = useRef(false), navigating = useRef(false);
  const valid = keys.includes(value);
  const mark = () => { navigating.current = true; moved.current = true; queueMicrotask(() => { navigating.current = false; }); };
  return {
    value: valid ? value : keys[0] ?? "",
    onValueChange: (v: string) => { if (navigating.current || !moved.current || !valid) setValue(v); },
    onKeyDown: (e: React.KeyboardEvent) => { if (NAV_KEYS.includes(e.key)) mark(); },
    onPointerMoveCapture: () => mark(),
    onQuery: () => { moved.current = false; },
  };
}
export function useCmdkAria(inputRef: React.RefObject<HTMLInputElement>, open: boolean | null) {
  React.useLayoutEffect(() => { if (open !== null) inputRef.current?.setAttribute("aria-expanded", String(open)); });
  const stop = useRef<(() => void) | undefined>(undefined);
  return useCallback((list: HTMLDivElement | null) => {
    stop.current?.(); stop.current = undefined;
    const input = inputRef.current;
    if (!list || !input) return;
    const sync = () => {
      const sel = list.hidden ? null : list.querySelector<HTMLElement>('[cmdk-item][aria-selected="true"]');
      if (sel) { if (input.getAttribute("aria-activedescendant") !== sel.id) input.setAttribute("aria-activedescendant", sel.id); }
      else input.removeAttribute("aria-activedescendant");
    };
    const mo = new MutationObserver(sync);
    mo.observe(list, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-selected", "hidden"] });
    sync();
    stop.current = () => mo.disconnect();
  }, [inputRef]);
}
const itemKey = (i: SearchItem) => i.id ?? (i.kind ? i.kind + ":" : "") + i.label;
export function GlobalSearch({ items = [], onSelect, placeholder = "Search repositories, runs, files", forceQuery, emptyHint, recent, loading, onQueryChange, filter = true, limit = 7, shortcut = true, label = "Search" }: GlobalSearchProps) {
  const [q, setQ] = useState(forceQuery || "");
  const [active, setActive] = useState(!!forceQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!shortcut) return;
    bindSearchShortcut(); searchStack.push(inputRef);
    return () => { const i = searchStack.indexOf(inputRef); if (i >= 0) searchStack.splice(i, 1); };
  }, [shortcut]);
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const results = q
    ? (filter ? items.map((i) => [i, searchRank(i, terms)] as const).filter(([, r]) => r >= 0).sort((a, b) => a[1] - b[1]).map(([i]) => i) : items).slice(0, limit)
    : (recent || []).slice(0, limit);
  const groups: Array<{ name: string; items: SearchItem[] }> = [];
  for (const i of results) {
    const name = q ? i.group || "" : "Recent";
    const g = groups.find((x) => x.name === name); if (g) g.items.push(i); else groups.push({ name, items: [i] });
  }
  const open = active && (q ? true : results.length > 0);
  const listRef = useCmdkAria(inputRef, open);
  const hl = useCmdkHighlight(results.map(itemKey));
  const setQuery = (v: string) => { hl.onQuery(); setQ(v); onQueryChange && onQueryChange(v); };
  const pick = (i: SearchItem) => { i.onRun && i.onRun(); onSelect && onSelect(i); setQuery(""); setActive(false); };
  return (
    <Command className="pw-search" label={label} shouldFilter={false} loop value={hl.value} onValueChange={hl.onValueChange} onPointerMoveCapture={hl.onPointerMoveCapture}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setActive(false); }}
      onKeyDown={(e) => {
        hl.onKeyDown(e);
        if (open) return;
        if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); setActive(true); }
        else if (e.key === "Enter" || e.key === "Home" || e.key === "End") e.preventDefault();
      }}>
      <Icon name="search" />
      <Command.Input ref={inputRef} className="pw-search__in" placeholder={placeholder} value={q}
        onValueChange={(v) => { setQuery(v); setActive(true); }} onFocus={() => setActive(true)}
        onKeyDown={(e) => { if (e.key === "Escape") { if (open) setActive(false); else if (q) setQuery(""); else e.currentTarget.blur(); } }} />
      {shortcut ? <kbd className="pw-kbd" aria-hidden="true">{isApple() ? "⌘K" : "Ctrl K"}</kbd> : null}
      <Command.List ref={listRef} className="pw-pop pw-list pw-search__res" label="Search results" hidden={!open} onMouseDown={(e) => e.preventDefault()}>
        {loading ? <Command.Loading className="pw-list__empty pw-muted">Searching…</Command.Loading> : null}
        {!loading && q ? <Command.Empty className="pw-list__empty pw-muted">No match for “{q}”.{emptyHint ? " " + emptyHint : ""}</Command.Empty> : null}
        {groups.map((g) => {
          const body = g.items.map((i) => (
            <Command.Item key={itemKey(i)} value={itemKey(i)} onSelect={() => pick(i)} className="pw-list__item">
              {i.status ? <StatusDot status={i.status} /> : <span className="pw-list__check">{i.icon ? <Icon name={i.icon} size={14} /> : null}</span>}
              <span className="pw-search__txt">
                <span className={cx(i.onRun ? undefined : "pw-mono")}>{i.label}</span>
                {i.description ? <span className="pw-caption pw-muted">{i.description}</span> : null}
              </span>
              {i.shortcut ? <kbd className="pw-kbd pw-list__meta">{i.shortcut}</kbd> : <span className="pw-muted pw-list__meta">{i.kind}</span>}
            </Command.Item>
          ));
          return g.name ? <Command.Group key={g.name} heading={g.name} className="pw-search__group">{body}</Command.Group> : <Fragment key="">{body}</Fragment>;
        })}
      </Command.List>
    </Command>
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
        {/* Clear comes first so the count stays anchored at the right edge when Clear appears. */}
        {active.length || query ? <button type="button" className="pw-linkbtn" onClick={onClear}>Clear {active.length + (query ? 1 : 0)}</button> : null}
        {count != null ? <span className="pw-caption pw-muted pw-num">{count}</span> : null}
      </span>
    </div>
  );
}

/* ---------- Breadcrumbs ---------- */
// With maxItems, the earlier levels fold into a "…" menu (Radix DropdownMenu) so a deep path never repeats the levels
// above the current scope; the current page always shows.
export function Breadcrumbs({ items = [], onNavigate, maxItems }: BreadcrumbsProps) {
  const fold = maxItems && maxItems >= 2 && items.length > maxItems ? items.length - (maxItems - 1) : 0;
  const hidden = items.slice(0, fold), shown = items.slice(fold);
  const go = (it: BreadcrumbItem) => { if (onNavigate) onNavigate(it); else if (it.href) window.location.href = it.href; };
  const crumb = (it: BreadcrumbItem, last: boolean) => {
    const body = <>{it.icon ? <Icon name={it.icon} size={14} /> : null}<span>{it.label}</span></>;
    return last ? <span aria-current="page" className={cx("pw-crumbs__item", it.mono && "pw-mono")}>{body}</span>
      : <a href={it.href || "#"} className={cx("pw-crumbs__item", it.mono && "pw-mono")} onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate(it); } }}>{body}</a>;
  };
  return (
    <nav aria-label="Breadcrumb" className="pw-crumbs">
      <ol>
        {hidden.length ? (
          <li>
            <DM.Root>
              <DM.Trigger asChild>
                <button type="button" className="pw-crumbs__more" aria-label={`Show ${hidden.length} more level${hidden.length === 1 ? "" : "s"}`}>…</button>
              </DM.Trigger>
              <DM.Portal>
                <DM.Content className="pw-menu" align="start" sideOffset={4} loop>
                  {hidden.map((it, i) => (
                    <DM.Item key={i} className="pw-list__item" onSelect={() => go(it)}>
                      <span className="pw-list__check">{it.icon ? <Icon name={it.icon} size={14} /> : null}</span><span className={cx(it.mono && "pw-mono")}>{it.label}</span>
                    </DM.Item>
                  ))}
                </DM.Content>
              </DM.Portal>
            </DM.Root>
            <span className="pw-crumbs__sep" aria-hidden="true">/</span>
          </li>
        ) : null}
        {shown.map((it, i) => {
          const last = i === shown.length - 1;
          return (
            <li key={fold + i}>
              {crumb(it, last)}
              {!last ? <span className="pw-crumbs__sep" aria-hidden="true">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ---------- Tabs (Radix Tabs) ---------- */
// Arrow keys move and select (wrapping), Home/End jump, disabled tabs are skipped. Selected labels reserve their bold
// width, so switching never moves the tabs after them. Pass the panels as children (<TabPanel value>) to link each tab
// to its panel; without children the tabs only switch the page's content (e.g. in PageHeader) and don't point at it.
export function Tabs({ tabs = [], value, onChange, size, label, children }: TabsProps) {
  const list = (
    <RTabs.List className={cx("pw-tabs", size === "sm" && "pw-tabs--sm")} aria-label={label} loop>
      {tabs.map((t) => (
        <RTabs.Trigger key={t.value} value={t.value} disabled={t.disabled} className={cx("pw-tab", t.value === value && "is-on")} {...(children ? {} : { "aria-controls": undefined })}>
          <Reserve text={t.label} />{t.count != null ? <span className={cx("pw-tab__count", t.tone && "pw-tone--" + t.tone)}>{t.count}</span> : null}
        </RTabs.Trigger>
      ))}
    </RTabs.List>
  );
  return <RTabs.Root value={value} onValueChange={(v) => onChange && onChange(v)} activationMode="automatic" className="pw-tabsroot">{list}{children}</RTabs.Root>;
}
/** The content for one tab; render inside <Tabs>. Focusable, labelled by its tab. */
export function TabPanel({ value, children, className }: { value: string; children?: React.ReactNode; className?: string }) {
  return <RTabs.Content value={value} className={cx("pw-tabpanel", className)}>{children}</RTabs.Content>;
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

const STATE_DEF: Record<Exclude<StateBlockProps["kind"], "loading">, { icon: IconName; title: string }> = {
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
// Toast is the visual: Toaster shows queued toasts in an always-present live region (Radix Toast). A Toast placed by
// hand is announced as a status message.
export function Toast({ tone = "info", title, body, action, onAction, onClose }: ToastProps) {
  return (
    <div className={cx("pw-toast", "pw-toast--" + tone)} role={tone === "critical" ? "alert" : "status"}>
      <Icon name={tone} />
      <div className="pw-toast__txt"><div className="pw-body-strong">{title}</div>{body ? <div className="pw-muted">{body}</div> : null}</div>
      {action ? <button type="button" className="pw-linkbtn" onClick={onAction}>{action}</button> : null}
      {onClose ? <Button size="sm" variant="ghost" icon="x" aria-label="Close" onClick={onClose} /> : null}
    </div>
  );
}
export function ToastRegion({ children }: ToastRegionProps) { return <div className="pw-toasts" role="region" aria-label="Notifications">{children}</div>; }

/* ---------- Drawer & modal (Radix Dialog) ---------- */
// Radix handles the focus trap, Escape, outside click and aria-modal. `contained` renders a non-modal dialog inside the
// nearest positioned ancestor (used by the preview cards and embedded demos): no focus trap, no scroll lock.
// Focus returns to whatever was focused when the dialog opened (there is no Dialog.Trigger to return to).
function useReturnFocus(open: boolean) {
  const prev = useRef<HTMLElement | null>(null);
  if (open && !prev.current && typeof document !== "undefined") prev.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  return (e: Event) => { e.preventDefault(); prev.current?.focus(); prev.current = null; };
}
function Scrim({ contained, light }: { contained?: boolean; light?: boolean }) {
  const cls = cx("pw-scrim", light && "pw-scrim--light");
  return contained ? <div className={cls} /> : <Dialog.Overlay className={cls} />;
}
export function Drawer({ open, title, subtitle, onClose, children, footer, width, contained }: DrawerProps) {
  const onCloseAutoFocus = useReturnFocus(open);
  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }} modal={!contained}>
      {open ? (
        <div className={cx("pw-layer", contained && "is-contained")}>
          <Scrim contained={contained} light />
          <Dialog.Content asChild aria-describedby={undefined} onCloseAutoFocus={onCloseAutoFocus}>
            <aside className="pw-drawer" style={width ? { width } : undefined}>
              <header className="pw-drawer__h"><div><Dialog.Title asChild><div className="pw-heading">{title}</div></Dialog.Title>{subtitle ? <div className="pw-caption pw-muted">{subtitle}</div> : null}</div><Button variant="ghost" icon="x" aria-label="Close" onClick={onClose} /></header>
              <div className="pw-drawer__b">{children}</div>
              {footer ? <footer className="pw-drawer__f">{footer}</footer> : null}
            </aside>
          </Dialog.Content>
        </div>
      ) : null}
    </Dialog.Root>
  );
}
// tone="critical" is an alert dialog: a destructive decision. It is described by its body (read on open), and clicking
// outside doesn't dismiss it; Escape, Close and the actions do.
export function Modal({ open, title, onClose, children, actions, contained, tone }: ModalProps) {
  const onCloseAutoFocus = useReturnFocus(open);
  const alert = tone === "critical";
  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }} modal={!contained}>
      {open ? (
        <div className={cx("pw-layer", "pw-layer--center", contained && "is-contained")}>
          <Scrim contained={contained} />
          <Dialog.Content className="pw-modal" role={alert ? "alertdialog" : "dialog"} {...(alert ? {} : { "aria-describedby": undefined })} onCloseAutoFocus={onCloseAutoFocus}
            onInteractOutside={alert ? (e) => e.preventDefault() : undefined}>
            <header className="pw-modal__h"><Dialog.Title asChild><div className="pw-heading">{title}</div></Dialog.Title><Button variant="ghost" icon="x" aria-label="Close" onClick={onClose} /></header>
            {alert ? <Dialog.Description asChild><div className="pw-modal__b">{children}</div></Dialog.Description> : <div className="pw-modal__b">{children}</div>}
            {actions ? <footer className="pw-modal__f">{actions}</footer> : null}
          </Dialog.Content>
        </div>
      ) : null}
    </Dialog.Root>
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
