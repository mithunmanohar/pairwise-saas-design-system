import type { SideNavProps, TopBarProps, AppShellProps, PageHeaderProps, NavGroup } from "./types";
import * as React from "react";
export declare const NAV: NavGroup[];
export declare function SideNav({ active, onNavigate, collapsed, badges, nav, onClose, overlay }: SideNavProps): React.JSX.Element;
export declare function TopBar({ ownership, runtime, scope, scopeOptions, onScope, time, onTime, refresh, onRefresh, searchItems, searchRecent, onSearch, alerts, user, accountLabel, account, onMenu, mode, onAlerts, onCopyRange, assistant }: TopBarProps): React.JSX.Element;
/** Where AppShell places the assistant, for an AssistantPanel anywhere inside its `assistant` slot (wrappers allowed). */
export declare const AssistantSlot: React.Context<{
    placement: "docked" | "overlay";
    setCovering: (covering: boolean) => void;
} | null>;
export declare function AppShell({ nav, top, children, density, forceWidth, assistant }: AppShellProps): React.JSX.Element;
export declare function PageHeader({ kind, crumbs, title, titleMono, status, meta, actions, tabs, back }: PageHeaderProps): React.JSX.Element;
//# sourceMappingURL=shell.d.ts.map