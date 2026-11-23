import * as React from "react";
import type { RadioGroupProps, ComboboxProps, DatePickerProps, DateRangePickerProps, DateRangePreset, InlineEditProps, FileUploadProps } from "./types";
export declare const RadioGroup: React.ForwardRefExoticComponent<RadioGroupProps & React.RefAttributes<HTMLDivElement>>;
export declare const Combobox: React.ForwardRefExoticComponent<ComboboxProps & React.RefAttributes<HTMLButtonElement>>;
export declare const toISODate: (d: Date) => string;
export declare function parseISODate(s: string | null | undefined): Date | null;
export declare const DatePicker: React.ForwardRefExoticComponent<DatePickerProps & React.RefAttributes<HTMLInputElement>>;
export declare const DEFAULT_RANGE_PRESETS: DateRangePreset[];
export declare const DateRangePicker: React.ForwardRefExoticComponent<DateRangePickerProps & React.RefAttributes<HTMLButtonElement>>;
export declare function InlineEdit({ value, onSave, label, placeholder, emptyText, validate, multiline, mono, disabled, hideLabel }: InlineEditProps): React.JSX.Element;
export declare function FileUpload({ label, hint, error, required, accept, maxSize, multiple, maxFiles, files, onFiles, onRemove, onRetry, disabled, id: idProp, variant }: FileUploadProps): React.JSX.Element;
//# sourceMappingURL=inputs.d.ts.map