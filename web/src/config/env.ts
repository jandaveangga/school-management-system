import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

// Validates VITE_-prefixed env vars at module load.
// Fail-fast if environment is misconfigured.
export const env = createEnv({
  clientPrefix: 'VITE_',

  client: {
    VITE_API_BASE_URL: z.string().min(1).default('/api/v1'),
    VITE_NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
  },

  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});