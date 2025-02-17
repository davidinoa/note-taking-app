import { Badge } from '@/components/ui/badge'
import { db } from '@/server/db'
import Link from 'next/link'

type Props = {
  searchParams: Promise<{ query: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const query = (await searchParams).query
  const notes = await db.query.notes.findMany({
    where: (notes, { ilike, or }) =>
      or(ilike(notes.title, `%${query}%`), ilike(notes.content, `%${query}%`)),
    with: {
      notesToTags: {
        with: {
          tag: true,
        },
      },
    },
  })

  const notesWithTags = notes.map((note) => ({
    ...note,
    tags: note.notesToTags.map((ntt) => ntt.tag.name),
  }))

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4">
      {notesWithTags.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">
          No notes found matching &ldquo;{query}&rdquo;
        </p>
      ) : (
        <ul className="divide-y">
          {notesWithTags.map((note) => (
            <li key={note.id}>
              <Link
                href={`/notes/${note.id}`}
                className="block space-y-2 p-4 transition-colors hover:bg-gray-50">
                <h2 className="text-lg font-semibold">{note.title}</h2>
                <div className="flex flex-wrap gap-1.5">
                  {note.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-muted-foreground line-clamp-2 text-sm">
                  {note.content}
                </p>
                <time className="text-muted-foreground block text-xs">
                  {note.createdAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
