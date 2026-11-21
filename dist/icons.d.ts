import type * as React from "react";
import type { IconProps, EntityKind } from "./types";
declare const P: {
    search: React.JSX.Element;
    "chevron-down": React.JSX.Element;
    "chevron-right": React.JSX.Element;
    "chevron-left": React.JSX.Element;
    "chevron-up": React.JSX.Element;
    x: React.JSX.Element;
    clock: React.JSX.Element;
    refresh: React.JSX.Element;
    bell: React.JSX.Element;
    home: React.JSX.Element;
    siren: React.JSX.Element;
    changes: React.JSX.Element;
    layers: React.JSX.Element;
    server: React.JSX.Element;
    pipeline: React.JSX.Element;
    chip: React.JSX.Element;
    cube: React.JSX.Element;
    database: React.JSX.Element;
    coins: React.JSX.Element;
    target: React.JSX.Element;
    shield: React.JSX.Element;
    grid: React.JSX.Element;
    settings: React.JSX.Element;
    external: React.JSX.Element;
    copy: React.JSX.Element;
    filter: React.JSX.Element;
    more: React.JSX.Element;
    menu: React.JSX.Element;
    user: React.JSX.Element;
    check: React.JSX.Element;
    "arrow-up": React.JSX.Element;
    "arrow-down": React.JSX.Element;
    "arrow-left": React.JSX.Element;
    sort: React.JSX.Element;
    lock: React.JSX.Element;
    book: React.JSX.Element;
    link: React.JSX.Element;
    pause: React.JSX.Element;
    play: React.JSX.Element;
    scale: React.JSX.Element;
    terminal: React.JSX.Element;
    comment: React.JSX.Element;
    page: React.JSX.Element;
    ticket: React.JSX.Element;
    minus: React.JSX.Element;
    "chevrons-left": React.JSX.Element;
    "chevrons-right": React.JSX.Element;
    edit: React.JSX.Element;
    upload: React.JSX.Element;
    calendar: React.JSX.Element;
    plus: React.JSX.Element;
    file: React.JSX.Element;
    building: React.JSX.Element;
    briefcase: React.JSX.Element;
    users: React.JSX.Element;
    flag: React.JSX.Element;
    folder: React.JSX.Element;
    "git-repo": React.JSX.Element;
    globe: React.JSX.Element;
    "level-up": React.JSX.Element;
    columns: React.JSX.Element;
};
declare const S: {
    critical: React.JSX.Element;
    warning: React.JSX.Element;
    healthy: React.JSX.Element;
    unknown: React.JSX.Element;
    info: React.JSX.Element;
};
/** Every icon name: the line set plus the five status glyphs. A typo is a type error, not a silent "x". */
export type IconName = keyof typeof P | keyof typeof S;
export declare function Icon({ name, size, title, className }: IconProps): React.JSX.Element;
/** The line icons (status glyphs excluded), for pickers and docs. */
export declare const iconNames: Array<keyof typeof P>;
/**
 * The icon and word for each kind of owned thing. Kinds are told apart by icon and label, never by colour (Signal keeps
 * colour for status). Use these everywhere an entity is named: trees, the scope picker, table rows, page headers.
 */
export declare const entityIcon: Record<EntityKind, IconName>;
export declare const entityLabel: Record<EntityKind, string>;
export {};
//# sourceMappingURL=icons.d.ts.map