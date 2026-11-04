import type { SideNavProps, TopBarProps, AppShellProps, PageHeaderProps, NavGroup } from "./types";
import * as React from "react";
export declare const NAV: NavGroup[];
export declare function SideNav({ active, onNavigate, collapsed, badges, nav, onClose, overlay }: SideNavProps): React.JSX.Element;
export declare function TopBar({ scope, scopeOptions, onScope, time, onTime, refresh, onRefresh, searchItems, onSearch, alerts, user, accountLabel, onMenu, mode, onAlerts, onCopyRange }: TopBarProps): React.JSX.Element;
export declare function AppShell({ nav, top, children, density, forceWidth }: AppShellProps): React.JSX.Element;
export declare function PageHeader({ crumbs, title, titleMono, status, meta, actions, tabs, back }: PageHeaderProps): React.JSX.Element;
//# sourceMappingURL=shell.d.ts.map