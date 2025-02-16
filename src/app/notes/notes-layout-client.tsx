'use client'

import NotesList from '@/features/notes/notes-list'
import type { notes } from '@/server/db'
import { usePathname } from 'next/navigation'

type NotesLayoutClientProps = {
  notesWithTags: (typeof notes.$inferSelect & { tags: string[] })[]
  children: React.ReactNode
}

export default function NotesLayoutClient({
  notesWithTags,
  children,
}: NotesLayoutClientProps) {
  const pathname = usePathname()

  // Check if we're on a specific note page or new note page
  const showFormOnMobile =
    pathname.match(/^\/notes\/[^/]+$/) || pathname === '/notes/new'

  return (
    <div className="grid h-full w-full grid-cols-1 md:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_1fr_1fr]">
      <div
        className={`col-span-1 border-r ${
          showFormOnMobile ? 'hidden md:block' : 'block'
        }`}>
        <NotesList notesWithTags={notesWithTags} />
      </div>

      <div
        className={`md:col-span-1 lg:col-span-2 ${
          showFormOnMobile ? 'block' : 'hidden md:block'
        }`}>
        {children}
      </div>
    </div>
  )
}
