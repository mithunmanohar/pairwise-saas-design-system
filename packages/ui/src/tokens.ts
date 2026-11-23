// Generated from design-system/tokens.json by scripts/build-tokens.mjs. Do not edit.
export const themes = ["light","dark"] as const;
export type Theme = (typeof themes)[number];
export const densities = ["compact", "comfortable"] as const;
export type Density = (typeof densities)[number];
export const color = {
  "surface": {
    "light": "#f4f5f7",
    "dark": "#141619"
  },
  "surface-raised": {
    "light": "#ffffff",
    "dark": "#1b1e22"
  },
  "surface-sunken": {
    "light": "#eef0f2",
    "dark": "#17191d"
  },
  "surface-hover": {
    "light": "#eceef1",
    "dark": "#23272c"
  },
  "surface-selected": {
    "light": "#e3e6ea",
    "dark": "#2c3137"
  },
  "surface-overlay": {
    "light": "#ffffff",
    "dark": "#22262b"
  },
  "border": {
    "light": "#e1e4e8",
    "dark": "#2e333a"
  },
  "border-strong": {
    "light": "#828a94",
    "dark": "#6f7782"
  },
  "ink": {
    "light": "#15171a",
    "dark": "#eceef0"
  },
  "ink-muted": {
    "light": "#5a616b",
    "dark": "#a0a7b1"
  },
  "ink-disabled": {
    "light": "#9aa1aa",
    "dark": "#5b626b"
  },
  "ink-inverse": {
    "light": "#ffffff",
    "dark": "#141619"
  },
  "focus-ring": {
    "light": "#15171a",
    "dark": "#eceef0"
  },
  "scrim": {
    "light": "rgba(14, 16, 18, 0.44)",
    "dark": "rgba(0, 0, 0, 0.62)"
  },
  "status-critical": {
    "light": "#b42318",
    "dark": "#ff7a6b"
  },
  "status-critical-surface": {
    "light": "#fdecea",
    "dark": "#3a1d1a"
  },
  "status-warning": {
    "light": "#8a5300",
    "dark": "#f7b955"
  },
  "status-warning-surface": {
    "light": "#fdf3e1",
    "dark": "#33270f"
  },
  "status-healthy": {
    "light": "#0b6e69",
    "dark": "#4fd1c1"
  },
  "status-healthy-surface": {
    "light": "#e3f4f2",
    "dark": "#0f2e2b"
  },
  "status-unknown": {
    "light": "#5b6470",
    "dark": "#a3acb8"
  },
  "status-unknown-surface": {
    "light": "#eef0f3",
    "dark": "#222831"
  },
  "status-info": {
    "light": "#3c4654",
    "dark": "#c3cad3"
  },
  "status-info-surface": {
    "light": "#eceef1",
    "dark": "#20252b"
  },
  "chart-1": {
    "light": "#2a62c9",
    "dark": "#4d8ae6"
  },
  "chart-2": {
    "light": "#b23a78",
    "dark": "#c95791"
  },
  "chart-3": {
    "light": "#6b7a12",
    "dark": "#8a9a20"
  },
  "chart-4": {
    "light": "#5d1b6a",
    "dark": "#cea2d7"
  },
  "chart-5": {
    "light": "#225924",
    "dark": "#57db5d"
  },
  "chart-other": {
    "light": "#9aa1aa",
    "dark": "#6b727c"
  },
  "chart-grid": {
    "light": "#e6e8eb",
    "dark": "#23272b"
  }
} as const;
export type ColorToken = keyof typeof color;
export const space = {
  "space-1": "4px",
  "space-2": "8px",
  "space-3": "12px",
  "space-4": "16px",
  "space-6": "24px",
  "space-5": "20px",
  "space-8": "32px",
  "space-12": "48px"
} as const;
export type SpaceToken = keyof typeof space;
export const radius = {
  "radius-0": "0px",
  "radius-sm": "4px",
  "radius-md": "6px"
} as const;
export type RadiusToken = keyof typeof radius;
export const size = {
  "row-compact": "32px",
  "row-comfortable": "40px",
  "control-compact": "32px",
  "control-comfortable": "36px",
  "topbar-height": "52px",
  "rail-expanded": "232px",
  "rail-collapsed": "56px",
  "drawer-width": "520px",
  "explorer-width": "320px",
  "assistant-width": "400px"
} as const;
export type SizeToken = keyof typeof size;
/** Durations and easings. prefers-reduced-motion sets every duration to 0 ms in tokens.css. */
export const motion = {
  "duration-fast": "120ms",
  "duration-base": "160ms",
  "duration-slow": "220ms",
  "duration-spin": "800ms",
  "duration-pulse": "1400ms",
  "ease-standard": "cubic-bezier(0.2, 0, 0, 1)",
  "ease-exit": "cubic-bezier(0.4, 0, 1, 1)"
} as const;
export type MotionToken = keyof typeof motion;
/** Stacking order (z-index) for floating layers. */
export const layer = {
  "z-sticky": "1",
  "z-raised": "2",
  "z-chart-tip": "5",
  "z-overlay": "60",
  "z-popover": "70",
  "z-toast": "80",
  "z-tooltip": "90"
} as const;
export type LayerToken = keyof typeof layer;
/** Font presets for data-font on <html> (the app default, or a person's own choice). The first is the default. */
export const fonts = [
  {
    "id": "atkinson",
    "label": "Atkinson Hyperlegible",
    "usage": "Default. Drawn for legibility: distinct letterforms (I l 1, O 0) help low-vision readers and dense data."
  },
  {
    "id": "inter",
    "label": "Inter",
    "usage": "A neutral, compact interface face; fits more text per line. Paired with IBM Plex Mono for identifiers."
  },
  {
    "id": "plex",
    "label": "IBM Plex",
    "usage": "A technical, slightly condensed face with a matching mono."
  },
  {
    "id": "system",
    "label": "System font",
    "usage": "The device's own interface font (San Francisco, Segoe UI, Roboto). Nothing to download."
  }
] as const;
export type FontPreset = (typeof fonts)[number]["id"];
/** CSS custom-property reference for a token, e.g. cssVar("chart-1") → "var(--chart-1)". */
export const cssVar = (name: ColorToken | SpaceToken | RadiusToken | SizeToken | MotionToken | LayerToken): string => `var(--${name})`;
