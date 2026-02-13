import { DependencyContainer } from 'tsyringe'
import { PrismaClient } from '@/generated/prisma/client'
import { TOKENS } from '@/config/tokens'
import { Config } from '@/config'
import { IDENTITY_TOKENS } from './identity.tokens'

// Domain — Repository interfaces
import { IPermissionRepository } from './domain/repositories/permission.repository.interface'
import { IUserRepository } from './domain/repositories/user.repository.interface'
import { IRoleRepository } from './domain/repositories/role.repository.interface'

// Application — Use Cases
import { GetPermissionByIdUseCase } from './application/permissions/use-cases/get-permission-by-id.use-case'
import { ListPermissionsUseCase } from './application/permissions/use-cases/list-permissions.use-case'
import { CheckPermissionUseCase } from './application/authorization/use-cases/check-permission.use-case'
import { GetActiveUserByIdUseCase } from './application/users/use-cases/get-active-user-by-id.use-case'
import { RegisterUserUseCase } from './application/auth/use-cases/register-user.use-case'
import { LoginUserUseCase } from './application/auth/use-cases/login-user.use-case'

// Application — Services
import { IJwtService } from './application/services/jwt.service.interface'
import { IPasswordHashService } from './application/services/password-hash.service.interface'

// Infrastructure — Persistence
import { PermissionRepositoryImpl } from './infrastructure/persistence/prisma/permission.repository.impl'
import { UserRepositoryImpl } from './infrastructure/persistence/prisma/user.repository.impl'
import { RoleRepositoryImpl } from './infrastructure/persistence/prisma/role.repository.impl'

// Infrastructure — Services
import { JwtService } from './infrastructure/services/jwt.service'
import { BcryptPasswordHashService } from './infrastructure/services/bcrypt-password-hash.service'

// Infrastructure — HTTP
import { PermissionsController } from './infrastructure/http/controllers/permissions.controller'
import { AuthController } from './infrastructure/http/controllers/auth.controller'
import { PermissionsRoutes } from './infrastructure/http/routes/permissions.routes'
import { AuthRoutes } from './infrastructure/http/routes/auth.routes'
import { AuthenticationMiddleware } from './infrastructure/http/middleware/authentication.middleware'
import { AuthorizationMiddleware } from './infrastructure/http/middleware/authorization.middleware'

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

  container.register<IUserRepository>(IDENTITY_TOKENS.UserRepository, {
    useFactory: (c) => {
      const prisma = c.resolve<PrismaClient>(TOKENS.PrismaClient)
      return new UserRepositoryImpl(prisma)
    }
  })

  container.register<IRoleRepository>(IDENTITY_TOKENS.RoleRepository, {
    useFactory: (c) => {
      const prisma = c.resolve<PrismaClient>(TOKENS.PrismaClient)
      return new RoleRepositoryImpl(prisma)
    }
  })

  // ── Infrastructure Services ─────────────────────────────────────────
  container.register<IJwtService>(IDENTITY_TOKENS.JwtService, {
    useFactory: (c) => {
      const config = c.resolve<Config>(TOKENS.Config)
      return new JwtService(config.jwtSecret, config.jwtExpiresIn)
    }
  })

  container.register<IPasswordHashService>(IDENTITY_TOKENS.PasswordHashService, {
    useFactory: (c) => {
      const config = c.resolve<Config>(TOKENS.Config)
      return new BcryptPasswordHashService(config.bcryptSaltRounds)
    }
  })

  // ── Use Cases — Authorization ───────────────────────────────────────
  container.register<CheckPermissionUseCase>(IDENTITY_TOKENS.CheckPermissionUseCase, {
    useFactory: (c) => {
      const userRepository = c.resolve<IUserRepository>(IDENTITY_TOKENS.UserRepository)
      const roleRepository = c.resolve<IRoleRepository>(IDENTITY_TOKENS.RoleRepository)
      const permissionRepository = c.resolve<IPermissionRepository>(
        IDENTITY_TOKENS.PermissionRepository
      )

      return new CheckPermissionUseCase(userRepository, roleRepository, permissionRepository)
    }
  })

  // ── Use Cases — Users ───────────────────────────────────────────────
  container.register<GetActiveUserByIdUseCase>(IDENTITY_TOKENS.GetActiveUserByIdUseCase, {
    useFactory: (c) => {
      const userRepository = c.resolve<IUserRepository>(IDENTITY_TOKENS.UserRepository)
      return new GetActiveUserByIdUseCase(userRepository)
    }
  })

  // ── Use Cases — Auth ────────────────────────────────────────────────
  container.register<RegisterUserUseCase>(IDENTITY_TOKENS.RegisterUserUseCase, {
    useFactory: (c) => {
      const userRepository = c.resolve<IUserRepository>(IDENTITY_TOKENS.UserRepository)
      const roleRepository = c.resolve<IRoleRepository>(IDENTITY_TOKENS.RoleRepository)
      const passwordHashService = c.resolve<IPasswordHashService>(
        IDENTITY_TOKENS.PasswordHashService
      )
      return new RegisterUserUseCase(userRepository, roleRepository, passwordHashService)
    }
  })

  container.register<LoginUserUseCase>(IDENTITY_TOKENS.LoginUserUseCase, {
    useFactory: (c) => {
      const userRepository = c.resolve<IUserRepository>(IDENTITY_TOKENS.UserRepository)
      const passwordHashService = c.resolve<IPasswordHashService>(
        IDENTITY_TOKENS.PasswordHashService
      )
      const jwtService = c.resolve<IJwtService>(IDENTITY_TOKENS.JwtService)
      return new LoginUserUseCase(userRepository, passwordHashService, jwtService)
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

  container.register<AuthController>(IDENTITY_TOKENS.AuthController, {
    useFactory: (c) => {
      const registerUser = c.resolve<RegisterUserUseCase>(IDENTITY_TOKENS.RegisterUserUseCase)
      const loginUser = c.resolve<LoginUserUseCase>(IDENTITY_TOKENS.LoginUserUseCase)
      return new AuthController(registerUser, loginUser)
    }
  })

  // ── Middlewares ──────────────────────────────────────────────────────
  container.register<AuthenticationMiddleware>(IDENTITY_TOKENS.AuthenticationMiddleware, {
    useFactory: (c) => {
      const jwtService = c.resolve<IJwtService>(IDENTITY_TOKENS.JwtService)
      const getActiveUserById = c.resolve<GetActiveUserByIdUseCase>(
        IDENTITY_TOKENS.GetActiveUserByIdUseCase
      )
      return new AuthenticationMiddleware(jwtService, getActiveUserById)
    }
  })

  container.register<AuthorizationMiddleware>(IDENTITY_TOKENS.AuthorizationMiddleware, {
    useFactory: (c) => {
      const checkPermissionUseCase = c.resolve<CheckPermissionUseCase>(
        IDENTITY_TOKENS.CheckPermissionUseCase
      )
      return new AuthorizationMiddleware(checkPermissionUseCase)
    }
  })

  // ── Routes ────────────────────────────────────────────────────────────
  container.register<PermissionsRoutes>(IDENTITY_TOKENS.PermissionsRoutes, {
    useFactory: (c) => {
      const controller = c.resolve<PermissionsController>(IDENTITY_TOKENS.PermissionsController)
      const authentication = c.resolve<AuthenticationMiddleware>(
        IDENTITY_TOKENS.AuthenticationMiddleware
      )
      const authorization = c.resolve<AuthorizationMiddleware>(
        IDENTITY_TOKENS.AuthorizationMiddleware
      )

      return new PermissionsRoutes(controller, authentication, authorization)
    }
  })

  container.register<AuthRoutes>(IDENTITY_TOKENS.AuthRoutes, {
    useFactory: (c) => {
      const controller = c.resolve<AuthController>(IDENTITY_TOKENS.AuthController)
      return new AuthRoutes(controller)
    }
  })
}
