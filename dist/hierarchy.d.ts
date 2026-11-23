import * as React from "react";
import type { TreeNode, TreeViewProps, ScopePickerProps, SplitViewProps, ScopeNoteProps } from "./types";
export interface TreeIndexEntry {
    node: TreeNode;
    parentId: string | null;
    path: TreeNode[];
}
/** Flattens a tree (including loaded children) into id → {node, parentId, path from the root down to the node}. */
export declare function indexTree(nodes: TreeNode[], loaded?: Record<string, TreeNode[]>): Map<string, TreeIndexEntry>;
export declare function TreeView({ nodes, label, selectedId, onSelect, expandedIds, defaultExpandedIds, onExpandedChange, loadChildren, filter, state, emptyText, className }: TreeViewProps): React.JSX.Element;
export declare function ScopePicker({ nodes, value, onChange, label, wholeLabel, loadChildren, forceOpen }: ScopePickerProps): React.JSX.Element;
export declare function SplitView({ aside, asideLabel, asideTitle, children, collapsed: collapsedProp, defaultCollapsed, onCollapsedChange, drawerOpen, onDrawerOpenChange, forceWidth }: SplitViewProps): React.JSX.Element;
export declare function ScopeNote({ scope, summary, runtime, mode, onModeChange, children }: ScopeNoteProps): React.JSX.Element;
//# sourceMappingURL=hierarchy.d.ts.map