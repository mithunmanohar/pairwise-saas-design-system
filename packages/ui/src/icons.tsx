import type * as React from "react";
import type { IconProps, EntityKind } from "./types";

// One icon set: 16px grid, 1.5 stroke, square-ish terminals. Drawn for this system.
const P = {
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
  minus: <path d="M4 8h8"/>,
  "chevrons-left": <path d="m8.25 4.5-3.5 3.5 3.5 3.5M12.25 4.5 8.75 8l3.5 3.5"/>,
  "chevrons-right": <path d="m3.75 4.5 3.5 3.5-3.5 3.5M7.75 4.5l3.5 3.5-3.5 3.5"/>,
  edit: <g><path d="M10.25 3.25 12.75 5.75 6 12.5H3.5V10z"/><path d="m8.75 4.75 2.5 2.5"/></g>,
  upload: <g><path d="M8 10.5V2.75M4.75 6 8 2.75 11.25 6"/><path d="M2.75 10.5v2.75h10.5V10.5"/></g>,
  calendar: <g><rect x="2.5" y="3.5" width="11" height="10"/><path d="M2.5 6.75h11M5.5 2v3M10.5 2v3"/></g>,
  plus: <path d="M8 3.5v9M3.5 8h9"/>,
  file: <g><path d="M3.75 1.75h5.5l3 3v9.5h-8.5z"/><path d="M9.25 1.75v3h3"/></g>,
  building: <g><path d="M3 14V2.75h7V14M10 6.25h3.25V14M1.75 14h12.5"/><path d="M5.25 5h2.5M5.25 7.75h2.5M5.25 10.5h2.5"/></g>,
  briefcase: <g><rect x="2" y="5" width="12" height="8.25"/><path d="M5.75 5V3h4.5v2M2 8.75h12"/></g>,
  users: <g><circle cx="6" cy="5.5" r="2.25"/><path d="M1.75 13.25c.5-2.2 2.1-3.5 4.25-3.5s3.75 1.3 4.25 3.5"/><path d="M10.25 3.5a2.25 2.25 0 0 1 0 4.25M11.75 9.9c1.35.45 2.2 1.6 2.5 3.35"/></g>,
  flag: <g><path d="M3.5 14.25V2"/><path d="M3.5 2.75h8.75l-1.75 3 1.75 3H3.5"/></g>,
  folder: <path d="M2 3.25h4.25l1.5 1.75h6.25v7.75H2z"/>,
  "git-repo": <g><path d="M4 2.25h8.75v9.5H4.75a1.5 1.5 0 0 0-1.5 1.5V3A.75.75 0 0 1 4 2.25z"/><path d="M3.25 13.25a1.5 1.5 0 0 0 1.5 1.5h1.5M8 12.25v2.5l1-.75 1 .75v-2.5"/></g>,
  globe: <g><circle cx="8" cy="8" r="5.75"/><path d="M2.25 8h11.5M8 2.25c1.6 1.6 2.4 3.5 2.4 5.75S9.6 12.15 8 13.75C6.4 12.15 5.6 10.25 5.6 8S6.4 3.85 8 2.25z"/></g>,
  "level-up": <path d="M5 6.5 8 3.5l3 3M8 3.5v9"/>,
  columns: <g><rect x="2.5" y="2.75" width="11" height="10.5"/><path d="M6.25 2.75v10.5M9.75 2.75v10.5"/></g>,
  // The assistant: a speech bubble with a prompt mark. Never a sparkle: AI is told apart by label and layout, not magic.
  assistant: <g><path d="M2.5 3h11v7.5H7.25L4.5 13v-2.5h-2z"/><path d="m5.25 5.25 1.75 1.5-1.75 1.5M8.25 8.25h2.5"/></g>,
  send: <g><path d="M2.25 7.75 13.75 2.25 10.5 13.75 7.5 9z"/><path d="M7.5 9 13.75 2.25"/></g>,
  stop: <rect x="4" y="4" width="8" height="8"/>,
  attach: <path d="M11.25 5.5 6.6 10.15a1.25 1.25 0 0 0 1.77 1.77l4.6-4.6a2.75 2.75 0 0 0-3.9-3.9L4.4 8.1a4.25 4.25 0 0 0 6 6l3.1-3.1"/>,
  "thumb-up": <g><path d="M2.5 7.25h2.75v6.5H2.5z"/><path d="M5.25 7.25 7.75 2.5c1 0 1.75.8 1.5 1.85l-.5 2.4h4l-1.25 7H5.25"/></g>,
  "thumb-down": <g transform="matrix(1 0 0 -1 0 16)"><path d="M2.5 7.25h2.75v6.5H2.5z"/><path d="M5.25 7.25 7.75 2.5c1 0 1.75.8 1.5 1.85l-.5 2.4h4l-1.25 7H5.25"/></g>,
  history: <g><path d="M2.9 9.5A5.25 5.25 0 1 0 4.3 4.3L2.75 5.85"/><path d="M2.75 2.75v3.1h3.1M8 5.25V8l2 1.25"/></g>,
  expand: <path d="M9.5 2.75h3.75V6.5M13.25 2.75l-4 4M6.5 13.25H2.75V9.5M2.75 13.25l4-4"/>,
  collapse: <path d="M13.25 2.75l-4 4M9.25 3.5v3.25h3.25M2.75 13.25l4-4M3.5 9.25h3.25v3.25"/>,
} satisfies Record<string, React.ReactElement>;

// Status glyphs: filled shapes so they read without colour.
const S = {
  critical: <g><path d="M5.1 1.5h5.8l3.6 3.6v5.8l-3.6 3.6H5.1l-3.6-3.6V5.1z" fill="currentColor" stroke="none"/><path d="M8 4.5v4.25" stroke="var(--surface-raised)" strokeWidth="1.8"/><circle cx="8" cy="11.1" r="1" fill="var(--surface-raised)" stroke="none"/></g>,
  warning: <g><path d="M8 1.4 15 13.9H1z" fill="currentColor" stroke="none"/><path d="M8 5.75v3.75" stroke="var(--surface-raised)" strokeWidth="1.7"/><circle cx="8" cy="11.6" r=".95" fill="var(--surface-raised)" stroke="none"/></g>,
  healthy: <g><circle cx="8" cy="8" r="6.25"/><path d="m5.1 8.1 2 2 3.8-4"/></g>,
  unknown: <g><circle cx="8" cy="8" r="6.25" strokeDasharray="2.4 1.9"/><path d="M6.4 6.3a1.7 1.7 0 1 1 2.3 1.6c-.45.2-.7.55-.7 1.05"/><circle cx="8" cy="11.1" r=".8" fill="currentColor" stroke="none"/></g>,
  info: <g><circle cx="8" cy="8" r="6.25" strokeDasharray="28 11.3"/><circle cx="8" cy="8" r="2" fill="currentColor" stroke="none"/></g>,
} satisfies Record<string, React.ReactElement>;

/** Every icon name: the line set plus the five status glyphs. A typo is a type error, not a silent "x". */
export type IconName = keyof typeof P | keyof typeof S;
const GLYPHS: Record<IconName, React.ReactElement> = { ...P, ...S };

export function Icon({ name, size = 16, title, className }: IconProps) {
  const glyph = GLYPHS[name];
  return (
    <svg className={"pw-icon" + (className ? " " + className : "")} width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" aria-hidden={title ? undefined : true} role={title ? "img" : undefined} focusable="false">
      {title ? <title>{title}</title> : null}
      {glyph || P.x}
    </svg>
  );
}
/** The line icons (status glyphs excluded), for pickers and docs. */
export const iconNames = Object.keys(P) as Array<keyof typeof P>;

/**
 * The icon and word for each kind of owned thing. Kinds are told apart by icon and label, never by colour (Signal keeps
 * colour for status). Use these everywhere an entity is named: trees, the scope picker, table rows, page headers.
 */
export const entityIcon: Record<EntityKind, IconName> = {
  company: "building", function: "briefcase", squad: "users", initiative: "flag", project: "folder",
  repository: "git-repo", pipeline: "pipeline", webapp: "globe", infrastructure: "server", dataset: "database",
  model: "chip", resources: "layers",
};
export const entityLabel: Record<EntityKind, string> = {
  company: "Company", function: "Business function", squad: "Squad", initiative: "Initiative", project: "Project",
  repository: "Repository", pipeline: "Pipeline", webapp: "Web app", infrastructure: "Infrastructure", dataset: "Dataset",
  model: "Model", resources: "Resources",
};
