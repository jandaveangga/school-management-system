import { createHash, randomBytes } from 'node:crypto';

// 48 bytes (~64 base64url chars) — well above NIST guidance for opaque tokens.
const REFRESH_TOKEN_BYTES = 48;

export const generateRefreshToken = (): string => {
  return randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
};

// SHA-256 of the raw token. We only ever store the hash, so a DB leak never
// exposes usable refresh tokens.
export const hashToken = (raw: string): string => {
  return createHash('sha256').update(raw).digest('hex');
};