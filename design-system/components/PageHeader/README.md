Top of every page: where you are, what this is, its state, and what you can do.

**Consumer provides:** `crumbs`, optional `back` (a ghost button naming where it returns to, with time and filters kept), `title` (`titleMono` for identifiers), `status`, `meta` (repository, branch, commit, owner), `actions` (max one primary), `tabs`.

- Left-aligned. The title is the object's real name (`run_8f3k2`, `feature/add-retry`), not "Run details".
- `back` appears when the user arrived by drill-down, and names the origin page.
