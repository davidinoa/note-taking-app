'use client'

import { Search } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

const inputName = 'query'
const placeholder = 'Search by title, content, or tags...'

export default function SearchInput() {
  const searchParams = useSearchParams()
  const defaultValue = searchParams.get(inputName)?.toString()

  return (
    <form action="/search" className="flex-1">
      <div className="text-ds-neutral-500 relative">
        <label htmlFor={inputName} className="sr-only">
          Search
        </label>
        <Search
          aria-hidden="true"
          className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 sm:left-3"
        />
        <input
          required
          type="search"
          id={inputName}
          name={inputName}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="border-ds-neutral-300 w-full rounded-lg border py-2.5 pr-3 pl-8 text-sm shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] sm:min-w-[320px] sm:py-3.5 sm:pr-4 sm:pl-9"
        />
      </div>
    </form>
  )
}
