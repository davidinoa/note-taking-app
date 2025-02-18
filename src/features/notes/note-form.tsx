'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useActionFeedback } from '@/hooks/use-action-feedback'
import { type notes } from '@/server/db/schema'
import { Archive, ArrowLeft, Clock, Tag, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useTransition } from 'react'
import { toast } from 'sonner'
import { archiveNote, createNote, deleteNote, updateNote } from './actions'

type NoteFormProps = {
  note?: typeof notes.$inferSelect & { tags: string[] }
  mode?: 'create' | 'edit'
}

export default function NoteForm({ note, mode = 'create' }: NoteFormProps) {
  const router = useRouter()
  const [isPendingDelete, startTransition] = useTransition()
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
      router.push('/notes')
    },
    onError: ({ actionState }) => {
      toast.error(
        actionState.message ||
          `Failed to ${mode === 'create' ? 'create' : 'update'} note`,
      )
    },
  })

  const handleDelete = () => {
    if (!note?.id || mode !== 'edit') return

    if (confirm('Are you sure you want to delete this note?')) {
      startTransition(async () => {
        const result = await deleteNote(note.id)
        if (result.status === 'SUCCESS') {
          toast.success(result.message || 'Note deleted successfully')
          router.push('/notes')
        } else {
          toast.error(result.message || 'Failed to delete note')
        }
      })
    }
  }

  const handleArchive = () => {
    if (!note?.id || mode !== 'edit') return

    if (confirm('Are you sure you want to archive this note?')) {
      startTransition(async () => {
        const result = await archiveNote(note.id)
        if (result.status === 'SUCCESS') {
          toast.success(result.message || 'Note archived successfully')
          router.push('/notes')
        } else {
          toast.error(result.message || 'Failed to archive note')
        }
      })
    }
  }

  return (
    <form
      action={formAction}
      className="mx-auto w-full max-w-4xl space-y-6 p-4">
      {mode === 'edit' && note && (
        <input type="hidden" name="id" value={note.id} />
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/notes">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            type="button">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={handleArchive}
            title="Archive note"
            disabled={mode !== 'edit'}>
            <Archive className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={handleDelete}
            title="Delete note"
            disabled={mode !== 'edit' || isPendingDelete}>
            <Trash2 className="text-destructive h-4 w-4" />
          </Button>
          <Link href="/notes">
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

      <div className="space-y-4">
        <div>
          <Textarea
            name="title"
            placeholder="Enter a title..."
            className="[field-sizing:content] min-h-0 resize-none overflow-hidden border-none px-0 text-xl font-semibold shadow-none placeholder:text-gray-400 sm:px-2 sm:text-3xl"
            required
            disabled={isPending}
            defaultValue={note?.title || state?.payload?.title?.toString()}
            rows={1}
            onInput={(e) => {
              // Auto-adjust height based on content
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = `${target.scrollHeight}px`
            }}
          />
          {state?.fieldErrors?.title && (
            <div className="mt-1 text-sm text-red-500">
              {state.fieldErrors.title}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-500">
            <Tag className="h-4 w-4 shrink-0" />
            <Input
              name="tags"
              type="text"
              placeholder="Add tags separated by commas (e.g. Work, Planning)"
              className="border-none px-0 shadow-none sm:px-2"
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
          <Clock className="h-4 w-4 shrink-0" />
          <span className="text-xs sm:text-sm">
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
            className="min-h-[300px] resize-none border-none px-0 text-base shadow-none sm:min-h-[500px] sm:px-2"
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
