import { fetchTags } from '@/features/tags/db'
import Link from 'next/link'

export default async function TagsPage() {
  const tags = await fetchTags()

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Tags</h1>
      <div className="space-y-1">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tags/${encodeURIComponent(tag.name)}`}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">
            <svg
              className="h-4 w-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <span>{tag.name}</span>
          </Link>
        ))}
        {tags.length === 0 && (
          <p className="text-gray-500">No tags created yet.</p>
        )}
      </div>
    </div>
  )
}
