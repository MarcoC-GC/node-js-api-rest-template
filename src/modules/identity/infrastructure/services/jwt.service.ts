import jwt, { type SignOptions } from 'jsonwebtoken'
import { Result } from '@/lib/result/result'
import { UnauthorizedError } from '@/modules/common/errors/unauthorized.error'
import {
  type IJwtService,
  type AccessTokenPayload
} from '@/modules/identity/application/services/jwt.service.interface'

export class JwtService implements IJwtService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string
  ) {}

  sign(payload: AccessTokenPayload): string {
    const options: SignOptions = {
      expiresIn: this.expiresIn as SignOptions['expiresIn']
    }

    return jwt.sign(payload, this.secret, options)
  }

  verify(token: string): Result<AccessTokenPayload, UnauthorizedError> {
    try {
      const decoded = jwt.verify(token, this.secret)

      if (typeof decoded === 'string') {
        return Result.fail(new UnauthorizedError('Invalid token payload'))
      }

      if (!decoded.userId || typeof decoded.userId !== 'string') {
        return Result.fail(new UnauthorizedError('Invalid token payload'))
      }

      return Result.ok(decoded as AccessTokenPayload)
    } catch (error) {
      return Result.fail(
        new UnauthorizedError('Invalid or expired token', {
          metadata: { cause: error }
        })
      )
    }
  }
}
