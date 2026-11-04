// Small, very common building blocks: an action menu, a copy button, a tag and a code / log block.
import * as React from "react";
import * as DM from "@radix-ui/react-dropdown-menu";
import type { ActionMenuProps, CopyButtonProps, TagProps, CodeBlockProps } from "./types";
import { cx, Button } from "./core";
import { Icon } from "./icons";
const { useState, useRef, useEffect } = React;

/* ---------- ActionMenu (Radix DropdownMenu) ---------- */
export function ActionMenu({ items, label = "More actions", trigger, align = "end", forceOpen }: ActionMenuProps) {
  return (
    <DM.Root {...(forceOpen ? { open: true, modal: false } : {})}>
      <DM.Trigger asChild>{trigger ?? <Button variant="ghost" icon="more" aria-label={label} />}</DM.Trigger>
      <DM.Portal>
        <DM.Content className="pw-menu" align={align} sideOffset={4} loop>
          {items.map((it, i) => it === "separator" ? <DM.Separator key={i} className="pw-menu__sep" /> : (
            <DM.Item key={i} className={cx("pw-list__item", it.tone && "pw-tone--" + it.tone)} disabled={it.disabled} onSelect={it.onSelect}>
              <span className="pw-list__check">{it.icon ? <Icon name={it.icon} size={14} /> : null}</span>
              <span>{it.label}</span>
              {it.shortcut ? <span className="pw-muted pw-list__meta">{it.shortcut}</span> : null}
            </DM.Item>
          ))}
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

/* ---------- CodeBlock (code, diffs as text, logs) ---------- */
export function CodeBlock({ code, title, lineNumbers, wrap: wrapInit = false, maxHeight = 320, highlight = [], copy = true }: CodeBlockProps) {
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
        <code>{lines.map((l, i) => (
          <span key={i} className={cx("pw-code__line", hl.has(i + 1) && "is-hl")}>
            {nums ? <span className="pw-code__n" style={{ width: numW }} aria-hidden="true">{i + 1}</span> : null}
            <span className="pw-code__t">{l || " "}</span>
          </span>
        ))}</code>
      </pre>
    </figure>
  );
}
