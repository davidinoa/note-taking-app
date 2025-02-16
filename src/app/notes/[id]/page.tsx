import NoteForm from '@/features/notes/note-form'
import { db } from '@/server/db'
import { notes } from '@/server/db/schema'
import { currentUser } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function NotePage({ params }: Props) {
  const user = await currentUser()
  if (!user?.id) notFound()

  const { id } = await params
  const note = await db.query.notes.findFirst({
    where: and(eq(notes.id, id), eq(notes.userId, user.id)),
    with: {
      notesToTags: {
        with: {
          tag: true,
        },
      },
    },
  })

  if (!note) notFound()

  const noteWithTags = {
    ...note,
    tags: note.notesToTags.map((ntt) => ntt.tag.name),
  }

  return <NoteForm note={noteWithTags} mode="edit" />
}
