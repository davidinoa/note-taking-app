import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import NoteForm from '@/features/notes/create-form'
import { fetchNotes } from '@/features/notes/db'
import { notes } from '@/server/db/schema'
import { currentUser } from '@clerk/nextjs/server'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { connection } from 'next/server'

export default async function Home() {
  await connection()
  const user = await currentUser()
  const userId = user?.id ?? ''
  const notesWithTags = await fetchNotes(userId)

  return (
    <div className="ds-md:grid-cols-[18.125rem_1fr] grid w-full grid-rows-1 overflow-auto">
      <NotesList notesWithTags={notesWithTags} />
      <div className="max-ds-md:hidden">
        <NoteForm />
      </div>
    </div>
  )
}

type NotesListProps = {
  notesWithTags: (typeof notes.$inferSelect & { tags: string[] })[]
}

function NotesList({ notesWithTags }: NotesListProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <Button asChild className="h-14 w-full text-lg" size="lg">
        <Link href="/notes/new">
          <Plus className="mr-2 h-5 w-5" />
          Create New Note
        </Link>
      </Button>

      <div className="space-y-4">
        {notesWithTags.map((note) => (
          <Link
            key={note.id}
            href={`/notes/${note.id}`}
            className="block rounded-lg p-4 transition-colors hover:bg-gray-50">
            <h2 className="mb-2 text-lg font-semibold">{note.title}</h2>
            <div className="mb-2 flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <time className="text-muted-foreground text-sm">
              {note.createdAt.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </time>
          </Link>
        ))}
      </div>
    </div>
  )
}
