import { PaginationMetadata } from '../types/pagination.types'

/**
 * Paginated Response DTO
 *
 * Generic DTO for paginated responses.
 * Contains data array and pagination metadata.
 */
export interface PaginatedResponseDto<T> {
  data: T[]
  pagination: PaginationMetadata
}
