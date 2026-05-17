import jwt, { type SignOptions, type VerifyOptions } from 'jsonwebtoken';
import { v7 as uuidv7 } from 'uuid';
import type { RoleName } from '../enums.js';

import { env } from '../../config/env.js';
import { UnauthorizedError } from '../errors/app-error.js';

const ISSUER = 'school-mngt-api';
const AUDIENCE = 'school-mngt-api';

export interface AccessTokenClaims {
  sub: string;
  email: string;
  roles: RoleName[];
  type: 'access';
  jti: string;
  iat?: number;
  exp?: number;
}

export const signAccessToken = (
  input: Pick<AccessTokenClaims, 'sub' | 'email' | 'roles'>
): string => {
  const claims: Omit<AccessTokenClaims, 'iat' | 'exp'> = {
    sub: input.sub,
    email: input.email,
    roles: input.roles,
    type: 'access',
    jti: uuidv7(),
  };

  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_TTL as SignOptions['expiresIn'],
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithm: 'HS256',
  };

  return jwt.sign(claims, env.JWT_ACCESS_SECRET, options);
};

export const verifyAccessToken = (token: string): AccessTokenClaims => {
  const options: VerifyOptions = {
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithms: ['HS256'],
  };

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, options);

    if (typeof decoded === 'string') {
      throw new UnauthorizedError('Invalid token type');
    }

    const claims = decoded as AccessTokenClaims;

    if (claims.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }

    return claims;
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      throw err;
    }

    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Access token expired');
    }

    if (err instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid access token');
    }

    throw err;
  }
};