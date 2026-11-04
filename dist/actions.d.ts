import * as React from "react";
import type { ActionMenuProps, CopyButtonProps, TagProps, CodeBlockProps } from "./types";
export declare function ActionMenu({ items, label, trigger, align, forceOpen }: ActionMenuProps): React.JSX.Element;
export declare function CopyButton({ value, label, children, onCopy }: CopyButtonProps): React.JSX.Element;
export declare function Tag({ children, mono, onRemove, removeLabel }: TagProps): React.JSX.Element;
export declare function CodeBlock({ code, title, lineNumbers, wrap: wrapInit, maxHeight, highlight, copy }: CodeBlockProps): React.JSX.Element;
//# sourceMappingURL=actions.d.ts.map