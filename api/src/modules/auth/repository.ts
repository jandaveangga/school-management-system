import type {
  Prisma,
  RefreshToken,
} from '@prisma/client';
import type { RoleName } from '../../shared/enums.js';

import { prisma } from '../../db/prisma.js';

import type { UserWithRoles } from './types/index.js';

// =========================================================
// PRISMA INCLUDES
// =========================================================

const userWithRolesInclude = {
  userRoles: {
    include: {
      role: true,
    },
  },
} satisfies Prisma.UserInclude;

// =========================================================
// AUTH REPOSITORY
// =========================================================

export const authRepository = {
  // =======================================================
  // USERS
  // =======================================================

  findUserByEmail: (
    email: string,
  ): Promise<UserWithRoles | null> => {
    return prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
      include: userWithRolesInclude,
    });
  },

  findUserById: (
    id: string,
  ): Promise<UserWithRoles | null> => {
    return prisma.user.findUnique({
      where: {
        id,
      },
      include: userWithRolesInclude,
    });
  },

  createUserWithRole: async (
    data: Prisma.UserCreateInput,
    roleName: RoleName,
  ): Promise<UserWithRoles> => {
    return prisma.$transaction(async (tx) => {
      const role = await tx.role.findUnique({
        where: {
          name: roleName,
        },
      });

      if (role === null) {
        // Happens if database seed was not executed
        throw new Error(
          `Role "${roleName}" not found — run \`pnpm prisma db seed\``,
        );
      }

      const user = await tx.user.create({
        data,
      });

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });

      return tx.user.findUniqueOrThrow({
        where: {
          id: user.id,
        },
        include: userWithRolesInclude,
      });
    });
  },

  // =======================================================
  // REFRESH TOKENS
  // =======================================================

  createRefreshToken: (
    data: Prisma.RefreshTokenUncheckedCreateInput,
  ): Promise<RefreshToken> => {
    return prisma.refreshToken.create({
      data,
    });
  },

  findRefreshTokenByHash: (
    tokenHash: string,
  ): Promise<RefreshToken | null> => {
    return prisma.refreshToken.findUnique({
      where: {
        tokenHash,
      },
    });
  },

  revokeRefreshToken: (
    id: string,
    replacedById: string | null = null,
  ): Promise<RefreshToken> => {
    return prisma.refreshToken.update({
      where: {
        id,
      },
      data: {
        revokedAt: new Date(),
        replacedById,
      },
    });
  },

  revokeAllUserRefreshTokens: async (
    userId: string,
  ): Promise<number> => {
    const result = await prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return result.count;
  },

  // =======================================================
  // USER ACTIVITY
  // =======================================================

  updateLastLogin: async (
    userId: string,
  ): Promise<void> => {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });
  },
};
