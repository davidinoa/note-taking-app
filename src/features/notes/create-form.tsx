'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Clock, Tag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { createNote } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      className="bg-blue-500 hover:bg-blue-600"
      disabled={pending}>
      {pending ? 'Saving...' : 'Save Note'}
    </Button>
  )
}

export default function NoteForm() {
  const router = useRouter()

  return (
    <form
      action={createNote}
      className="mx-auto w-full max-w-4xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          type="button"
          onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
        <div className="flex items-center gap-4">
          <Button variant="ghost" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <SubmitButton />
        </div>
      </div>

      <div className="space-y-6">
        <Input
          name="title"
          type="text"
          placeholder="Enter a title..."
          className="border-none px-2 text-3xl font-semibold shadow-none placeholder:text-gray-400"
          required
        />

        <div className="flex items-center gap-2 text-gray-500">
          <Tag className="h-4 w-4" />
          <Input
            name="tags"
            type="text"
            placeholder="Add tags separated by commas (e.g. Work, Planning)"
            className="border-none px-2 shadow-none"
          />
        </div>

        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="h-4 w-4" />
          <span className="text-sm">Not yet saved</span>
        </div>

        <Textarea
          name="content"
          placeholder="Start typing your note here..."
          className="min-h-[500px] resize-none border-none px-2 shadow-none"
          required
        />
      </div>
    </form>
  )
}
