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

The project adapts automatically based on the environment:

- **Lambda** – detected when `AWS_LAMBDA_FUNCTION_NAME` is set. Fastify is not auto-started; the exported handler injects requests.
- **Container / Node process** – the HTTP server auto-starts (unless `DISABLE_SERVER_AUTOSTART=true`).
- Override detection with `RUNTIME_TARGET=container|lambda|node`.

### Docker image

A multi-stage `Dockerfile` is available. Build and run locally:

```bash
docker build -t microservices-ai .
docker run -p 3000:3000 --env-file .env microservices-ai
```

## Middleware & Observability

The service wires optional Fastify plugins when available:

- `@fastify/request-id` – propagates request IDs (falls back to UUIDs if missing).
- `@fastify/cors` – configurable CORS with allowlist.
- `@fastify/helmet` – security headers.
- `@fastify/compress` – gzip compression when beneficial.
- Built-in logging (Pino), metrics, health/ready routes, and rate limiting.

If any middleware is not installed in your environment the server logs a debug message and continues gracefully.

### Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `LOG_LEVEL` | `debug` (non-prod) / `info` (prod) | Logger level |
| `LOG_PRETTY` | `true` (non-prod) / `false` (prod) | Enable pretty logger transport when available |
| `PORT` | `3000` | HTTP port for containers/local runs |
| `HOST` | `0.0.0.0` | Host binding |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `RATE_LIMIT_WINDOW_SEC` | `60` | Rate limit window size (seconds) |
| `HTTP_REQUEST_ID_HEADER` | `x-request-id` | Header used to propagate request IDs |
| `HTTP_CORS_ENABLED` | `true` | Enable CORS handling |
| `HTTP_CORS_ORIGIN` | `*` | Comma-separated list of allowed origins |
| `HTTP_CORS_METHODS` | `GET,POST,PUT,PATCH,DELETE,OPTIONS` | Allowed HTTP methods |
| `HTTP_CORS_ALLOW_CREDENTIALS` | `false` | Allow credentials in CORS responses |
| `HTTP_COMPRESSION_ENABLED` | `true` | Enable gzip compression (if plugin available) |
| `HTTP_COMPRESSION_MIN_LENGTH` | `1024` | Minimum payload size before compressing |
| `HTTP_SECURITY_HEADERS_ENABLED` | `true` | Toggle security headers (helmet fallback) |
| `DISABLE_SERVER_AUTOSTART` | unset | Prevent Fastify from listening automatically |

## Endpoints

- `GET /health` – health probe
- `GET /ready` – readiness probe
- `GET /metrics` – Prometheus metrics
- `GET /openapi.json` – OpenAPI JSON
- `GET /protected` – example protected route (JWT)
- `POST /login` – issues demo JWT (`{"username":"admin","password":"password"}`)

## Files of interest

- `Dockerfile` – container build recipe
- `src/index.ts` – Fastify bootstrap and middleware wiring
- `src/runtime.ts` – runtime detection helpers
- `src/handlers/lambda.ts` – Lambda adapter that injects Fastify
- `src/config.ts` – centralized configuration loader

## License

MIT
