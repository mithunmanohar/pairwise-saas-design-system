import type { PopoverProps, ButtonProps, StatusBadgeProps, StatusDotProps, SeverityMarkProps, TrendProps, TooltipProps, SegmentedControlProps, MenuSelectProps, TimeRangePickerProps, ScopeSwitcherProps, GlobalSearchProps, FilterBarProps, BreadcrumbsProps, TabsProps, PanelProps, MetricProps, StateBlockProps, AlertBannerProps, ToastProps, DrawerProps, ModalProps, SparklineProps, SkeletonProps, ToastRegionProps } from "./types";
import * as React from "react";
export declare const cx: (...a: Array<string | false | null | undefined | 0>) => string;
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
export declare function Popover({ trigger, children, label, open, defaultOpen, onOpenChange, side, align, width, forceOpen, className }: PopoverProps): React.JSX.Element;
/** Wraps an element inside a Popover so activating it closes the popover: <PopoverClose><Button>Done</Button></PopoverClose>. */
export declare function PopoverClose({ children }: {
    children: React.ReactElement;
}): React.JSX.Element;
export declare function StatusBadge({ status, label, emphasis, size, className }: StatusBadgeProps): React.JSX.Element;
export declare function StatusDot({ status, label }: StatusDotProps): React.JSX.Element;
export declare function SeverityMark({ level, showLabel, count }: SeverityMarkProps): React.JSX.Element;
export declare function Trend({ value, unit, polarity, window: win, threshold, breach }: TrendProps): React.JSX.Element;
export declare function TooltipProvider({ children, delay }: {
    children?: React.ReactNode; /** ms before a tooltip opens (default 400) */
    delay?: number;
}): React.JSX.Element;
export declare function Tooltip({ content, children, side, forceOpen }: TooltipProps): React.JSX.Element;
export declare function MenuSelect({ label, value, options, onChange, icon, disabled, width, prefix, forceOpen, quiet }: MenuSelectProps): React.JSX.Element;
export declare function SegmentedControl({ label, value, defaultValue, onChange, options, disabled, size }: SegmentedControlProps): React.JSX.Element;
export declare const TIME_RANGES: {
    value: string;
    label: string;
}[];
export declare function TimeRangePicker({ value, refresh, onChange, onRefreshChange, onCopy, ranges, forceOpen, disabled, absolute, defaultAbsolute, onAbsoluteChange }: TimeRangePickerProps): React.JSX.Element;
export declare function ScopeSwitcher({ scope, options, onChange, compact, dimensions, label }: ScopeSwitcherProps): React.JSX.Element;
export declare function useCmdkHighlight(keys: string[]): {
    value: string;
    onValueChange: (v: string) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onPointerMoveCapture: () => void;
    onQuery: () => void;
};
export declare function useCmdkAria(inputRef: React.RefObject<HTMLInputElement>, open: boolean | null): (list: HTMLDivElement | null) => void;
export declare function GlobalSearch({ items, onSelect, placeholder, forceQuery, emptyHint, recent, loading, onQueryChange, filter, limit, shortcut, label }: GlobalSearchProps): React.JSX.Element;
export declare function FilterBar({ filters, values, onChange, query, onQuery, queryPlaceholder, onClear, count, children }: FilterBarProps): React.JSX.Element;
export declare function Breadcrumbs({ items, onNavigate, maxItems }: BreadcrumbsProps): React.JSX.Element;
export declare function Tabs({ tabs, value, onChange, size, label, children }: TabsProps): React.JSX.Element;
/** The content for one tab; render inside <Tabs>. Focusable, labelled by its tab. */
export declare function TabPanel({ value, children, className }: {
    value: string;
    children?: React.ReactNode;
    className?: string;
}): React.JSX.Element;
export declare function Panel({ title, meta, actions, children, flush, className, footer, id }: PanelProps): React.JSX.Element;
export declare function Metric({ label, scope, value, unit, delta, target, status, statusLabel, freshness, action, onAction, spark, state, compact }: MetricProps): React.JSX.Element;
export declare function Skeleton({ w, h: ht, style }: SkeletonProps): React.JSX.Element;
export declare function StateBlock({ kind, title, body, action, onAction, secondary, onSecondary, detail, rows, inline }: StateBlockProps): React.JSX.Element;
export declare function AlertBanner({ tone, title, children, action, onAction, onDismiss, meta }: AlertBannerProps): React.JSX.Element;
export declare function Toast({ tone, title, body, action, onAction, onClose }: ToastProps): React.JSX.Element;
export declare function ToastRegion({ children }: ToastRegionProps): React.JSX.Element;
export declare function Drawer({ open, title, subtitle, onClose, children, footer, width, contained }: DrawerProps): React.JSX.Element;
export declare function Modal({ open, title, onClose, children, actions, contained, tone }: ModalProps): React.JSX.Element;
export declare function Sparkline({ points, width, height, threshold, tone, label }: SparklineProps): React.JSX.Element | null;
//# sourceMappingURL=core.d.ts.map