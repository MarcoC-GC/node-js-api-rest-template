/**
 * Common OpenAPI Schemas
 *
 * This file contains JSDoc OpenAPI documentation for shared schemas
 * used across multiple endpoints (pagination, errors, responses).
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     ProblemDetails:
 *       type: object
 *       description: RFC 9457 Problem Details for HTTP APIs
 *       required:
 *         - type
 *         - title
 *         - status
 *         - detail
 *       properties:
 *         type:
 *           type: string
 *           format: uri
 *           description: URI reference identifying the problem type
 *           example: https://api.example.com/problems/validation-error
 *         title:
 *           type: string
 *           description: Short, human-readable summary of the problem
 *           example: Validation Error
 *         status:
 *           type: integer
 *           description: HTTP status code
 *           minimum: 100
 *           maximum: 599
 *           example: 400
 *         detail:
 *           type: string
 *           description: Human-readable explanation specific to this occurrence
 *           example: The 'limit' parameter must be between 1 and 100
 *         instance:
 *           type: string
 *           format: uri
 *           description: URI reference identifying the specific occurrence
 *           example: /api/permissions
 *         requestId:
 *           type: string
 *           format: uuid
 *           description: Unique request identifier for tracing
 *           example: a7ff6019-a9ec-4219-9203-89545a8fce5a
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the error occurred
 *           example: 2026-02-08T01:37:15.808Z
 *
 *     PaginationMetadata:
 *       type: object
 *       description: Metadata for paginated responses
 *       required:
 *         - total
 *         - limit
 *         - offset
 *         - hasMore
 *         - currentPage
 *         - totalPages
 *       properties:
 *         total:
 *           type: integer
 *           description: Total number of items across all pages
 *           minimum: 0
 *           example: 100
 *         limit:
 *           type: integer
 *           description: Maximum number of items per page
 *           minimum: 1
 *           maximum: 100
 *           example: 20
 *         offset:
 *           type: integer
 *           description: Number of items skipped from the beginning
 *           minimum: 0
 *           example: 0
 *         hasMore:
 *           type: boolean
 *           description: Whether there are more items available
 *           example: true
 *         currentPage:
 *           type: integer
 *           description: Current page number (1-indexed)
 *           minimum: 1
 *           example: 1
 *         totalPages:
 *           type: integer
 *           description: Total number of pages
 *           minimum: 1
 *           example: 5
 *
 *     PermissionResponse:
 *       type: object
 *       description: Permission entity representation
 *       required:
 *         - id
 *         - resource
 *         - action
 *         - description
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique permission identifier
 *           example: b8fb0213-4718-4759-9d96-2c222c9cf9ee
 *         resource:
 *           type: string
 *           description: Resource being protected (e.g., users, roles, permissions)
 *           minLength: 1
 *           maxLength: 100
 *           example: users
 *         action:
 *           type: string
 *           description: Action allowed on the resource (e.g., read, create, update, delete, or * for wildcard)
 *           minLength: 1
 *           maxLength: 50
 *           example: read
 *         description:
 *           type: string
 *           description: Human-readable description of what this permission allows
 *           maxLength: 500
 *           example: View user details and list users
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the permission was created
 *           example: 2026-02-07T13:26:24.206Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the permission was last updated
 *           example: 2026-02-07T13:26:24.206Z
 *
 *     PaginatedPermissionResponse:
 *       type: object
 *       description: Paginated list of permissions
 *       required:
 *         - data
 *         - pagination
 *       properties:
 *         data:
 *           type: array
 *           description: Array of permission objects for the current page
 *           items:
 *             $ref: '#/components/schemas/PermissionResponse'
 *         pagination:
 *           $ref: '#/components/schemas/PaginationMetadata'
 */

// This file only contains JSDoc comments, no executable code
export {}
