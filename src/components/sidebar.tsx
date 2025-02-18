'use client'

import { fetchTags } from '@/features/tags/db'
import { cn } from '@/lib/utils'
import { Archive, Home, Tag } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type SidebarProps = {
  tagsData: Awaited<ReturnType<typeof fetchTags>>
}

export default function Sidebar({ tagsData }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="border-ds-neutral-200 ds-md:block hidden h-full w-xs border-r p-8">
      <nav className="mb-8 space-y-2">
        <Link
          href="/notes"
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50',
            pathname === '/notes' && 'bg-gray-50 font-medium',
          )}>
          <Home className="h-4 w-4" />
          All Notes
        </Link>
        <Link
          href="/archived"
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50',
            pathname === '/archived' && 'bg-gray-50 font-medium',
          )}>
          <Archive className="h-4 w-4" />
          Archived Notes
        </Link>
      </nav>

      <h2 className="mb-4 text-lg font-bold">Tags</h2>
      <ul className="space-y-2">
        {tagsData.map((tag) => (
          <li key={tag.id}>
            <Link
              href={`/tags/${encodeURIComponent(tag.name)}`}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50',
                pathname === `/tags/${tag.name}` && 'bg-gray-50 font-medium',
              )}>
              <Tag className="h-4 w-4" />
              {tag.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
