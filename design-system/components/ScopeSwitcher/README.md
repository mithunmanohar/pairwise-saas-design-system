Organisation / repository / branch scope. It sits at the left of the top bar and its value is part of every link.

**Consumer provides:** `scope` (one value per dimension), `options` per dimension, `onChange`.

- Each dimension narrows the next: an organisation lists its repositories, a repository its branches.
- Changing scope keeps the current page and re-queries it. It never navigates home.
- Unavailable options appear with a reason ("(no access)") rather than disappearing.

The three levels are named `env`, `cloud` and `cluster`; pass whatever options your project uses.
