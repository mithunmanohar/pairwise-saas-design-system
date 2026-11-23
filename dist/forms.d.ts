import * as React from "react";
import type { TextInputProps, TextareaProps, SelectProps, CheckboxProps, SwitchProps, FieldProps, FieldControlProps } from "./types";
/** Ids and ARIA wiring for one control. Used by Field and by controls that lay out their own label (Checkbox, Switch). */
export declare function useField(idProp: string | undefined, hint?: string, error?: string): {
    id: string;
    hintId: string | undefined;
    errId: string | undefined;
    describedBy: string | undefined;
    invalid: boolean | undefined;
};
/**
 * Label, hint, error and "Required" marker around any control. `children` receives the props to spread on the
 * focusable element: `<Field label="Owner">{(p) => <MyPicker {...p} />}</Field>`.
 */
export declare function Field({ label, hideLabel, hint, error, required, id: idProp, className, children }: FieldProps & {
    id?: string;
    className?: string;
    children: (control: FieldControlProps) => React.ReactNode;
}): React.JSX.Element;
export declare const TextInput: React.ForwardRefExoticComponent<TextInputProps & React.RefAttributes<HTMLInputElement>>;
export declare const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;
export declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLButtonElement>>;
export declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLButtonElement>>;
export declare const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=forms.d.ts.map