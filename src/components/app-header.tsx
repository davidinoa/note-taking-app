'use client'

import { Cog } from 'lucide-react'
import { usePathname, useSearchParams } from 'next/navigation'
import SearchInput from './search-input'

export default function AppHeader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isSearching = pathname.startsWith('/search')
  const searchQuery = searchParams.get('query')
  const heading =
    isSearching && searchQuery
      ? `Search Results for "${searchQuery}"`
      : 'All Notes'

  return (
    <header className="sticky top-0 z-10 flex min-h-[4rem] flex-col gap-3 border-b bg-white p-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6 md:px-8">
      <h1 className="text-xl font-bold sm:text-2xl">{heading}</h1>
      <div className="flex flex-1 items-center gap-3">
        <SearchInput />
        <Cog className="text-ds-neutral-500 h-5 w-5 shrink-0" />
      </div>
    </header>
  )
}
