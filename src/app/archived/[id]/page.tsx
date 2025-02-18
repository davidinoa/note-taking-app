import { fetchNoteById } from '@/features/notes/db'
import NoteForm from '@/features/notes/note-form'
import { currentUser } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function ArchivedNotePage({ params }: Props) {
  const user = await currentUser()
  if (!user?.id) notFound()

  const { id } = await params
  const note = await fetchNoteById(id, user.id)

  if (!note || note.status !== 'archived') notFound()

  return <NoteForm note={note} mode="edit" />
}
