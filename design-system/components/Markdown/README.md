Model output rendered as Pairwise elements: text styles, links, lists, tables, inline code, and `CodeBlock` for fences.

**Consumer provides:** the Markdown text as children; `streaming` while it is still arriving; `sources` + `onSource` to turn "[1]" into citations; `onLink` for in-app navigation; `headingLevel` (default 3: headings never rank above it).

- Built on markdown-to-jsx (MIT), which builds React elements and never uses innerHTML. Raw HTML is shown as text, images become links (a model can't make the page load an image), and unsafe URLs are dropped.
- Fences become `CodeBlock` with copy and wrap. A `diff` fence uses CodeBlock's `diff`. There is no multi-hue syntax theme.
- While `streaming`, unfinished syntax is held back, so stray `**` or backticks never flash.
- It is its own module, so apps that don't render Markdown don't load the parser.
