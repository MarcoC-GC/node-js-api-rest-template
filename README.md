# Node.js REST API Template

Boilerplate para arrancar APIs REST en Node.js con TypeScript, arquitectura por capas y enfoque production-ready.

## Stack

- TypeScript + Express 5
- Prisma 7 + PostgreSQL
- Zod para validacion de input
- Vitest para testing
- ESLint + Prettier
- Husky + lint-staged
- OpenAPI/Swagger + Scalar docs

## Requisitos

- Node.js >= 22
- pnpm >= 10

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```

## Post-clone Checklist

1. Cambiar secretos en `.env` (`JWT_SECRET`, credenciales DB, admin seed).
2. Ajustar CORS para tu frontend real (`CORS_ORIGIN`, `CORS_CREDENTIALS`).
3. Configurar `TRUST_PROXY=true` si deployas detras de reverse proxy.
4. Revisar rate limits (`RATE_LIMIT_*`) segun trafico esperado.
5. Ejecutar `pnpm check` antes del primer commit.

## Scripts

```bash
# Development
pnpm dev

# Build / Run
pnpm build
pnpm start

# Quality
pnpm lint
pnpm typecheck
pnpm test
pnpm test:run
pnpm test:coverage
pnpm check

# Prisma
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:migrate:deploy
pnpm prisma:migrate:status
pnpm prisma:migrate:reset
pnpm prisma:push
pnpm prisma:pull
pnpm prisma:studio
pnpm prisma:seed
```

## Variables de Entorno

Base:

- `NODE_ENV`, `PORT`, `API_BASE_URL`
- `DATABASE_URL`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `BCRYPT_SALT_ROUNDS`

Seguridad/Infra:

- `CORS_ORIGIN`
- `CORS_CREDENTIALS`
- `TRUST_PROXY`
- `RATE_LIMIT_GLOBAL_WINDOW_MS`
- `RATE_LIMIT_GLOBAL_MAX`
- `RATE_LIMIT_AUTH_WINDOW_MS`
- `RATE_LIMIT_AUTH_MAX`

Seed:

- `ALLOW_PROD_SEED`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_FIRST_NAME`
- `ADMIN_LAST_NAME`

> El seed bloquea produccion por default. Solo corre en `production` si `ALLOW_PROD_SEED=true`.

## API Docs

- OpenAPI JSON: `GET /api/docs/openapi.json`
- UI (Scalar): `GET /api/docs`
- Healthcheck: `GET /health`

## Estructura

```text
.
├── prisma/
├── src/
│   ├── config/
│   ├── lib/
│   └── modules/
│       ├── common/
│       └── identity/
│           ├── application/
│           ├── domain/
│           ├── infrastructure/
│           └── docs/
├── .github/workflows/ci.yml
├── .env.example
├── eslint.config.js
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

## CI

El workflow de GitHub Actions (`.github/workflows/ci.yml`) corre en push a `main` y en pull requests:

- install (`pnpm install --frozen-lockfile`)
- `pnpm check` (lint + typecheck + tests)

## Licencia

ISC
