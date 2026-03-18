# The Untested Cart

**Date:** 2026-03-17
**Category:** state-management
**Type:** add-coverage
**Difficulty:** Senior

---

## Problem Statement

You've inherited a fully working shopping cart implementation. It handles adding products, adjusting quantities, removing items, applying coupon codes, and clearing the cart. The logic lives in a custom `useCartReducer` hook built on `useReducer`, and `CartManager` is the presentational layer.

There's just one problem: **there are zero tests.**

Your job is to write comprehensive test coverage for both the reducer logic and the rendered component. Don't just test the happy path — this codebase has several non-obvious edge cases that real bugs live in. Find them, document them in your tests, and make sure they're pinned down forever.

---

## Requirements

1. **Test `cartReducer` as a pure function.** Cover every action type. Pay special attention to boundary conditions: what happens at `MAX_QUANTITY`, what happens when `quantity` drops to zero or below, and what happens with invalid vs. valid coupon codes (including case sensitivity and whitespace).

2. **Test `useCartReducer` as a hook.** Use `renderHook` to verify that `derived` state (`subtotal`, `discount`, `total`, `itemCount`) is calculated correctly after a sequence of dispatches, and that memoization means the derived object reference only changes when the underlying data changes.

3. **Test `CartManager` as a rendered component.** Use React Testing Library (query by role and `aria-label`, not by test IDs). Cover the full user workflow: adding a product, adjusting quantity with the `+`/`−` buttons, removing an item, entering a coupon code (both via button click and Enter key), removing a coupon, and clearing the cart. Also verify the "Clear Cart" button is disabled when the cart is empty.

---

## Hints

<details>
<summary>Hint 1 — Coupon edge cases</summary>

The reducer normalizes coupon codes before looking them up (`trim().toUpperCase()`). Does your test suite catch what happens with `" save10 "` (leading/trailing spaces and lowercase)? Also: applying an invalid coupon returns state unchanged — does the UI give the user any feedback about that failure?

</details>

<details>
<summary>Hint 2 — Quantity clamping removes items</summary>

`UPDATE_QUANTITY` with a value of `0` or below removes the item entirely. The `−` button on an item with `quantity: 1` triggers exactly this path. There's also an upper bound at `MAX_QUANTITY` — calling `ADD_ITEM` on an item already at the cap should clamp silently, not error or exceed the limit.

</details>

---

## Running the Tests

```bash
cd ~/Projects/react-daily-challenges
npm run test:challenge -- solutions/2026-03-17-untested-cart
```

Run in watch mode while you work:

```bash
npm run test:challenge -- solutions/2026-03-17-untested-cart --watch
```

---

## Files

```
useCartReducer.ts     — The reducer logic and custom hook
CartManager.tsx       — The rendered component
types.ts              — Shared TypeScript types
useCartReducer.test.ts — Your reducer/hook tests go here
CartManager.test.tsx  — Your component tests go here
```
