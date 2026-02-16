import swaggerJsdoc from 'swagger-jsdoc'
import type { Options } from 'swagger-jsdoc'

/**
 * Swagger/OpenAPI Configuration
 *
 * Generates OpenAPI 3.1.0 specification from JSDoc comments
 * in controllers, routes, and documentation files.
 */
const options: Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Node.js REST API Template',
      version: '1.0.0',
      description:
        'REST API built with Hexagonal Architecture, Domain-Driven Design (DDD), and Role-Based Access Control (RBAC). Features TypeScript, Express 5, Prisma 7, and PostgreSQL.',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.production.com',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check and system status endpoints'
      },
      {
        name: 'Permissions',
        description: 'Permission management - CRUD operations for system permissions'
      },
      {
        name: 'Roles',
        description: 'Role management - CRUD operations with permission assignment'
      },
      {
        name: 'Users',
        description: 'User management - Registration, profiles, and user operations'
      },
      {
        name: 'Auth',
        description: 'Authentication - Login, logout, token refresh, and session management'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer {token}'
        }
      },
      schemas: {
        // Populated via JSDoc comments in code
      },
      responses: {
        // Populated via JSDoc comments in code
      }
    }
  },
  // Paths to files containing JSDoc comments
  apis: ['./src/modules/**/routes/*.ts', './src/modules/**/docs/*.ts', './src/app.ts']
}

/**
 * Generated OpenAPI specification
 */
export const swaggerSpec = swaggerJsdoc(options)
