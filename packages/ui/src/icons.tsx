import * as React from "react";
import { Fragment } from "react";

// One icon set: 16px grid, 1.5 stroke, square-ish terminals. Drawn for this system.
const P: Record<string, any> = {
  search: <g><circle cx="7" cy="7" r="4.25"/><path d="m10.2 10.2 3.3 3.3"/></g>,
  "chevron-down": <path d="m4.5 6.25 3.5 3.5 3.5-3.5"/>,
  "chevron-right": <path d="m6.25 4.5 3.5 3.5-3.5 3.5"/>,
  "chevron-left": <path d="m9.75 4.5-3.5 3.5 3.5 3.5"/>,
  "chevron-up": <path d="m4.5 9.75 3.5-3.5 3.5 3.5"/>,
  x: <path d="m4.5 4.5 7 7m0-7-7 7"/>,
  clock: <g><circle cx="8" cy="8" r="5.75"/><path d="M8 4.75V8l2.25 1.5"/></g>,
  refresh: <g><path d="M12.9 6.5A5 5 0 0 0 3.6 5.4M3.1 9.5a5 5 0 0 0 9.3 1.1"/><path d="M3.25 2.75v2.9h2.9M12.75 13.25v-2.9h-2.9"/></g>,
  bell: <g><path d="M4.25 11.25V7.5a3.75 3.75 0 0 1 7.5 0v3.75l1 1.25H3.25z"/><path d="M6.75 14h2.5"/></g>,
  home: <path d="M2.75 7.25 8 2.75l5.25 4.5v6H9.5V10h-3v3.25H2.75z"/>,
  siren: <g><path d="M4.5 12V8.5a3.5 3.5 0 0 1 7 0V12"/><path d="M2.75 12.25h10.5v1.5H2.75zM8 1.75v1.5M2.6 4.1l1.05 1.05M13.4 4.1l-1.05 1.05"/></g>,
  changes: <g><circle cx="8" cy="8" r="2.25"/><path d="M1.75 8h4M10.25 8h4"/></g>,
  layers: <g><path d="M8 2.25 14 5.5 8 8.75 2 5.5z"/><path d="m2 8.5 6 3.25 6-3.25M2 11.25 8 14.5l6-3.25"/></g>,
  server: <g><rect x="2.5" y="2.75" width="11" height="4.25"/><rect x="2.5" y="9" width="11" height="4.25"/><path d="M5 4.9h.01M5 11.1h.01"/></g>,
  pipeline: <g><circle cx="3.5" cy="4" r="1.5"/><circle cx="12.5" cy="4" r="1.5"/><circle cx="8" cy="12" r="1.5"/><path d="M5 4h6M4.3 5.3l2.9 5.4M11.7 5.3l-2.9 5.4"/></g>,
  chip: <g><rect x="4" y="4" width="8" height="8"/><path d="M6 1.75V4M10 1.75V4M6 12v2.25M10 12v2.25M1.75 6H4M1.75 10H4M12 6h2.25M12 10h2.25"/></g>,
  cube: <g><path d="M8 1.75 13.5 4.9v6.2L8 14.25 2.5 11.1V4.9z"/><path d="M2.5 4.9 8 8l5.5-3.1M8 8v6.25"/></g>,
  database: <g><ellipse cx="8" cy="3.75" rx="5" ry="1.75"/><path d="M3 3.75v8.5c0 1 2.2 1.75 5 1.75s5-.75 5-1.75v-8.5M3 8c0 1 2.2 1.75 5 1.75S13 9 13 8"/></g>,
  coins: <g><ellipse cx="6" cy="5" rx="3.75" ry="1.75"/><path d="M2.25 5v3c0 1 1.7 1.75 3.75 1.75M2.25 8v3c0 1 1.7 1.75 3.75 1.75"/><ellipse cx="10.5" cy="9.5" rx="3.25" ry="1.5"/><path d="M7.25 9.5v2.75c0 .85 1.45 1.5 3.25 1.5s3.25-.65 3.25-1.5V9.5"/></g>,
  target: <g><circle cx="8" cy="8" r="5.75"/><circle cx="8" cy="8" r="2.75"/><path d="M8 8h.01"/></g>,
  shield: <g><path d="M8 1.75 13 3.5v4.25c0 3-2.1 5.1-5 6.5-2.9-1.4-5-3.5-5-6.5V3.5z"/><path d="m5.75 8 1.6 1.6 2.9-3"/></g>,
  grid: <g><rect x="2.5" y="2.5" width="4.5" height="4.5"/><rect x="9" y="2.5" width="4.5" height="4.5"/><rect x="2.5" y="9" width="4.5" height="4.5"/><rect x="9" y="9" width="4.5" height="4.5"/></g>,
  settings: <g><circle cx="8" cy="8" r="2"/><path d="M8 1.75v2M8 12.25v2M1.75 8h2M12.25 8h2M3.6 3.6l1.4 1.4M11 11l1.4 1.4M3.6 12.4 5 11M11 5l1.4-1.4"/></g>,
  external: <g><path d="M9.5 2.75h3.75V6.5M13.25 2.75 7.5 8.5"/><path d="M11.5 9.5v3.75H2.75V4.5H6.5"/></g>,
  copy: <g><rect x="5.25" y="5.25" width="8" height="8"/><path d="M10.75 5.25v-2.5h-8v8h2.5"/></g>,
  filter: <path d="M2.25 3h11.5L9.25 8.5v4.25l-2.5 1V8.5z"/>,
  more: <g><path d="M3.5 8h.01M8 8h.01M12.5 8h.01" strokeWidth="2.2"/></g>,
  menu: <path d="M2.5 4h11M2.5 8h11M2.5 12h11"/>,
  user: <g><circle cx="8" cy="5.5" r="2.75"/><path d="M2.75 14c.6-2.6 2.7-4 5.25-4s4.65 1.4 5.25 4"/></g>,
  check: <path d="m3.25 8.25 3 3 6.5-6.5"/>,
  "arrow-up": <path d="M8 13V3.5M4.25 7.25 8 3.5l3.75 3.75"/>,
  "arrow-down": <path d="M8 3v9.5M4.25 8.75 8 12.5l3.75-3.75"/>,
  "arrow-left": <path d="M13 8H3.5M7.25 4.25 3.5 8l3.75 3.75"/>,
  sort: <path d="M5 2.75v10.5M2.75 5 5 2.75 7.25 5M11 13.25V2.75M8.75 11 11 13.25 13.25 11"/>,
  lock: <g><rect x="3" y="7" width="10" height="7"/><path d="M5.25 7V5a2.75 2.75 0 0 1 5.5 0v2"/></g>,
  book: <g><path d="M2.75 3h4a1.5 1.5 0 0 1 1.25.7A1.5 1.5 0 0 1 9.25 3h4v9.5h-4a1.25 1.25 0 0 0-1.25 1.25A1.25 1.25 0 0 0 6.75 12.5h-4z"/><path d="M8 3.7v10"/></g>,
  link: <g><path d="M6.75 9.25a2.6 2.6 0 0 0 3.7 0l2.1-2.1a2.6 2.6 0 0 0-3.7-3.7L8 4.3"/><path d="M9.25 6.75a2.6 2.6 0 0 0-3.7 0l-2.1 2.1a2.6 2.6 0 0 0 3.7 3.7l.85-.85"/></g>,
  pause: <path d="M5.5 3.5v9M10.5 3.5v9"/>,
  play: <path d="M5 3.25v9.5L12.5 8z"/>,
  scale: <g><path d="M2.75 13.25h10.5M4.5 13.25V9.5M8 13.25V6M11.5 13.25V2.75"/></g>,
  terminal: <g><rect x="2" y="2.75" width="12" height="10.5"/><path d="m4.75 6 2 2-2 2M8.5 10.25h3"/></g>,
  comment: <path d="M2.5 3h11v7.5H7.25L4.5 13v-2.5h-2z"/>,
  page: <g><path d="M3.5 1.75h6l3 3v9.5h-9z"/><path d="M9.5 1.75v3h3M5.75 8h4.5M5.75 10.5h4.5"/></g>,
  ticket: <g><path d="M2 4.5h12v2a1.5 1.5 0 0 0 0 3v2H2v-2a1.5 1.5 0 0 0 0-3z"/><path d="M10 4.5v7" strokeDasharray="1.2 1.4"/></g>,
};

// Status glyphs: filled shapes so they read without colour.
const S: Record<string, any> = {
  critical: <g><path d="M5.1 1.5h5.8l3.6 3.6v5.8l-3.6 3.6H5.1l-3.6-3.6V5.1z" fill="currentColor" stroke="none"/><path d="M8 4.5v4.25" stroke="var(--surface-raised)" strokeWidth="1.8"/><circle cx="8" cy="11.1" r="1" fill="var(--surface-raised)" stroke="none"/></g>,
  warning: <g><path d="M8 1.4 15 13.9H1z" fill="currentColor" stroke="none"/><path d="M8 5.75v3.75" stroke="var(--surface-raised)" strokeWidth="1.7"/><circle cx="8" cy="11.6" r=".95" fill="var(--surface-raised)" stroke="none"/></g>,
  healthy: <g><circle cx="8" cy="8" r="6.25"/><path d="m5.1 8.1 2 2 3.8-4"/></g>,
  unknown: <g><circle cx="8" cy="8" r="6.25" strokeDasharray="2.4 1.9"/><path d="M6.4 6.3a1.7 1.7 0 1 1 2.3 1.6c-.45.2-.7.55-.7 1.05"/><circle cx="8" cy="11.1" r=".8" fill="currentColor" stroke="none"/></g>,
  info: <g><circle cx="8" cy="8" r="6.25" strokeDasharray="28 11.3"/><circle cx="8" cy="8" r="2" fill="currentColor" stroke="none"/></g>,
};

export function Icon({ name, size = 16, title, className }: { name: string; size?: number; title?: string; className?: string }) {
  const glyph = S[name] || P[name];
  return (
    <svg className={"pw-icon" + (className ? " " + className : "")} width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" aria-hidden={title ? undefined : true} role={title ? "img" : undefined} focusable="false">
      {title ? <title>{title}</title> : null}
      {glyph || P["x"]}
    </svg>
  );
}
export const iconNames = Object.keys(P);
