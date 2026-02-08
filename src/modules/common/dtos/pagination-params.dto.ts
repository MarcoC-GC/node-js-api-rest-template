/**
 * Pagination Parameters DTO
 *
 * Input DTO for pagination requests.
 * Used by use cases to receive pagination parameters.
 */
export interface PaginationParamsDto {
  limit?: number
  offset?: number
}
