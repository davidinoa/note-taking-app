'use server'

import { db } from '@/server/db'
import { tags } from '@/server/db/schema'
import { currentUser } from '@clerk/nextjs/server'
import { unstable_cacheTag as cacheTag, revalidateTag } from 'next/cache'

export async function fetchTags() {
  'use cache'
  cacheTag('tags')
  return await db.select().from(tags)
}

export async function createTag(name: string) {
  const user = await currentUser()
  const userId = user?.id ?? ''
  if (!userId) {
    throw new Error('User not found')
  }
  await db
    .insert(tags)
    .values({ name, userId })
    .returning()
    .then(() => {
      revalidateTag('tags')
    })
}
