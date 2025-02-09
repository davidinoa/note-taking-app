'use server'

import { db } from '@/server/db'
import { tags } from '@/server/db/schema'
import { unstable_cacheTag as cacheTag, revalidateTag } from 'next/cache'

export async function fetchTags() {
  'use cache'
  cacheTag('tags')
  return await db.select().from(tags)
}

export async function createTag(name: string, userId: string) {
  await db
    .insert(tags)
    .values({ name, userId })
    .returning()
    .then(() => {
      revalidateTag('tags')
    })
}
