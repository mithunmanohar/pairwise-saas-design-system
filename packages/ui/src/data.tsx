import type { Column, DataTableProps, SortValue, TimeSeriesChartProps, BarChartProps, RunStripProps, HeatmapProps, StatusGridProps, BulletBarProps, TimelineProps, TimelineEvent, LegendProps, ViewState, Status } from "./types";
import { Icon } from "./icons";
import { cx, StateBlock, StatusBadge, Button, Skeleton } from "./core";
import * as React from "react";
import { Fragment } from "react";
const { useState, useRef, useEffect, useMemo } = React;

function useWidth(initial = 0): [React.RefObject<HTMLDivElement>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(el.clientWidth || initial);
    const ro = new ResizeObserver((e) => { const r = e[0]; if (r) setW(Math.max(120, Math.floor(r.contentRect.width))); });
    ro.observe(el); return () => ro.disconnect();
  }, []);
  return [ref, w];
}
const tk = (v: number) => v.toLocaleString("en", { maximumFractionDigits: 2 });
const fmt = (v: number | null | undefined, d = 0) => (v == null || isNaN(v) ? "–" : v.toLocaleString("en", { maximumFractionDigits: d, minimumFractionDigits: d }));

/* ---------- DataTable ---------- */
// Rows are plain objects; columns read `row[column.key]` unless they supply render / sortValue.
const field = (r: object, k: string): unknown => (r as Record<string, unknown>)[k];
const asNode = (v: unknown): React.ReactNode =>
  v == null || typeof v === "boolean" ? null : typeof v === "string" || typeof v === "number" || React.isValidElement(v) ? v : String(v);
// Same ordering as the relational operators for strings, numbers and dates; mixed or missing values compare equal.
const compare = (x: SortValue, y: SortValue): number => {
  const a = x instanceof Date ? x.getTime() : x, b = y instanceof Date ? y.getTime() : y;
  if (typeof a === "string" && typeof b === "string") return a > b ? 1 : a < b ? -1 : 0;
  const na = typeof a === "boolean" ? +a : a, nb = typeof b === "boolean" ? +b : b;
  if (typeof na === "number" && typeof nb === "number") return na > nb ? 1 : na < nb ? -1 : 0;
  return 0;
};
type Sort = { key: string; dir: "asc" | "desc" };
export function DataTable<T extends object>({ columns, rows, rowKey = "id", defaultSort, renderExpanded, pageSize = 0, onRowClick, rowTone, state = "ready", emptyTitle, emptyBody, errorDetail, onRetry, caption, density, selectedKey, stickyHeader }: DataTableProps<T>) {
  const [sort, setSort] = useState<Sort | null>(defaultSort || null);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(0);
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key); if (!col) return rows;
    const get = col.sortValue || ((r: T) => field(r, col.key) as SortValue);
    return [...rows].sort((a, b) => compare(get(a), get(b)) * (sort.dir === "asc" ? 1 : -1));
  }, [rows, sort]);
  const pages = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const view = pageSize ? sorted.slice(page * pageSize, page * pageSize + pageSize) : sorted;
  const ncol = columns.length + (renderExpanded ? 1 : 0);
  const toggleSort = (c: Column<T>) => { if (!c.sortable) return; setSort(!sort || sort.key !== c.key ? { key: c.key, dir: c.defaultDir || "desc" } : { key: c.key, dir: sort.dir === "asc" ? "desc" : "asc" }); };
  return (
    <div className={cx("pw-table-wrap", density && "is-" + density)}>
      <table className={cx("pw-table", stickyHeader && "is-sticky")}>
        {caption ? <caption className="pw-sr">{caption}</caption> : null}
        <thead>
          <tr>
            {renderExpanded ? <th className="pw-table__x" aria-label="Expand" /> : null}
            {columns.map((c) => {
              const s = sort && sort.key === c.key ? sort.dir : null;
              return (
                <th key={c.key} scope="col" style={{ width: c.width, textAlign: c.align }} aria-sort={s ? (s === "asc" ? "ascending" : "descending") : undefined}>
                  {c.sortable ? <button type="button" className={cx("pw-th-sort", s && "is-on")} onClick={() => toggleSort(c)}>{c.header}<Icon name={s === "asc" ? "arrow-up" : s === "desc" ? "arrow-down" : "sort"} size={12} /></button> : c.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {state === "loading" ? Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="is-skel">{renderExpanded ? <td /> : null}{columns.map((c, j) => <td key={j}><Skeleton w={j === 0 ? "70%" : "45%"} /></td>)}</tr>
          )) : state === "error" ? (
            <tr><td colSpan={ncol} className="pw-table__state"><StateBlock kind="error" inline title="Couldn’t load rows" body="The data source didn’t respond. Other panels on this page are unaffected." detail={errorDetail} action={onRetry ? "Retry" : undefined} onAction={onRetry} /></td></tr>
          ) : !view.length ? (
            <tr><td colSpan={ncol} className="pw-table__state"><StateBlock kind="empty" inline title={emptyTitle || "No rows match"} body={emptyBody || "Clear filters or widen the time range."} /></td></tr>
          ) : view.map((r) => {
            const id = field(r, rowKey); const k = String(id); const isOpen = !!open[k]; const tone = rowTone ? rowTone(r) : null;
            return (
              <Fragment key={k}>
                <tr className={cx(tone && "is-" + tone, onRowClick && "is-click", selectedKey === id && "is-selected")} tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? () => onRowClick(r) : undefined} onKeyDown={onRowClick ? (e: React.KeyboardEvent<HTMLTableRowElement>) => { if (e.key === "Enter") onRowClick(r); } : undefined}>
                  {renderExpanded ? (
                    <td className="pw-table__x"><button type="button" className="pw-xbtn" aria-expanded={isOpen} aria-label={(isOpen ? "Collapse " : "Expand ") + k}
                      onClick={(e) => { e.stopPropagation(); setOpen({ ...open, [k]: !isOpen }); }}><Icon name={isOpen ? "chevron-down" : "chevron-right"} size={14} /></button></td>
                  ) : null}
                  {columns.map((c) => <td key={c.key} style={{ textAlign: c.align }} className={cx(c.mono && "pw-mono", c.num && "is-nowrap", c.nowrap && "is-nowrap", c.className)}>{c.render ? c.render(r) : asNode(field(r, c.key))}</td>)}
                </tr>
                {renderExpanded && isOpen ? <tr className="pw-table__exp"><td /><td colSpan={columns.length}>{renderExpanded(r)}</td></tr> : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
      {pageSize && state === "ready" && sorted.length > pageSize ? (
        <div className="pw-pager">
          <span className="pw-caption pw-muted pw-num">{page * pageSize + 1}–{Math.min(sorted.length, (page + 1) * pageSize)} of {sorted.length}</span>
          <Button size="sm" variant="ghost" icon="chevron-left" aria-label="Previous page" disabled={page === 0} onClick={() => setPage(page - 1)} />
          <Button size="sm" variant="ghost" icon="chevron-right" aria-label="Next page" disabled={page >= pages - 1} onClick={() => setPage(page + 1)} />
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Time series ---------- */
// series: [{name, points:number[], color?: 'chart-1'|..|'ink', dashed?}], labels: string[] (same length), unit
export function TimeSeriesChart({ series = [], labels = [], unit = "", height = 180, threshold, markers = [], yMax, yMin = 0, onMarker, onBrush, ariaLabel, decimals = 0, band, state = "ready", highlight, table = true, endLabels = true }: TimeSeriesChartProps) {
  const [ref, w] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const [drag, setDrag] = useState<{ a: number; b: number } | null>(null);
  const [asTable, setAsTable] = useState(false);
  const n = labels.length || (series[0] && series[0].points.length) || 0;
  const all = series.flatMap((s) => s.points).filter((v): v is number => v != null);
  const max = yMax || niceMax(Math.max(...all, threshold ? threshold.value : 0) * 1.08);
  // direct end labels for 2–4 series when they don't collide (dataviz: legend + selective direct labels)
  const lastOf = (s: { points: (number | null)[] }): number | null => { for (let i = s.points.length - 1; i >= 0; i--) { const v = s.points[i]; if (v != null) return v; } return null; };
  const ih0 = height - 22 - 22;
  const ends = series.flatMap((s, k) => { const v = lastOf(s); return v == null ? [] : [{ k, v, name: s.name, color: s.color }]; })
    .map((e) => ({ ...e, y: 22 + ih0 - ((Math.max(e.v, yMin) - yMin) / (max - yMin)) * ih0 })).sort((a, b) => a.y - b.y);
  const collide = ends.some((e, i) => { const prev = ends[i - 1]; return prev != null && e.y - prev.y < 14; });
  const showEnd = endLabels && series.length >= 2 && series.length <= 4 && !collide && w > 420;
  const pad = { l: 44, r: showEnd ? 112 : 12, t: 22, b: 22 };
  const iw = w - pad.l - pad.r, ih = height - pad.t - pad.b;
  const sx = (i: number) => pad.l + (n > 1 ? (i * iw) / (n - 1) : 0);
  const sy = (v: number) => pad.t + ih - (Math.max(v, yMin) - yMin) / (max - yMin) * ih;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => yMin + t * (max - yMin));
  const xt = [0, Math.floor((n - 1) / 2), n - 1];
  const idxAt = (x: number) => Math.max(0, Math.min(n - 1, Math.round(((x - pad.l) / iw) * (n - 1))));
  if (state !== "ready") return <div ref={ref} className="pw-chart" style={{ height }}><ChartState state={state} height={height} /></div>;
  if (w < 60) return <div ref={ref} className="pw-chart" style={{ height: height + (table ? 22 : 0) }} />;
  const toneOf = (c?: string) => (c ? "var(--" + c + ")" : "var(--ink)");
  const tbl = (
    <div className="pw-chart__table"><table className="pw-table"><thead><tr><th>Time</th>{series.map((s) => <th key={s.name} style={{ textAlign: "right" }}>{s.name}{unit ? " (" + unit + ")" : ""}</th>)}</tr></thead>
      <tbody>{labels.map((l, i) => <tr key={i}><td>{l}</td>{series.map((s) => <td key={s.name} style={{ textAlign: "right" }}>{fmt(s.points[i], decimals)}</td>)}</tr>)}</tbody></table></div>
  );
  return (
    <div ref={ref} className="pw-chart">
      {table ? <div className="pw-chart__bar"><button type="button" className="pw-chart__toggle" aria-pressed={asTable} onClick={() => setAsTable(!asTable)}>{asTable ? "Show chart" : "Show table"}</button></div> : null}
      {asTable ? tbl : (
      <svg width={w} height={height} role="img" aria-label={ariaLabel} onMouseLeave={() => { setHover(null); setDrag(null); }}
        onMouseMove={(e) => { const x = e.clientX - e.currentTarget.getBoundingClientRect().left; const i = idxAt(x); setHover(i); if (drag) setDrag({ ...drag, b: i }); }}
        onMouseDown={(e) => { if (!onBrush) return; const i = idxAt(e.clientX - e.currentTarget.getBoundingClientRect().left); setDrag({ a: i, b: i }); }}
        onMouseUp={() => { if (drag && Math.abs(drag.b - drag.a) > 1 && onBrush) onBrush(Math.min(drag.a, drag.b), Math.max(drag.a, drag.b)); setDrag(null); }}>
        {ticks.map((t, i) => <g key={i}><line x1={pad.l} x2={w - pad.r} y1={sy(t)} y2={sy(t)} className="pw-grid" /><text x={pad.l - 8} y={sy(t) + 4} className="pw-tick" textAnchor="end">{tk(t)}</text></g>)}
        {xt.map((i) => <text key={i} x={sx(i)} y={height - 5} className="pw-tick" textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}>{labels[i]}</text>)}
        <text x={pad.l - 8} y={10} className="pw-tick" textAnchor="end">{unit}</text>
        {highlight ? <rect x={sx(highlight[0])} y={pad.t} width={Math.max(2, sx(highlight[1]) - sx(highlight[0]))} height={ih} className="pw-hl" /> : null}
        {band ? <rect x={pad.l} y={sy(band[1])} width={iw} height={sy(band[0]) - sy(band[1])} className="pw-band" /> : null}
        {threshold ? <g><line x1={pad.l} x2={w - pad.r} y1={sy(threshold.value)} y2={sy(threshold.value)} className="pw-thr" /><text x={showEnd ? pad.l + 6 : w - pad.r - 4} y={sy(threshold.value) - 6} className="pw-tick" textAnchor={showEnd ? "start" : "end"}>{threshold.label}</text></g> : null}
        {series.map((s, k) => {
          let d = ""; s.points.forEach((v, i) => { if (v == null) return; d += (d && s.points[i - 1] != null ? "L" : "M") + sx(i).toFixed(1) + "," + sy(v).toFixed(1); });
          return <path key={k} d={d} fill="none" stroke={toneOf(s.color)} strokeWidth={s.dashed ? 1.5 : 2} strokeDasharray={s.dashed ? "4 4" : undefined} strokeLinejoin="round" strokeLinecap="round" />;
        })}
        {showEnd ? ends.map((e) => <g key={e.k}><circle cx={sx(n - 1)} cy={e.y} r="4" fill={toneOf(e.color)} stroke="var(--surface-raised)" strokeWidth="2" /><text x={sx(n - 1) + 10} y={e.y + 4} className="pw-endlab">{e.name}</text></g>) : null}
        {markers.map((m, i) => (
          <g key={i} className="pw-marker" tabIndex={0} role="button" aria-label={"Change: " + m.label} onClick={() => onMarker && onMarker(m)} onKeyDown={(e) => e.key === "Enter" && onMarker && onMarker(m)}>
            <rect x={sx(m.index) - 12} y={pad.t - 14} width={24} height={ih + 14} fill="transparent" />
            <line x1={sx(m.index)} x2={sx(m.index)} y1={pad.t} y2={pad.t + ih} className="pw-marker__l" />
            <path d={`M${sx(m.index)},${pad.t - 4} l5,5 l-5,5 l-5,-5z`} className="pw-marker__g" />
            <text x={sx(m.index) + 9} y={pad.t + 5} className="pw-marker__t">{m.label}</text>
          </g>
        ))}
        {drag ? <rect x={sx(Math.min(drag.a, drag.b))} y={pad.t} width={Math.abs(sx(drag.b) - sx(drag.a))} height={ih} className="pw-brush" /> : null}
        {hover != null ? <line x1={sx(hover)} x2={sx(hover)} y1={pad.t} y2={pad.t + ih} className="pw-cross" /> : null}
        {hover != null ? series.map((s, k) => { const v = s.points[hover]; return v == null ? null : <circle key={k} cx={sx(hover)} cy={sy(v)} r="4" fill={toneOf(s.color)} stroke="var(--surface-raised)" strokeWidth="2" />; }) : null}
      </svg>)}
      {!asTable && hover != null ? (
        <div className="pw-chart__tip" style={{ left: Math.min(sx(hover) + 12, w - 190), top: 24 }}>
          <div className="pw-caption pw-muted pw-num">{labels[hover]}</div>
          {series.map((s, k) => <div key={k} className="pw-chart__tiprow"><i style={{ background: toneOf(s.color) }} className={s.dashed ? "is-dashed" : ""} /><span>{s.name}</span><b>{fmt(s.points[hover], decimals)} {unit}</b></div>)}
        </div>
      ) : null}
      {!asTable && series.length > 1 ? <Legend line items={series.map((s) => ({ name: s.name, color: s.color, dashed: s.dashed }))} /> : null}
    </div>
  );
}
function niceMax(v: number) { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const m = v / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p; }
export function Legend({ items, line }: LegendProps) {
  return <ul className="pw-legend">{items.map((it) => <li key={it.name}><i className={cx(line && "is-line", it.dashed && "is-dashed")} style={{ background: it.dashed ? undefined : "var(--" + (it.color || "ink") + ")", borderColor: "var(--" + (it.color || "ink") + ")" }} />{it.name}</li>)}</ul>;
}
function ChartState({ state, height }: { state: ViewState; height: number }) {
  if (state === "loading") return <div className="pw-chart__sk" style={{ height }} aria-busy="true"><Skeleton h={height - 24} /></div>;
  if (state === "empty") return <StateBlock kind="empty" inline title="No data points in this range" body="The source reported no samples. Try a wider range." />;
  if (state === "no-access") return <StateBlock kind="no-access" inline body="This metric belongs to example-team. Ask an owner for viewer access." />;
  return <StateBlock kind="error" inline title="Chart failed to load" body="Query exceeded 30 s. Narrow the time range or retry." />;
}

/* ---------- Bar / stacked bar ---------- */
// categories: string[], series: [{name, values:number[], color, pattern?}]. Patterns render only when `textures` is on (a11y / print).
export function BarChart({ categories = [], series = [], stacked = true, height = 160, unit = "", ariaLabel, onBar, state = "ready", textures = false }: BarChartProps) {
  const [ref, w] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const pid = "cap" + String(React.useId()).replace(/[^a-zA-Z0-9]/g, "");
  const pad = { l: 40, r: 8, t: 10, b: 24 };
  const totals = categories.map((_, i) => stacked ? series.reduce((a, s) => a + (s.values[i] || 0), 0) : Math.max(...series.map((s) => s.values[i] || 0)));
  const max = niceMax(Math.max(...totals, 1));
  const iw = w - pad.l - pad.r, ih = height - pad.t - pad.b;
  const bw = iw / categories.length;
  const sy = (v: number) => (v / max) * ih;
  if (state !== "ready") return <div ref={ref} className="pw-chart"><ChartState state={state} height={height} /></div>;
  if (w < 60) return <div ref={ref} className="pw-chart" style={{ height }} />;
  const every = Math.ceil(categories.length / Math.max(1, Math.floor(iw / 52)));
  const thick = Math.min(24, bw * 0.6);
  const GAP = 2, RAD = 4;
  // rounded data-end at the top, square at the baseline
  const topRounded = (x: number, y: number, ww: number, hh: number) => { const r = Math.min(RAD, ww / 2, hh); return `M${x},${y + hh}V${y + r}Q${x},${y} ${x + r},${y}H${x + ww - r}Q${x + ww},${y} ${x + ww},${y + r}V${y + hh}Z`; };
  return (
    <div ref={ref} className="pw-chart">
      <svg width={w} height={height} role="img" aria-label={ariaLabel} onMouseLeave={() => setHover(null)}>
        {textures ? <defs>{series.map((s, k) => s.pattern ? <pattern key={k} id={pid + k} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform={"rotate(" + (k % 2 ? 135 : 45) + ")"}><rect width="6" height="6" fill={"var(--" + s.color + ")"} /><line x1="0" y1="0" x2="0" y2="6" stroke="var(--surface-raised)" strokeWidth="1.4" /></pattern> : null)}</defs> : null}
        {[0, 0.5, 1].map((t, i) => <g key={i}><line x1={pad.l} x2={w - pad.r} y1={pad.t + ih - t * ih} y2={pad.t + ih - t * ih} className="pw-grid" /><text x={pad.l - 8} y={pad.t + ih - t * ih + 4} className="pw-tick" textAnchor="end">{tk(t * max)}</text></g>)}
        {categories.map((c, i) => {
          let acc = 0; const x0 = pad.l + i * bw + (bw - thick) / 2;
          const segs = series.map((s, k) => ({ s, k, v: s.values[i] || 0 })).filter((x) => x.v > 0);
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onClick={() => onBar && onBar(c, i)} className={cx(onBar && "is-click")}>
              <rect x={pad.l + i * bw} y={pad.t} width={bw} height={ih} fill="transparent" />
              {segs.map((g, j) => {
                const hgt = sy(g.v); const isTop = stacked ? j === segs.length - 1 : true;
                const y = pad.t + ih - (stacked ? acc : 0) - hgt; if (stacked) acc += hgt;
                const x = stacked ? x0 : x0 + (thick / series.length) * g.k; const ww = stacked ? thick : thick / series.length - GAP;
                const hh = Math.max(1, hgt - (stacked && j > 0 ? GAP : 0));
                const fill = textures && g.s.pattern ? "url(#" + pid + g.k + ")" : "var(--" + g.s.color + ")";
                return isTop ? <path key={g.k} d={topRounded(x, y, Math.max(1, ww), hh)} fill={fill} opacity={hover != null && hover !== i ? 0.5 : 1} />
                  : <rect key={g.k} x={x} y={y} width={Math.max(1, ww)} height={hh} fill={fill} opacity={hover != null && hover !== i ? 0.5 : 1} />;
              })}
              {i % every === 0 ? <text x={pad.l + i * bw + bw / 2} y={height - 6} className="pw-tick" textAnchor="middle">{c}</text> : null}
            </g>
          );
        })}
      </svg>
      {hover != null ? (
        <div className="pw-chart__tip" style={{ left: Math.min(pad.l + hover * bw + bw, w - 190), top: 6 }}>
          <div className="pw-caption pw-muted">{categories[hover]}</div>
          {series.map((s, k) => <div key={k} className="pw-chart__tiprow"><i style={{ background: "var(--" + s.color + ")", height: 8, width: 8 }} /><span>{s.name}</span><b>{fmt(s.values[hover] || 0, unit.includes("k")  ? 1 : 0)} {unit}</b></div>)}
          {stacked && series.length > 1 ? <div className="pw-chart__tiprow"><i /><span className="pw-muted">Total</span><b>{fmt(totals[hover], unit.includes("k")  ? 1 : 0)} {unit}</b></div> : null}
        </div>
      ) : null}
      {series.length > 1 ? <Legend items={series.map((s) => ({ name: s.name, color: s.color }))} /> : null}
    </div>
  );
}

/* ---------- Run strip: last N runs inline in a table cell ---------- */
export function RunStrip({ runs = [], labels = [], name = "" }: RunStripProps) {
  const word: Record<Status, string> = { critical: "failed", warning: "succeeded after retry", healthy: "succeeded", info: "running", unknown: "skipped" };
  const glyph: Record<Status, string> = { critical: "✕", warning: "↻", healthy: "", info: "", unknown: "" };
  const fails = runs.filter((r) => r === "critical").length;
  return (
    <span className="pw-runs" role="img" aria-label={`${name} last ${runs.length} runs: ${fails} failed. ` + runs.map((r, i) => (labels[i] || "run " + (i + 1)) + " " + word[r]).join(", ")}>
      {runs.map((r, i) => <span key={i} className={cx("pw-run", "is-" + r)} title={(labels[i] || "") + " " + word[r]}>{glyph[r]}</span>)}
    </span>
  );
}

/* ---------- Heatmap (sequential: one hue, light to dark) ---------- */
export function Heatmap({ rows = [], cols = [], values = [], unit = "", ariaLabel, max }: HeatmapProps) {
  const m = max || Math.max(...values.flat().filter((v): v is number => v != null), 1);
  const [hover, setHover] = useState<{ r: string; c: string; v: number | null | undefined } | null>(null);
  return (
    <div className="pw-heat" role="img" aria-label={ariaLabel}>
      <div className="pw-heat__grid" style={{ gridTemplateColumns: `120px repeat(${cols.length}, minmax(10px, 1fr))` }}>
        {rows.map((r, i) => (
          <Fragment key={r}>
            <span className="pw-caption pw-mono pw-heat__r">{r}</span>
            {cols.map((c, j) => {
              const v = values[i]?.[j];
              return <span key={j} className="pw-heat__c" onMouseEnter={() => setHover({ r, c, v })} onMouseLeave={() => setHover(null)} style={{ opacity: v == null ? 1 : 0.08 + 0.92 * (v / m) }} data-null={v == null ? "1" : undefined} />;
            })}
          </Fragment>
        ))}
        <span />
        {cols.map((c, j) => <span key={j} className="pw-tick pw-heat__x">{j % 4 === 0 ? c : ""}</span>)}
      </div>
      <div className="pw-heat__f pw-caption pw-muted">
        {hover ? <span className="pw-num">{hover.r} · {hover.c}: <b>{hover.v == null ? "no data" : fmt(hover.v, 1) + " " + unit}</b></span> : <span>Darker = higher. Hatched = no data.</span>}
        <span className="pw-heat__scale"><span>0</span><i /><span className="pw-num">{fmt(m, 0)} {unit}</span></span>
      </div>
    </div>
  );
}

/* ---------- Status grid (e.g. DAG × runs) ---------- */
export function StatusGrid({ rows = [], cols = [], cells = [], onCell, ariaLabel, rowLabelWidth = 200 }: StatusGridProps) {
  const glyph: Record<Status, string> = { critical: "✕", warning: "↻", healthy: "", unknown: "–", info: "•" };
  return (
    <div className="pw-sgrid" role="grid" aria-label={ariaLabel}>
      <div className="pw-sgrid__row pw-sgrid__head" role="row" style={{ gridTemplateColumns: `${rowLabelWidth}px repeat(${cols.length}, 18px)` }}>
        <span role="columnheader" className="pw-caption pw-muted">{""}</span>
        {cols.map((c, j) => <span key={j} role="columnheader" className="pw-tick pw-sgrid__ch">{j % 2 === 0 ? c : ""}</span>)}
      </div>
      {rows.map((r, i) => (
        <div key={r.key} className="pw-sgrid__row" role="row" style={{ gridTemplateColumns: `${rowLabelWidth}px repeat(${cols.length}, 18px)` }}>
          <span role="rowheader" className="pw-mono pw-sgrid__rh">{r.label}</span>
          {cols.map((c, j) => {
            const s = cells[i]?.[j];
            return <button key={j} type="button" role="gridcell" className={cx("pw-sgrid__c", "is-" + s)} aria-label={`${r.label}, ${c}: ${s === "critical" ? "failed" : s === "warning" ? "succeeded after retry" : s === "healthy" ? "succeeded" : s === "info" ? "running" : "skipped"}`}
              onClick={() => onCell && s && onCell(r, c, s)}>{s ? glyph[s] : null}</button>;
          })}
        </div>
      ))}
      <div className="pw-sgrid__key pw-caption pw-muted">
        <span><b className="pw-sgrid__c is-healthy" />Succeeded</span><span><b className="pw-sgrid__c is-warning">↻</b>Succeeded after retry</span><span><b className="pw-sgrid__c is-critical">✕</b>Failed</span><span><b className="pw-sgrid__c is-info">•</b>Running</span><span><b className="pw-sgrid__c is-unknown">–</b>Skipped</span>
      </div>
    </div>
  );
}

/* ---------- Bullet bar: used vs requested vs limit ---------- */
export function BulletBar({ used, requested, limit, unit = "", warnAt = 0.8, critAt = 0.92, label }: BulletBarProps) {
  const p = (v: number) => Math.min(100, (v / limit) * 100) + "%";
  const ratio = used / limit; const tone = ratio >= critAt ? "critical" : ratio >= warnAt ? "warning" : "ink";
  return (
    <div className="pw-bullet" role="img" aria-label={`${label || ""} ${fmt(used, 1)} of ${fmt(limit, 1)} ${unit} used, ${fmt(requested, 1)} requested`}>
      <div className="pw-bullet__track">
        <span className="pw-bullet__req" style={{ width: p(requested) }} />
        <span className={cx("pw-bullet__used", "pw-fill--" + tone)} style={{ width: p(used) }} />
        <span className="pw-bullet__lim" style={{ left: "calc(100% - 1px)" }} />
      </div>
      <span className={cx("pw-num pw-caption", tone !== "ink" && "pw-tone--" + tone)}>{Math.round(ratio * 100)}%</span>
    </div>
  );
}

/* ---------- Timeline / event feed ---------- */
const EV_ICON: Record<TimelineEvent["kind"], string> = { alert: "critical", warn: "warning", deploy: "changes", config: "settings", ack: "check", comment: "comment", scale: "scale", resolve: "healthy", page: "bell", ticket: "ticket", info: "info" };
export function Timeline({ events = [], onEvent, dense }: TimelineProps) {
  return (
    <ol className={cx("pw-timeline", dense && "is-dense")}>
      {events.map((e, i) => (
        <li key={i} className={cx("pw-tl", "pw-tl--" + e.kind, e.highlight && "is-hl")}>
          <time className="pw-caption pw-muted pw-tl__t">{e.time}</time>
          <span className={cx("pw-tl__i", (e.kind === "alert") && "pw-tone--critical", e.kind === "warn" && "pw-tone--warning", e.kind === "resolve" && "pw-tone--healthy")}><Icon name={EV_ICON[e.kind] || "info"} size={14} /></span>
          <div className="pw-tl__b">
            <div>{onEvent && e.link ? <button type="button" className="pw-tl__link" onClick={() => onEvent(e)}>{e.title}</button> : <span className="pw-body-strong">{e.title}</span>}{e.tag ? <span className="pw-tag">{e.tag}</span> : null}</div>
            {e.body ? <div className="pw-muted">{e.body}</div> : null}
            {e.actor ? <div className="pw-caption pw-muted">{e.actor}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
