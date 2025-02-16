import { fetchNotes } from '@/features/notes/db'
import { currentUser } from '@clerk/nextjs/server'
import NotesLayoutClient from './notes-layout-client'

export default async function NotesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()
  const userId = user?.id ?? ''
  const notesWithTags = await fetchNotes(userId)

  return (
    <NotesLayoutClient notesWithTags={notesWithTags}>
      {children}
    </NotesLayoutClient>
  )
}
