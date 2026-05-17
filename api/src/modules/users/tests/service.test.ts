import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';

import { RoleName } from '../../../shared/enums.js';

import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../../shared/errors/app-error.js';

// ─────────────────────────────────────────────
// Mocks (must be before service import)
// ─────────────────────────────────────────────
vi.mock('../repository.js', () => ({
  usersRepository: {
    list: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    addRole: vi.fn(),
    removeRole: vi.fn(),
    createStudentProfile: vi.fn(),
    createTeacherProfile: vi.fn(),
    findStudentProfileByUserId: vi.fn(),
    findTeacherProfileByUserId: vi.fn(),
  },
}));

vi.mock('../../auth/repository.js', () => ({
  authRepository: {
    revokeAllUserRefreshTokens: vi.fn(),
  },
}));

vi.mock('../../../shared/utils/password.js', () => ({
  hashPassword: vi.fn(async (s: string) => `hashed_${s}`),
  verifyPassword: vi.fn(
    async (plain: string, hash: string) =>
      hash === `hashed_${plain}`,
  ),
}));

import { usersService } from '../service.js';
import { usersRepository } from '../repository.js';
import type { UserWithRoles } from '../types/index.js';

// ─────────────────────────────────────────────
// Test helpers
// ─────────────────────────────────────────────
const makeUser = (
  id: string,
  roles: RoleName[] = [RoleName.STUDENT],
  passwordHash = 'hashed_oldpw',
): UserWithRoles => ({
  id,
  email: `${id}@school.local`,
  passwordHash,
  firstName: 'F',
  lastName: 'L',
  phone: null,
  isActive: true,
  emailVerifiedAt: null,
  lastLoginAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  userRoles: roles.map((name) => ({
    userId: id,
    roleId: `${name}-id`,
    assignedAt: new Date(),
    role: {
      id: `${name}-id`,
      name,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  })),
});

const adminCtx = {
  id: 'admin-1',
  roles: [RoleName.ADMIN],
};

const studentCtx = {
  id: 'stu-1',
  roles: [RoleName.STUDENT],
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────
// list
// ─────────────────────────────────────────────
describe('usersService.list', () => {
  it('rejects non-admin', async () => {
    await expect(
      usersService.list(
        {
          page: 1,
          pageSize: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        },
        studentCtx,
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('returns paginated public users for admin', async () => {
    vi.mocked(usersRepository.list).mockResolvedValueOnce({
      items: [makeUser('u1'), makeUser('u2')],
      totalCount: 2,
    });

    const res = await usersService.list(
      {
        page: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
      adminCtx,
    );

    expect(res.items).toHaveLength(2);
    expect(res.totalCount).toBe(2);
    expect(res.totalPages).toBe(1);
    expect(res.items[0]).not.toHaveProperty('passwordHash');
  });
});

// ─────────────────────────────────────────────
// get
// ─────────────────────────────────────────────
describe('usersService.get', () => {
  it('admin can fetch any user', async () => {
    vi.mocked(usersRepository.findById).mockResolvedValueOnce(
      makeUser('other'),
    );

    const u = await usersService.get('other', adminCtx);
    expect(u.id).toBe('other');
  });

  it('non-admin cannot fetch other user', async () => {
    await expect(
      usersService.get('other', studentCtx),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('non-admin can fetch self', async () => {
    vi.mocked(usersRepository.findById).mockResolvedValueOnce(
      makeUser('stu-1'),
    );

    const u = await usersService.get('stu-1', studentCtx);
    expect(u.id).toBe('stu-1');
  });

  it('throws NotFound when missing', async () => {
    vi.mocked(usersRepository.findById).mockResolvedValueOnce(
      null,
    );

    await expect(
      usersService.get('admin-1', adminCtx),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

// ─────────────────────────────────────────────
// create
// ─────────────────────────────────────────────
describe('usersService.create', () => {
  it('rejects non-admin', async () => {
    await expect(
      usersService.create(
        {
          email: 'a@b.c',
          password: 'long-enough',
          firstName: 'A',
          lastName: 'B',
          roles: [RoleName.STUDENT],
        },
        studentCtx,
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('rejects when email already taken', async () => {
    vi.mocked(usersRepository.findByEmail).mockResolvedValueOnce(
      makeUser('existing'),
    );

    await expect(
      usersService.create(
        {
          email: 'a@b.c',
          password: 'long-enough',
          firstName: 'A',
          lastName: 'B',
          roles: [RoleName.STUDENT],
        },
        adminCtx,
      ),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('hashes password and persists with roles', async () => {
    vi.mocked(usersRepository.findByEmail).mockResolvedValueOnce(
      null,
    );

    vi.mocked(usersRepository.create).mockResolvedValueOnce(
      makeUser('new', [RoleName.TEACHER]),
    );

    const u = await usersService.create(
      {
        email: 'a@b.c',
        password: 'plaintext',
        firstName: 'A',
        lastName: 'B',
        roles: [RoleName.TEACHER],
      },
      adminCtx,
    );

    expect(u.id).toBe('new');

    const callArg =
      vi.mocked(usersRepository.create).mock.calls[0]?.[0];

    expect(callArg?.passwordHash).toBe('hashed_plaintext');
  });
});