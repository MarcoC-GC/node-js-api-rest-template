/**
 * Identity Module — Dependency Injection Tokens
 *
 * Tokens for all dependencies that belong to the Identity module (RBAC).
 * Includes repositories, domain services, use cases, controllers, and routes.
 *
 * @example
 * ```typescript
 * import { IDENTITY_TOKENS } from '@/modules/identity/identity.tokens'
 *
 * container.register(IDENTITY_TOKENS.PermissionRepository, { useFactory: ... })
 * ```
 */
export const IDENTITY_TOKENS = {
  // ── Repositories ────────────────────────────────────────────────────
  PermissionRepository: Symbol.for('Identity.PermissionRepository'),
  RoleRepository: Symbol.for('Identity.RoleRepository'),
  UserRepository: Symbol.for('Identity.UserRepository'),

  // ── Domain Services ─────────────────────────────────────────────────
  AuthorizationService: Symbol.for('Identity.AuthorizationService'),

  // ── Use Cases — Permissions ─────────────────────────────────────────
  GetPermissionByIdUseCase: Symbol.for('Identity.GetPermissionByIdUseCase'),
  ListPermissionsUseCase: Symbol.for('Identity.ListPermissionsUseCase'),

  // ── Controllers ─────────────────────────────────────────────────────
  PermissionsController: Symbol.for('Identity.PermissionsController'),

  // ── Routes ──────────────────────────────────────────────────────────
  PermissionsRoutes: Symbol.for('Identity.PermissionsRoutes')
} as const
