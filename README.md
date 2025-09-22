# microservices-ai boilerplate

Minimal TypeScript + Fastify boilerplate optimized for AWS Lambda with esbuild bundling.

Quickstart

1. Install dependencies (pnpm recommended):

```bash
pnpm install
```

2. Copy `.env.example` to `.env` and adjust values.

3. Run in development:

```bash
pnpm run dev
```

# Endpoints

- `GET /health` - health check
- `GET /metrics` - Prometheus metrics
- `GET /openapi.json` - OpenAPI JSON
- `GET /protected` - example protected route (JWT)
- `POST /login` - issue a JWT for demo/testing; send JSON `{ "username": "admin", "password": "password" }`
# microservices-ai-boilerplate

Minimal Node.js + TypeScript boilerplate optimized for AWS Lambda (low cold start) and small REST APIs.

Features

- Fastify HTTP framework (lightweight, fast)
- Bundled with `esbuild` for small, minified artifact
- TypeScript + Vitest for tests
- Minimal Lambda handler adapter

Quick start

```bash
# install deps (recommended: pnpm)
pnpm install

# build
pnpm build

# run locally
pnpm start

# run tests
pnpm test
```

Files of interest

- `src/index.ts` - Fastify server and entrypoint
- `src/handlers/lambda.ts` - minimal Lambda adapter
- `package.json` - scripts and deps

License: MIT
