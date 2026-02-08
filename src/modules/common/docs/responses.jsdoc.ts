/**
 * Common OpenAPI Responses
 *
 * This file contains JSDoc OpenAPI documentation for shared response
 * definitions used across multiple endpoints (errors, success responses).
 */

/**
 * @openapi
 * components:
 *   responses:
 *     BadRequest:
 *       description: Bad Request - Invalid input or validation failed
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProblemDetails'
 *           example:
 *             type: https://api.example.com/problems/validation-error
 *             title: Validation Error
 *             status: 400
 *             detail: Validation failed for 'limit' - must be between 1 and 100
 *             instance: /api/permissions
 *             requestId: a7ff6019-a9ec-4219-9203-89545a8fce5a
 *             timestamp: 2026-02-08T01:37:15.808Z
 *
 *     Unauthorized:
 *       description: Unauthorized - Authentication credentials are missing or invalid
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProblemDetails'
 *           example:
 *             type: https://api.example.com/problems/unauthorized
 *             title: Unauthorized
 *             status: 401
 *             detail: Authentication credentials are missing or invalid
 *             instance: /api/users
 *             requestId: a7ff6019-a9ec-4219-9203-89545a8fce5a
 *             timestamp: 2026-02-08T01:37:15.808Z
 *
 *     Forbidden:
 *       description: Forbidden - Insufficient permissions to access this resource
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProblemDetails'
 *           example:
 *             type: https://api.example.com/problems/forbidden
 *             title: Forbidden
 *             status: 403
 *             detail: You don't have permission to perform this action
 *             instance: /api/users/123
 *             requestId: a7ff6019-a9ec-4219-9203-89545a8fce5a
 *             timestamp: 2026-02-08T01:37:15.808Z
 *
 *     NotFound:
 *       description: Not Found - The requested resource does not exist
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProblemDetails'
 *           example:
 *             type: https://api.example.com/problems/not-found
 *             title: Not Found
 *             status: 404
 *             detail: Permission with ID 'b8fb0213-4718-4759-9d96-2c222c9cf9ee' not found
 *             instance: /api/permissions/b8fb0213-4718-4759-9d96-2c222c9cf9ee
 *             requestId: a7ff6019-a9ec-4219-9203-89545a8fce5a
 *             timestamp: 2026-02-08T01:37:15.808Z
 *
 *     Conflict:
 *       description: Conflict - The request conflicts with the current state of the resource
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProblemDetails'
 *           example:
 *             type: https://api.example.com/problems/conflict
 *             title: Conflict
 *             status: 409
 *             detail: A user with email 'user@example.com' already exists
 *             instance: /api/users
 *             requestId: a7ff6019-a9ec-4219-9203-89545a8fce5a
 *             timestamp: 2026-02-08T01:37:15.808Z
 *
 *     InternalServerError:
 *       description: Internal Server Error - An unexpected error occurred on the server
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProblemDetails'
 *           example:
 *             type: https://api.example.com/problems/internal-error
 *             title: Internal Server Error
 *             status: 500
 *             detail: An unexpected error occurred while processing your request
 *             instance: /api/permissions
 *             requestId: a7ff6019-a9ec-4219-9203-89545a8fce5a
 *             timestamp: 2026-02-08T01:37:15.808Z
 */

// This file only contains JSDoc comments, no executable code
export {}
