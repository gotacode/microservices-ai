# microservices-ai boilerplate

Minimal Node.js + TypeScript boilerplate optimized for AWS Lambda and lightweight containers.

## Quickstart

```bash
# install deps (recommended pnpm)
pnpm install

# build artifacts
pnpm build

# run local server
pnpm start

# run tests
pnpm test
```

Copy `.env.example` to `.env` and adjust values before running locally or packaging for Lambda.

## Runtime targets

The project automatically adapts based on environment variables:

- **Lambda** – detected when `AWS_LAMBDA_FUNCTION_NAME` is set. Fastify is not auto-started; the exported handler injects requests into the Fastify instance.
- **Container / Node process** – the HTTP server auto-starts (unless `DISABLE_SERVER_AUTOSTART=true`).
- Override detection with `RUNTIME_TARGET=container|lambda|node` as needed.

### Docker image

A multi-stage `Dockerfile` is provided. Build and run locally:

```bash
docker build -t microservices-ai .
docker run -p 3000:3000 --env-file .env microservices-ai
```

### Key environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `LOG_LEVEL` | `debug` (non-prod) / `info` (prod) | Pino log level |
| `LOG_PRETTY` | `true` (non-prod) / `false` (prod) | Enable Pino pretty transport when available |
| `PORT` | `3000` | HTTP port for containers/local runs |
| `HOST` | `0.0.0.0` | Host binding |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `RATE_LIMIT_WINDOW_SEC` | `60` | Rate limit window size |
| `DISABLE_SERVER_AUTOSTART` | unset | Set to `true` to prevent Fastify from listening automatically |

## Endpoints

- `GET /health` – health probe
- `GET /ready` – readiness probe for container orchestrators
- `GET /metrics` – Prometheus metrics
- `GET /openapi.json` – OpenAPI JSON
- `GET /protected` – example protected route (JWT)
- `POST /login` – issues demo JWT (`{"username":"admin","password":"password"}`)

## Files of interest

- `Dockerfile` – container build recipe
- `src/index.ts` – Fastify server and bootstrap
- `src/runtime.ts` – runtime detection helpers
- `src/handlers/lambda.ts` – Lambda adapter that injects requests into Fastify
- `src/config.ts` – centralized configuration loader

## License

MIT
