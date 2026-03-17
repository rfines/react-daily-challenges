# React Daily Challenges

Daily React coding challenges for senior-level interview prep. Each challenge covers state management, data fetching, component design, testing, performance, and more.

## Getting Started

```bash
cd react-daily-challenges
npm install
```

## Repository Structure

```
challenges/          ← Starter code (this is where you work)
  2026-03-16-.../
    README.md        ← Problem statement, requirements, hints
    Component.tsx    ← Buggy / incomplete / messy code to fix
    Component.test.tsx ← Tests that define success
solutions/           ← Reference solutions (no peeking!)
  2026-03-16-.../
    Component.tsx    ← Working solution code
    Component.test.tsx ← Same tests (for verification)
```

The `challenges/` directory contains starter code with bugs, stubs, or messy code depending on the challenge type. The `solutions/` directory contains reference implementations. Try to solve each challenge on your own before checking the solution!

## Working on a Challenge

1. Read the challenge's `README.md` for the problem statement and requirements
2. Edit the source files in `challenges/YYYY-MM-DD-challenge-name/`
3. Run the tests to check your work

```bash
# Run a specific challenge's tests
npm run test:challenge -- challenges/2026-03-17

# Watch mode for iterating
npm run test:watch -- challenges/2026-03-17

# Run ALL challenge tests
npm test
```

## Verifying Solutions

You can run the tests against the reference solutions to confirm they pass:

```bash
npm run test:solutions -- solutions/2026-03-17
```

## Challenge Types

| Type | What You Do |
|------|------------|
| **debug** | Find and fix bugs in existing React components |
| **fix-tests** | Correct failing test assertions or test logic |
| **add-coverage** | Write tests for an untested component |
| **build-feature** | Implement a component or hook from requirements |
| **refactor** | Improve code quality without changing behavior |
| **performance** | Optimize a component with measurable perf issues |

## Topics Covered

- State management (useState, useReducer, context, external stores)
- Data fetching (useEffect, Suspense, custom hooks, caching)
- Component design (composition, render props, compound components)
- Performance (memoization, virtualization, lazy loading, profiling)
- Testing (unit, integration, mocking, async testing)
- TypeScript patterns (generics, discriminated unions, type narrowing)
- Accessibility (ARIA, keyboard nav, screen readers)
- Forms (controlled/uncontrolled, validation, complex state)
- Error handling (error boundaries, graceful degradation)
- Hooks (custom hooks, rules of hooks, closure pitfalls)
- Concurrent React (transitions, Suspense boundaries, streaming)
- Patterns (HOCs, render props, compound components, state machines)

## Progress

Progress is tracked automatically in `tracker.json` at the repo root (created on first challenge).
