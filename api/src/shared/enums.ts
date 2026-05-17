/**
 * Local enum definitions to replace @prisma/client enums.
 * Required because SQLite does not support native Prisma enums —
 * these fields are stored as plain strings in the database.
 */

export const RoleName = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  PARENT: 'PARENT',
  STAFF: 'STAFF',
} as const;

export type RoleName = (typeof RoleName)[keyof typeof RoleName];

export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];
