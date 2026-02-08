/**
 * Pagination Types
 *
 * Common types for pagination across the application.
 */

/**
 * Pagination Parameters
 * Input for paginated queries
 */
export interface PaginationParams {
  limit: number
  offset: number
}

/**
 * Pagination Metadata
 * Metadata returned with paginated responses
 */
export interface PaginationMetadata {
  /** Total number of items in the database */
  total: number
  /** Maximum items per page */
  limit: number
  /** Number of items skipped */
  offset: number
  /** Whether there are more items after current page */
  hasMore: boolean
  /** Current page number (1-indexed) */
  currentPage: number
  /** Total number of pages */
  totalPages: number
}
