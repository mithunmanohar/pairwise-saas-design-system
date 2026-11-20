A person or team: their image, or their initials on a neutral fill. `AvatarGroup` overlaps several, with "+N" for the rest. Built on Radix Avatar, which shows the initials until the image loads, or if it fails.

**Consumer provides:** `name`. Optional `src`, `size` (20, 28 default, 32 or 36), `status` (a small status mark), `initials` (to override them) and `decorative` (when the name is already written next to it). AvatarGroup: `people` `[{name, src?}]`, `max` (default 4), `size`, `label` (e.g. "Reviewers").

- No colour per person: Signal keeps colour for status. Tell people apart by name and image.
- An avatar is an image named after the person ("Dev F, critical"). A group is named "Reviewers: Dev A, Dev B, Dev C and 3 others".
- Avatars aren't buttons. Wrap one in a button or link only when it opens the person, and name that.
