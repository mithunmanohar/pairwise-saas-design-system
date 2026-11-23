import * as React from "react";
import type { DisclosureProps, CitationProps, SourceListProps, ResourceCardProps, EntityRefProps, AttentionListProps, MetricStripProps, NextStepProps, AnswerSummaryProps } from "./types";
export declare function Disclosure({ summary, meta, open, defaultOpen, onOpenChange, className, children }: DisclosureProps): React.JSX.Element;
export declare function Citation({ n, title, href, onOpen }: CitationProps): React.JSX.Element;
export declare function SourceList({ sources, onOpen, defaultOpen }: SourceListProps): React.JSX.Element | null;
export declare function ResourceCard({ kind, name, mono, href, onOpen, status, statusLabel, path, facts, actions }: ResourceCardProps): React.JSX.Element;
export declare function EntityRef({ label, kind, icon, kindLabel, href, onOpen, mono }: EntityRefProps): React.JSX.Element;
export declare function AnswerSummary({ status, statusLabel, children }: AnswerSummaryProps): React.JSX.Element;
export declare function AttentionList({ items, title, max }: AttentionListProps): React.JSX.Element | null;
export declare function MetricStrip({ items, label }: MetricStripProps): React.JSX.Element | null;
export declare function NextStep({ title, children, actions, proposal }: NextStepProps): React.JSX.Element;
//# sourceMappingURL=content.d.ts.map