import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { GetPermissionByIdUseCase } from '@/modules/identity/application/permissions/use-cases/get-permission-by-id.use-case'
import { ListPermissionsUseCase } from '@/modules/identity/application/permissions/use-cases/list-permissions.use-case'
import { ZodValidationError } from '@/modules/common/errors/infrastructure/zod-validation.error'

const permissionIdParamsSchema = z.object({
  id: z.uuid()
})

const paginationQuerySchema = z.object({
  limit: z.preprocess(
    (value) => (value === '' || value === undefined || value === null ? undefined : value),
    z.coerce.number().int().min(1).max(100).optional()
  ),
  offset: z.preprocess(
    (value) => (value === '' || value === undefined || value === null ? undefined : value),
    z.coerce.number().int().min(0).optional()
  )
})

export class PermissionsController {
  constructor(
    private readonly getPermissionByIdUseCase: GetPermissionByIdUseCase,
    private readonly listPermissionsUseCase: ListPermissionsUseCase
  ) {}

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const paramsResult = permissionIdParamsSchema.safeParse(req.params)

      if (!paramsResult.success) {
        return next(ZodValidationError.fromZodError(paramsResult.error))
      }

      const result = await this.getPermissionByIdUseCase.execute(paramsResult.data.id)

      if (!result.isSuccess()) {
        next(result.error)
        return
      }

      res.status(200).json(result.value)
    } catch (error) {
      next(error)
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryResult = paginationQuerySchema.safeParse(req.query)

      if (!queryResult.success) {
        return next(ZodValidationError.fromZodError(queryResult.error))
      }

      const { limit, offset } = queryResult.data
      const result = await this.listPermissionsUseCase.execute(limit, offset)

      if (!result.isSuccess()) {
        next(result.error)
        return
      }

      res.status(200).json(result.value)
    } catch (error) {
      next(error)
    }
  }
}
