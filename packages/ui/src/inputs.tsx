// Richer inputs: RadioGroup (Radix), Combobox (Radix Popover + cmdk), DatePicker and DateRangePicker (Radix Popover +
// react-day-picker), InlineEdit and FileUpload. All share Field's label, hint, error and "Required" wiring.
import * as React from "react";
import * as RRadio from "@radix-ui/react-radio-group";
import * as RPopover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { DayPicker, type DateRange, type Matcher } from "react-day-picker";
import type { RadioGroupProps, ComboboxProps, ComboboxOption, DatePickerProps, DateRangePickerProps, DateRangeValue, DateRangePreset, InlineEditProps, FileUploadProps, UploadItem } from "./types";
import { cx, Button, Tooltip, useCmdkAria, useCmdkHighlight } from "./core";
import { Field, useField } from "./forms";
import { Tag } from "./actions";
import { ProgressBar } from "./display";
import { Icon } from "./icons";
const { useState, useRef, useEffect } = React;

const mergeRefs = <T,>(...refs: Array<React.Ref<T> | undefined>) => (el: T | null) => {
  for (const r of refs) { if (typeof r === "function") r(el); else if (r) (r as React.MutableRefObject<T | null>).current = el; }
};
const Req = () => <span className="pw-formfield__req" aria-hidden="true">Required</span>;
function Notes({ hint, error, hintId, errId }: { hint?: string; error?: string; hintId?: string; errId?: string }) {
  return (
    <>
      {hint ? <div id={hintId} className="pw-formfield__hint">{hint}</div> : null}
      {error ? <div id={errId} className="pw-formfield__error"><Icon name="critical" size={12} /><span>{error}</span></div> : null}
    </>
  );
}

/* ---------- RadioGroup (Radix RadioGroup) ---------- */
// One choice from a few visible options, each with an optional description. Tab enters at the selected option,
// arrows move and select, disabled options are skipped. The group is named by its visible label.
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup({ label, hideLabel, hint, error, required, options, value, defaultValue, onChange, orientation = "vertical", disabled, name, id: idProp }, ref) {
  const f = useField(idProp, hint, error);
  return (
    <div className="pw-formfield">
      <div id={f.id + "-label"} className={cx("pw-formfield__label", hideLabel && "pw-sr")}>{label}{required ? <Req /> : null}</div>
      <RRadio.Root ref={ref} id={f.id} className={cx("pw-radios", "is-" + orientation)} value={value} defaultValue={defaultValue} onValueChange={onChange} orientation={orientation}
        disabled={disabled} required={required} name={name} aria-labelledby={f.id + "-label"} aria-describedby={f.describedBy} aria-invalid={f.invalid} loop>
        {options.map((o) => {
          const opt = typeof o === "string" ? { value: o, label: o } : o;
          const iid = f.id + "-" + opt.value.replace(/[^a-zA-Z0-9_-]/g, "_");
          return (
            <div key={opt.value} className="pw-radio">
              <RRadio.Item id={iid} value={opt.value} disabled={opt.disabled} className="pw-radio__box" aria-describedby={opt.description ? iid + "-d" : undefined}>
                <RRadio.Indicator className="pw-radio__dot" />
              </RRadio.Item>
              <div className="pw-radio__txt">
                <label htmlFor={iid} className="pw-check__label">{opt.label ?? opt.value}</label>
                {opt.description ? <div id={iid + "-d"} className="pw-caption pw-muted">{opt.description}</div> : null}
              </div>
            </div>
          );
        })}
      </RRadio.Root>
      <Notes hint={hint} error={error} hintId={f.hintId} errId={f.errId} />
    </div>
  );
});

/* ---------- Combobox (Radix Popover + cmdk) ---------- */
// Pick one (or several, with `multiple`) from a long or searchable list. The trigger is a combobox button: Enter,
// Space, ↓ or typing opens a popover with a search box and the options (cmdk: arrows, Home/End, Enter). Single picks
// close it; multiple picks stay open and show as removable tags (Backspace on the trigger removes the last).
// Search is local unless filter={false} (fetch in onQueryChange, show `loading`). `creatable` offers "Create “x”".
type Opt = ComboboxOption & { label: string };
const toOpt = (o: string | ComboboxOption): Opt => (typeof o === "string" ? { value: o, label: o } : { ...o, label: o.label ?? o.value });
const toArr = (v: string | string[] | null | undefined): string[] => (v == null ? [] : Array.isArray(v) ? v : [v]);
const rankOpt = (o: Opt, terms: string[]) => {
  const hay = [o.label, o.meta, o.description, ...(o.keywords || [])].filter(Boolean).join(" ").toLowerCase();
  if (!terms.every((t) => hay.includes(t))) return -1;
  return o.label.toLowerCase().startsWith(terms[0] || "") ? 0 : 1;
};
export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(function Combobox(props, ref) {
  const { label, hideLabel, hint, error, required, id, options, searchPlaceholder = "Search…", emptyText = "No matches.", loading, onQueryChange, filter = true, clearable = true, creatable, onCreate, disabled, name, className } = props;
  const multiple = props.multiple === true;
  const placeholder = props.placeholder ?? (multiple ? "Add…" : "Select…");
  const [inner, setInner] = useState<string[]>(() => toArr(props.defaultValue));
  const values = props.value !== undefined ? toArr(props.value) : inner;
  const emit = (next: string[]) => {
    setInner(next);
    if (props.multiple === true) props.onChange && props.onChange(next);
    else props.onChange && props.onChange(next[0] ?? null);
  };
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useCmdkAria(inputRef, null);
  const opts = options.map(toOpt);
  const labelOf = (v: string) => opts.find((o) => o.value === v)?.label ?? v;
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = q && filter ? opts.map((o) => [o, rankOpt(o, terms)] as const).filter(([, r]) => r >= 0).sort((a, b) => a[1] - b[1]).map(([o]) => o) : opts;
  const canCreate = !!creatable && !!q.trim() && !opts.some((o) => o.label.toLowerCase() === q.trim().toLowerCase());
  const hl = useCmdkHighlight([...shown.map((o) => o.value), ...(canCreate ? ["\u0000create"] : [])]);
  const setQuery = (v: string) => { hl.onQuery(); setQ(v); onQueryChange && onQueryChange(v); };
  const pick = (v: string) => {
    if (multiple) emit(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
    else { emit([v]); setOpen(false); }
    setQuery("");
  };
  const remove = (v: string) => { emit(values.filter((x) => x !== v)); triggerRef.current?.focus(); };
  const shownText = multiple ? placeholder : values.length ? labelOf(values[0]!) : placeholder;
  return (
    <Field label={label} hideLabel={hideLabel} hint={hint} error={error} required={required} id={id} className={className}>
      {(p) => (
        <div className={cx("pw-combo", multiple && "pw-combo--multi", disabled && "is-disabled")} data-invalid={p["aria-invalid"] || undefined}>
          {multiple && values.length ? (
            <ul className="pw-combo__tags" aria-label={"Selected " + label.toLowerCase()}>
              {values.map((v) => <li key={v}><Tag onRemove={disabled ? undefined : () => remove(v)} removeLabel={"Remove " + labelOf(v)}>{labelOf(v)}</Tag></li>)}
            </ul>
          ) : null}
          <RPopover.Root open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(""); }}>
            <RPopover.Trigger asChild disabled={disabled}>
              <button ref={mergeRefs(ref, triggerRef)} {...p} type="button" role="combobox" aria-expanded={open} aria-haspopup="listbox"
                className={cx("pw-field pw-select pw-combo__trigger", multiple && "pw-field--quiet")}
                onKeyDown={(e) => {
                  if (multiple && e.key === "Backspace" && values.length) { e.preventDefault(); emit(values.slice(0, -1)); return; }
                  if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); return; }
                  if (e.key.length === 1 && e.key !== " " && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); setQuery(e.key); setOpen(true); }
                }}>
                <span className={cx("pw-field__val", (multiple || !values.length) && "is-placeholder")}>{shownText}</span>
                <span className="pw-select__icon"><Icon name={multiple ? "plus" : "chevron-down"} size={14} /></span>
              </button>
            </RPopover.Trigger>
            <RPopover.Portal>
              <RPopover.Content className="pw-popover pw-combo__pop" align="start" sideOffset={4} collisionPadding={8} aria-label={label}
                onOpenAutoFocus={(e) => { e.preventDefault(); inputRef.current?.focus(); }}>
                <Command shouldFilter={false} loop label={"Search " + label.toLowerCase()} value={hl.value} onValueChange={hl.onValueChange} onKeyDown={hl.onKeyDown} onPointerMoveCapture={hl.onPointerMoveCapture}>
                  <div className="pw-combo__search"><Icon name="search" size={14} />
                    <Command.Input ref={inputRef} className="pw-combo__in" placeholder={searchPlaceholder} value={q} onValueChange={setQuery} />
                  </div>
                  <Command.List ref={listRef} className="pw-list pw-combo__list" label={label + " options"}>
                    {loading ? <Command.Loading className="pw-list__empty pw-muted">Loading…</Command.Loading> : null}
                    {!loading && !shown.length && !canCreate ? <Command.Empty className="pw-list__empty pw-muted">{emptyText}</Command.Empty> : null}
                    {!loading ? shown.map((o) => {
                      const sel = values.includes(o.value);
                      return (
                        <Command.Item key={o.value} value={o.value} disabled={o.disabled} onSelect={() => pick(o.value)} className={cx("pw-list__item", sel && "is-selected")} aria-checked={sel}>
                          <span className="pw-list__check">{sel ? <Icon name="check" size={14} /> : null}</span>
                          <span className="pw-search__txt"><span>{o.label}</span>{o.description ? <span className="pw-caption pw-muted">{o.description}</span> : null}</span>
                          {o.meta ? <span className="pw-muted pw-list__meta">{o.meta}</span> : null}
                        </Command.Item>
                      );
                    }) : null}
                    {canCreate && !loading ? (
                      <Command.Item value={"\u0000create"} onSelect={() => { const v = q.trim(); onCreate && onCreate(v); pick(v); }} className="pw-list__item">
                        <span className="pw-list__check"><Icon name="plus" size={14} /></span><span>Create “{q.trim()}”</span>
                      </Command.Item>
                    ) : null}
                  </Command.List>
                </Command>
              </RPopover.Content>
            </RPopover.Portal>
          </RPopover.Root>
          {!multiple && clearable && values.length && !disabled ? <Button size="sm" variant="ghost" icon="x" className="pw-combo__clear" aria-label={"Clear " + label.toLowerCase()} onClick={() => { emit([]); triggerRef.current?.focus(); }} /> : null}
          {name ? values.map((v) => <input key={v} type="hidden" name={name} value={v} />) : null}
        </div>
      )}
    </Field>
  );
});

/* ---------- Dates: shared calendar ---------- */
// Dates are "YYYY-MM-DD" strings in the user's local calendar (no time zone shifts). react-day-picker draws the
// month grid with full keyboard support: arrows move by day and week, PageUp/PageDown by month (Shift: year),
// Home/End to the week's ends. Month and year menus jump further.
const pad = (n: number) => String(n).padStart(2, "0");
export const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export function parseISODate(s: string | null | undefined): Date | null {
  const m = s ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim()) : null;
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return toISODate(d) === s!.trim() ? d : null;
}
const weekStart = (): 0 | 1 | 6 => {
  try {
    const loc = new Intl.Locale(typeof navigator !== "undefined" ? navigator.language : "en-US") as Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };
    const first = (loc.getWeekInfo ? loc.getWeekInfo() : loc.weekInfo)?.firstDay ?? 7;
    return (first % 7) as 0 | 1 | 6;
  } catch { return 0; }
};
const CAL_CLASSES = {
  root: "pw-cal", months: "pw-cal__months", month: "pw-cal__month", month_caption: "pw-cal__caption", caption_label: "pw-cal__title",
  nav: "pw-cal__nav", button_previous: "pw-cal__navbtn", button_next: "pw-cal__navbtn", chevron: "pw-cal__chev", month_grid: "pw-cal__grid",
  weekdays: "pw-cal__weekdays", weekday: "pw-cal__weekday", weeks: "pw-cal__weeks", week: "pw-cal__week", day: "pw-cal__day", day_button: "pw-cal__btn",
  selected: "is-selected", today: "is-today", outside: "is-outside", disabled: "is-disabled", hidden: "is-hidden", focused: "is-focused",
  range_start: "is-start", range_middle: "is-middle", range_end: "is-end", dropdowns: "pw-cal__dropdowns", dropdown_root: "pw-cal__ddroot",
  dropdown: "pw-cal__dd", months_dropdown: "pw-cal__ddm", years_dropdown: "pw-cal__ddy", footer: "pw-cal__footer",
};
// Day names that contain the visible number ("Sunday, November 1, 2026"), plus today / selected / unavailable.
// react-day-picker's default ("Sunday, November 1st, 2026") doesn't include "1" as a word (WCAG 2.5.3).
const dayFmt = () => new Intl.DateTimeFormat(typeof navigator !== "undefined" ? navigator.language : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
const CAL_LABELS = {
  labelDayButton: (date: Date, m: { today?: boolean; selected?: boolean; disabled?: boolean; range_start?: boolean; range_end?: boolean }) =>
    dayFmt().format(date) + (m.today ? ", today" : "") + (m.range_start ? ", start" : m.range_end ? ", end" : m.selected ? ", selected" : "") + (m.disabled ? ", unavailable" : ""),
};
const Chevron = ({ orientation }: { orientation?: "up" | "down" | "left" | "right" }) => <Icon name={orientation === "left" ? "chevron-left" : orientation === "right" ? "chevron-right" : orientation === "up" ? "chevron-up" : "chevron-down"} size={14} />;
function dateMatchers(min?: string, max?: string, isDisabled?: (iso: string) => boolean): Matcher[] {
  const m: Matcher[] = [];
  const lo = parseISODate(min), hi = parseISODate(max);
  if (lo) m.push({ before: lo }); if (hi) m.push({ after: hi });
  if (isDisabled) m.push((d: Date) => isDisabled(toISODate(d)));
  return m;
}
const calBounds = (min?: string, max?: string) => {
  const now = new Date();
  return { startMonth: parseISODate(min) ?? new Date(now.getFullYear() - 10, 0, 1), endMonth: parseISODate(max) ?? new Date(now.getFullYear() + 5, 11, 31) };
};
function useNarrow() {
  const q = "(max-width: 640px)";
  const [n, setN] = useState(() => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(q).matches);
  useEffect(() => { if (!window.matchMedia) return; const m = window.matchMedia(q); const f = () => setN(m.matches); m.addEventListener("change", f); return () => m.removeEventListener("change", f); }, []);
  return n;
}

/* ---------- DatePicker ---------- */
// A typed field (YYYY-MM-DD) with a calendar button. Typing is checked on blur or Enter: format, range and disabled
// dates each get a specific message. The calendar opens on the chosen date (or today) with focus on it.
export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker({ label, hideLabel, hint, error, required, id, value, defaultValue = null, onChange, min, max, isDateDisabled, clearable = true, disabled, name, placeholder = "YYYY-MM-DD" }, ref) {
  const [inner, setInner] = useState<string | null>(defaultValue);
  const cur = value !== undefined ? value : inner;
  const [text, setText] = useState(cur ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setText(cur ?? ""); }, [cur]);
  const set = (v: string | null) => { setInner(v); setErr(null); onChange && onChange(v); };
  const check = (iso: string): string | null => {
    if (!parseISODate(iso)) return "Use the format YYYY-MM-DD.";
    if (min && iso < min) return `Choose ${min} or later.`;
    if (max && iso > max) return `Choose ${max} or earlier.`;
    if (isDateDisabled && isDateDisabled(iso)) return "That date isn’t available.";
    return null;
  };
  const commit = () => {
    const t = text.trim();
    if (!t) { if (cur !== null) set(null); else setErr(null); return; }
    const e = check(t); if (e) { setErr(e); return; }
    if (t !== cur) set(t); else setErr(null);
  };
  const sel = parseISODate(cur);
  return (
    <Field label={label} hideLabel={hideLabel} hint={hint} error={error ?? err ?? undefined} required={required} id={id}>
      {(p) => (
        <div className="pw-datefield">
          <input ref={mergeRefs(ref, inputRef)} {...p} name={name} className="pw-input pw-num" value={text} placeholder={placeholder} disabled={disabled} inputMode="numeric" autoComplete="off"
            onChange={(e) => setText(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }} />
          {clearable && cur && !disabled ? <Button size="sm" variant="ghost" icon="x" aria-label={"Clear " + label.toLowerCase()} onClick={() => { set(null); inputRef.current?.focus(); }} /> : null}
          <RPopover.Root open={open} onOpenChange={setOpen}>
            <RPopover.Trigger asChild disabled={disabled}><Button size="sm" variant="ghost" icon="calendar" aria-label={"Choose " + label.toLowerCase() + " on a calendar"} /></RPopover.Trigger>
            <RPopover.Portal>
              <RPopover.Content className="pw-popover pw-cal-pop" align="end" sideOffset={6} collisionPadding={8} aria-label={label + ": calendar"}>
                <DayPicker mode="single" selected={sel ?? undefined} defaultMonth={sel ?? undefined} autoFocus weekStartsOn={weekStart()} captionLayout="dropdown" {...calBounds(min, max)}
                  disabled={dateMatchers(min, max, isDateDisabled)} classNames={CAL_CLASSES} components={{ Chevron }} labels={CAL_LABELS}
                  onSelect={(d) => { if (d) { set(toISODate(d)); setOpen(false); inputRef.current?.focus(); } }} />
              </RPopover.Content>
            </RPopover.Portal>
          </RPopover.Root>
        </div>
      )}
    </Field>
  );
});

/* ---------- DateRangePicker ---------- */
// Start and end dates on a two-month calendar (one month on phones), with presets. Picking happens in a draft:
// Apply commits, Esc or Cancel discards. `maxDays` limits the length of a range.
const today0 = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const DEFAULT_RANGE_PRESETS: DateRangePreset[] = [
  { label: "Last 7 days", range: () => ({ from: toISODate(addDays(today0(), -6)), to: toISODate(today0()) }) },
  { label: "Last 30 days", range: () => ({ from: toISODate(addDays(today0(), -29)), to: toISODate(today0()) }) },
  { label: "This month", range: () => { const t = today0(); return { from: toISODate(new Date(t.getFullYear(), t.getMonth(), 1)), to: toISODate(t) }; } },
  { label: "Last month", range: () => { const t = today0(); return { from: toISODate(new Date(t.getFullYear(), t.getMonth() - 1, 1)), to: toISODate(new Date(t.getFullYear(), t.getMonth(), 0)) }; } },
];
const days = (a: string, b: string) => Math.round((parseISODate(b)!.getTime() - parseISODate(a)!.getTime()) / 864e5) + 1;
export const DateRangePicker = React.forwardRef<HTMLButtonElement, DateRangePickerProps>(function DateRangePicker({ label, hideLabel, hint, error, required, id, value, defaultValue = null, onChange, min, max, maxDays, isDateDisabled, presets = DEFAULT_RANGE_PRESETS, placeholder = "Choose dates", disabled, forceOpen }, ref) {
  const [inner, setInner] = useState<DateRangeValue | null>(defaultValue);
  const cur = value !== undefined ? value : inner;
  const [open, setOpen] = useState(false);
  const isOpen = forceOpen || open;
  const [draft, setDraft] = useState<DateRangeValue | null>(cur);
  const narrow = useNarrow();
  const commit = (r: DateRangeValue | null) => { setInner(r); onChange && onChange(r); };
  const from = parseISODate(draft?.from), to = parseISODate(draft?.to);
  const tooLong = !!(maxDays && draft?.from && draft?.to && days(draft.from, draft.to) > maxDays);
  const outOfBounds = (r: { from: string; to: string }) => (min && r.from < min) || (max && r.to > max);
  const status = tooLong ? `Choose ${maxDays} days or fewer.` : draft?.from && draft?.to ? `${draft.from} to ${draft.to}, ${days(draft.from, draft.to)} days` : draft?.from ? `From ${draft.from}: choose an end date.` : "Choose a start date.";
  const shown = cur?.from && cur?.to ? `${cur.from} – ${cur.to}` : placeholder;
  return (
    <Field label={label} hideLabel={hideLabel} hint={hint} error={error} required={required} id={id}>
      {(p) => (
        <RPopover.Root open={isOpen} onOpenChange={(o) => { setOpen(o); if (o) setDraft(cur); }}>
          <RPopover.Trigger asChild disabled={disabled}>
            <button ref={ref} {...p} type="button" aria-haspopup="dialog" className={cx("pw-field pw-select pw-daterange")}>
              <Icon name="calendar" />
              <span className={cx("pw-field__val pw-num", !cur?.from && "is-placeholder")}>{shown}</span>
              <span className="pw-select__icon"><Icon name="chevron-down" size={14} /></span>
            </button>
          </RPopover.Trigger>
          <RPopover.Portal>
            <RPopover.Content className="pw-popover pw-cal-pop pw-range-pop" align="start" sideOffset={6} collisionPadding={8} aria-label={label}>
              <div className="pw-range">
                {presets && presets.length ? (
                  <div className="pw-range__presets" role="group" aria-label="Presets">
                    {presets.map((pr) => {
                      const r = pr.range(); const bad = !!outOfBounds(r);
                      return <RPopover.Close key={pr.label} asChild><button type="button" className="pw-list__item" disabled={bad} onClick={() => commit(r)}>{pr.label}</button></RPopover.Close>;
                    })}
                  </div>
                ) : null}
                <div className="pw-range__main">
                  <DayPicker mode="range" selected={from ? ({ from, to: to ?? undefined } as DateRange) : undefined} defaultMonth={from ?? (narrow ? today0() : addDays(today0(), -28))}
                    numberOfMonths={narrow ? 1 : 2} autoFocus weekStartsOn={weekStart()} {...calBounds(min, max)} disabled={dateMatchers(min, max, isDateDisabled)} classNames={CAL_CLASSES} components={{ Chevron }} labels={CAL_LABELS}
                    onSelect={(r) => setDraft(r?.from ? { from: toISODate(r.from), to: r.to ? toISODate(r.to) : null } : null)} />
                  <div className="pw-range__foot">
                    <span className={cx("pw-caption pw-num", tooLong ? "pw-tone--critical" : "pw-muted")} role="status">{status}</span>
                    <RPopover.Close asChild><Button size="sm" variant="ghost">Cancel</Button></RPopover.Close>
                    <RPopover.Close asChild><Button size="sm" variant="primary" disabled={!draft?.from || !draft?.to || tooLong} onClick={() => draft && commit(draft)}>Apply</Button></RPopover.Close>
                  </div>
                </div>
              </div>
            </RPopover.Content>
          </RPopover.Portal>
        </RPopover.Root>
      )}
    </Field>
  );
});

/* ---------- InlineEdit ---------- */
// A value that edits in place: a details field, a repository description. Click or Enter on it to edit; Enter (in a
// textarea: Ctrl/⌘+Enter) or Save commits, Esc or Cancel restores. `onSave` may return a promise: the field shows
// "Saving…" (the field stays focused, read-only) and stays open with the error if it rejects. Focus returns to the
// value afterwards.
export function InlineEdit({ value, onSave, label, placeholder, emptyText = "Not set", validate, multiline, mono, disabled, hideLabel = true }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const viewRef = useRef<HTMLButtonElement>(null);
  const fieldRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const back = useRef(false);
  useEffect(() => { if (editing) { fieldRef.current?.focus(); fieldRef.current?.select(); } else if (back.current) { back.current = false; viewRef.current?.focus(); } }, [editing]);
  const start = () => { if (disabled) return; setDraft(value); setErr(null); setEditing(true); };
  const cancel = () => { back.current = true; setEditing(false); setErr(null); };
  const save = async () => {
    const v = multiline ? draft : draft.trim();
    const e = validate ? validate(v) : null;
    if (e) { setErr(e); fieldRef.current?.focus(); return; }
    if (v === value) { cancel(); return; }
    setSaving(true);
    try { await onSave(v); back.current = true; setEditing(false); setErr(null); }
    catch (x) { setErr(x instanceof Error && x.message ? x.message : "Couldn’t save. Try again."); fieldRef.current?.focus(); }
    finally { setSaving(false); }
  };
  if (!editing) {
    return (
      <button ref={viewRef} type="button" className={cx("pw-inline", !value && "is-empty", mono && "pw-mono")} onClick={start} disabled={disabled}>
        <span className="pw-sr">{label}: </span>
        <span className="pw-inline__val">{value || emptyText}</span>
        {!disabled ? <Icon name="edit" size={14} className="pw-inline__icon" /> : null}
        <span className="pw-sr">, edit</span>
      </button>
    );
  }
  return (
    <div className="pw-inline__edit">
      <Field label={label} hideLabel={hideLabel} error={err ?? undefined}>
        {(p) => multiline
          ? <textarea ref={fieldRef} {...p} className={cx("pw-input pw-textarea", mono && "pw-mono")} rows={3} value={draft} placeholder={placeholder} readOnly={saving} aria-busy={saving || undefined} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); cancel(); } if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void save(); } }} />
          : <input ref={fieldRef} {...p} className={cx("pw-input", mono && "pw-mono")} value={draft} placeholder={placeholder} readOnly={saving} aria-busy={saving || undefined} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); cancel(); } if (e.key === "Enter") { e.preventDefault(); void save(); } }} />}
      </Field>
      <div className="pw-inline__acts">
        <Button size="sm" variant="primary" loading={saving} onClick={() => void save()}>{saving ? "Saving…" : "Save"}</Button>
        <Button size="sm" variant="ghost" disabled={saving} onClick={cancel}>Cancel</Button>
      </div>
    </div>
  );
}

/* ---------- FileUpload ---------- */
// A drop zone with a "Choose files" button (the keyboard path), checks for type, size and count, and a list of files
// with progress, errors, Retry and Remove. You own the upload: onFiles receives accepted files; pass back `files`
// with their status and progress. Rejected files are listed with the reason until dismissed. A polite live region
// announces what happened ("2 files added", "sbom.json: larger than 5 MB").
const fmtSize = (n: number) => {
  const u = ["B", "KB", "MB", "GB"]; let i = 0, v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: i ? 1 : 0 }).format(v) + " " + u[i];
};
const accepts = (f: File, accept?: string) => {
  if (!accept) return true;
  const name = f.name.toLowerCase(), type = (f.type || "").toLowerCase();
  return accept.split(",").map((a) => a.trim().toLowerCase()).filter(Boolean).some((a) => a.startsWith(".") ? name.endsWith(a) : a.endsWith("/*") ? type.startsWith(a.slice(0, -1)) : type === a);
};
export function FileUpload({ label, hint, error, required, accept, maxSize, multiple = true, maxFiles, files = [], onFiles, onRemove, onRetry, disabled, id: idProp, variant = "dropzone" }: FileUploadProps) {
  const f = useField(idProp, hint, error);
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [rejected, setRejected] = useState<UploadItem[]>([]);
  const [said, setSaid] = useState("");
  const take = (list: FileList | File[]) => {
    const arr = Array.from(list), ok: File[] = [], bad: UploadItem[] = [];
    const room = maxFiles ? Math.max(0, maxFiles - files.length) : Infinity;
    for (const file of multiple ? arr : arr.slice(0, 1)) {
      const reason = !accepts(file, accept) ? `Not an accepted type (${accept}).` : maxSize && file.size > maxSize ? `Larger than ${fmtSize(maxSize)}.` : ok.length >= room ? `Only ${maxFiles} file${maxFiles === 1 ? "" : "s"} allowed.` : null;
      if (reason) bad.push({ id: "rej-" + file.name + "-" + Date.now() + "-" + bad.length, name: file.name, size: file.size, status: "error", error: reason }); else ok.push(file);
    }
    if (ok.length && onFiles) onFiles(ok);
    setRejected((r) => [...r, ...bad]);
    setSaid([ok.length ? `${ok.length} file${ok.length === 1 ? "" : "s"} added.` : "", ...bad.map((b) => `${b.name}: ${b.error}`)].filter(Boolean).join(" "));
  };
  const all = [...files, ...rejected];
  const picker = <input ref={inputRef} id={f.id} type="file" className="pw-sr" tabIndex={-1} aria-hidden="true" accept={accept} multiple={multiple} disabled={disabled}
    onChange={(e) => { if (e.target.files) take(e.target.files); e.target.value = ""; }} />;
  const button = variant === "button";
  return (
    <div className={cx("pw-formfield", button && "pw-upload--button")}>
      <div id={f.id + "-label"} className={button ? "pw-sr" : "pw-formfield__label"}>{label}{required ? <Req /> : null}</div>
      {button ? (
        <span className="pw-upload__btn">
          <Tooltip content={label}><Button variant="ghost" size="sm" icon="attach" aria-label={label} aria-describedby={f.describedBy} disabled={disabled} onClick={() => inputRef.current?.click()} /></Tooltip>
          {picker}
        </span>
      ) : <div className={cx("pw-drop", over && "is-over", disabled && "is-disabled", f.invalid && "is-error")} role="group" aria-labelledby={f.id + "-label"} aria-describedby={f.describedBy} aria-disabled={disabled || undefined}
        onDragOver={(e) => { if (disabled) return; e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); if (!disabled) take(e.dataTransfer.files); }}>
        <Icon name="upload" size={20} className="pw-drop__icon" />
        <span className="pw-drop__txt">Drag {multiple ? "files" : "a file"} here or</span>
        <Button size="sm" icon="file" disabled={disabled} onClick={() => inputRef.current?.click()}>Choose {multiple ? "files" : "a file"}</Button>
        {picker}
      </div>}
      <Notes hint={hint} error={error} hintId={f.hintId} errId={f.errId} />
      {all.length ? (
        <ul className="pw-files" aria-label={label + ": files"}>
          {all.map((it) => {
            const isRejected = rejected.includes(it);
            return (
              <li key={it.id} className={cx("pw-file", "is-" + it.status)}>
                <Icon name={it.status === "error" ? "critical" : it.status === "done" ? "healthy" : "file"} size={16} className="pw-file__icon" />
                <div className="pw-file__main">
                  <div className="pw-file__row"><span className="pw-mono pw-file__name">{it.name}</span><span className="pw-caption pw-muted pw-num">{fmtSize(it.size)}</span></div>
                  {it.status === "uploading" ? <ProgressBar label={"Uploading " + it.name} hideLabel value={it.progress ?? null} showValue={false} />
                    : it.status === "error" ? <span className="pw-caption pw-tone--critical">{it.error || "Upload failed."}</span>
                    : it.status === "queued" ? <span className="pw-caption pw-muted">Waiting…</span>
                    : <span className="pw-caption pw-muted">Uploaded</span>}
                </div>
                {it.status === "uploading" ? <span className="pw-caption pw-num pw-muted">{it.progress != null ? Math.round(it.progress) + " %" : ""}</span> : null}
                {it.status === "error" && !isRejected && onRetry ? <Button size="sm" variant="ghost" onClick={() => onRetry(it.id)}>Retry</Button> : null}
                <Button size="sm" variant="ghost" icon="x" aria-label={(isRejected ? "Dismiss " : "Remove ") + it.name}
                  onClick={() => (isRejected ? setRejected((r) => r.filter((x) => x !== it)) : onRemove && onRemove(it.id))} />
              </li>
            );
          })}
        </ul>
      ) : null}
      <span className="pw-sr" role="status">{said}</span>
    </div>
  );
}
