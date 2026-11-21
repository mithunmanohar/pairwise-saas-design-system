import * as React from "react";
import type { KeyValueListProps, AvatarProps, AvatarGroupProps, ProgressBarProps } from "./types";
export declare function KeyValueList({ items, layout, columns, loading, className, label }: KeyValueListProps): React.JSX.Element;
export declare function Avatar({ name, src, size, status, decorative, initials }: AvatarProps): React.JSX.Element;
/** Overlapping avatars with a "+N" for the rest. The group is named "Dev A, Dev B and 3 others". */
export declare function AvatarGroup({ people, max, size, label }: AvatarGroupProps): React.JSX.Element;
export declare function ProgressBar({ value, max, label, hideLabel, valueText, tone, hint, showValue }: ProgressBarProps): React.JSX.Element;
//# sourceMappingURL=display.d.ts.map