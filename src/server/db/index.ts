import { sql } from '@vercel/postgres'
import { drizzle } from 'drizzle-orm/vercel-postgres'

import * as relations from './relations'
import * as schema from './schema'

export const db = drizzle(sql, {
  schema: { ...schema, ...relations },
})

export { notes, notesToTags, tags } from './schema'
