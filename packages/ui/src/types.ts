// Public prop contracts. Ported from the hand-written index.d.ts; the published .d.ts is now generated from source.
import type * as React from "react";

export type Status = 'critical' | 'warning' | 'healthy' | 'unknown' | 'info';
export type Density = 'compact' | 'comfortable';
export type ViewState = 'ready' | 'loading' | 'empty' | 'error' | 'no-access';
export type { ColorToken } from "./tokens";

export interface IconProps { name: string; size?: 12 | 14 | 16 | 20; title?: string; className?: string }
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm'; icon?: string; iconRight?: string; loading?: boolean; forceState?: 'hover' | 'active' }
export interface StatusBadgeProps { status: Status; label?: string; emphasis?: boolean; size?: 'sm' }
export interface StatusDotProps { status: Status; label?: string }
export interface SeverityMarkProps { level: 1 | 2 | 3 | 4; showLabel?: boolean; count?: number }
export interface TrendProps { value: number; unit?: string; polarity?: 'up-bad' | 'up-good' | 'neutral'; window?: string; threshold?: number; breach?: boolean }
export interface TooltipProps { content: React.ReactNode; side?: 'top' | 'right' | 'bottom'; children: React.ReactElement; forceOpen?: boolean }
export interface Option { value: string; label?: string; meta?: string }
export interface MenuSelectProps { label: string; value: string; options: (string | Option)[]; onChange?: (v: string) => void; prefix?: string; icon?: string; disabled?: boolean; width?: number; quiet?: boolean }
export interface TimeRangePickerProps { value?: string; refresh?: 'off' | '30s' | '1m' | '5m'; onChange?: (v: string) => void; onRefreshChange?: (v: string) => void; onCopy?: (v: string) => void; ranges?: Option[]; absolute?: string; disabled?: boolean }
export interface Scope { env: string; cloud: string; cluster: string }
export interface ScopeSwitcherProps { scope: Scope; options: { env: Option[]; cloud: Option[]; cluster: Option[] }; onChange?: (s: Scope) => void; compact?: boolean }
export interface SearchItem { label: string; kind?: string; status?: Status }
export interface GlobalSearchProps { items?: SearchItem[]; onSelect?: (i: SearchItem) => void; placeholder?: string }
export interface FilterBarProps { filters: { key: string; label: string; options: (string | Option)[] }[]; values: Record<string, string>; onChange?: (v: Record<string, string>) => void; query?: string; onQuery?: (q: string) => void; queryPlaceholder?: string; count?: string; onClear?: () => void }
export interface BreadcrumbsProps { items: { label: string; href?: string; mono?: boolean }[]; onNavigate?: (item: { label: string; href?: string; mono?: boolean }) => void }
export interface TabsProps { tabs: { value: string; label: string; count?: number | string; tone?: 'critical'; disabled?: boolean }[]; value: string; onChange?: (v: string) => void; size?: 'sm' }
export interface PanelProps { title?: string; meta?: React.ReactNode; actions?: React.ReactNode; footer?: React.ReactNode; flush?: boolean; children?: React.ReactNode }
export interface MetricProps { label?: string; scope?: string; value?: string; unit?: string; delta?: TrendProps; target?: string; status?: Status; statusLabel?: string; freshness?: string; action?: string; onAction?: () => void; spark?: { points: number[]; threshold?: number }; state?: 'ready' | 'loading' | 'degraded' | 'error' }
export interface StateBlockProps { kind: 'loading' | 'empty' | 'error' | 'no-access' | 'degraded'; title?: string; body?: React.ReactNode; detail?: string; action?: string; onAction?: () => void; secondary?: string; onSecondary?: () => void; inline?: boolean; rows?: number }
export interface AlertBannerProps { tone: 'critical' | 'warning' | 'info' | 'healthy'; title: string; children?: React.ReactNode; meta?: string; action?: string; onAction?: () => void; onDismiss?: () => void }
export interface ToastProps { tone?: Status; title: string; body?: string; action?: string; onAction?: () => void; onClose?: () => void }
export interface DrawerProps { open: boolean; title: string; subtitle?: string; onClose: () => void; footer?: React.ReactNode; width?: number; contained?: boolean; children?: React.ReactNode }
export interface ModalProps { open: boolean; title: string; onClose: () => void; actions?: React.ReactNode; tone?: 'critical'; contained?: boolean; children?: React.ReactNode }
export interface SparklineProps { points: number[]; width?: number; height?: number; threshold?: number; tone?: Status; label?: string }
export interface Column<T> { key: string; header: string; sortable?: boolean; sortValue?: (r: T) => any; defaultDir?: 'asc' | 'desc'; align?: 'left' | 'right'; /** identifiers only */ mono?: boolean; /** numbers: tabular, no wrap */ num?: boolean; width?: number; className?: string; render?: (r: T) => React.ReactNode }
export interface DataTableProps<T = any> { columns: Column<T>[]; rows: T[]; rowKey?: string; defaultSort?: { key: string; dir: 'asc' | 'desc' }; renderExpanded?: (r: T) => React.ReactNode; pageSize?: number; onRowClick?: (r: T) => void; rowTone?: (r: T) => 'critical' | null; state?: 'ready' | 'loading' | 'error'; emptyTitle?: string; emptyBody?: string; errorDetail?: string; onRetry?: () => void; caption?: string; density?: Density; selectedKey?: string }
export interface TimeSeriesChartProps { series: { name: string; points: (number | null)[]; color?: ColorToken; dashed?: boolean }[]; labels: string[]; unit?: string; height?: number; threshold?: { value: number; label: string }; markers?: { index: number; label: string }[]; yMax?: number; yMin?: number; onMarker?: (m: any) => void; onBrush?: (from: number, to: number) => void; highlight?: [number, number]; ariaLabel: string; decimals?: number; state?: ViewState; /** 'Show table' toggle, default true */ table?: boolean; /** direct end labels for 2–4 series when they don't collide, default true */ endLabels?: boolean }
export interface BarChartProps { categories: string[]; series: { name: string; values: number[]; color: ColorToken; pattern?: 'hatch' | 'dots' }[]; stacked?: boolean; height?: number; unit?: string; ariaLabel?: string; onBar?: (c: string, i: number) => void; state?: ViewState; /** opt-in hatch textures for print / forced colours */ textures?: boolean }
export interface HeatmapProps { rows: string[]; cols: string[]; values: (number | null)[][]; unit?: string; max?: number; ariaLabel: string }
export interface StatusGridProps { rows: { key: string; label: string }[]; cols: string[]; cells: Status[][]; onCell?: (row: any, col: string, s: Status) => void; ariaLabel: string; rowLabelWidth?: number }
export interface RunStripProps { runs: Status[]; labels?: string[]; name?: string }
export interface BulletBarProps { used: number; requested: number; limit: number; unit?: string; warnAt?: number; critAt?: number; label?: string }
export interface TimelineEvent { time: string; kind: 'alert' | 'warn' | 'deploy' | 'config' | 'scale' | 'page' | 'ack' | 'ticket' | 'comment' | 'resolve' | 'info'; title: string; body?: string; actor?: string; tag?: string; link?: boolean; highlight?: boolean }
export interface TimelineProps { events: TimelineEvent[]; onEvent?: (e: TimelineEvent) => void; dense?: boolean }
export interface SideNavProps { active: string; onNavigate?: (key: string) => void; collapsed?: boolean; badges?: Record<string, { count: number; tone?: 'critical' }>; nav?: any[] }
export interface TopBarProps { scope: Scope; scopeOptions: ScopeSwitcherProps['options']; onScope?: (s: Scope) => void; time?: string; onTime?: (t: string) => void; refresh?: string; onRefresh?: (r: string) => void; searchItems?: SearchItem[]; onSearch?: (i: SearchItem) => void; alerts?: number; onAlerts?: () => void; onCopyRange?: () => void }
export interface AppShellProps { nav: React.ReactElement<SideNavProps>; top: React.ReactElement<TopBarProps>; density?: Density; forceWidth?: number; children?: React.ReactNode }
export interface PageHeaderProps { crumbs?: React.ReactNode; back?: React.ReactNode; title: string; titleMono?: boolean; status?: React.ReactNode; /** a short sentence, or labelled fields (preferred) */ meta?: React.ReactNode | { label: string; value: React.ReactNode; mono?: boolean }[]; actions?: React.ReactNode; tabs?: React.ReactNode }

type FC<P> = (props: P) => React.ReactElement | null;
