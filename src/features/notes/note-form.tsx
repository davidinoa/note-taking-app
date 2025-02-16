'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useActionFeedback } from '@/hooks/use-action-feedback'
import { type notes } from '@/server/db/schema'
import { ArrowLeft, Clock, Tag } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState } from 'react'
import { toast } from 'sonner'
import { createNote, updateNote } from './actions'

type NoteFormProps = {
  note?: typeof notes.$inferSelect & { tags: string[] }
  mode?: 'create' | 'edit'
}

export default function NoteForm({ note, mode = 'create' }: NoteFormProps) {
  const router = useRouter()
  const action = mode === 'create' ? createNote : updateNote
  const [state, formAction, isPending] = useActionState(action, {
    status: 'IDLE',
    message: null,
    payload: null,
    fieldErrors: null,
    timestamp: Date.now(),
  })

  useActionFeedback(state, {
    onSuccess: ({ actionState }) => {
      toast.success(
        actionState.message ||
          `Note ${mode === 'create' ? 'created' : 'updated'} successfully!`,
      )
      router.push('/')
    },
    onError: ({ actionState }) => {
      toast.error(
        actionState.message ||
          `Failed to ${mode === 'create' ? 'create' : 'update'} note`,
      )
    },
  })

  return (
    <form
      action={formAction}
      className="mx-auto w-full max-w-4xl space-y-6 p-4">
      {mode === 'edit' && note && (
        <input type="hidden" name="id" value={note.id} />
      )}
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            type="button">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
            {isPending
              ? 'Saving...'
              : `${mode === 'create' ? 'Save' : 'Update'} Note`}
          </Button>
        </div>
      </div>

      {state?.message && state.status === 'ERROR' && (
        <div className="text-sm text-red-500">{state.message}</div>
      )}

      <div className="space-y-6">
        <div>
          <Input
            name="title"
            type="text"
            placeholder="Enter a title..."
            className="border-none px-2 text-3xl font-semibold shadow-none placeholder:text-gray-400"
            required
            disabled={isPending}
            defaultValue={note?.title || state?.payload?.title?.toString()}
          />
          {state?.fieldErrors?.title && (
            <div className="mt-1 text-sm text-red-500">
              {state.fieldErrors.title}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-500">
            <Tag className="h-4 w-4" />
            <Input
              name="tags"
              type="text"
              placeholder="Add tags separated by commas (e.g. Work, Planning)"
              className="border-none px-2 shadow-none"
              disabled={isPending}
              defaultValue={
                note?.tags?.join(', ') || state?.payload?.tags?.toString()
              }
            />
          </div>
          {state?.fieldErrors?.tags && (
            <div className="mt-1 text-sm text-red-500">
              {state.fieldErrors.tags}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="h-4 w-4" />
          <span className="text-sm">
            {isPending
              ? 'Saving...'
              : note?.updatedAt
                ? `Last updated ${note.updatedAt.toLocaleString()}`
                : 'Not yet saved'}
          </span>
        </div>

        <div>
          <Textarea
            name="content"
            placeholder="Start typing your note here..."
            className="min-h-[500px] resize-none border-none px-2 shadow-none"
            required
            disabled={isPending}
            defaultValue={note?.content || state?.payload?.content?.toString()}
          />
          {state?.fieldErrors?.content && (
            <div className="mt-1 text-sm text-red-500">
              {state.fieldErrors.content}
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
