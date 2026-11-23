// Small, very common building blocks: an action menu, a copy button, a tag and a code / log block.
import * as React from "react";
import * as DM from "@radix-ui/react-dropdown-menu";
import type { ActionMenuProps, CopyButtonProps, TagProps, CodeBlockProps } from "./types";
import { cx, Button } from "./core";
import { Icon } from "./icons";
const { useState, useRef, useEffect } = React;

/* ---------- ActionMenu (Radix DropdownMenu) ---------- */
// Items with `checked` render as checkbox items (a tick, announced as checked), for picking the current one of several.
export function ActionMenu({ items, label = "More actions", trigger, align = "end", header, forceOpen }: ActionMenuProps) {
  return (
    <DM.Root {...(forceOpen ? { open: true, modal: false } : {})}>
      <DM.Trigger asChild>{trigger ?? <Button variant="ghost" icon="more" aria-label={label} />}</DM.Trigger>
      <DM.Portal>
        <DM.Content className="pw-menu" align={align} sideOffset={4} loop aria-label={label}>
          {header ? <><DM.Label asChild><div className="pw-menu__header">{header}</div></DM.Label><DM.Separator className="pw-menu__sep" /></> : null}
          {items.map((it, i) => {
            if (it === "separator") return <DM.Separator key={i} className="pw-menu__sep" />;
            if ("heading" in it) return <DM.Label key={i} className="pw-menu__heading pw-caption pw-muted">{it.heading}</DM.Label>;
            const body = <>
              <span className="pw-list__check">{it.checked ? <Icon name="check" size={14} /> : it.icon ? <Icon name={it.icon} size={14} /> : null}</span>
              <span>{it.label}</span>
              {it.meta || it.shortcut ? <span className="pw-muted pw-list__meta">{it.meta ?? it.shortcut}</span> : null}
            </>;
            const cls = cx("pw-list__item", it.tone && "pw-tone--" + it.tone, it.checked && "is-selected");
            return it.checked !== undefined
              ? <DM.CheckboxItem key={i} className={cls} disabled={it.disabled} checked={it.checked} onSelect={it.onSelect}>{body}</DM.CheckboxItem>
              : <DM.Item key={i} className={cls} disabled={it.disabled} onSelect={it.onSelect}>{body}</DM.Item>;
          })}
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}

/* ---------- CopyButton ---------- */
async function writeClipboard(text: string) {
  try { await navigator.clipboard.writeText(text); return; } catch { /* insecure context or denied: fall back */ }
  const ta = document.createElement("textarea");
  ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
  document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
}
export function CopyButton({ value, label = "Copy", children, onCopy }: CopyButtonProps) {
  const [done, setDone] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = async () => {
    await writeClipboard(value);
    onCopy && onCopy(value);
    setDone(true); window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setDone(false), 1500);
  };
  const status = <span className="pw-sr" role="status">{done ? "Copied" : ""}</span>;
  if (children == null) return <>{status}<Button variant="ghost" size="sm" icon={done ? "check" : "copy"} aria-label={label} title={done ? "Copied" : label} onClick={copy} /></>;
  return (
    <button type="button" className="pw-copy" title={done ? "Copied" : "Copy"} onClick={copy}>
      <span className="pw-mono">{children}</span><Icon name={done ? "check" : "copy"} size={14} />{status}
    </button>
  );
}

/* ---------- Tag ---------- */
export function Tag({ children, mono, onRemove, removeLabel }: TagProps) {
  const text = typeof children === "string" || typeof children === "number" ? String(children) : "";
  return (
    <span className={cx("pw-chip", mono && "pw-mono")}>
      <span>{children}</span>
      {onRemove ? <button type="button" className="pw-chip__x" aria-label={removeLabel || ("Remove " + text).trim()} onClick={onRemove}><Icon name="x" size={12} /></button> : null}
    </span>
  );
}

/* ---------- CodeBlock (code, diffs, logs) ---------- */
// `diff`: lines starting with + or − are marked added or removed by a sign column, a neutral tint and words for screen
// readers. No red and green: red is kept for what needs action, and the sign carries the meaning.
type DiffKind = "add" | "del" | "hunk" | null;
const diffKind = (l: string): DiffKind => l.startsWith("+++") || l.startsWith("---") ? "hunk" : l.startsWith("+") ? "add" : l.startsWith("-") ? "del" : l.startsWith("@@") ? "hunk" : null;
export function CodeBlock({ code, title, lineNumbers, wrap: wrapInit = false, maxHeight = 320, highlight = [], copy = true, diff }: CodeBlockProps) {
  const lines = code.replace(/\n$/, "").split("\n");
  const nums = lineNumbers ?? lines.length > 1;
  const [wrap, setWrap] = useState(wrapInit);
  const hl = new Set(highlight);
  const numW = String(lines.length).length + "ch";
  return (
    <figure className="pw-code">
      <figcaption className="pw-code__bar">
        <span className="pw-caption pw-muted">{title}</span>
        <span className="pw-code__acts">
          <button type="button" className="pw-chart__toggle" aria-pressed={wrap} onClick={() => setWrap(!wrap)}>Wrap lines</button>
          {copy ? <CopyButton value={code} label={"Copy " + (title || "code")} /> : null}
        </span>
      </figcaption>
      <pre className={cx("pw-code__pre", wrap && "is-wrap")} style={{ maxHeight }} tabIndex={0} aria-label={title || "Code"}>
        <code>{lines.map((l, i) => {
            const k = diff ? diffKind(l) : null;
            const text = diff && (k === "add" || k === "del") ? l.slice(1) : l;
            return (
              <span key={i} className={cx("pw-code__line", hl.has(i + 1) && "is-hl", k && "is-" + k)}>
                {nums ? <span className="pw-code__n" style={{ width: numW }} aria-hidden="true">{i + 1}</span> : null}
                {diff ? <span className="pw-code__sign" aria-hidden="true">{k === "add" ? "+" : k === "del" ? "−" : " "}</span> : null}
                {k === "add" ? <span className="pw-sr">Added: </span> : k === "del" ? <span className="pw-sr">Removed: </span> : null}
                <span className="pw-code__t">{text || " "}</span>
              </span>
            );
        })}</code>
      </pre>
    </figure>
  );
}
