import { Result } from '@/lib/result/result'
import { UnauthorizedError } from '@/modules/common/errors/unauthorized.error'
import { IUserRepository } from '@/modules/identity/domain/repositories/user.repository.interface'
import { UserId } from '@/modules/identity/domain/value-objects/user-id.vo'
import { User } from '@/modules/identity/domain/entities/user.entity'

export class GetActiveUserByIdUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: UserId): Promise<Result<User, Error>> {
    const userResult = await this.userRepository.findById(userId)

    if (!userResult.isSuccess()) {
      return Result.fail(userResult.error)
    }

    if (!userResult.value || !userResult.value.canAuthenticate()) {
      return Result.fail(new UnauthorizedError('User inactive or not found'))
    }

    return Result.ok(userResult.value)
  }
}
