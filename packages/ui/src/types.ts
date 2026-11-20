// Public prop contracts. Ported from the hand-written index.d.ts; the published .d.ts is now generated from source.
import type * as React from "react";
import type { ColorToken } from "./tokens";

export type Status = 'critical' | 'warning' | 'healthy' | 'unknown' | 'info';
export type Density = 'compact' | 'comfortable';
export type ViewState = 'ready' | 'loading' | 'empty' | 'error' | 'no-access';
export type { ColorToken, FontPreset } from "./tokens";
import type { IconName } from "./icons";
export type { IconName } from "./icons";

export interface IconProps { name: IconName; size?: 12 | 14 | 16 | 20; title?: string; className?: string }
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm'; icon?: IconName; iconRight?: IconName; loading?: boolean; forceState?: 'hover' | 'active'; /** render the single child (e.g. a router <a>) with button styling instead of a <button> */ asChild?: boolean }
export interface StatusBadgeProps { status: Status; label?: string; emphasis?: boolean; size?: 'sm'; className?: string }
export interface StatusDotProps { status: Status; label?: string }
export interface SeverityMarkProps { level: 1 | 2 | 3 | 4; showLabel?: boolean; count?: number }
export interface TrendProps { value: number; unit?: string; polarity?: 'up-bad' | 'up-good' | 'neutral'; window?: string; threshold?: number; breach?: boolean }
export interface TooltipProps { content: React.ReactNode; side?: 'top' | 'right' | 'bottom' | 'left'; /** the trigger; must forward a ref and be focusable */ children: React.ReactElement; forceOpen?: boolean }
export interface SegmentedControlProps { /** accessible name of the group, e.g. "Auto-refresh" */ label: string; options: (string | Option)[]; value?: string; defaultValue?: string; onChange?: (v: string) => void; disabled?: boolean; size?: 'sm' }
export interface Option { value: string; label?: string; meta?: string; disabled?: boolean }
export interface MenuSelectProps { label: string; value: string; options: (string | Option)[]; onChange?: (v: string) => void; prefix?: string; icon?: IconName; disabled?: boolean; width?: number; quiet?: boolean; /** preview only: render the menu open */ forceOpen?: boolean }
export interface TimeRangePickerProps { value?: string; refresh?: 'off' | '30s' | '1m' | '5m'; onChange?: (v: string) => void; onRefreshChange?: (v: string) => void; onCopy?: (v: string) => void; ranges?: Option[]; absolute?: string; disabled?: boolean; /** preview only: render the popover open */ forceOpen?: boolean; /** initial "YYYY-MM-DD HH:mm" values for the absolute range (default: the last hour) */ defaultAbsolute?: AbsoluteRange; /** called with a validated absolute range when the user presses Apply */ onAbsoluteChange?: (r: AbsoluteRange) => void }
/** Local time in the browser's zone, "YYYY-MM-DD HH:mm". */
export interface AbsoluteRange { from: string; to: string }
export interface Scope { env: string; cloud: string; cluster: string }
export interface ScopeSwitcherProps { scope: Scope; options: { env: Option[]; cloud: Option[]; cluster: Option[] }; onChange?: (s: Scope) => void; compact?: boolean }
export interface SearchItem { label: string; kind?: string; status?: Status; /** unique key when labels repeat (default kind + label) */ id?: string; /** results are sectioned by group, e.g. "Commands", "Runs" */ group?: string; /** a muted second line */ description?: string; /** extra words that match, e.g. synonyms */ keywords?: string[]; /** shown on the right instead of the kind, e.g. "G I" */ shortcut?: string; /** leading icon when there's no status */ icon?: IconName; /** makes the item a command: run on select */ onRun?: () => void }
export interface GlobalSearchProps { items?: SearchItem[]; onSelect?: (i: SearchItem) => void; placeholder?: string; /** preview only: start with this query and the results open */ forceQuery?: string; /** extra text after "No match for …", e.g. what can be searched */ emptyHint?: string; /** shown under "Recent" when the box is focused and empty */ recent?: SearchItem[]; /** shows "Searching…" (while you fetch results for onQueryChange) */ loading?: boolean; /** called on every keystroke, e.g. to fetch results */ onQueryChange?: (q: string) => void; /** filter items locally (default true); false shows items as given */ filter?: boolean; /** most results shown (default 7) */ limit?: number; /** Ctrl+K / ⌘K focuses this box (default true) */ shortcut?: boolean; /** accessible name (default "Search") */ label?: string }
export interface FilterBarProps { filters: { key: string; label: string; options: (string | Option)[] }[]; values: Record<string, string>; onChange?: (v: Record<string, string>) => void; query?: string; onQuery?: (q: string) => void; queryPlaceholder?: string; count?: string; onClear?: () => void; /** extra controls rendered after the filters */ children?: React.ReactNode }
export interface BreadcrumbsProps { items: { label: string; href?: string; mono?: boolean }[]; onNavigate?: (item: { label: string; href?: string; mono?: boolean }) => void }
export interface TabsProps { tabs: { value: string; label: string; count?: number | string; tone?: 'critical'; disabled?: boolean }[]; value: string; onChange?: (v: string) => void; size?: 'sm'; /** accessible name of the tab list */ label?: string; /** <TabPanel> elements; links each tab to its panel */ children?: React.ReactNode }
export interface PanelProps { title?: string; meta?: React.ReactNode; actions?: React.ReactNode; footer?: React.ReactNode; flush?: boolean; className?: string; /** id for the title; the panel is labelled by it */ id?: string; children?: React.ReactNode }
export interface MetricProps { label?: string; scope?: string; value?: string; unit?: string; delta?: TrendProps; target?: string; status?: Status; statusLabel?: string; freshness?: string; action?: string; onAction?: () => void; spark?: { points: number[]; threshold?: number }; state?: 'ready' | 'loading' | 'degraded' | 'error'; compact?: boolean }
export interface StateBlockProps { kind: 'loading' | 'empty' | 'error' | 'no-access' | 'degraded'; title?: string; body?: React.ReactNode; detail?: string; action?: string; onAction?: () => void; secondary?: string; onSecondary?: () => void; inline?: boolean; rows?: number }
export interface AlertBannerProps { tone: 'critical' | 'warning' | 'info' | 'healthy'; title: string; children?: React.ReactNode; meta?: string; action?: string; onAction?: () => void; onDismiss?: () => void }
export interface ToastProps { tone?: Status; title: string; body?: string; action?: string; onAction?: () => void; onClose?: () => void }
export interface DrawerProps { open: boolean; title: string; subtitle?: string; onClose: () => void; footer?: React.ReactNode; width?: number; contained?: boolean; children?: React.ReactNode }
export interface ModalProps { open: boolean; title: string; onClose: () => void; actions?: React.ReactNode; tone?: 'critical'; contained?: boolean; children?: React.ReactNode }
export interface SparklineProps { points: number[]; width?: number; height?: number; threshold?: number; tone?: Status; label?: string }
export interface Column<T> { key: string; header: string; sortable?: boolean; sortValue?: (r: T) => SortValue; defaultDir?: 'asc' | 'desc'; align?: 'left' | 'right'; /** identifiers only */ mono?: boolean; /** numbers: tabular, no wrap */ num?: boolean; /** never wrap the cell */ nowrap?: boolean; width?: number; className?: string; render?: (r: T) => React.ReactNode; /** not shown (see also DataTable hiddenColumns) */ hidden?: boolean; /** false keeps it on in ColumnsMenu */ hideable?: boolean; /** "start" keeps the column visible while the table scrolls sideways (first column only) */ pin?: 'start' }
export type SortValue = string | number | boolean | Date | null | undefined;
export interface DataTableSort { key: string; dir: 'asc' | 'desc' }
export interface DataTableProps<T> {
  columns: Column<T>[]; rows: T[]; rowKey?: string; defaultSort?: DataTableSort; renderExpanded?: (r: T) => React.ReactNode; pageSize?: number; onRowClick?: (r: T) => void; rowTone?: (r: T) => 'critical' | null; state?: 'ready' | 'loading' | 'error' | 'empty'; emptyTitle?: string; emptyBody?: string; errorDetail?: string; onRetry?: () => void; caption?: string; density?: Density; /** the active (opened) row */ selectedKey?: string; stickyHeader?: boolean;
  /** controlled sort; pair with onSortChange */ sort?: DataTableSort | null; onSortChange?: (s: DataTableSort) => void;
  /** rows are already sorted and paged (server-side): give totalRows and handle onSortChange / onPageChange */ manual?: boolean; totalRows?: number;
  /** controlled page, 1-based */ page?: number; onPageChange?: (page: number) => void; /** offers a page-size menu */ pageSizeOptions?: number[]; onPageSizeChange?: (size: number) => void;
  /** adds a checkbox column */ selection?: 'multiple'; selectedKeys?: string[]; defaultSelectedKeys?: string[]; onSelectionChange?: (keys: string[]) => void;
  /** actions for the selected rows, shown in a bar above the table while any are selected */ bulkActions?: (keys: string[], rows: T[]) => React.ReactNode;
  /** a trailing "⋯" menu per row */ rowActions?: (r: T) => ActionMenuEntry[];
  /** how a row is named in labels ("Select run_8f3k2", "Actions for run_8f3k2"); default the rowKey value */ rowLabel?: (r: T) => string;
  /** column keys to hide (see ColumnsMenu) */ hiddenColumns?: string[];
}
export interface PaginationProps { /** 1-based */ page: number; pageSize: number; /** total rows */ total: number; onPageChange?: (page: number) => void; pageSizeOptions?: number[]; onPageSizeChange?: (size: number) => void; /** first/last buttons and "Page x of y" (default true) */ firstLast?: boolean; /** accessible name (default "Pagination") */ label?: string }
export interface ColumnsMenuProps<T> { columns: Column<T>[]; /** hidden column keys */ hidden: string[]; onChange: (hidden: string[]) => void; /** button text (default "Columns") */ label?: string }
export interface ChartMarker { index: number; label: string }
export interface LegendProps { items: { name: string; color?: ColorToken; dashed?: boolean }[]; /** line swatches instead of squares */ line?: boolean }
export interface TimeSeriesChartProps { series: { name: string; points: (number | null)[]; color?: ColorToken; dashed?: boolean }[]; labels: string[]; unit?: string; height?: number; threshold?: { value: number; label: string }; markers?: ChartMarker[]; yMax?: number; yMin?: number; onMarker?: (m: ChartMarker) => void; onBrush?: (from: number, to: number) => void; highlight?: [number, number]; /** shaded y band [from, to], e.g. a normal range */ band?: [number, number]; ariaLabel: string; decimals?: number; state?: ViewState; /** 'Show table' toggle, default true */ table?: boolean; /** direct end labels for 2–4 series when they don't collide, default true */ endLabels?: boolean }
export interface BarChartProps { categories: string[]; series: { name: string; values: number[]; color: ColorToken; pattern?: 'hatch' | 'dots' }[]; stacked?: boolean; height?: number; unit?: string; ariaLabel?: string; onBar?: (c: string, i: number) => void; state?: ViewState; /** opt-in hatch textures for print / forced colours */ textures?: boolean; /** 'Show table' toggle, default true */ table?: boolean }
export interface HeatmapProps { rows: string[]; cols: string[]; values: (number | null)[][]; unit?: string; max?: number; ariaLabel: string; /** 'Show table' toggle, default true */ table?: boolean }
export interface StatusGridRow { key: string; label: string }
export interface StatusGridProps { rows: StatusGridRow[]; cols: string[]; cells: Status[][]; /** makes cells keyboard-navigable targets */ onCell?: (row: StatusGridRow, col: string, s: Status) => void; ariaLabel: string; rowLabelWidth?: number; /** 'Show table' toggle, default true */ table?: boolean }
export interface RunStripProps { runs: Status[]; labels?: string[]; name?: string }
export interface BulletBarProps { used: number; requested: number; limit: number; unit?: string; warnAt?: number; critAt?: number; label?: string }
export interface TimelineEvent { time: string; kind: 'alert' | 'warn' | 'deploy' | 'config' | 'scale' | 'page' | 'ack' | 'ticket' | 'comment' | 'resolve' | 'info'; title: string; body?: string; actor?: string; tag?: string; link?: boolean; highlight?: boolean }
export interface TimelineProps { events: TimelineEvent[]; onEvent?: (e: TimelineEvent) => void; dense?: boolean }
export interface NavItem { key: string; label: string; icon: IconName }
export interface NavGroup { group: string | null; items: NavItem[] }
export interface SideNavProps { active: string; onNavigate?: (key: string) => void; collapsed?: boolean; badges?: Record<string, { count: number; tone?: 'critical' }>; nav?: NavGroup[]; /** set by AppShell below 1024 px */ overlay?: boolean; onClose?: () => void }
export interface TopBarProps { scope: Scope; scopeOptions: ScopeSwitcherProps['options']; onScope?: (s: Scope) => void; time?: string; onTime?: (t: string) => void; refresh?: TimeRangePickerProps['refresh']; onRefresh?: (r: string) => void; searchItems?: SearchItem[]; onSearch?: (i: SearchItem) => void; alerts?: number; onAlerts?: () => void; onCopyRange?: () => void; /** avatar initials */ user?: string; /** accessible name of the account button, e.g. "Account: Dev A" (default "Account") */ accountLabel?: string; /** who is signed in; the account button then opens a menu with this header and `items` (switch organization, preferences, sign out) */ account?: TopBarAccount; /** set by AppShell */ onMenu?: () => void; /** set by AppShell from its width */ mode?: ShellMode }
export type ShellMode = 'full' | 'collapsed' | 'tablet';
/** The signed-in person, shown at the top of the account menu. */
export interface TopBarAccount { name: string; email?: string; /** their role in the current organization, e.g. "Owner" */ role?: string; /** the current organization */ org?: string; items?: ActionMenuEntry[] }
export interface AppShellProps { nav: React.ReactElement<SideNavProps>; top: React.ReactElement<TopBarProps>; density?: Density; forceWidth?: number; children?: React.ReactNode }
export interface PageHeaderField { label: string; value: React.ReactNode; mono?: boolean }
export interface PageHeaderProps { crumbs?: React.ReactNode; back?: React.ReactNode; title: string; titleMono?: boolean; status?: React.ReactNode; /** a short sentence, or labelled fields (preferred) */ meta?: React.ReactNode | PageHeaderField[]; actions?: React.ReactNode; tabs?: React.ReactNode }

export interface SkeletonProps { w?: string | number; h?: string | number; style?: React.CSSProperties }
export interface ToastRegionProps { children?: React.ReactNode }

/* ---------- Form controls ---------- */
/** Shared by every form control: a visible label (or a visually hidden one), optional hint and error text. */
export interface FieldProps { label: string; /** keep the label for screen readers only */ hideLabel?: boolean; hint?: string; /** shown in status-critical with an icon; sets aria-invalid */ error?: string; /** shows a muted "Required" after the label and sets aria-required */ required?: boolean }
/** What Field passes to its control: spread it on the focusable element. */
export interface FieldControlProps { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean; 'aria-required'?: boolean }
export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, FieldProps {}
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, FieldProps {}
export interface SelectProps extends FieldProps { options: (string | Option)[]; value?: string; defaultValue?: string; onChange?: (v: string) => void; placeholder?: string; disabled?: boolean; required?: boolean; name?: string; id?: string; className?: string }
export interface CheckboxProps extends FieldProps { /** "indeterminate" shows a dash: some, not all, are selected */ checked?: boolean | 'indeterminate'; defaultChecked?: boolean; onChange?: (checked: boolean) => void; disabled?: boolean; required?: boolean; name?: string; value?: string; id?: string }
export interface SwitchProps extends Omit<FieldProps, 'hideLabel' | 'required'> { checked?: boolean; defaultChecked?: boolean; onChange?: (on: boolean) => void; disabled?: boolean; name?: string; id?: string }

/* ---------- Actions, feedback, content ---------- */
export interface ActionMenuItem { label: string; icon?: IconName; onSelect?: () => void; disabled?: boolean; /** destructive actions */ tone?: 'critical'; /** shown on the right, e.g. "⌘D" */ shortcut?: string; /** muted text on the right, e.g. a role */ meta?: string; /** shows a tick and is announced as checked: the current choice, e.g. the active organization */ checked?: boolean }
/** A group heading inside a menu, e.g. "Switch organization". */
export interface ActionMenuHeading { heading: string }
/** A menu entry, a group heading, or "separator" for a divider line. */
export type ActionMenuEntry = ActionMenuItem | ActionMenuHeading | 'separator';
export interface ActionMenuProps { items: ActionMenuEntry[]; /** accessible name of the default "⋯" button (default "More actions") */ label?: string; /** your own trigger, e.g. <Button>Actions</Button>; must forward a ref */ trigger?: React.ReactElement; align?: 'start' | 'end'; /** non-interactive content above the items, e.g. who is signed in */ header?: React.ReactNode; /** preview only: render the menu open */ forceOpen?: boolean }
export interface CopyButtonProps { /** the text that is copied */ value: string; /** accessible name for the icon-only form, e.g. "Copy run id" (default "Copy") */ label?: string; /** shown as the button text (e.g. the id itself); omit for an icon-only button */ children?: React.ReactNode; onCopy?: (value: string) => void }
export interface TagProps { children: React.ReactNode; /** identifiers: branch, commit, label selector */ mono?: boolean; /** shows a remove (×) button */ onRemove?: () => void; /** accessible name of the remove button (default "Remove <text>") */ removeLabel?: string }
export interface CodeBlockProps { code: string; /** shown in the header bar, e.g. a file name or "Build log" */ title?: string; /** default: on when there is more than one line */ lineNumbers?: boolean; /** start with long lines wrapped (a toggle is always shown) */ wrap?: boolean; /** px; the block scrolls beyond it (default 320) */ maxHeight?: number; /** 1-based line numbers to highlight */ highlight?: number[]; /** show a copy button (default true) */ copy?: boolean }
export interface ToastOptions { tone?: Status; title: string; body?: string; /** action button label, e.g. "Undo" */ action?: string; onAction?: () => void; /** ms before it hides; null keeps it until closed. Default 6000, and null for critical */ duration?: number | null }
/* ---------- Popover ---------- */
export interface PopoverProps {
  /** the element that opens it; must forward a ref (Button does) */
  trigger: React.ReactElement;
  children?: React.ReactNode;
  /** accessible name of the popover dialog */
  label: string;
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  side?: 'top' | 'right' | 'bottom' | 'left'; align?: 'start' | 'center' | 'end';
  /** px; default fits the content (max 360) */
  width?: number;
  /** preview only: render it open */
  forceOpen?: boolean;
  className?: string;
}
export interface ToasterProps { /** most toasts shown at once (default 3) */ max?: number; /** position inside the nearest positioned parent instead of the window (demos) */ contained?: boolean }
