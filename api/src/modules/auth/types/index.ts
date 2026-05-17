import type {
  Role,
  User,
  UserRole,
} from '@prisma/client';
import type { RoleName } from '../../../shared/enums.js';

export type UserWithRoles = User & {
  userRoles: (UserRole & { role: Role })[];
};

export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  isActive: boolean;
  roles: RoleName[];
  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Subset of req.user passed to the service
// for authorization decisions.
export interface RequesterContext {
  id: string;
  roles: RoleName[];
  userAgent?: string | null;
  ip?: string | null;
}