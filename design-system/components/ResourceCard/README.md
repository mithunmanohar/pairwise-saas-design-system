A resource an answer refers to: its kind (icon + word), its name, status, where it sits below the scope, and a few facts.

**Consumer provides:** `kind` (an `EntityKind`), `name` (`mono` for identifiers), `href` or `onOpen`, optional `status` + `statusLabel`, `path`, `facts` (two to four), `actions` (a menu).

- The name is the only link. Actions sit in a menu, so the card is never one large nested control.
- Status follows the status grammar: healthy shows nothing, and only critical asks for action.
- Use it for the resources an assistant mentions, and for "Related" lists on resource pages.
