# The Accordion Cleanup

**Date:** 2026-03-17 (Bonus)
**Category:** Component Design
**Type:** Refactor
**Difficulty:** Intermediate

## Problem

A junior dev shipped this `Accordion` component in a hurry. It works — all tests pass — but the code is a mess. Duplicated logic, inline everything, prop drilling where it doesn't belong, and not a compound component pattern in sight.

Your job: **refactor the component to be clean, idiomatic React** while keeping every test green. The tests are your safety net — run them early, run them often.

## Requirements

1. **Extract the compound component pattern** — The accordion should expose `Accordion`, `Accordion.Item`, `Accordion.Trigger`, and `Accordion.Content` (or similar) instead of jamming everything into one component.
2. **Eliminate duplicated logic** — There are at least two places where the same expand/collapse logic is copy-pasted. Consolidate it.
3. **All existing tests must continue to pass** — Don't change the test file.

## Hints

<details>
<summary>Hint 1</summary>

React Context is a natural fit for sharing the "which item is open" state between the parent `Accordion` and its children without prop drilling.

</details>

<details>
<summary>Hint 2</summary>

You can attach sub-components to the parent via `Accordion.Item = AccordionItem` etc. — this is the standard compound component export pattern.

</details>

## Running the Tests

```bash
cd ~/Projects/react-daily-challenges && npm run test:challenge -- challenges/2026-03-17-accordion-cleanup
```
