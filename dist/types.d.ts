import type * as React from "react";
import type { ColorToken } from "./tokens";
export type Status = 'critical' | 'warning' | 'healthy' | 'unknown' | 'info';
export type Density = 'compact' | 'comfortable';
export type ViewState = 'ready' | 'loading' | 'empty' | 'error' | 'no-access';
export type { ColorToken, FontPreset } from "./tokens";
import type { IconName } from "./icons";
export type { IconName } from "./icons";
export interface IconProps {
    name: IconName;
    size?: 12 | 14 | 16 | 20;
    title?: string;
    className?: string;
}
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm';
    icon?: IconName;
    iconRight?: IconName;
    loading?: boolean;
    forceState?: 'hover' | 'active'; /** render the single child (e.g. a router <a>) with button styling instead of a <button> */
    asChild?: boolean;
}
export interface StatusBadgeProps {
    status: Status;
    label?: string;
    emphasis?: boolean;
    size?: 'sm';
    className?: string;
}
export interface StatusDotProps {
    status: Status;
    label?: string;
}
export interface SeverityMarkProps {
    level: 1 | 2 | 3 | 4;
    showLabel?: boolean;
    count?: number;
}
export interface TrendProps {
    value: number;
    unit?: string;
    polarity?: 'up-bad' | 'up-good' | 'neutral';
    window?: string;
    threshold?: number;
    breach?: boolean;
}
export interface TooltipProps {
    content: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left'; /** the trigger; must forward a ref and be focusable */
    children: React.ReactElement;
    forceOpen?: boolean;
}
export interface SegmentedControlProps {
    label: string;
    options: (string | Option)[];
    value?: string;
    defaultValue?: string;
    onChange?: (v: string) => void;
    disabled?: boolean;
    size?: 'sm';
}
export interface Option {
    value: string;
    label?: string;
    meta?: string;
    disabled?: boolean;
}
export interface MenuSelectProps {
    label: string;
    value: string;
    options: (string | Option)[];
    onChange?: (v: string) => void;
    prefix?: string;
    icon?: IconName;
    disabled?: boolean;
    width?: number;
    quiet?: boolean; /** preview only: render the menu open */
    forceOpen?: boolean;
}
export interface TimeRangePickerProps {
    value?: string;
    refresh?: 'off' | '30s' | '1m' | '5m';
    onChange?: (v: string) => void;
    onRefreshChange?: (v: string) => void;
    onCopy?: (v: string) => void;
    ranges?: Option[];
    absolute?: string;
    disabled?: boolean; /** preview only: render the popover open */
    forceOpen?: boolean; /** initial "YYYY-MM-DD HH:mm" values for the absolute range (default: the last hour) */
    defaultAbsolute?: AbsoluteRange; /** called with a validated absolute range when the user presses Apply */
    onAbsoluteChange?: (r: AbsoluteRange) => void;
}
/** Local time in the browser's zone, "YYYY-MM-DD HH:mm". */
export interface AbsoluteRange {
    from: string;
    to: string;
}
export interface Scope {
    env: string;
    cloud: string;
    cluster: string;
}
export type ScopeOptions = {
    env: Option[];
    cloud: Option[];
    cluster: Option[];
};
/** One runtime dimension (environment, region, cluster, namespace…): a quiet menu in the runtime scope. */
export interface ScopeDimension {
    key: string;
    label: string;
    value: string;
    options: (string | Option)[];
    onChange?: (value: string) => void;
}
/** Runtime scope: where things run. Pass `dimensions` for any set of dimensions, or the 1.x `scope` + `options` (environment / cloud / cluster). */
export interface ScopeSwitcherProps {
    scope?: Scope;
    options?: ScopeOptions;
    onChange?: (s: Scope) => void; /** any runtime dimensions, in order; replaces scope / options */
    dimensions?: ScopeDimension[]; /** show only the first two dimensions (narrow top bars) */
    compact?: boolean; /** accessible name of the group (default "Environment") */
    label?: string;
}
/** Kinds of owned thing, for icons and labels (entityIcon, entityLabel). Organisation units first, then resources. */
export type EntityKind = 'company' | 'function' | 'squad' | 'initiative' | 'project' | 'repository' | 'pipeline' | 'webapp' | 'infrastructure' | 'dataset' | 'model' | 'resources';
export interface SearchItem {
    label: string;
    kind?: string;
    status?: Status; /** unique key when labels repeat (default kind + label) */
    id?: string; /** results are sectioned by group, e.g. "Commands", "Runs" */
    group?: string; /** a muted second line */
    description?: string; /** extra words that match, e.g. synonyms */
    keywords?: string[]; /** shown on the right instead of the kind, e.g. "G I" */
    shortcut?: string; /** leading icon when there's no status */
    icon?: IconName; /** makes the item a command: run on select */
    onRun?: () => void;
}
export interface GlobalSearchProps {
    items?: SearchItem[];
    onSelect?: (i: SearchItem) => void;
    placeholder?: string; /** preview only: start with this query and the results open */
    forceQuery?: string; /** extra text after "No match for …", e.g. what can be searched */
    emptyHint?: string; /** shown under "Recent" when the box is focused and empty */
    recent?: SearchItem[]; /** shows "Searching…" (while you fetch results for onQueryChange) */
    loading?: boolean; /** called on every keystroke, e.g. to fetch results */
    onQueryChange?: (q: string) => void; /** filter items locally (default true); false shows items as given */
    filter?: boolean; /** most results shown (default 7) */
    limit?: number; /** Ctrl+K / ⌘K focuses this box (default true) */
    shortcut?: boolean; /** accessible name (default "Search") */
    label?: string;
}
export interface FilterBarProps {
    filters: {
        key: string;
        label: string;
        options: (string | Option)[];
    }[];
    values: Record<string, string>;
    onChange?: (v: Record<string, string>) => void;
    query?: string;
    onQuery?: (q: string) => void;
    queryPlaceholder?: string;
    count?: string;
    onClear?: () => void; /** extra controls rendered after the filters */
    children?: React.ReactNode;
}
export interface BreadcrumbItem {
    label: string;
    href?: string;
    mono?: boolean; /** a leading icon, e.g. entityIcon[kind] */
    icon?: IconName;
}
export interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    onNavigate?: (item: BreadcrumbItem) => void; /** show at most this many; the earlier levels fold into a "…" menu (the current page always shows) */
    maxItems?: number;
}
export interface TabsProps {
    tabs: {
        value: string;
        label: string;
        count?: number | string;
        tone?: 'critical';
        disabled?: boolean;
    }[];
    value: string;
    onChange?: (v: string) => void;
    size?: 'sm'; /** accessible name of the tab list */
    label?: string; /** <TabPanel> elements; links each tab to its panel */
    children?: React.ReactNode;
}
export interface PanelProps {
    title?: string;
    meta?: React.ReactNode;
    actions?: React.ReactNode;
    footer?: React.ReactNode;
    flush?: boolean;
    className?: string; /** id for the title; the panel is labelled by it */
    id?: string;
    children?: React.ReactNode;
}
export interface MetricProps {
    label?: string;
    scope?: string;
    value?: string;
    unit?: string;
    delta?: TrendProps;
    target?: string;
    status?: Status;
    statusLabel?: string;
    freshness?: string;
    action?: string;
    onAction?: () => void;
    spark?: {
        points: number[];
        threshold?: number;
    };
    state?: 'ready' | 'loading' | 'degraded' | 'error';
    compact?: boolean;
}
export interface StateBlockProps {
    kind: 'loading' | 'empty' | 'error' | 'no-access' | 'degraded';
    title?: string;
    body?: React.ReactNode;
    detail?: string;
    action?: string;
    onAction?: () => void;
    secondary?: string;
    onSecondary?: () => void;
    inline?: boolean;
    rows?: number;
}
export interface AlertBannerProps {
    tone: 'critical' | 'warning' | 'info' | 'healthy';
    title: string;
    children?: React.ReactNode;
    meta?: string;
    action?: string;
    onAction?: () => void;
    onDismiss?: () => void;
}
export interface ToastProps {
    tone?: Status;
    title: string;
    body?: string;
    action?: string;
    onAction?: () => void;
    onClose?: () => void;
}
export interface DrawerProps {
    open: boolean;
    title: string;
    subtitle?: string;
    onClose: () => void;
    footer?: React.ReactNode;
    width?: number;
    contained?: boolean; /** a panel beside the page instead of a floating layer (the assistant): in place, bordered, non-modal; clicking the page keeps it open */
    docked?: boolean; /** extra header controls, before Close */
    actions?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
}
export interface ModalProps {
    open: boolean;
    title: string;
    onClose: () => void;
    actions?: React.ReactNode;
    tone?: 'critical';
    contained?: boolean;
    children?: React.ReactNode;
}
export interface SparklineProps {
    points: number[];
    width?: number;
    height?: number;
    threshold?: number;
    tone?: Status;
    label?: string;
}
export interface Column<T> {
    key: string;
    header: string;
    sortable?: boolean;
    sortValue?: (r: T) => SortValue;
    defaultDir?: 'asc' | 'desc';
    align?: 'left' | 'right'; /** identifiers only */
    mono?: boolean; /** numbers: tabular, no wrap */
    num?: boolean; /** never wrap the cell */
    nowrap?: boolean;
    width?: number;
    className?: string;
    render?: (r: T) => React.ReactNode; /** Tree view: how a collapsed group totals this column (default "–") */
    rollup?: ColumnRollup<T>; /** formats a 'sum' rollup, e.g. (n) => `$${n}k` */
    format?: (n: number) => React.ReactNode; /** not shown (see also DataTable hiddenColumns) */
    hidden?: boolean; /** false keeps it on in ColumnsMenu */
    hideable?: boolean; /** "start" keeps the column visible while the table scrolls sideways (first column only) */
    pin?: 'start';
}
export type SortValue = string | number | boolean | Date | null | undefined;
export interface DataTableSort {
    key: string;
    dir: 'asc' | 'desc';
}
export interface DataTableProps<T> {
    columns: Column<T>[];
    rows: T[];
    rowKey?: string;
    defaultSort?: DataTableSort;
    renderExpanded?: (r: T) => React.ReactNode;
    pageSize?: number;
    onRowClick?: (r: T) => void;
    rowTone?: (r: T) => 'critical' | null;
    state?: 'ready' | 'loading' | 'error' | 'empty';
    emptyTitle?: string;
    emptyBody?: string;
    errorDetail?: string;
    onRetry?: () => void;
    caption?: string;
    density?: Density; /** the active (opened) row */
    selectedKey?: string;
    stickyHeader?: boolean;
    /** controlled sort; pair with onSortChange */ sort?: DataTableSort | null;
    onSortChange?: (s: DataTableSort) => void;
    /** rows are already sorted and paged (server-side): give totalRows and handle onSortChange / onPageChange */ manual?: boolean;
    totalRows?: number;
    /** controlled page, 1-based */ page?: number;
    onPageChange?: (page: number) => void; /** offers a page-size menu */
    pageSizeOptions?: number[];
    onPageSizeChange?: (size: number) => void;
    /** adds a checkbox column */ selection?: 'multiple';
    selectedKeys?: string[];
    defaultSelectedKeys?: string[];
    onSelectionChange?: (keys: string[]) => void;
    /** actions for the selected rows, shown in a bar above the table while any are selected */ bulkActions?: (keys: string[], rows: T[]) => React.ReactNode;
    /** a trailing "⋯" menu per row (none when it returns []) */ rowActions?: (r: T) => ActionMenuEntry[];
    /** how a row is named in labels ("Select run_8f3k2", "Actions for run_8f3k2"); default the rowKey value */ rowLabel?: (r: T) => string;
    /** column keys to hide (see ColumnsMenu) */ hiddenColumns?: string[];
    /** each row's ownership path BELOW the current scope ([] = owned directly by the scope); turns on List | Tree */ getPath?: (r: T) => PathSegment[];
    view?: 'list' | 'tree';
    defaultView?: 'list' | 'tree';
    onViewChange?: (v: 'list' | 'tree') => void;
    /** List view: the path line for rows owned directly by the scope (default "Owned directly") */ directLabel?: string;
    /** Tree view: what the rows are, for counts ("3 pipelines"); default ["item", "items"] */ itemNoun?: [string, string];
    /** content at the left of the table's toolbar, e.g. a ScopeNote */ toolbar?: React.ReactNode;
}
export interface PaginationProps {
    page: number;
    pageSize: number; /** total rows */
    total: number;
    onPageChange?: (page: number) => void;
    pageSizeOptions?: number[];
    onPageSizeChange?: (size: number) => void; /** first/last buttons and "Page x of y" (default true) */
    firstLast?: boolean; /** accessible name (default "Pagination") */
    label?: string;
}
export interface ColumnsMenuProps<T> {
    columns: Column<T>[]; /** hidden column keys */
    hidden: string[];
    onChange: (hidden: string[]) => void; /** button text (default "Columns") */
    label?: string;
}
export interface ChartMarker {
    index: number;
    label: string;
}
export interface LegendProps {
    items: {
        name: string;
        color?: ColorToken;
        dashed?: boolean;
    }[]; /** line swatches instead of squares */
    line?: boolean;
}
export interface TimeSeriesChartProps {
    series: {
        name: string;
        points: (number | null)[];
        color?: ColorToken;
        dashed?: boolean;
    }[];
    labels: string[];
    unit?: string;
    height?: number;
    threshold?: {
        value: number;
        label: string;
    };
    markers?: ChartMarker[];
    yMax?: number;
    yMin?: number;
    onMarker?: (m: ChartMarker) => void;
    onBrush?: (from: number, to: number) => void;
    highlight?: [number, number]; /** shaded y band [from, to], e.g. a normal range */
    band?: [number, number];
    ariaLabel: string;
    decimals?: number;
    state?: ViewState; /** 'Show table' toggle, default true */
    table?: boolean; /** direct end labels for 2–4 series when they don't collide, default true */
    endLabels?: boolean;
}
export interface BarChartProps {
    categories: string[];
    series: {
        name: string;
        values: number[];
        color: ColorToken;
        pattern?: 'hatch' | 'dots';
    }[];
    stacked?: boolean;
    height?: number;
    unit?: string;
    ariaLabel?: string;
    onBar?: (c: string, i: number) => void;
    state?: ViewState; /** opt-in hatch textures for print / forced colours */
    textures?: boolean; /** 'Show table' toggle, default true */
    table?: boolean;
}
export interface HeatmapProps {
    rows: string[];
    cols: string[];
    values: (number | null)[][];
    unit?: string;
    max?: number;
    ariaLabel: string; /** 'Show table' toggle, default true */
    table?: boolean;
}
export interface StatusGridRow {
    key: string;
    label: string;
}
export interface StatusGridProps {
    rows: StatusGridRow[];
    cols: string[];
    cells: Status[][]; /** makes cells keyboard-navigable targets */
    onCell?: (row: StatusGridRow, col: string, s: Status) => void;
    ariaLabel: string;
    rowLabelWidth?: number; /** 'Show table' toggle, default true */
    table?: boolean;
}
export interface RunStripProps {
    runs: Status[];
    labels?: string[];
    name?: string;
}
export interface BulletBarProps {
    used: number;
    requested: number;
    limit: number;
    unit?: string;
    warnAt?: number;
    critAt?: number;
    label?: string;
}
export interface TimelineEvent {
    time: string;
    kind: 'alert' | 'warn' | 'deploy' | 'config' | 'scale' | 'page' | 'ack' | 'ticket' | 'comment' | 'resolve' | 'info';
    title: string;
    body?: string;
    actor?: string;
    tag?: string;
    link?: boolean;
    highlight?: boolean;
}
export interface TimelineProps {
    events: TimelineEvent[];
    onEvent?: (e: TimelineEvent) => void;
    dense?: boolean;
}
export interface NavItem {
    key: string;
    label: string;
    icon: IconName;
}
export interface NavGroup {
    group: string | null;
    items: NavItem[];
}
export interface SideNavProps {
    active: string;
    onNavigate?: (key: string) => void;
    collapsed?: boolean;
    badges?: Record<string, {
        count: number;
        tone?: 'critical';
    }>;
    nav?: NavGroup[]; /** set by AppShell below 1024 px */
    overlay?: boolean;
    onClose?: () => void;
}
export interface TopBarProps {
    ownership?: React.ReactNode; /** runtime dimensions; replaces scope / scopeOptions */
    runtime?: ScopeDimension[];
    scope?: Scope;
    scopeOptions?: ScopeOptions;
    onScope?: (s: Scope) => void;
    time?: string;
    onTime?: (t: string) => void;
    refresh?: TimeRangePickerProps['refresh'];
    onRefresh?: (r: string) => void;
    searchItems?: SearchItem[]; /** shown when search is focused and empty */
    searchRecent?: SearchItem[];
    onSearch?: (i: SearchItem) => void;
    alerts?: number;
    onAlerts?: () => void;
    onCopyRange?: () => void; /** avatar initials */
    user?: string; /** accessible name of the account button, e.g. "Account: Dev A" (default "Account") */
    accountLabel?: string; /** who is signed in; the account button then opens a menu with this header and `items` (switch organization, preferences, sign out) */
    account?: TopBarAccount; /** the assistant's launcher, left of alerts (Ctrl+I / ⌘I) */
    assistant?: TopBarAssistant; /** set by AppShell */
    onMenu?: () => void; /** set by AppShell from its width */
    mode?: ShellMode;
}
export type ShellMode = 'full' | 'collapsed' | 'tablet';
/** The signed-in person, shown at the top of the account menu. */
export interface TopBarAccount {
    name: string;
    email?: string; /** their role in the current organization, e.g. "Owner" */
    role?: string; /** the current organization */
    org?: string;
    items?: ActionMenuEntry[];
}
export interface AppShellProps {
    nav: React.ReactElement<SideNavProps>;
    top: React.ReactElement<TopBarProps>;
    density?: Density;
    forceWidth?: number; /** an AssistantPanel (or a component that renders one): docked beside the content at 1280 px and wider, a drawer below */
    assistant?: React.ReactNode;
    children?: React.ReactNode;
}
export interface PageHeaderField {
    label: string;
    value: React.ReactNode;
    mono?: boolean;
}
/** The eyebrow above an entity's title: "Initiative · owned by ML engineering". */
export interface PageHeaderKind {
    label: string;
    icon?: IconName; /** follows the label after a dot, e.g. <>owned by <b>ML engineering</b></> */
    detail?: React.ReactNode;
}
export interface PageHeaderProps {
    kind?: PageHeaderKind;
    crumbs?: React.ReactNode;
    back?: React.ReactNode;
    title: string;
    titleMono?: boolean;
    status?: React.ReactNode; /** a short sentence, or labelled fields (preferred) */
    meta?: React.ReactNode | PageHeaderField[];
    actions?: React.ReactNode;
    tabs?: React.ReactNode;
}
export interface SkeletonProps {
    w?: string | number;
    h?: string | number;
    style?: React.CSSProperties;
}
export interface ToastRegionProps {
    children?: React.ReactNode;
}
/** Shared by every form control: a visible label (or a visually hidden one), optional hint and error text. */
export interface FieldProps {
    label: string; /** keep the label for screen readers only */
    hideLabel?: boolean;
    hint?: string; /** shown in status-critical with an icon; sets aria-invalid */
    error?: string; /** shows a muted "Required" after the label and sets aria-required */
    required?: boolean;
}
/** What Field passes to its control: spread it on the focusable element. */
export interface FieldControlProps {
    id: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
    'aria-required'?: boolean;
}
export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, FieldProps {
}
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, FieldProps {
}
export interface SelectProps extends FieldProps {
    options: (string | Option)[];
    value?: string;
    defaultValue?: string;
    onChange?: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    id?: string;
    className?: string;
}
export interface CheckboxProps extends FieldProps {
    checked?: boolean | 'indeterminate';
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    value?: string;
    id?: string;
}
export interface SwitchProps extends Omit<FieldProps, 'hideLabel' | 'required'> {
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (on: boolean) => void;
    disabled?: boolean;
    name?: string;
    id?: string;
}
export interface ActionMenuItem {
    label: string;
    icon?: IconName;
    onSelect?: () => void;
    disabled?: boolean; /** destructive actions */
    tone?: 'critical'; /** shown on the right, e.g. "⌘D" */
    shortcut?: string; /** muted text on the right, e.g. a role */
    meta?: string; /** shows a tick and is announced as checked: the current choice, e.g. the active organization */
    checked?: boolean;
}
/** A group heading inside a menu, e.g. "Switch organization". */
export interface ActionMenuHeading {
    heading: string;
}
/** A menu entry, a group heading, or "separator" for a divider line. */
export type ActionMenuEntry = ActionMenuItem | ActionMenuHeading | 'separator';
export interface ActionMenuProps {
    items: ActionMenuEntry[]; /** accessible name of the default "⋯" button (default "More actions") */
    label?: string; /** your own trigger, e.g. <Button>Actions</Button>; must forward a ref */
    trigger?: React.ReactElement;
    align?: 'start' | 'end'; /** non-interactive content above the items, e.g. who is signed in */
    header?: React.ReactNode; /** preview only: render the menu open */
    forceOpen?: boolean;
}
export interface CopyButtonProps {
    value: string; /** accessible name for the icon-only form, e.g. "Copy run id" (default "Copy") */
    label?: string; /** shown as the button text (e.g. the id itself); omit for an icon-only button */
    children?: React.ReactNode;
    onCopy?: (value: string) => void;
}
export interface TagProps {
    children: React.ReactNode; /** identifiers: branch, commit, label selector */
    mono?: boolean; /** shows a remove (×) button */
    onRemove?: () => void; /** accessible name of the remove button (default "Remove <text>") */
    removeLabel?: string;
}
export interface CodeBlockProps {
    code: string; /** shown in the header bar, e.g. a file name or "Build log" */
    title?: string; /** default: on when there is more than one line */
    lineNumbers?: boolean; /** start with long lines wrapped (a toggle is always shown) */
    wrap?: boolean; /** px; the block scrolls beyond it (default 320) */
    maxHeight?: number; /** 1-based line numbers to highlight */
    highlight?: number[]; /** show a copy button (default true) */
    copy?: boolean; /** a unified diff: + and − lines are marked added and removed (sign, neutral tint, screen-reader words) */
    diff?: boolean;
}
export interface ToastOptions {
    tone?: Status;
    title: string;
    body?: string; /** action button label, e.g. "Undo" */
    action?: string;
    onAction?: () => void; /** ms before it hides; null keeps it until closed. Default 6000, and null for critical */
    duration?: number | null;
}
export interface PopoverProps {
    /** the element that opens it; must forward a ref (Button does) */
    trigger: React.ReactElement;
    children?: React.ReactNode;
    /** accessible name of the popover dialog */
    label: string;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    /** px; default fits the content (max 360) */
    width?: number;
    /** preview only: render it open */
    forceOpen?: boolean;
    className?: string;
}
export interface ToasterProps {
    max?: number; /** position inside the nearest positioned parent instead of the window (demos) */
    contained?: boolean;
}
export interface KeyValueItem {
    label: string;
    value?: React.ReactNode; /** identifiers: run ids, SHAs, paths */
    mono?: boolean; /** adds a copy button that copies this text */
    copy?: string;
}
export interface KeyValueListProps {
    items: KeyValueItem[]; /** "rows" (default): label left, value right; "grid": label above value in columns; "inline": a wrapping line, as in PageHeader */
    layout?: 'rows' | 'grid' | 'inline'; /** grid only (default 2); one column on phones */
    columns?: 1 | 2 | 3 | 4; /** skeleton values */
    loading?: boolean; /** accessible name for the list */
    label?: string;
    className?: string;
}
export interface AvatarProps {
    name: string;
    src?: string;
    size?: 20 | 28 | 32 | 36; /** a small status mark in the corner */
    status?: Status; /** hide from screen readers when the name is written next to it */
    decorative?: boolean; /** override the derived initials */
    initials?: string; /** an icon instead of initials, e.g. "assistant" (neutral fill) */
    icon?: IconName;
}
export interface AvatarGroupProps {
    people: {
        name: string;
        src?: string;
    }[]; /** avatars before "+N" (default 4) */
    max?: number;
    size?: AvatarProps['size']; /** prefix for the accessible name, e.g. "Reviewers" */
    label?: string;
}
export interface ProgressBarProps {
    value: number | null;
    max?: number;
    label: string;
    hideLabel?: boolean; /** what is read and shown instead of "42 %", e.g. "3 of 12 replicas" */
    valueText?: string; /** ink (default); warning or critical when the progress itself is at risk */
    tone?: 'ink' | 'warning' | 'critical';
    hint?: string; /** show the value text (default true) */
    showValue?: boolean;
}
export interface RadioOption {
    value: string;
    label?: string; /** a muted line under the label */
    description?: string;
    disabled?: boolean;
}
export interface RadioGroupProps extends FieldProps {
    options: (string | RadioOption)[];
    value?: string;
    defaultValue?: string;
    onChange?: (v: string) => void;
    orientation?: 'vertical' | 'horizontal';
    disabled?: boolean;
    name?: string;
    id?: string;
}
export interface ComboboxOption {
    value: string;
    label?: string; /** muted text on the right */
    meta?: string; /** a muted second line */
    description?: string; /** extra words that match */
    keywords?: string[];
    disabled?: boolean;
}
interface ComboboxBase extends FieldProps {
    options: (string | ComboboxOption)[];
    /** trigger text when nothing is chosen (default "Select…", or "Add…" for multiple) */ placeholder?: string;
    /** default "Search…" */ searchPlaceholder?: string;
    /** default "No matches." */ emptyText?: string;
    /** shows "Loading…" (while you fetch options for onQueryChange) */ loading?: boolean;
    onQueryChange?: (q: string) => void;
    /** filter options locally (default true); false shows options as given */ filter?: boolean;
    /** single: show a clear button (default true) */ clearable?: boolean;
    /** offer "Create “x”" for a query that matches nothing */ creatable?: boolean;
    onCreate?: (label: string) => void;
    disabled?: boolean; /** submits each value as a hidden input */
    name?: string;
    id?: string;
    className?: string;
}
export interface ComboboxSingleProps extends ComboboxBase {
    multiple?: false;
    value?: string | null;
    defaultValue?: string | null;
    onChange?: (v: string | null) => void;
}
export interface ComboboxMultipleProps extends ComboboxBase {
    multiple: true;
    value?: string[];
    defaultValue?: string[];
    onChange?: (v: string[]) => void;
}
export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps;
/** "YYYY-MM-DD" in the user's local calendar. */
export type ISODate = string;
export interface DatePickerProps extends FieldProps {
    value?: ISODate | null;
    defaultValue?: ISODate | null;
    onChange?: (v: ISODate | null) => void; /** earliest allowed */
    min?: ISODate; /** latest allowed */
    max?: ISODate;
    isDateDisabled?: (d: ISODate) => boolean; /** a clear button (default true) */
    clearable?: boolean;
    disabled?: boolean;
    name?: string;
    id?: string;
    placeholder?: string;
}
export interface DateRangeValue {
    from: ISODate;
    to: ISODate | null;
}
export interface DateRangePreset {
    label: string;
    range: () => {
        from: ISODate;
        to: ISODate;
    };
}
export interface DateRangePickerProps extends FieldProps {
    value?: DateRangeValue | null;
    defaultValue?: DateRangeValue | null;
    onChange?: (v: DateRangeValue | null) => void;
    min?: ISODate;
    max?: ISODate; /** longest allowed range, in days */
    maxDays?: number;
    isDateDisabled?: (d: ISODate) => boolean; /** default: last 7 and 30 days, this and last month; [] for none */
    presets?: DateRangePreset[];
    placeholder?: string;
    disabled?: boolean;
    id?: string; /** preview only */
    forceOpen?: boolean;
}
export interface InlineEditProps {
    value: string; /** may return a promise; a rejection keeps the field open with its message */
    onSave: (v: string) => void | Promise<void>; /** names the value ("Description") */
    label: string;
    placeholder?: string; /** shown when empty (default "Not set") */
    emptyText?: string; /** return a message to block saving */
    validate?: (v: string) => string | null;
    multiline?: boolean;
    mono?: boolean;
    disabled?: boolean; /** show the label above the field while editing (default hidden) */
    hideLabel?: boolean;
}
export interface UploadItem {
    id: string;
    name: string; /** bytes */
    size: number;
    status: 'queued' | 'uploading' | 'done' | 'error'; /** 0..100; omit for indeterminate */
    progress?: number;
    error?: string;
}
export interface FileUploadProps {
    label: string;
    hint?: string;
    error?: string;
    required?: boolean; /** e.g. ".json,.txt" or "image/*" */
    accept?: string; /** bytes */
    maxSize?: number;
    multiple?: boolean;
    maxFiles?: number; /** your uploads and their state */
    files?: UploadItem[]; /** accepted files to upload */
    onFiles?: (files: File[]) => void;
    onRemove?: (id: string) => void;
    onRetry?: (id: string) => void;
    disabled?: boolean;
    id?: string; /** "button": a paperclip button instead of the drop area, e.g. in a composer (the label names the button) */
    variant?: 'dropzone' | 'button';
}
/** A node in the ownership tree: an organisation unit, or a group of resources under one. */
export interface TreeNode {
    id: string;
    kind: EntityKind;
    label: string;
    /** overrides the kind's icon */ icon?: IconName;
    /** the worst status at or below this node; healthy and unknown show nothing (healthy is quiet) */ status?: Status;
    /** how many items have that status, shown beside it */ statusCount?: number;
    /** read with the status, e.g. "1 critical below" */ statusLabel?: string;
    /** muted text on the right when there is no status to show, e.g. a resource count */ meta?: React.ReactNode;
    children?: TreeNode[];
    /** children exist but load on expand (TreeView loadChildren) */ hasChildren?: boolean;
    /** shown as greyed context: the person can't open it */ noAccess?: boolean;
    /** extra words that find it in search */ keywords?: string[];
}
export interface TreeViewProps {
    nodes: TreeNode[]; /** accessible name, e.g. "Organisation" */
    label: string;
    selectedId?: string | null;
    onSelect?: (node: TreeNode) => void;
    expandedIds?: string[];
    defaultExpandedIds?: string[];
    onExpandedChange?: (ids: string[]) => void;
    /** loads a node's children the first time it expands (for nodes with hasChildren) */ loadChildren?: (node: TreeNode) => Promise<TreeNode[]>;
    /** keeps matching nodes and their ancestors, expanded */ filter?: string;
    state?: 'ready' | 'loading' | 'error';
    emptyText?: string;
    className?: string;
}
export interface ScopePickerProps {
    /** the organisation tree (the same nodes as the explorer) */ nodes: TreeNode[];
    /** the current scope's node id; null is the whole organisation */ value: string | null;
    onChange?: (id: string | null) => void;
    /** accessible name (default "Ownership scope") */ label?: string;
    /** default "Whole organisation" */ wholeLabel?: string;
    loadChildren?: TreeViewProps['loadChildren'];
    /** preview only */ forceOpen?: boolean;
}
export interface SplitViewProps {
    /** the tree pane's content (a TreeView, its search, its tools) */ aside: React.ReactNode;
    /** names the pane and its show/hide buttons, e.g. "Organisation" */ asideLabel: string;
    asideTitle?: string;
    children?: React.ReactNode;
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    onCollapsedChange?: (c: boolean) => void;
    /** below 1024 px: whether the aside's drawer is open, e.g. to close it once a node is picked */ drawerOpen?: boolean;
    onDrawerOpenChange?: (open: boolean) => void;
    /** preview only: lay out as if this wide */ forceWidth?: number;
}
export interface ScopeNoteProps {
    /** the scope's name */ scope: React.ReactNode;
    /** how far it reaches, e.g. "and its 2 projects" */ summary?: React.ReactNode;
    /** the runtime scope, e.g. "prod / region-a" */ runtime?: string;
    mode?: 'descendants' | 'direct';
    onModeChange?: (m: 'descendants' | 'direct') => void;
    /** extra controls on the line */ children?: React.ReactNode;
}
/** A step in a row's ownership path below the current scope. */
export interface PathSegment {
    id: string;
    label: string;
    kind?: EntityKind;
}
/** How a column totals up on a collapsed Tree-view row. */
export type ColumnRollup<T> = 'sum' | 'latest' | {
    status: (r: T) => Status; /** words for "1 failed" (default the status name) */
    word?: (s: Status) => string;
} | ((rows: T[]) => React.ReactNode);
/** The assistant's launcher in the TopBar. */
export interface TopBarAssistant {
    open: boolean;
    onToggle: () => void;
    /** working: a reply is being written; needs-input: an agent is waiting for the person; unread: a reply arrived while closed */
    activity?: 'idle' | 'working' | 'needs-input' | 'unread';
    /** default "Assistant" */ label?: string;
    /** Ctrl+I / ⌘I toggles it (default true) */ shortcut?: boolean;
}
/** What the assistant can see. Ownership and runtime are separate kinds and never merge into one item. */
export type AssistantContextKind = 'page' | 'entity' | 'filter' | 'ownership' | 'runtime' | 'time' | 'permission' | 'attachment';
export interface AssistantContextItem {
    id: string;
    kind: AssistantContextKind;
    /** "Usage and cost", "checkout-api", "env: prod", "Last 24 hours", "Read only" */ label: string;
    /** entities and ownership: icon + word from entityIcon / entityLabel */ entity?: EntityKind;
    /** the path below the ownership scope, drawn like ScopeNote's line */ path?: PathSegment[];
    /** a muted line in the inspector, e.g. "3 filters: status, owner, region" */ detail?: string;
    /** false for items the page always sends (the page, permissions); default true */ removable?: boolean;
}
export interface ContextBarProps {
    items: AssistantContextItem[];
    onRemove?: (id: string) => void;
    /** offered by "Add context" (a searchable list): entities on the page, recent resources */ available?: AssistantContextItem[];
    onAdd?: (item: AssistantContextItem) => void;
    /** the ownership item offers "Change scope", which opens the existing ScopePicker */ scope?: Pick<ScopePickerProps, 'nodes' | 'value' | 'onChange' | 'loadChildren'>;
    /** chips shown before "+N more" (default 3); "Context" opens an inspector that lists every item */ max?: number;
}
export interface PromptSuggestion {
    label: string; /** what is sent or inserted (default label) */
    prompt?: string;
    icon?: IconName; /** templates: insert into the input (caret at the first "…") instead of sending */
    insert?: boolean;
}
export interface PromptCommand {
    value: string;
    label: string;
    description?: string;
    group?: string;
    keywords?: string[];
    icon?: IconName;
    entity?: EntityKind;
}
export interface PromptComposerProps extends Pick<FieldProps, 'hint' | 'error'> {
    value?: string;
    defaultValue?: string;
    onChange?: (v: string) => void;
    /** Enter sends, Shift+Enter adds a line; empty or over maxLength never sends */ onSubmit: (prompt: string) => void;
    /** a response is streaming: Send becomes Stop */ busy?: boolean;
    onStop?: () => void;
    /** accessible name (default "Ask the assistant") */ label?: string;
    placeholder?: string;
    maxLength?: number;
    disabled?: boolean; /** shown instead of the hint when disabled, e.g. "You have read-only access to this project" */
    disabledReason?: string;
    /** buttons above the input (an empty conversation's starters) */ suggestions?: PromptSuggestion[];
    onSuggestion?: (s: PromptSuggestion) => void;
    /** a "Templates" menu */ templates?: PromptSuggestion[];
    /** typing "@": resources, people, agents; onMentionQuery fetches */ mentions?: PromptCommand[];
    onMentionQuery?: (q: string) => void;
    mentionsLoading?: boolean;
    /** typing "/" at the start: commands such as /explain, /summarise */ commands?: PromptCommand[];
    /** a paperclip button with FileUpload's rules and rows */ attachments?: Pick<FileUploadProps, 'accept' | 'maxSize' | 'maxFiles' | 'files' | 'onFiles' | 'onRemove' | 'onRetry'>;
    /** a ContextBar, shown above the input */ context?: React.ReactNode;
}
export interface AssistantAuthor {
    name: string;
    kind: 'assistant' | 'agent' | 'person'; /** agents: what it does, read after the name */
    description?: string; /** an image for people */
    avatar?: string;
}
export type AssistantMessageStatus = 'streaming' | 'done' | 'stopped' | 'error';
export interface AssistantSource {
    id: string;
    title: string; /** "Runbook", "Incident", "Repository" */
    kind?: string;
    entity?: EntityKind;
    href?: string;
    path?: PathSegment[];
    excerpt?: string;
    updated?: string;
}
export interface AssistantProvenance {
    generated: string;
    model?: string; /** the context items it used, by label */
    context?: string[]; /** the tools it called, by name */
    tools?: string[];
}
export type AssistantFeedback = 'helpful' | 'not-helpful' | null;
export interface AssistantMessageProps {
    author: AssistantAuthor;
    status?: AssistantMessageStatus;
    time?: string;
    /** Markdown, CodeBlock, DataTable, Metric, charts, ResourceCard, Disclosure… */ children?: React.ReactNode;
    /** numbered sources; <Citation n> in the body points at them */ sources?: AssistantSource[];
    onSource?: (s: AssistantSource) => void;
    /** under a streaming body (default "Responding…"); the error text for status "error" */ statusText?: string;
    onRetry?: () => void;
    followUps?: PromptSuggestion[];
    onFollowUp?: (s: PromptSuggestion) => void;
    /** assistant and agent messages only */ feedback?: AssistantFeedback;
    onFeedback?: (f: AssistantFeedback) => void;
    /** "Report" opens a dialog (reason + detail) */ onReport?: (report: {
        reason: string;
        detail: string;
    }) => void;
    /** what Copy copies; no Copy without it */ copyText?: string;
    onRegenerate?: () => void;
    provenance?: AssistantProvenance;
}
export interface CitationProps {
    n: number; /** the source's title, read as "Source 1: <title>" */
    title: string;
    href?: string;
    onOpen?: () => void;
}
export interface SourceListProps {
    sources: AssistantSource[];
    onOpen?: (s: AssistantSource) => void; /** start expanded (default false: "3 sources") */
    defaultOpen?: boolean;
}
export interface MarkdownProps {
    /** model output; raw HTML is never rendered and images become links */ children: string;
    /** the text is still arriving: unfinished syntax is held back, and an unclosed code fence renders as code */ streaming?: boolean;
    /** in-app navigation; return false to let the browser follow the link */ onLink?: (href: string) => boolean | void;
    /** headings never rank above this level (default 3: "#" to "###" are h3, "####" is h4) */ headingLevel?: 2 | 3 | 4;
    /** "[1]" in the text becomes a Citation to the first source, and so on */ sources?: AssistantSource[];
    onSource?: (s: AssistantSource) => void;
    /** identifiers (e.g. INC-2041, checkout-api) that become EntityRef chips wherever they appear, in text or code spans */ entities?: EntityRefProps[];
    className?: string;
}
export interface ResourceCardProps {
    kind: EntityKind;
    name: string;
    mono?: boolean;
    href?: string;
    onOpen?: () => void;
    status?: Status;
    statusLabel?: string; /** the path below the scope, drawn like ScopeNote's line */
    path?: PathSegment[];
    /** two to four facts, shown as an inline KeyValueList */ facts?: KeyValueItem[];
    actions?: ActionMenuEntry[];
}
export interface DisclosureProps {
    summary: React.ReactNode; /** muted text after the summary, e.g. "4 steps" */
    meta?: React.ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
    children?: React.ReactNode;
}
export interface AssistantConversation {
    id: string;
    title: string;
    updated: string; /** what it is about, e.g. "checkout-api" */
    about?: string;
}
export interface AssistantPanelProps {
    open: boolean;
    onClose: () => void;
    /** default "Assistant" */ title?: string;
    /** docked only: the panel covers the content area */ expanded?: boolean;
    onExpandedChange?: (e: boolean) => void;
    conversations?: AssistantConversation[];
    activeId?: string | null;
    onSelectConversation?: (id: string) => void;
    onNewConversation?: () => void;
    state?: 'ready' | 'loading' | 'empty' | 'error' | 'no-access';
    errorDetail?: string;
    onRetry?: () => void;
    /** the empty state's body: what it can help with here */ empty?: React.ReactNode;
    /** a polite live region reads this once: "Assistant replied: …", "Response stopped" */ announcement?: string;
    /** a PromptComposer */ composer: React.ReactNode;
    /** AssistantMessage elements, oldest first */ children?: React.ReactNode;
    /** inside AppShell's assistant slot this follows the shell's width (docked at 1280 px and wider); set it to override */ placement?: 'docked' | 'overlay';
    /** preview only: lay out in place, as if docked */ contained?: boolean;
}
export interface AssistantProviderProps {
    /** ask() was called: the prompt (if any) and the context it was asked with (the page's items plus extras) */ onAsk?: (prompt: string | undefined, context: AssistantContextItem[]) => void;
    defaultOpen?: boolean;
    children?: React.ReactNode;
}
export interface AssistantApi {
    open: boolean;
    setOpen: (open: boolean) => void;
    toggle: () => void;
    expanded: boolean;
    setExpanded: (expanded: boolean) => void;
    /** opens the panel and asks; extra context is added to the page's (an entity from a row's menu) */ ask: (prompt?: string, extra?: AssistantContextItem[]) => void;
    /** the current page's context items (useAssistantContext) */ context: AssistantContextItem[];
}
/** An identifier in text or a row: kind icon + mono name on a neutral tint. */
export interface EntityRefProps {
    label: string;
    kind?: EntityKind; /** overrides the kind's icon, e.g. "siren" for an incident */
    icon?: IconName;
    /** read before the label, e.g. "Incident" (default the kind's word) */ kindLabel?: string;
    href?: string;
    onOpen?: () => void; /** default true */
    mono?: boolean;
}
export interface AnswerSummaryProps {
    status?: Status; /** read with the status, e.g. "Needs attention" */
    statusLabel?: string;
    children?: React.ReactNode;
}
export interface AttentionItem {
    id: string;
    ref: EntityRefProps;
    title: React.ReactNode; /** a muted second line, e.g. "investigating for 27 min" */
    meta?: React.ReactNode;
    status?: Status;
    statusLabel?: string; /** one action, e.g. { label: "Open" } */
    action?: {
        label: string;
        onSelect: () => void;
    };
}
export interface AttentionListProps {
    items: AttentionItem[]; /** a short heading, e.g. "Needs attention" */
    title?: string; /** rows before "Show N more" (default 5) */
    max?: number;
}
export interface MetricStripItem {
    label: string;
    value: string;
    unit?: string;
    delta?: TrendProps;
}
export interface MetricStripProps {
    items: MetricStripItem[]; /** accessible name (default "Key figures") */
    label?: string;
}
export interface NextStepProps {
    title?: string;
    children?: React.ReactNode; /** buttons that open or prepare, never ones that change things unasked */
    actions?: React.ReactNode; /** says "Proposed. Nothing has been changed." (default true) */
    proposal?: boolean;
}
/** One section of an answer. An agent returns these instead of one long Markdown string; AssistantAnswer draws them. */
export type AnswerBlock = {
    type: 'summary';
    text: string;
    status?: Status;
    statusLabel?: string;
} | {
    type: 'text';
    markdown: string;
} | {
    type: 'items';
    items: AttentionItem[];
    title?: string;
    max?: number;
} | {
    type: 'metrics';
    items: MetricStripItem[];
    label?: string;
} | {
    type: 'next';
    text: string;
    title?: string;
    actions?: {
        label: string;
        onSelect: () => void;
    }[];
    proposal?: boolean;
} | {
    type: 'code';
    code: string;
    title?: string;
    diff?: boolean;
} | {
    type: 'steps';
    steps: string[];
    title?: string;
} | {
    type: 'custom';
    content: React.ReactNode;
};
export interface AssistantAnswerProps {
    /** in reading order; put a summary first */ blocks: AnswerBlock[];
    /** more blocks are coming: the last text block holds back unfinished syntax, and a placeholder shows where the next block goes */ streaming?: boolean;
    /** "[1]" in text blocks becomes a citation */ sources?: AssistantSource[];
    onSource?: (s: AssistantSource) => void;
    /** identifiers that become EntityRef chips wherever they appear in text blocks */ entities?: EntityRefProps[];
}
//# sourceMappingURL=types.d.ts.map