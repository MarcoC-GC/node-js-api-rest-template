import { Router } from 'express'
import { PermissionsController } from '../controllers/permissions.controller'
import { AuthenticationMiddleware } from '../middleware/authentication.middleware'
import { AuthorizationMiddleware } from '../middleware/authorization.middleware'

/**
 * Permissions Routes
 *
 * Defines HTTP routes for permission operations.
 * Maps routes to controller methods.
 */
export class PermissionsRoutes {
  private readonly router: Router
  private readonly controller: PermissionsController
  private readonly authenticationMiddleware: AuthenticationMiddleware
  private readonly authorizationMiddleware: AuthorizationMiddleware

  constructor(
    controller: PermissionsController,
    authenticationMiddleware: AuthenticationMiddleware,
    authorizationMiddleware: AuthorizationMiddleware
  ) {
    this.router = Router()
    this.controller = controller
    this.authenticationMiddleware = authenticationMiddleware
    this.authorizationMiddleware = authorizationMiddleware
    this.setupRoutes()
  }

  private setupRoutes(): void {
    const authenticate = this.authenticationMiddleware.handle.bind(this.authenticationMiddleware)
    const requirePermissionsRead =
      this.authorizationMiddleware.requirePermission('permissions:read')

    /**
     * GET /api/permissions
     * List all permissions with pagination
     * Query params: ?limit=20&offset=0
     */
    this.router.get(
      '/',
      authenticate,
      requirePermissionsRead,
      this.controller.list.bind(this.controller)
    )

    /**
     * GET /api/permissions/:id
     * Get a single permission by ID
     */
    this.router.get(
      '/:id',
      authenticate,
      requirePermissionsRead,
      this.controller.getById.bind(this.controller)
    )
  }

  getRouter(): Router {
    return this.router
  }
}
