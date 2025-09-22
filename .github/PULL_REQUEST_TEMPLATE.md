### Summary

Migrate Fastify to v5 and update dev tooling.

### Changes

- Upgraded `fastify` to v5.
- Adjusted `src/index.ts` to move `ignoreTrailingSlash` into router options (applied via a safe runtime cast to keep TypeScript compatibility).
- Replaced `ts-node-dev` with `nodemon` + `ts-node` to remove deprecated `rimraf@2.x` transitive dependency.
- Updated `esbuild` and ESLint toolchain to modern versions; simplified ESLint config to `plugin:@typescript-eslint/recommended`.
- Added/updated tests and installed `supertest`.

### Why

Fastify v5 contains improvements and will be the current major version. This migration addresses deprecation warnings and keeps the boilerplate up to date.

### Risks

- Fastify v5 contains breaking changes; verify all plugins and middleware used in downstream projects remain compatible.
- `routerOptions` typing is bypassed via a cast in `src/index.ts` to avoid TypeScript compatibility issues; consider updating types or using proper migration patterns.

### How to test

```bash
pnpm install
pnpm test
pnpm build
node dist/index.js # or pnpm start
curl http://localhost:3000/health
```

### Next steps

- Migrate Middy to v6 in a follow-up PR (breaking changes expected).
- Consider stricter TypeScript typing for `routerOptions` usage.
- Add CI job for Node LTS matrix if desired.

### Notes

If you want, I can push this branch to the remote and open the PR for you; provide the repo remote URL or grant push permissions.
