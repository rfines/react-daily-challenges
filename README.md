# React Daily Challenges

A personal daily React coding challenge repo for senior-level interview prep. A new challenge appears each morning at 8am — covering state management, data fetching, component design, testing, performance, and more.

## Getting Started

```bash
cd react-daily-challenges
npm install
```

## Working on a Challenge

Each challenge lives in `challenges/YYYY-MM-DD-challenge-name/` and contains:

- `README.md` — the problem statement, requirements, and hints
- Source files (`.tsx`, `.ts`) — the code you need to fix, complete, or debug
- Test files (`.test.tsx`) — the tests that define success

```bash
# Run a specific challenge's tests
npm run test:challenge -- challenges/2026-03-17

# Watch mode for iterating
npm run test:watch -- challenges/2026-03-17

# Run ALL challenge tests
npm test
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
