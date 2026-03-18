# The Mistrusted Table

**Date:** 2026-03-18
**Category:** performance
**Type:** fix-tests
**Difficulty:** Senior

---

## Problem

Someone wrote a `SortableTable` component that uses `React.memo`, `useMemo`, and
`useCallback` correctly — it renders efficiently and behaves exactly as expected.

Unfortunately the test file shipped with **4 bugs**. The tests are currently
failing, but the component itself is fine.

Your job is to find and fix the 4 bugs in `SortableTable.test.tsx` without
touching `SortableTable.tsx`.

---

## Requirements

1. **All 9 tests must pass** — do not delete, skip, or comment out any test.
2. **Every fix must be in the test file only** — the component is correct as-is.
3. **Understand why each assertion was wrong**, not just what number or string
   makes it pass. The comments in the test file point you to the right lines.

---

## Running the tests

```bash
cd ~/Projects/react-daily-challenges
npm run test:challenge -- solutions/2026-03-18-mistrusted-table
```

You'll see which tests are failing and the received vs. expected values.

---

## Hints

<details>
<summary>Hint 1 — Bug 1</summary>

`getAllByRole('row')` queries the entire table, including `<thead>`. A table
with N data rows always has N + 1 total `<tr>` elements when there is a header.

</details>

<details>
<summary>Hint 2 — Bug 4</summary>

WAI-ARIA defines four valid values for `aria-sort`: `ascending`, `descending`,
`none`, and `other`. Check the
[MDN docs](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-sort)
if you're unsure which value applies after the second click.

</details>
