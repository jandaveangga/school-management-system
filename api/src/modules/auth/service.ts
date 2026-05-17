import bcrypt from 'bcryptjs';
import { RoleName } from '../../shared/enums.js';

import { env } from '../../config/env.js';
import {
  ConflictError,
  UnauthorizedError,
} from '../../shared/errors/app-error.js';
import { logger } from '../../shared/utils/logger.js';
import { hashPassword, verifyPassword } from '../../shared/utils/password.js';
import { generateRefreshToken, hashToken } from '../../shared/utils/token.js';
import { signAccessToken } from '../../shared/utils/jwt.js';
import { parseDurationMs } from '../../shared/utils/duration.js';

import { authRepository } from './repository.js';
import type { LoginBody, RegisterBody } from './dtos/auth.dto.js';
import type {
  PublicUser,
  RequesterContext,
  UserWithRoles,
} from './types/index.js';

// Use RequesterContext directly — the alias `RequestContext` was an unused rename
// that could cause confusion. Removed to keep the import clean.

type TokenPair = {
  accessToken: string;
  refreshToken: string;
  refreshTokenId: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: PublicUser;
};

// Pre-computed once at module load so the "user not found" path still spends
// a hash cycle and the response timing can't reveal whether the email exists.
const TIMING_DUMMY_HASH = bcrypt.hashSync(
  'timing_equalization_only',
  env.BCRYPT_ROUNDS,
);

const toPublicUser = (u: UserWithRoles): PublicUser => ({
  id: u.id,
  email: u.email,
  firstName: u.firstName,
  lastName: u.lastName,
  phone: u.phone,
  isActive: u.isActive,
  roles: u.userRoles.map((ur) => ur.role.name),
  emailVerifiedAt: u.emailVerifiedAt,
  lastLoginAt: u.lastLoginAt,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

const issueTokens = async (
  user: UserWithRoles,
  context: RequesterContext,
): Promise<TokenPair> => {
  const roles = user.userRoles.map((ur) => ur.role.name);

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    roles,
  });

  const refreshTokenRaw = generateRefreshToken();
  const refreshTokenHash = hashToken(refreshTokenRaw);

  const refreshTtlMs = parseDurationMs(env.JWT_REFRESH_TTL);
  const accessTtlMs = parseDurationMs(env.JWT_ACCESS_TTL);

  const stored = await authRepository.createRefreshToken({
    userId: user.id,
    tokenHash: refreshTokenHash,
    expiresAt: new Date(Date.now() + refreshTtlMs),
    userAgent: context.userAgent ?? null,
    ipAddress: context.ip ?? null,
  });

  return {
    accessToken,
    refreshToken: refreshTokenRaw,
    refreshTokenId: stored.id,
    tokenType: 'Bearer',
    expiresIn: Math.floor(accessTtlMs / 1000),
    user: toPublicUser(user),
  };
};

export const authService = {
  register: async (
    input: RegisterBody,
    context: RequesterContext,
  ): Promise<TokenPair> => {
    const existing = await authRepository.findUserByEmail(input.email);

    if (existing !== null) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await authRepository.createUserWithRole(
      {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone ?? null,
      },
      RoleName.STUDENT,
    );

    logger.info({ userId: user.id, email: user.email }, 'user registered');

    return issueTokens(user, context);
  },

  login: async (
    input: LoginBody,
    context: RequesterContext,
  ): Promise<TokenPair> => {
    const user = await authRepository.findUserByEmail(input.email);

    const fail = (): never => {
      throw new UnauthorizedError('Invalid credentials');
    };

    if (user === null || user.deletedAt !== null || !user.isActive) {
      // Spend a hash cycle on the dummy so missing-user path matches timing
      if (user === null) {
        await verifyPassword(input.password, TIMING_DUMMY_HASH);
      }
      fail();
    }

    // `user` may be non-null here but because we awaited inside the
    // earlier conditional TypeScript cannot guarantee it. Narrow into a
    // local typed variable to satisfy the compiler.
    const userNotNull = user as UserWithRoles;

    const valid = await verifyPassword(input.password, userNotNull.passwordHash);

    if (!valid) {
      fail();
    }

    await authRepository.updateLastLogin(userNotNull.id);

    logger.info({ userId: userNotNull.id }, 'user login');

    return issueTokens(userNotNull, context);
  },

  refresh: async (
    rawToken: string,
    context: RequesterContext,
  ): Promise<TokenPair> => {
    const tokenHash = hashToken(rawToken);

    const stored = await authRepository.findRefreshTokenByHash(tokenHash);

    if (stored === null) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedError('Refresh token expired');
    }

    if (stored.revokedAt !== null) {
      // Reuse detected — revoke all sessions
      const revokedCount =
        await authRepository.revokeAllUserRefreshTokens(stored.userId);

      logger.warn(
        { userId: stored.userId, revokedCount },
        'refresh-token reuse detected — all sessions revoked',
      );

      throw new UnauthorizedError('Refresh token reused — session revoked');
    }

    const user = await authRepository.findUserById(stored.userId);

    if (user === null || user.deletedAt !== null || !user.isActive) {
      throw new UnauthorizedError('User unavailable');
    }

    // FIX: Issue new tokens BEFORE revoking the old one, then pass the new
    // token's ID as the successor so the repository can link rotation history.
    // Previously the order was correct but the successor ID was being passed
    // as a second positional arg — ensure your revokeRefreshToken signature
    // accepts (id: string, successorId?: string).
    const pair = await issueTokens(user, context);

    await authRepository.revokeRefreshToken(stored.id, pair.refreshTokenId);

    return pair;
  },

  logout: async (rawToken: string): Promise<void> => {
    const tokenHash = hashToken(rawToken);

    const stored = await authRepository.findRefreshTokenByHash(tokenHash);

    if (stored !== null && stored.revokedAt === null) {
      // FIX: logout has no successor token — pass only the token ID.
      // The original code already did this correctly; confirmed no second arg needed here.
      await authRepository.revokeRefreshToken(stored.id);
    }

    // Idempotent — unknown / already-revoked tokens still succeed
  },

  getUserPublic: async (userId: string): Promise<PublicUser | null> => {
    const user = await authRepository.findUserById(userId);

    if (user === null || user.deletedAt !== null) {
      return null;
    }

    return toPublicUser(user);
  },
};