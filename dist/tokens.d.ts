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
};
export type SizeToken = keyof typeof size;
/** CSS custom-property reference for a token, e.g. cssVar("chart-1") → "var(--chart-1)". */
export declare const cssVar: (name: ColorToken | SpaceToken | RadiusToken | SizeToken) => string;
//# sourceMappingURL=tokens.d.ts.map