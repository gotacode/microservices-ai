PR draft: Remove OAuth, stabilize tests, and add coverage tests

Summary
-------
This branch (`fix/tests-typings`) contains the following changes:

Removed OAuth support files: `src/routes/oauth.ts` and `src/stores/state.ts` were deleted to fully remove OAuth-related code.
- Make Redis optional and testable:
  - `src/plugins/redisClient.ts` now supports lazy init and provides test helpers: `__initRedisClient`, `__getRedisClient`, and `__setRedisClient`.
  - `src/stores/refresh.ts` reads the redis client dynamically so tests can inject a fake redis client.
- Add tests to increase coverage and exercise branches:
  - `test/index.start.test.ts` — tests server start success and failure.
  - `test/redisClient.*.test.ts` — tests for plugin behavior with/without ioredis.
  - `test/refresh.*.test.ts` — expiry and redis-backed refresh store tests.
  - `test/rateLimiter.*.test.ts` — in-memory and redis-limiter tests and helper `__resetRateMap` was added.
- Expose small test helpers:
  - `__getRefreshMap`, `__resetRateMap`, `__initRedisClient`, `__getRedisClient`, `__setRedisClient`.

Why
---
This work stabilizes the test suite so CI doesn't require optional dependencies (like `ioredis`) installed and makes it straightforward to write tests that exercise both in-memory fallbacks and redis-backed paths.

How to run locally
------------------
Install deps (pnpm is recommended):

```bash
pnpm install
```

Run tests:

```bash
pnpm test
```

Run tests with coverage (Istanbul):

```bash
pnpm test -- --coverage --coverageProvider=istanbul
# open coverage/lcov-report/index.html
```

Coverage status
---------------
- Current overall coverage (after these tests): ~53.55% statements (see `coverage/lcov-report/index.html` for full details).
- Major uncovered areas remain; see the coverage report for specific files and line ranges.

Next steps
----------
- Add tests to cover `src/routes/auth.ts` uncovered branches (missing username refresh payload variations).
- Add tests for `src/index.ts` additional branches if desired (logging / NODE_ENV variations).
- Notes
- -----
- OAuth files were deleted in this branch to remove leftover no-op/stubs.
- If you want me to continue toward a higher coverage goal (Option A), I can continue iterating on tests until we reach the target.
