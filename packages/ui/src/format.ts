// Locale-driven formatting for Pairwise. Defaults come from the browser (navigator.language and the
// resolved Intl time zone). Wrap the app in <PairwiseProvider locale timeZone currency> to override.
//
// Opt-in options (never defaults):
//   - Indian digit grouping (12,34,567): pass { grouping: "indian" } or use locale "en-IN".
//   - A fixed FX rate with its date: pass { fx: { rate, currency, asOf, source } } to formatMoney; the
//     output then states the rate and date, e.g. "€1,220 (at 0.92, 28 Oct 2026)".
import * as React from "react";

export interface FormatSettings {
  locale?: string;
  timeZone?: string;
  currency?: string;
}

export interface FxRate {
  rate: number;
  currency: string;
  asOf: Date | string;
  source?: string;
}

const browserLocale = (): string =>
  (typeof navigator !== "undefined" && navigator.language) || "en";
const browserTimeZone = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

const FormatContext = React.createContext<Required<FormatSettings> | null>(null);

export function PairwiseProvider(props: FormatSettings & { children?: React.ReactNode }) {
  const value = React.useMemo(
    () => ({
      locale: props.locale ?? browserLocale(),
      timeZone: props.timeZone ?? browserTimeZone(),
      currency: props.currency ?? "USD",
    }),
    [props.locale, props.timeZone, props.currency],
  );
  return React.createElement(FormatContext.Provider, { value }, props.children);
}

export function useFormat() {
  const ctx = React.useContext(FormatContext);
  const s = ctx ?? { locale: browserLocale(), timeZone: browserTimeZone(), currency: "USD" };
  return React.useMemo(() => createFormatter(s), [s.locale, s.timeZone, s.currency]);
}

export function createFormatter(s: Required<FormatSettings>) {
  const { locale, timeZone, currency } = s;
  const withGrouping = (grouping?: "indian") => (grouping === "indian" ? "en-IN" : locale);

  return {
    settings: s,
    /** Short zone label for headers like "Absolute (CET)". */
    timeZoneLabel(at: Date = new Date()): string {
      const part = new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: "short" })
        .formatToParts(at)
        .find((p) => p.type === "timeZoneName");
      return part?.value ?? timeZone;
    },
    /** HH:mm:ss, for traces. */
    time(d: Date, opts: { seconds?: boolean; zone?: boolean } = {}): string {
      return new Intl.DateTimeFormat(locale, {
        timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
        ...(opts.seconds !== false ? { second: "2-digit" } : {}),
        ...(opts.zone ? { timeZoneName: "short" } : {}),
      }).format(d);
    },
    /** DD Mon HH:mm, for feeds. */
    dateTime(d: Date, opts: { zone?: boolean } = {}): string {
      return new Intl.DateTimeFormat(locale, {
        timeZone, day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
        ...(opts.zone ? { timeZoneName: "short" } : {}),
      }).format(d);
    },
    date(d: Date): string {
      return new Intl.DateTimeFormat(locale, { timeZone, day: "numeric", month: "short", year: "numeric" }).format(d);
    },
    number(v: number, opts: { decimals?: number; grouping?: "indian" } = {}): string {
      const d = opts.decimals;
      return new Intl.NumberFormat(withGrouping(opts.grouping), {
        ...(d !== undefined ? { minimumFractionDigits: d, maximumFractionDigits: d } : {}),
      }).format(v);
    },
    /** Money in the account currency, or converted with an explicit, dated FX rate. */
    money(v: number, opts: { decimals?: number; grouping?: "indian"; fx?: FxRate } = {}): string {
      const cur = opts.fx ? opts.fx.currency : currency;
      const amount = opts.fx ? v * opts.fx.rate : v;
      const d = opts.decimals ?? 0;
      const out = new Intl.NumberFormat(withGrouping(opts.grouping), {
        style: "currency", currency: cur, minimumFractionDigits: d, maximumFractionDigits: d,
      }).format(amount);
      if (!opts.fx) return out;
      const asOf = typeof opts.fx.asOf === "string" ? new Date(opts.fx.asOf) : opts.fx.asOf;
      return `${out} (at ${opts.fx.rate}, ${new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(asOf)})`;
    },
    /** 2.4 s, 340 ms, 1 min 12 s */
    duration(ms: number): string {
      if (ms < 1000) return `${Math.round(ms)} ms`;
      const s = ms / 1000;
      if (s < 60) return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(s)} s`;
      const m = Math.floor(s / 60), r = Math.round(s % 60);
      return r ? `${m} min ${r} s` : `${m} min`;
    },
  };
}

export type Formatter = ReturnType<typeof createFormatter>;
