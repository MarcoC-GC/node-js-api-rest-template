import { PrismaClient } from '@/generated/prisma/client'
import { Result } from '@/lib/result/result'
import { DatabaseError } from '@/modules/common/errors/database.error'
import { IUserRepository } from '@/modules/identity/domain/repositories/user.repository.interface'
import { User } from '@/modules/identity/domain/entities/user.entity'
import { UserId } from '@/modules/identity/domain/value-objects/user-id.vo'
import { Email } from '@/modules/identity/domain/value-objects/email.vo'
import { Password } from '@/modules/identity/domain/value-objects/password.vo'
import { RoleId } from '@/modules/identity/domain/value-objects/role-id.vo'

export class UserRepositoryImpl implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: UserId): Promise<Result<User | null, Error>> {
    try {
      const record = await this.prisma.user.findFirst({
        where: { id: id.getValue(), deletedAt: null }
      })

      if (!record) {
        return Result.ok(null)
      }

      const emailResult = Email.create(record.email)
      if (!emailResult.isSuccess()) {
        return Result.fail(emailResult.error)
      }

      const roleIdResult = RoleId.fromString(record.roleId)
      if (!roleIdResult.isSuccess()) {
        return Result.fail(roleIdResult.error)
      }

      const user = User.reconstitute({
        id,
        email: emailResult.value,
        password: Password.fromString(record.password),
        firstName: record.firstName,
        lastName: record.lastName,
        isActive: record.isActive,
        roleId: roleIdResult.value,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      })

      return Result.ok(user)
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find user by ID', {
          metadata: { operation: 'findById', id: id.getValue(), cause: error }
        })
      )
    }
  }

  async findByEmail(email: Email): Promise<Result<User | null, Error>> {
    try {
      const record = await this.prisma.user.findFirst({
        where: { email: email.getValue(), deletedAt: null }
      })

      if (!record) {
        return Result.ok(null)
      }

      const idResult = UserId.fromString(record.id)
      if (!idResult.isSuccess()) {
        return Result.fail(idResult.error)
      }

      const roleIdResult = RoleId.fromString(record.roleId)
      if (!roleIdResult.isSuccess()) {
        return Result.fail(roleIdResult.error)
      }

      const user = User.reconstitute({
        id: idResult.value,
        email,
        password: Password.fromString(record.password),
        firstName: record.firstName,
        lastName: record.lastName,
        isActive: record.isActive,
        roleId: roleIdResult.value,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      })

      return Result.ok(user)
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find user by email', {
          metadata: { operation: 'findByEmail', email: email.getValue(), cause: error }
        })
      )
    }
  }

  async findAll(limit: number, offset: number): Promise<Result<User[], Error>> {
    try {
      const records = await this.prisma.user.findMany({
        where: { deletedAt: null },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' }
      })

      const users: User[] = []

      for (const record of records) {
        const idResult = UserId.fromString(record.id)
        if (!idResult.isSuccess()) {
          return Result.fail(idResult.error)
        }

        const emailResult = Email.create(record.email)
        if (!emailResult.isSuccess()) {
          return Result.fail(emailResult.error)
        }

        const roleIdResult = RoleId.fromString(record.roleId)
        if (!roleIdResult.isSuccess()) {
          return Result.fail(roleIdResult.error)
        }

        users.push(
          User.reconstitute({
            id: idResult.value,
            email: emailResult.value,
            password: Password.fromString(record.password),
            firstName: record.firstName,
            lastName: record.lastName,
            isActive: record.isActive,
            roleId: roleIdResult.value,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
          })
        )
      }

      return Result.ok(users)
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find users', {
          metadata: { operation: 'findAll', limit, offset, cause: error }
        })
      )
    }
  }

  async existsByEmail(email: Email): Promise<Result<boolean, Error>> {
    try {
      const count = await this.prisma.user.count({
        where: { email: email.getValue(), deletedAt: null }
      })

      return Result.ok(count > 0)
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to check user existence by email', {
          metadata: { operation: 'existsByEmail', email: email.getValue(), cause: error }
        })
      )
    }
  }

  async existsById(id: UserId): Promise<Result<boolean, Error>> {
    try {
      const count = await this.prisma.user.count({
        where: { id: id.getValue(), deletedAt: null }
      })

      return Result.ok(count > 0)
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to check user existence by ID', {
          metadata: { operation: 'existsById', id: id.getValue(), cause: error }
        })
      )
    }
  }

  async save(user: User): Promise<Result<void, Error>> {
    try {
      await this.prisma.user.create({
        data: {
          id: user.id.getValue(),
          email: user.email.getValue(),
          password: user.password.getValue(),
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          roleId: user.getRoleId().getValue(),
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      })

      return Result.ok(undefined)
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to save user', {
          metadata: { operation: 'save', userId: user.id.getValue(), cause: error }
        })
      )
    }
  }

  async update(user: User): Promise<Result<void, Error>> {
    try {
      await this.prisma.user.update({
        where: { id: user.id.getValue() },
        data: {
          email: user.email.getValue(),
          password: user.password.getValue(),
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          roleId: user.getRoleId().getValue(),
          updatedAt: user.updatedAt
        }
      })

      return Result.ok(undefined)
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to update user', {
          metadata: { operation: 'update', userId: user.id.getValue(), cause: error }
        })
      )
    }
  }

  async delete(id: UserId): Promise<Result<boolean, Error>> {
    try {
      await this.prisma.user.update({
        where: { id: id.getValue() },
        data: { deletedAt: new Date() }
      })

      return Result.ok(true)
    } catch (error) {
      if (this.isRecordNotFoundError(error)) {
        return Result.ok(false)
      }

      return Result.fail(
        new DatabaseError('Failed to delete user', {
          metadata: { operation: 'delete', id: id.getValue(), cause: error }
        })
      )
    }
  }

  async count(): Promise<Result<number, Error>> {
    try {
      const total = await this.prisma.user.count({
        where: { deletedAt: null }
      })

      return Result.ok(total)
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to count users', {
          metadata: { operation: 'count', cause: error }
        })
      )
    }
  }

  private isRecordNotFoundError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2025'
    )
  }
}
