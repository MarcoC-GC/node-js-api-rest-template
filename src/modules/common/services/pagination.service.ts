import { Result } from '@/lib/result/result'
import { ValidationError } from '../errors/validation.error'
import { PaginationParams, PaginationMetadata } from '../types/pagination.types'
import { PaginatedResponseDto } from '../dtos/paginated-response.dto'

/**
 * Pagination Service
 *
 * Centralized service for handling pagination logic across the application.
 * Provides validation, normalization, and response building utilities.
 *
 * Business Rules:
 * - Limit must be between MIN_LIMIT and MAX_LIMIT
 * - Offset must be non-negative
 * - Provides consistent pagination metadata
 */
export class PaginationService {
  static readonly DEFAULT_LIMIT = 20
  static readonly MAX_LIMIT = 100
  static readonly MIN_LIMIT = 1

  /**
   * Validates and normalizes pagination parameters
   *
   * @param limit - Optional limit (defaults to DEFAULT_LIMIT)
   * @param offset - Optional offset (defaults to 0)
   * @returns Validated PaginationParams or ValidationError
   */
  static validateParams(
    limit?: number,
    offset?: number
  ): Result<PaginationParams, ValidationError> {
    // Normalize to defaults
    const normalizedLimit = limit ?? this.DEFAULT_LIMIT
    const normalizedOffset = offset ?? 0

    // Validate limit
    if (!Number.isInteger(normalizedLimit) || normalizedLimit < this.MIN_LIMIT) {
      return Result.fail(
        new ValidationError(
          'limit',
          `Limit must be an integer greater than or equal to ${this.MIN_LIMIT}`,
          { metadata: { value: normalizedLimit, min: this.MIN_LIMIT } }
        )
      )
    }

    if (normalizedLimit > this.MAX_LIMIT) {
      return Result.fail(
        new ValidationError('limit', `Limit must not exceed ${this.MAX_LIMIT}`, {
          metadata: { value: normalizedLimit, max: this.MAX_LIMIT }
        })
      )
    }

    // Validate offset
    if (!Number.isInteger(normalizedOffset) || normalizedOffset < 0) {
      return Result.fail(
        new ValidationError('offset', 'Offset must be a non-negative integer', {
          metadata: { value: normalizedOffset }
        })
      )
    }

    return Result.ok({
      limit: normalizedLimit,
      offset: normalizedOffset
    })
  }

  /**
   * Builds pagination metadata
   *
   * @param total - Total number of items in database
   * @param limit - Items per page
   * @param offset - Items skipped
   * @returns Pagination metadata
   */
  static buildMetadata(total: number, limit: number, offset: number): PaginationMetadata {
    const totalPages = Math.ceil(total / limit)
    const currentPage = Math.floor(offset / limit) + 1
    const hasMore = offset + limit < total

    return {
      total,
      limit,
      offset,
      hasMore,
      currentPage,
      totalPages
    }
  }

  /**
   * Builds a complete paginated response
   *
   * @param data - Array of items for current page
   * @param total - Total number of items in database
   * @param limit - Items per page
   * @param offset - Items skipped
   * @returns Complete paginated response
   */
  static buildResponse<T>(
    data: T[],
    total: number,
    limit: number,
    offset: number
  ): PaginatedResponseDto<T> {
    return {
      data,
      pagination: this.buildMetadata(total, limit, offset)
    }
  }
}
