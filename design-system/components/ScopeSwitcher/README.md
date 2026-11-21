The **runtime scope**: where things run (environment, region, cluster, namespace). It sits in the top bar and its value is part of every link.

**Consumer provides:** `dimensions` `[{key, label, value, options, onChange}]` in order, or the 1.x `scope` + `options` + `onChange` (environment / cloud / cluster). Optional `compact` (only the first two) and `label` (the group's name, default "Environment").

- Runtime scope is not ownership. Who owns something (company, function, squad, initiative, project) is the ownership scope, chosen in the Resource Explorer or the scope picker. The two change independently: switching `prod` to `staging` keeps the same initiative in view.
- Changing scope keeps the current page and re-queries it. It never navigates home.
- Each field keeps the width of its widest option, so switching (`prod` to `staging`) never moves the search box.
- Unavailable options appear with a reason ("(no access)") rather than disappearing.
