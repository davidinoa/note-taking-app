import { db } from '@/server/db'

export async function fetchNotes() {
  return await db.query.notes
    .findMany({
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
