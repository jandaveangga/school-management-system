import bcrypt from 'bcryptjs';
import { env } from '../../config/env.js';

export const hashPassword = (plain: string): Promise<string> => {
  return bcrypt.hash(plain, env.BCRYPT_ROUNDS);
};

export const verifyPassword = (
  plain: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};