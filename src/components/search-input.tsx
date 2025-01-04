'use client'

import { Search } from 'lucide-react'
import Form from 'next/form'
import { useSearchParams } from 'next/navigation'

const inputName = 'query'
const placeholder = 'Search by title, content, or tags...'

export default function SearchInput() {
  const searchParams = useSearchParams()
  const defaultValue = searchParams.get(inputName)?.toString()

  return (
    <Form action="/search">
      <div className="text-ds-neutral-500 relative">
        <label htmlFor={inputName} className="sr-only">
          Search
        </label>
        <Search
          aria-hidden="true"
          className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
        />
        <input
          required
          type="search"
          name={inputName}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="border-ds-neutral-300 w-full min-w-80 rounded-lg border py-3.5 pr-4 pl-9 text-sm shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)]"
        />
      </div>
    </Form>
  )
}
