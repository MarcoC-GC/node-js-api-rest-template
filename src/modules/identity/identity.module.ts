import { DependencyContainer } from 'tsyringe'
import { PrismaClient } from '@/generated/prisma/client'
import { TOKENS } from '@/config/tokens'
import { IDENTITY_TOKENS } from './identity.tokens'

// Domain — Repository interfaces
import { IPermissionRepository } from './domain/repositories/permission.repository.interface'

// Application — Use Cases
import { GetPermissionByIdUseCase } from './application/permissions/use-cases/get-permission-by-id.use-case'
import { ListPermissionsUseCase } from './application/permissions/use-cases/list-permissions.use-case'

// Infrastructure — Persistence
import { PermissionRepositoryImpl } from './infrastructure/persistence/prisma/permission.repository.impl'

// Infrastructure — HTTP
import { PermissionsController } from './infrastructure/http/controllers/permissions.controller'
import { PermissionsRoutes } from './infrastructure/http/routes/permissions.routes'

/**
 * Identity Module — Dependency Registration
 *
 * Registers all dependencies that belong to the Identity module (RBAC):
 * - Repositories (infrastructure implementations)
 * - Use Cases (application layer)
 * - Controllers (HTTP layer)
 * - Routes (HTTP layer)
 *
 * Called from the Composition Root (config/container.ts).
 * Uses tsyringe's factory providers (no decorators).
 */
export function registerIdentityModule(container: DependencyContainer): void {
  // ── Repositories ──────────────────────────────────────────────────────
  container.register<IPermissionRepository>(IDENTITY_TOKENS.PermissionRepository, {
    useFactory: (c) => {
      const prisma = c.resolve<PrismaClient>(TOKENS.PrismaClient)
      return new PermissionRepositoryImpl(prisma)
    }
  })

  // ── Use Cases ─────────────────────────────────────────────────────────
  container.register<GetPermissionByIdUseCase>(IDENTITY_TOKENS.GetPermissionByIdUseCase, {
    useFactory: (c) => {
      const repo = c.resolve<IPermissionRepository>(IDENTITY_TOKENS.PermissionRepository)
      return new GetPermissionByIdUseCase(repo)
    }
  })

  container.register<ListPermissionsUseCase>(IDENTITY_TOKENS.ListPermissionsUseCase, {
    useFactory: (c) => {
      const repo = c.resolve<IPermissionRepository>(IDENTITY_TOKENS.PermissionRepository)
      return new ListPermissionsUseCase(repo)
    }
  })

  // ── Controllers ───────────────────────────────────────────────────────
  container.register<PermissionsController>(IDENTITY_TOKENS.PermissionsController, {
    useFactory: (c) => {
      const getById = c.resolve<GetPermissionByIdUseCase>(IDENTITY_TOKENS.GetPermissionByIdUseCase)
      const list = c.resolve<ListPermissionsUseCase>(IDENTITY_TOKENS.ListPermissionsUseCase)
      return new PermissionsController(getById, list)
    }
  })

  // ── Routes ────────────────────────────────────────────────────────────
  container.register<PermissionsRoutes>(IDENTITY_TOKENS.PermissionsRoutes, {
    useFactory: (c) => {
      const controller = c.resolve<PermissionsController>(IDENTITY_TOKENS.PermissionsController)
      return new PermissionsRoutes(controller)
    }
  })
}
