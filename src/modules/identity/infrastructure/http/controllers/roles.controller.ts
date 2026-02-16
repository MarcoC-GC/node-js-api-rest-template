import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { ListRolesUseCase } from '@/modules/identity/application/roles/use-cases/list-roles.use-case'
import { GetRoleByIdUseCase } from '@/modules/identity/application/roles/use-cases/get-role-by-id.use-case'
import { CreateRoleUseCase } from '@/modules/identity/application/roles/use-cases/create-role.use-case'
import { UpdateRoleUseCase } from '@/modules/identity/application/roles/use-cases/update-role.use-case'
import { DeleteRoleUseCase } from '@/modules/identity/application/roles/use-cases/delete-role.use-case'
import { ZodValidationError } from '@/modules/common/errors/infrastructure/zod-validation.error'

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

const roleIdParamsSchema = z.object({
  id: z.uuid()
})

const roleNameSchema = z
  .string()
  .min(1, 'Role name is required')
  .max(50, 'Role name must not exceed 50 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Role name must contain only letters, numbers, and underscores')

const roleDescriptionSchema = z
  .string()
  .min(1, 'Role description is required')
  .max(255, 'Role description must not exceed 255 characters')

const createRoleSchema = z.object({
  name: roleNameSchema,
  description: roleDescriptionSchema,
  permissionIds: z.array(z.uuid()).optional()
})

const updateRoleSchema = z
  .object({
    name: roleNameSchema.optional(),
    description: roleDescriptionSchema.optional(),
    permissionIds: z.array(z.uuid()).optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided'
  })

export class RolesController {
  constructor(
    private readonly listRolesUseCase: ListRolesUseCase,
    private readonly getRoleByIdUseCase: GetRoleByIdUseCase,
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase
  ) {}

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryResult = paginationQuerySchema.safeParse(req.query)

      if (!queryResult.success) {
        return next(ZodValidationError.fromZodError(queryResult.error))
      }

      const { limit, offset } = queryResult.data
      const result = await this.listRolesUseCase.execute(limit, offset)

      if (!result.isSuccess()) {
        next(result.error)
        return
      }

      res.status(200).json(result.value)
    } catch (error) {
      next(error)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const paramsResult = roleIdParamsSchema.safeParse(req.params)

      if (!paramsResult.success) {
        return next(ZodValidationError.fromZodError(paramsResult.error))
      }

      const result = await this.getRoleByIdUseCase.execute(paramsResult.data.id)

      if (!result.isSuccess()) {
        next(result.error)
        return
      }

      res.status(200).json(result.value)
    } catch (error) {
      next(error)
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bodyResult = createRoleSchema.safeParse(req.body)

      if (!bodyResult.success) {
        return next(ZodValidationError.fromZodError(bodyResult.error))
      }

      const result = await this.createRoleUseCase.execute(bodyResult.data)

      if (!result.isSuccess()) {
        next(result.error)
        return
      }

      res.status(201).json(result.value)
    } catch (error) {
      next(error)
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const paramsResult = roleIdParamsSchema.safeParse(req.params)

      if (!paramsResult.success) {
        return next(ZodValidationError.fromZodError(paramsResult.error))
      }

      const bodyResult = updateRoleSchema.safeParse(req.body)

      if (!bodyResult.success) {
        return next(ZodValidationError.fromZodError(bodyResult.error))
      }

      const result = await this.updateRoleUseCase.execute(paramsResult.data.id, bodyResult.data)

      if (!result.isSuccess()) {
        next(result.error)
        return
      }

      res.status(200).json(result.value)
    } catch (error) {
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const paramsResult = roleIdParamsSchema.safeParse(req.params)

      if (!paramsResult.success) {
        return next(ZodValidationError.fromZodError(paramsResult.error))
      }

      const result = await this.deleteRoleUseCase.execute(paramsResult.data.id)

      if (!result.isSuccess()) {
        next(result.error)
        return
      }

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}
