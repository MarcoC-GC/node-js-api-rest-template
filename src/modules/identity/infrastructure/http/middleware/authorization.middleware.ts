import { Request, Response, NextFunction } from 'express'
import { UnauthorizedError } from '@/modules/common/errors/unauthorized.error'
import { ForbiddenError } from '@/modules/common/errors/forbidden.error'
import { ValidationError } from '@/modules/common/errors/validation.error'
import { UserId } from '@/modules/identity/domain/value-objects/user-id.vo'
import { CheckPermissionUseCase } from '@/modules/identity/application/authorization/use-cases/check-permission.use-case'

export class AuthorizationMiddleware {
  constructor(private readonly checkPermissionUseCase: CheckPermissionUseCase) {}

  requirePermission(permission: string | string[]) {
    const permissions = Array.isArray(permission) ? permission : [permission]

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (!req.userId) {
        return next(new UnauthorizedError('Token missing'))
      }

      const userIdResult = UserId.fromString(req.userId)

      if (!userIdResult.isSuccess()) {
        return next(new UnauthorizedError('Invalid user context'))
      }

      for (const permissionCode of permissions) {
        const [resource, action] = permissionCode.split(':')

        if (!resource || !action) {
          return next(
            new ValidationError('permission', 'Invalid permission format', {
              metadata: { permissionCode }
            })
          )
        }

        const hasPermissionResult = await this.checkPermissionUseCase.execute(
          userIdResult.value,
          resource,
          action
        )

        if (!hasPermissionResult.isSuccess()) {
          return next(hasPermissionResult.error)
        }

        if (!hasPermissionResult.value) {
          return next(
            new ForbiddenError(action, resource, 'Missing required permission', {
              userId: req.userId,
              operation: 'authorize'
            })
          )
        }
      }

      next()
    }
  }
}
