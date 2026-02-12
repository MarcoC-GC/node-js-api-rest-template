import { Result } from '@/lib/result/result'
import { NotFoundError } from '@/modules/common/errors/not-found.error'
import { IUserRepository } from '@/modules/identity/domain/repositories/user.repository.interface'
import { IRoleRepository } from '@/modules/identity/domain/repositories/role.repository.interface'
import { IPermissionRepository } from '@/modules/identity/domain/repositories/permission.repository.interface'
import { UserId } from '@/modules/identity/domain/value-objects/user-id.vo'

export class CheckPermissionUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly permissionRepository: IPermissionRepository
  ) {}

  async execute(userId: UserId, resource: string, action: string): Promise<Result<boolean, Error>> {
    const userResult = await this.userRepository.findById(userId)
    if (!userResult.isSuccess()) {
      return Result.fail(userResult.error)
    }

    const user = userResult.value
    if (!user) {
      return Result.fail(
        new NotFoundError('User', userId.getValue(), {
          aggregateType: 'User',
          aggregateId: userId.getValue()
        })
      )
    }

    if (!user.isActive) {
      return Result.ok(false)
    }

    const roleResult = await this.roleRepository.findById(user.getRoleId())
    if (!roleResult.isSuccess()) {
      return Result.fail(roleResult.error)
    }

    const role = roleResult.value
    if (!role) {
      return Result.fail(
        new NotFoundError('Role', user.getRoleId().getValue(), {
          aggregateType: 'Role',
          aggregateId: user.getRoleId().getValue()
        })
      )
    }

    const permissionIds = role.getPermissionIds()
    if (permissionIds.length === 0) {
      return Result.ok(false)
    }

    const permissionsResult = await this.permissionRepository.findByIds(permissionIds)
    if (!permissionsResult.isSuccess()) {
      return Result.fail(permissionsResult.error)
    }

    const hasPermission = permissionsResult.value.some((permission) =>
      permission.grants(resource, action)
    )

    return Result.ok(hasPermission)
  }
}
