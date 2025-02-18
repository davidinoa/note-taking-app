import { db, notes } from '@/server/db'
import { and, eq } from 'drizzle-orm'
import { unstable_cacheTag as cacheTag } from 'next/cache'

export async function fetchNotes(userId: string) {
  'use cache'
  cacheTag('notes')
  return await db.query.notes
    .findMany({
      where: and(eq(notes.userId, userId), eq(notes.status, 'published')),
      with: {
        notesToTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: (notes, { desc }) => [desc(notes.createdAt)],
    })
    .then((notes) =>
      notes.map(({ notesToTags, ...noteWithoutRelation }) => ({
        ...noteWithoutRelation,
        tags: notesToTags.map((ntt) => ntt.tag.name),
      })),
    )
}

export async function archiveNote(noteId: string) {
  return await db
    .update(notes)
    .set({ status: 'archived', updatedAt: new Date() })
    .where(eq(notes.id, noteId))
}

export async function fetchNoteById(noteId: string, userId: string) {
  'use cache'
  cacheTag(`note-${noteId}`)
  const note = await db.query.notes.findFirst({
    where: and(eq(notes.id, noteId), eq(notes.userId, userId)),
    with: {
      notesToTags: {
        with: {
          tag: true,
        },
      },
    },
  })

  if (!note) return null

  return {
    ...note,
    tags: note.notesToTags.map((ntt) => ntt.tag.name),
  }
}

export async function fetchArchivedNotes(userId: string) {
  'use cache'
  cacheTag('archived-notes')
  return await db.query.notes
    .findMany({
      where: and(eq(notes.userId, userId), eq(notes.status, 'archived')),
      with: {
        notesToTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: (notes, { desc }) => [desc(notes.createdAt)],
    })
    .then((notes) =>
      notes.map(({ notesToTags, ...noteWithoutRelation }) => ({
        ...noteWithoutRelation,
        tags: notesToTags.map((ntt) => ntt.tag.name),
      })),
    )
}

export async function restoreNote(noteId: string) {
  return await db
    .update(notes)
    .set({ status: 'draft', updatedAt: new Date() })
    .where(eq(notes.id, noteId))
}
