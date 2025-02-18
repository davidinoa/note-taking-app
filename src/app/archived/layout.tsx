import { fetchArchivedNotes } from '@/features/notes/db'
import { currentUser } from '@clerk/nextjs/server'
import ArchivedLayoutClient from './archived-layout-client'

export default async function ArchivedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()
  const userId = user?.id ?? ''
  const archivedNotes = await fetchArchivedNotes(userId)

  return (
    <ArchivedLayoutClient notesWithTags={archivedNotes}>
      {children}
    </ArchivedLayoutClient>
  )
}
