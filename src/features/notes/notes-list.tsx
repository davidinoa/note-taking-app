import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { notes } from '@/server/db'
import { Plus } from 'lucide-react'
import Link from 'next/link'

type NotesListProps = {
  notesWithTags: (typeof notes.$inferSelect & { tags: string[] })[]
}

export default function NotesList({ notesWithTags }: NotesListProps) {
  return (
    <div className="mx-auto space-y-4 p-3 pt-6 sm:space-y-6 sm:p-4">
      <Button
        asChild
        className="h-12 w-full text-base sm:h-14 sm:text-lg"
        size="lg">
        <Link href="/notes/new">
          <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Create New Note
        </Link>
      </Button>

      <div className="space-y-3 pb-24 sm:space-y-4">
        {notesWithTags.map((note) => (
          <Link
            key={note.id}
            href={`/notes/${note.id}`}
            className="block rounded-lg p-3 transition-colors hover:bg-gray-50 sm:p-4">
            <h2 className="mb-2 text-base font-semibold sm:text-lg">
              {note.title}
            </h2>
            <div className="mb-2 flex flex-wrap gap-1.5 sm:gap-2">
              {note.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs sm:text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
            <time className="text-muted-foreground text-xs sm:text-sm">
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
