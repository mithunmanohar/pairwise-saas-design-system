import type { DataTableProps, TimeSeriesChartProps, BarChartProps, RunStripProps, HeatmapProps, StatusGridProps, BulletBarProps, TimelineProps, LegendProps } from "./types";
import * as React from "react";
export declare function DataTable<T extends object>({ columns, rows, rowKey, defaultSort, renderExpanded, pageSize, onRowClick, rowTone, state, emptyTitle, emptyBody, errorDetail, onRetry, caption, density, selectedKey, stickyHeader }: DataTableProps<T>): React.JSX.Element;
export declare function TimeSeriesChart({ series, labels, unit, height, threshold, markers, yMax, yMin, onMarker, onBrush, ariaLabel, decimals, band, state, highlight, table, endLabels }: TimeSeriesChartProps): React.JSX.Element;
export declare function Legend({ items, line }: LegendProps): React.JSX.Element;
export declare function BarChart({ categories, series, stacked, height, unit, ariaLabel, onBar, state, textures }: BarChartProps): React.JSX.Element;
export declare function RunStrip({ runs, labels, name }: RunStripProps): React.JSX.Element;
export declare function Heatmap({ rows, cols, values, unit, ariaLabel, max }: HeatmapProps): React.JSX.Element;
export declare function StatusGrid({ rows, cols, cells, onCell, ariaLabel, rowLabelWidth }: StatusGridProps): React.JSX.Element;
export declare function BulletBar({ used, requested, limit, unit, warnAt, critAt, label }: BulletBarProps): React.JSX.Element;
export declare function Timeline({ events, onEvent, dense }: TimelineProps): React.JSX.Element;
//# sourceMappingURL=data.d.ts.map