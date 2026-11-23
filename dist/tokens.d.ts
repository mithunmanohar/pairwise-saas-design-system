export declare const themes: readonly ["light", "dark"];
export type Theme = (typeof themes)[number];
export declare const densities: readonly ["compact", "comfortable"];
export type Density = (typeof densities)[number];
export declare const color: {
    readonly surface: {
        readonly light: "#f4f5f7";
        readonly dark: "#141619";
    };
    readonly "surface-raised": {
        readonly light: "#ffffff";
        readonly dark: "#1b1e22";
    };
    readonly "surface-sunken": {
        readonly light: "#eef0f2";
        readonly dark: "#17191d";
    };
    readonly "surface-hover": {
        readonly light: "#eceef1";
        readonly dark: "#23272c";
    };
    readonly "surface-selected": {
        readonly light: "#e3e6ea";
        readonly dark: "#2c3137";
    };
    readonly "surface-overlay": {
        readonly light: "#ffffff";
        readonly dark: "#22262b";
    };
    readonly border: {
        readonly light: "#e1e4e8";
        readonly dark: "#2e333a";
    };
    readonly "border-strong": {
        readonly light: "#828a94";
        readonly dark: "#6f7782";
    };
    readonly ink: {
        readonly light: "#15171a";
        readonly dark: "#eceef0";
    };
    readonly "ink-muted": {
        readonly light: "#5a616b";
        readonly dark: "#a0a7b1";
    };
    readonly "ink-disabled": {
        readonly light: "#9aa1aa";
        readonly dark: "#5b626b";
    };
    readonly "ink-inverse": {
        readonly light: "#ffffff";
        readonly dark: "#141619";
    };
    readonly "focus-ring": {
        readonly light: "#15171a";
        readonly dark: "#eceef0";
    };
    readonly scrim: {
        readonly light: "rgba(14, 16, 18, 0.44)";
        readonly dark: "rgba(0, 0, 0, 0.62)";
    };
    readonly "status-critical": {
        readonly light: "#b42318";
        readonly dark: "#ff7a6b";
    };
    readonly "status-critical-surface": {
        readonly light: "#fdecea";
        readonly dark: "#3a1d1a";
    };
    readonly "status-warning": {
        readonly light: "#8a5300";
        readonly dark: "#f7b955";
    };
    readonly "status-warning-surface": {
        readonly light: "#fdf3e1";
        readonly dark: "#33270f";
    };
    readonly "status-healthy": {
        readonly light: "#0b6e69";
        readonly dark: "#4fd1c1";
    };
    readonly "status-healthy-surface": {
        readonly light: "#e3f4f2";
        readonly dark: "#0f2e2b";
    };
    readonly "status-unknown": {
        readonly light: "#5b6470";
        readonly dark: "#a3acb8";
    };
    readonly "status-unknown-surface": {
        readonly light: "#eef0f3";
        readonly dark: "#222831";
    };
    readonly "status-info": {
        readonly light: "#3c4654";
        readonly dark: "#c3cad3";
    };
    readonly "status-info-surface": {
        readonly light: "#eceef1";
        readonly dark: "#20252b";
    };
    readonly assistant: {
        readonly light: "#4338ca";
        readonly dark: "#b9b3ff";
    };
    readonly "assistant-surface": {
        readonly light: "#ebeafd";
        readonly dark: "#272552";
    };
    readonly "assistant-surface-hover": {
        readonly light: "#dedcfb";
        readonly dark: "#312e66";
    };
    readonly "chart-1": {
        readonly light: "#2a62c9";
        readonly dark: "#4d8ae6";
    };
    readonly "chart-2": {
        readonly light: "#b23a78";
        readonly dark: "#c95791";
    };
    readonly "chart-3": {
        readonly light: "#6b7a12";
        readonly dark: "#8a9a20";
    };
    readonly "chart-4": {
        readonly light: "#5d1b6a";
        readonly dark: "#cea2d7";
    };
    readonly "chart-5": {
        readonly light: "#225924";
        readonly dark: "#57db5d";
    };
    readonly "chart-other": {
        readonly light: "#9aa1aa";
        readonly dark: "#6b727c";
    };
    readonly "chart-grid": {
        readonly light: "#e6e8eb";
        readonly dark: "#23272b";
    };
};
export type ColorToken = keyof typeof color;
export declare const space: {
    readonly "space-1": "4px";
    readonly "space-2": "8px";
    readonly "space-3": "12px";
    readonly "space-4": "16px";
    readonly "space-6": "24px";
    readonly "space-5": "20px";
    readonly "space-8": "32px";
    readonly "space-12": "48px";
};
export type SpaceToken = keyof typeof space;
export declare const radius: {
    readonly "radius-0": "0px";
    readonly "radius-sm": "4px";
    readonly "radius-md": "6px";
};
export type RadiusToken = keyof typeof radius;
export declare const size: {
    readonly "row-compact": "32px";
    readonly "row-comfortable": "40px";
    readonly "control-compact": "32px";
    readonly "control-comfortable": "36px";
    readonly "topbar-height": "52px";
    readonly "rail-expanded": "232px";
    readonly "rail-collapsed": "56px";
    readonly "drawer-width": "520px";
    readonly "explorer-width": "320px";
    readonly "assistant-width": "400px";
};
export type SizeToken = keyof typeof size;
/** Durations and easings. prefers-reduced-motion sets every duration to 0 ms in tokens.css. */
export declare const motion: {
    readonly "duration-fast": "120ms";
    readonly "duration-base": "160ms";
    readonly "duration-slow": "220ms";
    readonly "duration-spin": "800ms";
    readonly "duration-pulse": "1400ms";
    readonly "ease-standard": "cubic-bezier(0.2, 0, 0, 1)";
    readonly "ease-exit": "cubic-bezier(0.4, 0, 1, 1)";
};
export type MotionToken = keyof typeof motion;
/** Stacking order (z-index) for floating layers. */
export declare const layer: {
    readonly "z-sticky": "1";
    readonly "z-raised": "2";
    readonly "z-chart-tip": "5";
    readonly "z-overlay": "60";
    readonly "z-popover": "70";
    readonly "z-toast": "80";
    readonly "z-tooltip": "90";
};
export type LayerToken = keyof typeof layer;
/** Font presets for data-font on <html> (the app default, or a person's own choice). The first is the default. */
export declare const fonts: readonly [{
    readonly id: "atkinson";
    readonly label: "Atkinson Hyperlegible";
    readonly usage: "Default. Drawn for legibility: distinct letterforms (I l 1, O 0) help low-vision readers and dense data.";
}, {
    readonly id: "inter";
    readonly label: "Inter";
    readonly usage: "A neutral, compact interface face; fits more text per line. Paired with IBM Plex Mono for identifiers.";
}, {
    readonly id: "plex";
    readonly label: "IBM Plex";
    readonly usage: "A technical, slightly condensed face with a matching mono.";
}, {
    readonly id: "system";
    readonly label: "System font";
    readonly usage: "The device's own interface font (San Francisco, Segoe UI, Roboto). Nothing to download.";
}];
export type FontPreset = (typeof fonts)[number]["id"];
/** CSS custom-property reference for a token, e.g. cssVar("chart-1") → "var(--chart-1)". */
export declare const cssVar: (name: ColorToken | SpaceToken | RadiusToken | SizeToken | MotionToken | LayerToken) => string;
//# sourceMappingURL=tokens.d.ts.map