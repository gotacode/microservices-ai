# Copilot instructions for microservices-ai-boilerplate

This file helps AI coding agents contribute safely and productively.

 - Project purpose: minimal TypeScript Node.js REST API optimized to run as AWS Lambda with low cold start using `esbuild` bundling and `fastify`.
 - Build & test commands
 
 - Install: `pnpm install` (repo uses pnpm in CI). `npm install` also works but `pnpm` is recommended for workspace/monorepo setups.
 - Build: `pnpm build` -> runs `esbuild` to `dist/index.js` targeting the repository's Node LTS (esbuild target `node20`).
 - Test: `pnpm test` (runs `vitest`).
 - Files to inspect for context: `package.json`, `tsconfig.json`, `src/index.ts`, `src/handlers/lambda.ts`, `.github/workflows/ci.yml`, `.nvmrc`.

Build & test commands

- Install: `pnpm install` (repo uses pnpm in CI), `npm install` is also supported.
- Build: `pnpm build` -> runs `esbuild` to `dist/index.js`.
- Test: `pnpm test` (runs `vitest`).

Conventions

- TypeScript strict mode is enabled via `tsconfig.json`.
- Keep lambda handler adapters in `src/handlers/`.
- Export `server` from `src/index.ts` for tests.

PRs & CI

- CI runs build and tests via `.github/workflows/ci.yml`.
- Keep changes small and add tests for new behaviors.

Files to inspect for context: `package.json`, `tsconfig.json`, `src/index.ts`, `src/handlers/lambda.ts`, `.github/workflows/ci.yml`.
