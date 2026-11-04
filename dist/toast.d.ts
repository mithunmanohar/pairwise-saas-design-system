import * as React from "react";
import type { ToastOptions, ToasterProps } from "./types";
/** Show a toast. Returns its id. `toast.dismiss(id)` hides one; `toast.dismiss()` hides all. */
export declare const toast: ((opts: ToastOptions | string) => number) & {
    dismiss: (id?: number) => void;
};
export declare function Toaster({ max, contained }: ToasterProps): React.JSX.Element | null;
//# sourceMappingURL=toast.d.ts.map