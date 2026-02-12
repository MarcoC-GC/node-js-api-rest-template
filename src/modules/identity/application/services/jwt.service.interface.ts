import { Result } from '@/lib/result/result'
import { UnauthorizedError } from '@/modules/common/errors/unauthorized.error'

export interface AccessTokenPayload {
  userId: string
}

export interface IJwtService {
  sign(payload: AccessTokenPayload): string
  verify(token: string): Result<AccessTokenPayload, UnauthorizedError>
}
