import * as React from "react";
import type { AssistantContextItem, ContextBarProps, PromptComposerProps, AssistantMessageProps, AssistantPanelProps, AssistantProviderProps, AssistantApi } from "./types";
/**
 * What the assistant can see: the page, the selected entity, filters, the ownership scope, the runtime scope, the time
 * range and the person's access, as icon + word chips. "All context" lists every item with its path, and the
 * ownership scope can be changed there with the existing ScopePicker (the full tree never appears in the panel).
 */
export declare function ContextBar({ items, onRemove, available, onAdd, scope, max }: ContextBarProps): React.JSX.Element;
export declare function PromptComposer({ value: valueProp, defaultValue, onChange, onSubmit, busy, onStop, label, placeholder, maxLength, disabled, disabledReason, suggestions, onSuggestion, templates, mentions, onMentionQuery, mentionsLoading, commands, attachments, context, hint, error, }: PromptComposerProps): React.JSX.Element;
/**
 * One turn of a conversation, as a list item (AssistantPanel puts them in a list). The assistant's and agents' turns
 * carry the assistant icon or the agent's initials, their name, and their actions; the person's turns sit on the right.
 * While streaming, the body is aria-busy and nothing is announced; the panel announces the finished answer once.
 */
export declare function AssistantMessage({ author, status, time, children, sources, onSource, statusText, onRetry, followUps, onFollowUp, feedback, onFeedback, onReport, copyText, onRegenerate, provenance, }: AssistantMessageProps): React.JSX.Element;
/**
 * The assistant's panel: a docked Drawer beside the content at 1280 px and wider (AppShell sets `placement`), a modal
 * drawer below that, and with `expanded` the whole content area. Header: new conversation, history, expand, close.
 * One polite live region reads `announcement` (a finished, stopped or failed answer), never each streamed word.
 */
export declare function AssistantPanel({ open, onClose, title, expanded, onExpandedChange, conversations, activeId, onSelectConversation, onNewConversation, state, errorDetail, onRetry, empty, announcement, composer, children, placement: placementProp, contained, }: AssistantPanelProps): React.JSX.Element;
/**
 * Holds whether the assistant is open or expanded and what the current page shows, so launchers (top bar, page and row
 * menus, the command palette) can call ask() with the right context. It makes no model calls: `onAsk` hands the prompt
 * and context to the app.
 */
export declare function AssistantProvider({ onAsk, defaultOpen, children }: AssistantProviderProps): React.JSX.Element;
/** The assistant's state and ask(), inside an AssistantProvider. */
export declare function useAssistant(): AssistantApi;
/**
 * A page declares what it shows the assistant (its name, the selected entity, filters, scopes, time, access). The items
 * replace the previous page's on mount and clear on unmount. Pass a stable list (it is compared by content).
 */
export declare function useAssistantContext(items: AssistantContextItem[]): void;
//# sourceMappingURL=assistant.d.ts.map