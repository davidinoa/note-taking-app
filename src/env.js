import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    SEED_USER_ID: z.string(),
  },
  client: {
    // NEXT_PUBLIC_ variables
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    SEED_USER_ID: process.env.SEED_USER_ID,
    // NEXT_PUBLIC_ variables
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
})
