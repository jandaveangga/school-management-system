 // Augment Express's Request with fields populated by our middleware.
//
//   - req.id   : set by `requestId` middleware; consumed by pino-http + error handler
//   - req.user : set by `requireAuth` middleware in modules/auth — present only on
//                authenticated routes. Always check before accessing.

import type { RoleName } from '../../shared/enums.js';

declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: {
        id: string;
        email: string;
        roles: RoleName[];
      };
    }
  }
}

export {};