import { Request, Response, NextFunction } from 'express'
import { IMiddleware } from '@/modules/common/middleware'
import { UnauthorizedError } from '@/modules/common/errors/unauthorized.error'
import { UserId } from '@/modules/identity/domain/value-objects/user-id.vo'
import { type IJwtService } from '@/modules/identity/application/services/jwt.service.interface'
import { GetActiveUserByIdUseCase } from '@/modules/identity/application/users/use-cases/get-active-user-by-id.use-case'

export class AuthenticationMiddleware implements IMiddleware {
  constructor(
    private readonly jwtService: IJwtService,
    private readonly getActiveUserByIdUseCase: GetActiveUserByIdUseCase
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return next(new UnauthorizedError('Token missing'))
    }

    const [scheme, token] = authHeader.split(' ')

    if (scheme !== 'Bearer' || !token) {
      return next(new UnauthorizedError('Invalid authorization header'))
    }

    const tokenResult = this.jwtService.verify(token)

    if (!tokenResult.isSuccess()) {
      return next(tokenResult.error)
    }

    const userIdResult = UserId.fromString(tokenResult.value.userId)

    if (!userIdResult.isSuccess()) {
      return next(new UnauthorizedError('Invalid token payload'))
    }

    const userResult = await this.getActiveUserByIdUseCase.execute(userIdResult.value)

    if (!userResult.isSuccess()) {
      return next(userResult.error)
    }

    req.userId = userResult.value.id.getValue()
    next()
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}
