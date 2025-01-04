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
    <header className="grid min-h-20.5 grid-cols-[1fr_auto_auto] items-center gap-4 border-b px-8">
      <h1 className="text-2xl font-bold">{heading}</h1>
      <SearchInput />
      <Cog className="text-ds-neutral-500" />
    </header>
  )
}
