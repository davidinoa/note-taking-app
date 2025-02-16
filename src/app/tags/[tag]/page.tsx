import { getNotesByTag } from '@/features/tags/db'
import { formatDate } from '@/lib/utils/format-date'
import Link from 'next/link'

type PageProps = {
  params: Promise<{ tag: string }>
}

export default async function TagNotesPage({ params }: PageProps) {
  const { tag } = await params
  const tagName = decodeURIComponent(tag)
  const notes = await getNotesByTag(tagName)

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <h1 className="text-2xl font-bold">
          Notes tagged with &ldquo;{tagName}&rdquo;
        </h1>
        <Link
          href="/tags"
          className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to tags
        </Link>
      </div>

      <div className="space-y-4">
        {notes.map((note) => (
          <Link
            key={note.id}
            href={`/notes/${note.id}`}
            className="block rounded-lg border p-4 hover:bg-gray-50">
            <h2 className="font-semibold">{note.title}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {formatDate(note.createdAt)}
            </p>
          </Link>
        ))}

        {notes.length === 0 && (
          <p className="text-gray-500">No notes found with this tag.</p>
        )}
      </div>
    </div>
  )
}
