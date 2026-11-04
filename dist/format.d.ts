import * as React from "react";
export interface FormatSettings {
    locale?: string;
    timeZone?: string;
    currency?: string;
}
export interface FxRate {
    rate: number;
    currency: string;
    asOf: Date | string;
    source?: string;
}
export declare function PairwiseProvider(props: FormatSettings & {
    children?: React.ReactNode;
}): React.FunctionComponentElement<React.ProviderProps<Required<FormatSettings> | null>>;
export declare function useFormat(): {
    settings: Required<FormatSettings>;
    /** Short zone label for headers like "Absolute (CET)". */
    timeZoneLabel(at?: Date): string;
    /** HH:mm:ss, for traces. */
    time(d: Date, opts?: {
        seconds?: boolean;
        zone?: boolean;
    }): string;
    /** DD Mon HH:mm, for feeds. */
    dateTime(d: Date, opts?: {
        zone?: boolean;
    }): string;
    date(d: Date): string;
    number(v: number, opts?: {
        decimals?: number;
        grouping?: "indian";
    }): string;
    /** Money in the account currency, or converted with an explicit, dated FX rate. */
    money(v: number, opts?: {
        decimals?: number;
        grouping?: "indian";
        fx?: FxRate;
    }): string;
    /** 2.4 s, 340 ms, 1 min 12 s */
    duration(ms: number): string;
};
export declare function createFormatter(s: Required<FormatSettings>): {
    settings: Required<FormatSettings>;
    /** Short zone label for headers like "Absolute (CET)". */
    timeZoneLabel(at?: Date): string;
    /** HH:mm:ss, for traces. */
    time(d: Date, opts?: {
        seconds?: boolean;
        zone?: boolean;
    }): string;
    /** DD Mon HH:mm, for feeds. */
    dateTime(d: Date, opts?: {
        zone?: boolean;
    }): string;
    date(d: Date): string;
    number(v: number, opts?: {
        decimals?: number;
        grouping?: "indian";
    }): string;
    /** Money in the account currency, or converted with an explicit, dated FX rate. */
    money(v: number, opts?: {
        decimals?: number;
        grouping?: "indian";
        fx?: FxRate;
    }): string;
    /** 2.4 s, 340 ms, 1 min 12 s */
    duration(ms: number): string;
};
export type Formatter = ReturnType<typeof createFormatter>;
//# sourceMappingURL=format.d.ts.map