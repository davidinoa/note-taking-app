import { db, notes } from '@/server/db'
import { eq } from 'drizzle-orm'

export async function fetchNotes(userId: string) {
  return await db.query.notes
    .findMany({
      where: eq(notes.userId, userId),
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
