import * as React from "react";
import type { TextInputProps, TextareaProps, SelectProps, CheckboxProps, SwitchProps } from "./types";
export declare const TextInput: React.ForwardRefExoticComponent<TextInputProps & React.RefAttributes<HTMLInputElement>>;
export declare const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;
export declare function Select({ label, hideLabel, hint, error, options, value, defaultValue, onChange, placeholder, disabled, required, name, id: idProp, className }: SelectProps): React.JSX.Element;
export declare function Checkbox({ label, hint, error, checked, defaultChecked, onChange, disabled, required, name, value, id: idProp }: CheckboxProps): React.JSX.Element;
export declare function Switch({ label, hint, checked, defaultChecked, onChange, disabled, name, id: idProp }: SwitchProps): React.JSX.Element;
//# sourceMappingURL=forms.d.ts.map