'use client'

import NotesList from '@/features/notes/notes-list'
import type { notes } from '@/server/db'
import { usePathname } from 'next/navigation'

type ArchivedLayoutClientProps = {
  notesWithTags: (typeof notes.$inferSelect & { tags: string[] })[]
  children: React.ReactNode
}

export default function ArchivedLayoutClient({
  notesWithTags,
  children,
}: ArchivedLayoutClientProps) {
  const pathname = usePathname()

  const showFormOnMobile = pathname.match(/^\/archived\/[^/]+$/)

  return (
    <div className="grid h-[calc(100vh-4rem)] w-full grid-cols-1 overflow-hidden md:grid-cols-[minmax(350px,_400px)_1fr] lg:grid-cols-[minmax(350px,_400px)_1fr_1fr]">
      <div
        className={`col-span-1 overflow-y-auto border-r transition-[grid-template-rows] duration-300 ${
          showFormOnMobile ? 'hidden md:block' : 'block'
        }`}>
        <NotesList
          notesWithTags={notesWithTags}
          basePath="/archived"
          showCreateButton={false}
        />
      </div>

      <div
        className={`overflow-y-auto md:col-span-1 lg:col-span-2 ${
          showFormOnMobile ? 'block' : 'hidden md:block'
        }`}>
        {children}
      </div>
    </div>
  )
}
