import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { RoleName } from '../src/shared/enums.js';
import bcrypt from 'bcryptjs';

const dbUrl = process.env['DATABASE_URL'] ?? 'file:./dev.db';
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

const log = (msg: string): void => {
  // eslint-disable-next-line no-console
  console.log(msg);
};

const warn = (msg: string): void => {
  // eslint-disable-next-line no-console
  console.warn(msg);
};

const seedRoles = async (): Promise<Map<RoleName, string>> => {
  const definitions: Array<{
    name: RoleName;
    description: string;
  }> = [
    {
      name: RoleName.ADMIN,
      description: 'Full system administrator',
    },
    {
      name: RoleName.TEACHER,
      description: 'Teaching staff',
    },
    {
      name: RoleName.STUDENT,
      description: 'Enrolled student',
    },
    {
      name: RoleName.PARENT,
      description: 'Parent or guardian',
    },
    {
      name: RoleName.STAFF,
      description: 'Non-teaching staff',
    },
  ];

  const ids = new Map<RoleName, string>();

  for (const def of definitions) {
    const role = await prisma.role.upsert({
      where: {
        name: def.name,
      },
      create: {
        name: def.name,
        description: def.description,
      },
      update: {
        description: def.description,
      },
    });

    ids.set(role.name, role.id);
  }

  log(`✓ Roles ready: ${[...ids.keys()].join(', ')}`);

  return ids;
};

const seedAdmin = async (
  roleIds: Map<RoleName, string>,
): Promise<void> => {
  const email = 'admin@example.com';
  const passwordRaw = 'ChangeMe123!';

  const adminRoleId = roleIds.get(RoleName.ADMIN);

  if (adminRoleId === undefined) {
    throw new Error(
      'ADMIN role missing — seedRoles() must run first',
    );
  }

  const passwordHash = await bcrypt.hash(passwordRaw, 12);

  const user = await prisma.user.upsert({
    where: {
      email,
    },
    update: {},
    create: {
      email,
      passwordHash,
      firstName: 'System',
      lastName: 'Admin',
      isActive: true,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: adminRoleId,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: adminRoleId,
    },
  });

  log(`✓ Admin user ready: ${email}`);
};

const main = async (): Promise<void> => {
  log('🌱 Starting database seed...');

  const roleIds = await seedRoles();

  await seedAdmin(roleIds);

  log('✅ Database seed completed');
};

main()
  .catch((err: unknown) => {
    // eslint-disable-next-line no-console
    console.error(err);

    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });