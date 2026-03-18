# React Daily Challenges

Daily React coding challenges for senior-level interview prep. Each challenge covers state management, data fetching, component design, testing, performance, and more.

## Getting Started

```bash
cd react-daily-challenges
npm install
```

## Repository Structure

```
challenges/          ← Original challenge code (pristine — never edit these)
  2026-03-16-.../
    README.md        ← Problem statement, requirements, hints
    Component.tsx    ← Buggy / incomplete / messy starter code
    Component.test.tsx ← Tests that define success
solutions/           ← Your workspace (fix bugs, implement features here)
  2026-03-16-.../
    (same files)     ← Starts as a copy of challenges/ — edit these
```

The `challenges/` directory is the untouched archive of each original problem. The `solutions/` directory is where you do your work — fix bugs, implement features, refactor code. Tests run against `solutions/`.

If you want to start fresh on a challenge, copy the original files back from `challenges/` into `solutions/`.

## Working on a Challenge

1. Read the challenge's `README.md` in `challenges/` (or `solutions/` — they're identical) for the problem statement
2. Edit the source files in `solutions/YYYY-MM-DD-challenge-name/`
3. Run the tests to check your work

```bash
# Run a specific challenge's tests
npm run test:challenge -- solutions/2026-03-17

# Watch mode for iterating
npm run test:watch -- solutions/2026-03-17

# Run ALL tests
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

State management, data fetching, component design, performance, testing, TypeScript patterns, accessibility, forms, error handling, hooks, concurrent React, and advanced patterns.

## Progress

Progress is tracked automatically in `tracker.json` at the repo root.
