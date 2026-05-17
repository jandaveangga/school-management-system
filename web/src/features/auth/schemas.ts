import { z } from 'zod';

// Mirrors api/prisma/schema.prisma RoleName enum exactly.
export const roleNameSchema = z.enum([
  'ADMIN',
  'TEACHER',
  'STUDENT',
  'PARENT',
  'STAFF',
]);

export type RoleName = z.infer<typeof roleNameSchema>;

// Minimal user embedded in token responses
// (login/register/refresh).
// Mirrors api/src/modules/auth/types/index.ts → PublicUser.
export const tokenUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  roles: z.array(roleNameSchema),
});

export type TokenUser = z.infer<typeof tokenUserSchema>;

// Full user record returned by /me and /users endpoints.
// Mirrors api/src/modules/users/types/index.ts → PublicUser.
export const publicUserSchema = tokenUserSchema.extend({
  phone: z.string().nullable(),
  isActive: z.boolean(),
  emailVerifiedAt: z.coerce.date().nullable(),
  lastLoginAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type PublicUser = z.infer<typeof publicUserSchema>;

// Token pair returned by
// POST /auth/login, /auth/register, /auth/refresh.
export const tokenPairSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  refreshTokenId: z.string(),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number().int().positive(),
  user: tokenUserSchema,
});

export type TokenPair = z.infer<typeof tokenPairSchema>;

//
// ── Reusable field schemas ──────────────────────────────────────────
//

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email')
  .max(254)
  .toLowerCase();

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be 128 characters or fewer');

const nameSchema = (label: string): z.ZodString =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(100);

const phoneSchema = z
  .string()
  .trim()
  .max(32, 'Phone number is too long');

//
// ── Login form ──────────────────────────────────────────────────────
//

export const loginFormSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

//
// ── Register: shared base ───────────────────────────────────────────
//

const registerBaseSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema('First name'),
  lastName: nameSchema('Last name'),
  phone: phoneSchema.optional(),
});

// What the API expects
// (mirrors backend registerBodySchema).
export const registerBodySchema = registerBaseSchema;

export type RegisterBody = z.infer<typeof registerBodySchema>;

// What the form collects
// — adds confirmPassword + match check.
export const registerFormSchema = registerBaseSchema
  .extend({
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<
  typeof registerFormSchema
>;