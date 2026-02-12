import { PrismaClient } from '../src/generated/prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'

// Prisma 7 requires adapter configuration
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

/**
 * Database Seeder for Identity Module (RBAC System)
 *
 * Seeds in order:
 * 1. Permissions (read-only, immutable)
 * 2. System Roles (SUPER_ADMIN, ADMIN, USER, GUEST)
 * 3. Initial SUPER_ADMIN user
 *
 * Run with: pnpm prisma db seed
 */

// ============================================================================
// 1. PERMISSIONS DATA
// ============================================================================

const PERMISSIONS = [
  // Users permissions
  { resource: 'users', action: 'create', description: 'Create new users' },
  { resource: 'users', action: 'read', description: 'View user details' },
  { resource: 'users', action: 'update', description: 'Update user information' },
  { resource: 'users', action: 'delete', description: 'Delete users (soft delete)' },

  // Roles permissions
  { resource: 'roles', action: 'create', description: 'Create custom roles' },
  { resource: 'roles', action: 'read', description: 'View role details' },
  { resource: 'roles', action: 'update', description: 'Update role information' },
  { resource: 'roles', action: 'delete', description: 'Delete custom roles' },

  // Permissions permissions (read-only)
  { resource: 'permissions', action: 'read', description: 'View permission details' },

  // Wildcard permissions (for ADMIN)
  { resource: '*', action: '*', description: 'Full system access (admin)' }
]

// ============================================================================
// 2. SYSTEM ROLES DATA
// ============================================================================

const SYSTEM_ROLES = [
  {
    name: 'ADMIN',
    description: 'System administrator with full access',
    isSystem: true,
    permissions: ['*:*'] // Everything
  },
  {
    name: 'USER',
    description: 'Authenticated user with basic permissions',
    isSystem: true,
    permissions: [
      'users:read' // Can view own profile
    ]
  },
  {
    name: 'GUEST',
    description: 'Guest user with no permissions',
    isSystem: true,
    permissions: [] // No permissions
  }
]

// ============================================================================
// 3. INITIAL ADMIN USER
// ============================================================================

const INITIAL_ADMIN = {
  email: 'admin@system.local',
  password: 'Admin123!@#', // CHANGE THIS IN PRODUCTION!
  firstName: 'System',
  lastName: 'Administrator',
  isActive: true
}

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function seedPermissions() {
  console.log('🔐 Seeding permissions...')

  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: {
        unique_permission_code: {
          resource: permission.resource,
          action: permission.action
        }
      },
      update: {
        description: permission.description
      },
      create: permission
    })
  }

  const count = await prisma.permission.count()
  console.log(`✅ Seeded ${count} permissions`)
}

async function seedRoles() {
  console.log('👥 Seeding system roles...')

  for (const roleData of SYSTEM_ROLES) {
    // Find permission IDs for this role
    const permissionRecords = await prisma.permission.findMany({
      where: {
        OR: roleData.permissions.map((code) => {
          const [resource, action] = code.split(':')
          return { resource, action }
        })
      }
    })

    await prisma.role.upsert({
      where: { name: roleData.name },
      update: {
        description: roleData.description,
        isSystem: roleData.isSystem,
        permissions: {
          set: permissionRecords.map((p) => ({ id: p.id }))
        }
      },
      create: {
        name: roleData.name,
        description: roleData.description,
        isSystem: roleData.isSystem,
        permissions: {
          connect: permissionRecords.map((p) => ({ id: p.id }))
        }
      }
    })
  }

  const count = await prisma.role.count()
  console.log(`✅ Seeded ${count} roles`)
}

async function seedInitialAdmin() {
  console.log('👤 Seeding initial ADMIN user...')

  // Check if ADMIN already exists
  const existingAdmin = await prisma.user.findFirst({
    where: {
      role: {
        name: 'ADMIN'
      },
      deletedAt: null
    }
  })

  if (existingAdmin) {
    console.log('⚠️  ADMIN user already exists, skipping...')
    return
  }

  // Find ADMIN role
  const adminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' }
  })

  if (!adminRole) {
    throw new Error('ADMIN role not found. Run role seeds first.')
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(INITIAL_ADMIN.password, 10)

  // Create user
  await prisma.user.create({
    data: {
      email: INITIAL_ADMIN.email,
      password: hashedPassword,
      firstName: INITIAL_ADMIN.firstName,
      lastName: INITIAL_ADMIN.lastName,
      isActive: INITIAL_ADMIN.isActive,
      roleId: adminRole.id
    }
  })

  console.log('✅ Initial ADMIN user created')
  console.log('📧 Email:', INITIAL_ADMIN.email)
  console.log('🔑 Password:', INITIAL_ADMIN.password)
  console.log('⚠️  IMPORTANT: Change this password in production!')
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log('🌱 Starting database seed...\n')

  try {
    // Seed in order (permissions → roles → users)
    await seedPermissions()
    console.log('')

    await seedRoles()
    console.log('')

    await seedInitialAdmin()
    console.log('')

    console.log('✅ Database seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// ============================================================================
// EXECUTE SEED
// ============================================================================

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
