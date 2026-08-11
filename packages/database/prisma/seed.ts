import { config as loadDotenv } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  TENANT_ROLES,
  type TenantRole,
} from '@ride-together/shared';

loadDotenv({ path: resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();

const ISRAEL_REGIONS = [
  { key: 'north', nameHe: 'צפון', nameEn: 'North', sortOrder: 1, cities: [
    { key: 'haifa-city', nameHe: 'חיפה', nameEn: 'Haifa' },
    { key: 'nahariya', nameHe: 'נהריה', nameEn: 'Nahariya' },
    { key: 'karmiel', nameHe: 'כרמיאל', nameEn: 'Karmiel' },
  ]},
  { key: 'haifa', nameHe: 'חיפה והקריות', nameEn: 'Haifa', sortOrder: 2, cities: [
    { key: 'kiryat-ata', nameHe: 'קריית אתא', nameEn: 'Kiryat Ata' },
    { key: 'nesher', nameHe: 'נשר', nameEn: 'Nesher' },
  ]},
  { key: 'sharon', nameHe: 'שרון', nameEn: 'Sharon', sortOrder: 3, cities: [
    { key: 'herzliya', nameHe: 'הרצליה', nameEn: 'Herzliya' },
    { key: 'ramat-hasharon', nameHe: 'רמת השרון', nameEn: 'Ramat Hasharon' },
    { key: 'netanya', nameHe: 'נתניה', nameEn: 'Netanya' },
    { key: 'raanana', nameHe: 'רעננה', nameEn: 'Raanana' },
  ]},
  { key: 'center', nameHe: 'מרכז', nameEn: 'Center', sortOrder: 4, cities: [
    { key: 'petah-tikva', nameHe: 'פתח תקווה', nameEn: 'Petah Tikva' },
    { key: 'rishon', nameHe: 'ראשון לציון', nameEn: 'Rishon LeZion' },
    { key: 'modiin', nameHe: 'מודיעין', nameEn: 'Modiin' },
  ]},
  { key: 'tel-aviv', nameHe: 'תל אביב', nameEn: 'Tel Aviv', sortOrder: 5, cities: [
    { key: 'tel-aviv-yafo', nameHe: 'תל אביב-יפו', nameEn: 'Tel Aviv-Yafo' },
    { key: 'givatayim', nameHe: 'גבעתיים', nameEn: 'Givatayim' },
    { key: 'ramat-gan', nameHe: 'רמת גן', nameEn: 'Ramat Gan' },
  ]},
  { key: 'jerusalem', nameHe: 'ירושלים', nameEn: 'Jerusalem', sortOrder: 6, cities: [
    { key: 'jerusalem-city', nameHe: 'ירושלים', nameEn: 'Jerusalem' },
    { key: 'mevaseret', nameHe: 'מבשרת ציון', nameEn: 'Mevaseret Zion' },
  ]},
  { key: 'shfela', nameHe: 'שפלה', nameEn: 'Shfela', sortOrder: 7, cities: [
    { key: 'rehovot', nameHe: 'רחובות', nameEn: 'Rehovot' },
    { key: 'ashdod', nameHe: 'אשדוד', nameEn: 'Ashdod' },
  ]},
  { key: 'south', nameHe: 'דרום', nameEn: 'South', sortOrder: 8, cities: [
    { key: 'beer-sheva', nameHe: 'באר שבע', nameEn: 'Beer Sheva' },
    { key: 'eilat', nameHe: 'אילת', nameEn: 'Eilat' },
  ]},
];

async function seedPermissions() {
  for (const key of Object.values(PERMISSIONS)) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key, description: key },
    });
  }
}

async function seedTenantRoles(tenantId: string) {
  const permissions = await prisma.permission.findMany();
  const byKey = new Map(permissions.map((p) => [p.key, p.id]));

  for (const roleKey of Object.values(TENANT_ROLES) as TenantRole[]) {
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

    const desired = ROLE_PERMISSIONS[roleKey];
    for (const perm of desired) {
      const permissionId = byKey.get(perm);
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId },
        },
        update: {},
        create: { roleId: role.id, permissionId },
      });
    }
  }
}

async function seedGeography() {
  for (const region of ISRAEL_REGIONS) {
    const created = await prisma.geographicRegion.upsert({
      where: { country_key: { country: 'IL', key: region.key } },
      update: {
        nameHe: region.nameHe,
        nameEn: region.nameEn,
        sortOrder: region.sortOrder,
      },
      create: {
        country: 'IL',
        key: region.key,
        nameHe: region.nameHe,
        nameEn: region.nameEn,
        sortOrder: region.sortOrder,
      },
    });

    for (const city of region.cities) {
      await prisma.city.upsert({
        where: { regionId_key: { regionId: created.id, key: city.key } },
        update: { nameHe: city.nameHe, nameEn: city.nameEn },
        create: {
          regionId: created.id,
          key: city.key,
          nameHe: city.nameHe,
          nameEn: city.nameEn,
        },
      });
    }
  }
}

async function ensureMembership(tenantId: string, userId: string, roleKey: string) {
  const membership = await prisma.tenantMembership.upsert({
    where: { tenantId_userId: { tenantId, userId } },
    update: { status: 'ACTIVE' },
    create: { tenantId, userId },
  });
  const role = await prisma.role.findUniqueOrThrow({
    where: { tenantId_key: { tenantId, key: roleKey } },
  });
  await prisma.membershipRole.upsert({
    where: {
      membershipId_roleId: { membershipId: membership.id, roleId: role.id },
    },
    update: {},
    create: { membershipId: membership.id, roleId: role.id },
  });
  return membership;
}

async function main() {
  await seedPermissions();
  await seedGeography();

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'ride-together' },
    update: { name: 'RideTogether' },
    create: {
      slug: 'ride-together',
      name: 'RideTogether',
    },
  });

  await seedTenantRoles(tenant.id);

  const adminEmail = (
    process.env.SEED_ADMIN_EMAIL ?? 'admin@ride-together.local'
  ).toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
  const adminName = process.env.SEED_ADMIN_NAME ?? 'Platform Admin';
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      fullName: adminName,
      emailVerifiedAt: new Date(),
      passwordHash,
    },
    create: {
      email: adminEmail,
      fullName: adminName,
      passwordHash,
      locale: 'he',
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.platformRoleAssignment.upsert({
    where: {
      userId_role: { userId: admin.id, role: 'SUPER_ADMIN' },
    },
    update: {},
    create: { userId: admin.id, role: 'SUPER_ADMIN' },
  });

  await ensureMembership(tenant.id, admin.id, 'ADMIN');

  const sharon = await prisma.geographicRegion.findFirstOrThrow({
    where: { key: 'sharon' },
  });
  const herzliya = await prisma.city.findFirst({
    where: { regionId: sharon.id, key: 'herzliya' },
  });

  const startsAt = new Date();
  startsAt.setDate(startsAt.getDate() + 14);
  startsAt.setHours(11, 0, 0, 0);

  const existingEvent = await prisma.event.findFirst({
    where: { tenantId: tenant.id, title: 'Community Ride · שרון' },
  });

  const event =
    existingEvent ??
    (await prisma.event.create({
      data: {
        tenantId: tenant.id,
        title: 'Community Ride · שרון',
        description: 'מפגש קהילתי קצר באזור השרון',
        aboutText:
          'זה מפגש קהילתי של רוכבי אופנועים עם משפחות ששובצו מראש. המטרה היא נוכחות חמה ומסודרת באזור — לא מופע ולא איסוף תרומות. סיפורים אישיים לא מפורסמים אלא אם המשפחה בחרה לשתף.',
        audienceText:
          'מיועד לרוכבים מורשים שמגיעים לתמוך; להורים/אפוטרופוסים שקיבלו שיבוץ; ולילדים שמגיעים רק עם מבוגר אחראי.',
        flowSteps: [
          'התכנסות בנקודת מפגש שתימסר אחרי אישור הגעה',
          'היכרות קצרה עם מארגני הקהילה והנחיות בטיחות',
          'רכיבה קבוצתית קצרה באזור, בקצב מתון',
          'סיום מסודר והתפזרות — בלי פרסום פרטים מזהים',
        ],
        status: 'OPEN_FOR_RIDERS',
        startsAt,
        regionId: sharon.id,
        cityId: herzliya?.id,
        publicMeetingArea: 'אזור השרון · נקודה תימסר אחרי RSVP',
        exactLocation: 'חניון קהילתי · הרצליה (דמו)',
        locationVisibilityPolicy: 'AFTER_RSVP',
        riderTarget: 60,
        childCapacity: 12,
      },
    }));

  // Second tenant for multi-tenant isolation demos
  const partner = await prisma.tenant.upsert({
    where: { slug: 'partner-club' },
    update: { name: 'מועדון שותף', isActive: true },
    create: { slug: 'partner-club', name: 'מועדון שותף', isActive: true },
  });
  await seedTenantRoles(partner.id);
  await ensureMembership(partner.id, admin.id, 'ADMIN');

  console.log('Seed complete:', {
    tenant: tenant.slug,
    partnerTenant: partner.slug,
    adminEmail: admin.email,
    demoEventId: event.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
