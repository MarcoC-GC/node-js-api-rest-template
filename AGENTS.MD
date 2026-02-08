# AGENTS.MD — Node.js REST API Template

## Resumen del Proyecto

API REST construida con **Node.js**, **TypeScript** y **Express 5**, siguiendo los principios de **Domain-Driven Design (DDD)** y **Clean Architecture**. El proyecto implementa un sistema RBAC (Role-Based Access Control) como módulo de identidad, con entidades de dominio ricas, Value Objects, y separación estricta de capas.

- **Runtime:** Node.js con ES Modules (`"type": "module"`)
- **Lenguaje:** TypeScript 5.9+ con `strict: true`
- **Target:** ES2024
- **Package Manager:** pnpm 10
- **Base de Datos:** PostgreSQL con Prisma ORM 7
- **Path Alias:** `@/*` → `./src/*`

---

## Stack Tecnológico y Uso de Librerías

### Producción

| Librería | Propósito | Dónde se usa |
|---|---|---|
| **express@5** | Framework HTTP | `src/app.ts`, controllers, routes, middlewares |
| **@prisma/client@7** | ORM y acceso a datos | Solo en capa `infrastructure/persistence/` |
| **@prisma/adapter-pg** + **pg** | Adaptador PostgreSQL para Prisma | Solo en `src/config/container.ts` |
| **zod@4** | Validación de variables de entorno | Solo en `src/config/env.ts` |
| **bcrypt** | Hashing de contraseñas | Solo en capa `infrastructure` (servicios de hashing) |
| **jsonwebtoken** | Generación y verificación de JWT | Solo en capa `infrastructure` (servicios de auth) |
| **ms** | Parsing de duraciones (e.g. `"7d"`) | Complemento de JWT config |
| **cors** | Middleware CORS | `src/modules/common/middleware/cors.middleware.ts` |
| **dotenv** | Carga de `.env` | `src/config/env.ts` |
| **reflect-metadata** | Metadata de decoradores | Disponible para DI futura con tsyringe |
| **tsyringe** | Contenedor de inyección de dependencias | Tokens definidos en `src/config/tokens.ts` (DI manual actual en `container.ts`) |

### Desarrollo

| Librería | Propósito |
|---|---|
| **vitest** + **@vitest/coverage-v8** | Testing y cobertura |
| **eslint** + **@typescript-eslint** | Linting con reglas estrictas |
| **prettier** + **eslint-plugin-prettier** | Formateo de código |
| **husky** + **lint-staged** | Git hooks (pre-commit) |
| **tsx** | Ejecución directa de TypeScript en desarrollo |
| **tsc-alias** | Resolución de path aliases en build |
| **prisma** | CLI de migraciones y generación de cliente |

---

## Arquitectura: Clean Architecture + DDD

### Estructura de Carpetas por Módulo

```
src/modules/<module>/
├── domain/                    # Capa de Dominio (el corazón)
│   ├── entities/              # Entidades con lógica de negocio
│   ├── value-objects/         # Value Objects inmutables
│   ├── repositories/          # Interfaces de repositorios (contratos)
│   └── services/              # Servicios de dominio
├── application/               # Capa de Aplicación (orquestación)
│   └── <feature>/
│       ├── use-cases/         # Casos de uso (1 clase = 1 acción)
│       ├── dtos/              # DTOs de entrada/salida
│       └── mappers/           # Mappers Entity → DTO
└── infrastructure/            # Capa de Infraestructura (detalles técnicos)
    ├── http/
    │   ├── controllers/       # Controllers Express
    │   └── routes/            # Definición de rutas
    └── persistence/
        └── prisma/            # Implementaciones de repositorios
```

### Carpetas Compartidas

```
src/lib/                       # Utilidades agnósticas al dominio
├── errors/                    # Jerarquía de errores (BaseError → Domain/App/Infra)
├── result/                    # Result<TSuccess, TError> (Railway-oriented programming)
└── logger/                    # Abstracción de logger (ILogger interface)

src/modules/common/            # Código compartido entre módulos
├── errors/                    # Errores concretos reutilizables (NotFound, Conflict, etc.)
├── middleware/                # Middlewares Express compartidos
├── mappers/                   # ErrorMapper → RFC 9457 Problem Details
├── dtos/                      # DTOs compartidos (paginación)
├── services/                  # Servicios compartidos (PaginationService)
└── types/                     # Tipos compartidos
```

---

## Dependencias entre Capas

```
┌─────────────────────────────────────────────┐
│              Infrastructure                  │
│  (Express, Prisma, bcrypt, jsonwebtoken)     │
│                                              │
│  Depende de: Application, Domain, lib        │
│  Implementa: Interfaces de Domain            │
└──────────────────────┬──────────────────────┘
                       │ depende de
┌──────────────────────▼──────────────────────┐
│              Application                     │
│  (Use Cases, DTOs, Mappers)                  │
│                                              │
│  Depende de: Domain, lib, common             │
│  NO depende de: Infrastructure               │
└──────────────────────┬──────────────────────┘
                       │ depende de
┌──────────────────────▼──────────────────────┐
│              Domain                          │
│  (Entities, Value Objects, Repository        │
│   Interfaces, Domain Services)               │
│                                              │
│  Depende de: lib/result, common/errors       │
│  NO depende de: Infrastructure, Application  │
│  NO depende de: Librerías externas           │
└─────────────────────────────────────────────┘
```

**Regla de Dependencia:** Las dependencias siempre apuntan hacia adentro. La capa externa conoce la interna, nunca al revés.

---

## Patrones y Convenciones

### Result Pattern (Railway-Oriented Programming)

Todos los métodos que pueden fallar retornan `Result<TSuccess, TError>` en lugar de lanzar excepciones:

```typescript
// ✅ Correcto
async execute(id: string): Promise<Result<PermissionResponseDto, Error>>

// ❌ Incorrecto — no lanzar excepciones para errores de negocio
async execute(id: string): Promise<PermissionResponseDto> // throws
```

- Las entidades de dominio retornan `Result<T, ValidationError>` en sus factory methods y métodos de negocio.
- Los repositorios retornan `Result<T, Error>` envolviendo errores de base de datos.
- Los use cases retornan `Result<T, Error>` que los controllers evalúan con `isSuccess()`.

### Jerarquía de Errores

```
BaseError (abstract)
├── DomainError (abstract) — httpStatus: 422, severity: LOW
│   ├── ValidationError — 400
│   ├── NotFoundError — 404
│   └── ConflictError — 409
├── ApplicationError (abstract) — httpStatus: 400, severity: MEDIUM
│   ├── UnauthorizedError — 401
│   └── ForbiddenError — 403
└── InfrastructureError (abstract) — httpStatus: 500, severity: HIGH
    └── DatabaseError — 500
```

- Los errores de dominio son **operacionales** (esperados).
- Los errores de infraestructura son **no-operacionales** por defecto (bugs o fallos de sistema).
- Todos los errores se mapean automáticamente a **RFC 9457 Problem Details** en el `ErrorHandlerMiddleware`.

### Entidades de Dominio

- Constructor **privado** — instanciación solo vía `static create()` (con validación) o `static reconstitute()` (desde persistencia, sin validación).
- Propiedades **privadas** con getters `readonly`.
- **Mutación controlada** mediante métodos de negocio que retornan `Result`.
- Igualdad por **identidad** (`equals()` compara IDs, no valores).

### Value Objects

- **Inmutables** — constructor privado, sin setters.
- Factory method `static create()` con validación que retorna `Result`.
- Method `static fromString()` para reconstitución desde persistencia.
- `getValue()`, `equals()`, `toString()` como API pública.
- IDs basados en UUID v4 generados con `node:crypto`.

### Inyección de Dependencias

- **Composition Root** en `src/config/container.ts` — toda la composición de dependencias ocurre aquí.
- DI manual (sin decoradores actualmente) — instanciación explícita siguiendo el orden: Repositories → Use Cases → Controllers → Routes.
- Las dependencias se inyectan por **constructor** usando **interfaces** (nunca implementaciones concretas en capas superiores).

### Controllers

- Reciben **use cases** por constructor (nunca repositorios directamente).
- Extraen datos del request, invocan el use case, y manejan el `Result`.
- Errores se delegan a `next(error)` para el middleware global.
- No contienen lógica de negocio.

### Repositorios

- La interfaz se define en `domain/repositories/`.
- La implementación vive en `infrastructure/persistence/prisma/`.
- Todos los métodos retornan `Result<T, Error>` con `try/catch` que envuelve errores en `DatabaseError`.

---

## Restricciones y Reglas Estrictas

### TypeScript

- ❌ **No usar `any`** — ESLint rule `@typescript-eslint/no-explicit-any: warn` (aspirar a `error`). Usar `unknown` y hacer type narrowing.
- ✅ **`strict: true`** habilitado en tsconfig — incluye `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, etc.
- ✅ Variables no usadas son **error** (`@typescript-eslint/no-unused-vars: error`), excepto las que empiezan con `_`.
- ✅ Usar siempre **single quotes**, sin punto y coma, trailing comma nunca (`comma-dangle: never`).

### Domain Layer

- ❌ **Sin dependencias de librerías externas** — la capa de dominio (`domain/`) solo puede importar de `@/lib/result` y `@/modules/common/errors`. Nunca importar Express, Prisma, Zod, bcrypt, ni ninguna otra librería.
- ❌ **Sin efectos secundarios** — las entidades y value objects no hacen I/O, no acceden a base de datos, no hacen llamadas HTTP.
- ❌ **Sin imports de `infrastructure/` ni `application/`** desde `domain/`.
- ✅ Toda validación de reglas de negocio **dentro de las entidades** usando el Result pattern.
- ✅ Las interfaces de repositorio se definen en `domain/repositories/` — son contratos que implementa la capa de infraestructura.
- ✅ Value Objects usan `node:crypto` (módulo nativo de Node.js) que es aceptable como dependencia del runtime.

### Application Layer

- ❌ **Sin acceso directo a base de datos** — solo a través de interfaces de repositorio.
- ❌ **Sin imports de `infrastructure/`** desde `application/`.
- ✅ Un **caso de uso = una clase = una acción** con método `execute()`.
- ✅ Los use cases **orquestan** la lógica llamando a entidades de dominio y repositorios.
- ✅ Los DTOs de response se crean con **Mappers** (Entity → DTO), nunca se exponen entidades directamente.

### Infrastructure Layer

- ✅ Es la **única capa** que conoce detalles técnicos: Express, Prisma, bcrypt, JWT.
- ✅ Implementa las interfaces definidas en el dominio.
- ✅ Los controllers solo reciben use cases inyectados, nunca repositorios.
- ✅ Las rutas se definen como clases con `Router` de Express.

### Manejo de Errores

- ❌ **No lanzar excepciones para errores de negocio** — usar `Result.fail()`.
- ❌ **No atrapar errores genéricos y silenciarlos** — siempre propagar o transformar en el tipo correcto.
- ✅ Las excepciones no controladas se capturan en el **ErrorHandlerMiddleware** global.
- ✅ Respuestas de error siguen **RFC 9457 Problem Details** con `Content-Type: application/problem+json`.
- ✅ Errores incluyen `requestId` para trazabilidad.

### Persistencia

- ✅ Prisma Client se genera en `src/generated/prisma/` (versionado).
- ✅ Se usa el adaptador `@prisma/adapter-pg` con pool de conexiones `pg`.
- ✅ Las migraciones están en `prisma/migrations/` y se ejecutan con `prisma migrate dev`.
- ✅ El seed se ejecuta con `tsx prisma/seed.ts`.
- ✅ Los modelos de Prisma usan `@@map()` para mapear a nombres de tabla en snake_case.

### Convenciones de Nombres

| Elemento | Convención | Ejemplo |
|---|---|---|
| Entidades | PascalCase | `Permission`, `User`, `Role` |
| Value Objects | PascalCase con sufijo `.vo.ts` | `email.vo.ts`, `user-id.vo.ts` |
| Interfaces | Prefijo `I` | `IPermissionRepository`, `ILogger`, `IMiddleware` |
| Use Cases | PascalCase con sufijo `UseCase` | `GetPermissionByIdUseCase` |
| DTOs | PascalCase con sufijo `Dto` | `PermissionResponseDto` |
| Errores | PascalCase con sufijo `Error` | `NotFoundError`, `DatabaseError` |
| Archivos | kebab-case | `permission.entity.ts`, `get-permission-by-id.use-case.ts` |
| Tablas DB | snake_case plural | `users`, `roles`, `permissions` |
| Columnas DB | snake_case | `first_name`, `is_active`, `created_at` |

---

## Comandos del Proyecto

```bash
pnpm dev              # Desarrollo con hot-reload (tsx watch)
pnpm build            # Compilar TypeScript + resolver aliases (tsc && tsc-alias)
pnpm start            # Ejecutar build de producción (node dist/index.js)
pnpm lint             # Ejecutar ESLint
pnpm lint:fix         # Ejecutar ESLint con auto-fix
pnpm format           # Formatear con Prettier
pnpm format:check     # Verificar formato
pnpm test             # Ejecutar tests con Vitest
pnpm test:ui          # UI interactiva de Vitest
pnpm test:coverage    # Tests con reporte de cobertura
npx prisma migrate dev    # Crear/aplicar migraciones
npx prisma generate       # Regenerar Prisma Client
npx prisma studio         # UI visual de la base de datos
```

---

## Módulo de Identidad (RBAC)

### Entidades

- **User** — Aggregate Root. Email único, un rol por usuario, soft delete, estados activo/inactivo.
- **Role** — Agrupa permisos. Roles de sistema (`isSystem`) no modificables. M2M con permissions.
- **Permission** — Formato `resource:action`. Soporta wildcards (`*:*`, `users:*`, `*:read`).

### Value Objects

- `UserId`, `RoleId`, `PermissionId` — UUID v4 con validación.
- `Email` — Normalización a lowercase, validación de formato.
- `Password` — Mínimo 8 caracteres, requiere mayúscula, minúscula, número y carácter especial. Max 72 (límite bcrypt).

### Servicios de Dominio

- **AuthorizationService** — Verifica si un usuario tiene un permiso o rol específico, con soporte de wildcards.
