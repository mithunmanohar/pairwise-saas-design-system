An answer drawn from typed blocks instead of one long Markdown string, so every kind of information has its own shape: the conclusion first, things to look at as rows, numbers as a strip, the next step set apart, and evidence folded away.

**Consumer provides:** `blocks` (in reading order), `streaming`, `sources` + `onSource` (for "[1]"), `entities` (identifiers that become `EntityRef` chips in text).

| Block | Drawn as |
|---|---|
| `summary` | `AnswerSummary`: the conclusion, with its status |
| `items` | `AttentionList`: rows, worst first, at most 5 |
| `metrics` | `MetricStrip`: up to 4 figures |
| `next` | `NextStep`: the tinted box with buttons |
| `text` | `Markdown`, with citations and entity chips |
| `code` | `CodeBlock` (`diff: true` for a diff) |
| `steps` | "How this was worked out", folded |
| `custom` | any node (a chart, a DataTable) |

- Ask your model for these blocks (structured output or a tool call) instead of prose. Markdown stays for the few sentences in between.
- Writing rules for agents: the summary first, at most two sentences. A list of things becomes `items`, never a paragraph. Numbers go in `metrics`. Give one next step. Name each identifier once.
- While `streaming`, a placeholder shows where the next block goes, and the last text block holds back unfinished syntax.

**Instructions for your model.** Ask for JSON blocks with structured output or a tool call, and add this to its system prompt:

```md
Answer as a JSON array of blocks, in this order:
1. {"type":"summary","text":…,"status":…}: the conclusion in at most two sentences. "critical" only if someone must act now.
2. {"type":"items","title":…,"items":[…]}: the things to look at, worst first, at most five. Each has the identifier, a short title and one action.
3. {"type":"metrics","items":[…]}: at most four figures the conclusion depends on.
4. {"type":"next","text":…}: one next step. Propose it; never say you did it.
5. Then "text" (a sentence or two, citing sources as [1]), "code" (diffs), "steps" (how you worked it out, short).
Name each identifier once, exactly as written in the product (INC-2041, checkout-api). No headings, no tables of prose.
```

