import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { RegisterUserUseCase } from '@/modules/identity/application/auth/use-cases/register-user.use-case'
import { LoginUserUseCase } from '@/modules/identity/application/auth/use-cases/login-user.use-case'
import { ZodValidationError } from '@/modules/common/errors/infrastructure/zod-validation.error'

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password cannot exceed 72 characters'),
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long')
})

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase
  ) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bodyResult = registerSchema.safeParse(req.body)

      if (!bodyResult.success) {
        return next(ZodValidationError.fromZodError(bodyResult.error))
      }

      const result = await this.registerUserUseCase.execute(bodyResult.data)

      if (!result.isSuccess()) {
        next(result.error)
        return
      }

      res.status(201).json(result.value)
    } catch (error) {
      next(error)
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bodyResult = loginSchema.safeParse(req.body)

      if (!bodyResult.success) {
        return next(ZodValidationError.fromZodError(bodyResult.error))
      }

      const result = await this.loginUserUseCase.execute(bodyResult.data)

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
