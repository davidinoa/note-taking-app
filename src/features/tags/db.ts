'use server'

import { db } from '@/server/db'
import { notes, notesToTags, tags } from '@/server/db/schema'
import { currentUser } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
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

export async function getNotesByTag(tagName: string) {
  const [tag] = await db.select().from(tags).where(eq(tags.name, tagName))
  if (!tag) return []

  return await db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
    })
    .from(notes)
    .innerJoin(notesToTags, eq(notes.id, notesToTags.noteId))
    .where(eq(notesToTags.tagId, tag.id))
    .orderBy(notes.createdAt)
}
