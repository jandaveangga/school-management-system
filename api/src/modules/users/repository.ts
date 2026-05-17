import {
  Prisma,
  type Student,
  type Teacher,
} from '@prisma/client';
import type { RoleName } from '../../shared/enums.js';

import { prisma } from '../../db/prisma.js';
import type { UserWithRoles } from './types/index.js';

export interface UserListFilters {
  search?: string;
  role?: RoleName;
  isActive?: boolean;
}

export interface UserListOrderBy {
  field:
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'createdAt'
    | 'lastLoginAt';
  direction: 'asc' | 'desc';
}

const userWithRolesInclude = {
  userRoles: {
    include: { role: true },
  },
} satisfies Prisma.UserInclude;

const buildWhere = (
  filters: UserListFilters,
): Prisma.UserWhereInput => {
  const where: Prisma.UserWhereInput = {
    deletedAt: null,
  };

  if (filters.search !== undefined) {
    where.OR = [
      {
        firstName: {
          contains: filters.search,
        },
      },
      {
        lastName: {
          contains: filters.search,
        },
      },
      {
        email: {
          contains: filters.search.toLowerCase(),
        },
      },
    ];
  }

  if (filters.role !== undefined) {
    where.userRoles = {
      some: { role: { name: filters.role } },
    };
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  return where;
};

export const usersRepository = {
  list: async (
    filters: UserListFilters,
    orderBy: UserListOrderBy,
    skip: number,
    take: number,
  ): Promise<{ items: UserWithRoles[]; totalCount: number }> => {
    const where = buildWhere(filters);

    const [items, totalCount] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        include: userWithRolesInclude,
        orderBy: {
          [orderBy.field]: orderBy.direction,
        },
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);

    return { items, totalCount };
  },

  findById: (id: string): Promise<UserWithRoles | null> => {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: userWithRolesInclude,
    });
  },

  findByEmail: (
    email: string,
  ): Promise<UserWithRoles | null> => {
    return prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
      },
      include: userWithRolesInclude,
    });
  },

  create: async (
    data: Prisma.UserCreateInput,
    roleNames: readonly RoleName[],
  ): Promise<UserWithRoles> => {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data });

      const roles = await tx.role.findMany({
        where: { name: { in: [...roleNames] } },
      });

      if (roles.length !== roleNames.length) {
        const found = new Set(roles.map((r) => r.name));
        const missing = roleNames.filter((n) => !found.has(n));

        throw new Error(
          `Roles not found (run db seed): ${missing.join(', ')}`,
        );
      }

      await tx.userRole.createMany({
        data: roles.map((r) => ({
          userId: user.id,
          roleId: r.id,
        })),
      });

      return tx.user.findUniqueOrThrow({
        where: { id: user.id },
        include: userWithRolesInclude,
      });
    });
  },

  // updateMany ensures soft-deleted users are never updated accidentally
  update: async (
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<UserWithRoles | null> => {
    const result = await prisma.user.updateMany({
      where: { id, deletedAt: null },
      data,
    });

    if (result.count === 0) {
      return null;
    }

    return prisma.user.findUnique({
      where: { id },
      include: userWithRolesInclude,
    });
  },

  softDelete: async (id: string): Promise<boolean> => {
    const result = await prisma.user.updateMany({
      where: { id, deletedAt: null },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return result.count > 0;
  },

  addRole: async (
    userId: string,
    roleName: RoleName,
  ): Promise<void> => {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (role === null) {
      throw new Error(
        `Role ${roleName} missing — run db seed`,
      );
    }

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
      create: {
        userId,
        roleId: role.id,
      },
      update: {},
    });
  },

  // Idempotent removal (safe if role doesn't exist or user doesn't have it)
  removeRole: async (
    userId: string,
    roleName: RoleName,
  ): Promise<void> => {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (role === null) return;

    await prisma.userRole.deleteMany({
      where: {
        userId,
        roleId: role.id,
      },
    });
  },

  createStudentProfile: (
    userId: string,
    data: Omit<
      Prisma.StudentUncheckedCreateInput,
      'userId'
    >,
  ): Promise<Student> => {
    return prisma.student.create({
      data: { ...data, userId },
    });
  },

  createTeacherProfile: (
    userId: string,
    data: Omit<
      Prisma.TeacherUncheckedCreateInput,
      'userId'
    >,
  ): Promise<Teacher> => {
    return prisma.teacher.create({
      data: { ...data, userId },
    });
  },

  findStudentProfileByUserId: (
    userId: string,
  ): Promise<Student | null> => {
    return prisma.student.findUnique({
      where: { userId },
    });
  },

  findTeacherProfileByUserId: (
    userId: string,
  ): Promise<Teacher | null> => {
    return prisma.teacher.findUnique({
      where: { userId },
    });
  },
};