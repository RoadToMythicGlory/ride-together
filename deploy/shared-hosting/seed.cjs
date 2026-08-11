#!/usr/bin/env node
/**
 * Slim production seed for shared hosting.
 * Mirrors packages/database ROLE_PERMISSIONS (colon keys) + SUPER_ADMIN.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const PERMISSIONS = [
  'tenants:manage',
  'platform:users:manage',
  'users:manage',
  'roles:manage',
  'regions:manage',
  'settings:manage',
  'audit:read',
  'analytics:read',
  'moderation:manage',
  'applications:create',
  'applications:read_own',
  'applications:review',
  'applications:assign',
  'child_private:read',
  'events:create',
  'events:publish',
  'events:read_public',
  'events:manage',
  'rsvp:manage_own',
  'attendance:record',
  'notifications:campaign',
  'consents:manage_own',
  'media:moderate',
];

const ROLE_PERMISSIONS = {
  ADMIN: [
    'users:manage',
    'roles:manage',
    'regions:manage',
    'settings:manage',
    'audit:read',
    'analytics:read',
    'moderation:manage',
    'applications:review',
    'applications:assign',
    'child_private:read',
    'events:create',
    'events:publish',
    'events:read_public',
    'events:manage',
    'attendance:record',
    'notifications:campaign',
    'media:moderate',
  ],
  EVENT_MANAGER: [
    'analytics:read',
    'applications:review',
    'applications:assign',
    'child_private:read',
    'events:create',
    'events:publish',
    'events:read_public',
    'events:manage',
    'attendance:record',
    'notifications:campaign',
    'media:moderate',
  ],
  RIDER: [
    'applications:create',
    'applications:read_own',
    'events:read_public',
    'rsvp:manage_own',
    'consents:manage_own',
  ],
  PARENT: [
    'applications:create',
    'applications:read_own',
    'child_private:read',
    'events:read_public',
    'consents:manage_own',
  ],
};

async function seedRolePermissions(tenantId) {
  const permissions = await prisma.permission.findMany();
  const byKey = new Map(permissions.map((p) => [p.key, p.id]));

  for (const [roleKey, perms] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { tenantId_key: { tenantId, key: roleKey } },
      update: { name: roleKey },
      create: {
        tenantId,
        key: roleKey,
        name: roleKey,
        isSystem: true,
      },
    });

    for (const key of perms) {
      const permissionId = byKey.get(key);
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        update: {},
        create: { roleId: role.id, permissionId },
      });
    }
  }
}

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@ride-together.local').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const name = process.env.SEED_ADMIN_NAME || 'Platform Admin';
  const passwordHash = await bcrypt.hash(password, 12);

  for (const key of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key, description: key },
    });
  }

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'ride-together' },
    update: { name: 'RideTogether' },
    create: { slug: 'ride-together', name: 'RideTogether' },
  });

  await seedRolePermissions(tenant.id);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { fullName: name, passwordHash, emailVerifiedAt: new Date() },
    create: {
      email,
      fullName: name,
      passwordHash,
      locale: 'he',
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.platformRoleAssignment.upsert({
    where: { userId_role: { userId: admin.id, role: 'SUPER_ADMIN' } },
    update: {},
    create: { userId: admin.id, role: 'SUPER_ADMIN' },
  });

  const role = await prisma.role.findUniqueOrThrow({
    where: { tenantId_key: { tenantId: tenant.id, key: 'ADMIN' } },
  });

  const membership = await prisma.tenantMembership.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: admin.id } },
    update: { status: 'ACTIVE' },
    create: { tenantId: tenant.id, userId: admin.id },
  });

  await prisma.membershipRole.upsert({
    where: {
      membershipId_roleId: { membershipId: membership.id, roleId: role.id },
    },
    update: {},
    create: { membershipId: membership.id, roleId: role.id },
  });

  console.log('SEED_OK', email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
