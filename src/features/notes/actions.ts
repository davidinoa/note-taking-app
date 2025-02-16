'use server'

import type { ActionState } from '@/lib/utils/to-action-state'
import { db, notes, notesToTags, tags } from '@/server/db'
import { currentUser } from '@clerk/nextjs/server'
import { sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { createFormSchema } from './schema'

export async function createNote(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await currentUser()
  if (!user?.id) {
    return toActionState({
      status: 'ERROR',
      message: 'You must be logged in to create notes',
    })
  }

  try {
    const result = createFormSchema.safeParse({
      title: formData.get('title'),
      content: formData.get('content'),
      tags: formData.get('tags'),
    })

    if (!result.success) return fromErrorToActionState(result.error, formData)
    const { title, content, tags: tagNames } = result.data

    return await db.transaction(async (tx) => {
      const [note] = await tx
        .insert(notes)
        .values({
          userId: user.id,
          title,
          content,
          status: 'draft', // Set default status
        })
        .returning()

      if (tagNames.length > 0) {
        // Batch tag operations for better performance
        const existingTags = await tx
          .select()
          .from(tags)
          .where(sql`${tags.name} = ANY(ARRAY[${tagNames}]::text[])`)

        const existingTagNames = new Set(existingTags.map((tag) => tag.name))
        const newTagNames = tagNames.filter(
          (name) => !existingTagNames.has(name),
        )

        // Create new tags in batch if needed
        let newTags: typeof existingTags = []
        if (newTagNames.length > 0) {
          newTags = await tx
            .insert(tags)
            .values(
              newTagNames.map((name) => ({
                userId: user.id,
                name,
              })),
            )
            .returning()
        }

        // Create all note-to-tag relationships in one batch
        const allTags = [...existingTags, ...newTags]
        await tx.insert(notesToTags).values(
          allTags.map((tag) => ({
            noteId: note.id,
            tagId: tag.id,
          })),
        )
      }

      revalidatePath('/')
      return toActionState({
        status: 'SUCCESS',
        message: 'Note created successfully',
      })
    })
  } catch (error) {
    return fromErrorToActionState(error, formData)
  }
}

export async function updateNote(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await currentUser()
  if (!user?.id) {
    return toActionState({
      status: 'ERROR',
      message: 'You must be logged in to update notes',
    })
  }

  try {
    const result = createFormSchema.safeParse({
      title: formData.get('title'),
      content: formData.get('content'),
      tags: formData.get('tags'),
    })

    if (!result.success) return fromErrorToActionState(result.error, formData)
    const { title, content, tags: tagNames } = result.data

    const noteId = formData.get('id')
    if (!noteId) {
      return toActionState({
        status: 'ERROR',
        message: 'Note ID is required for updating',
      })
    }

    return await db.transaction(async (tx) => {
      // Update the note
      const [updatedNote] = await tx
        .update(notes)
        .set({
          title,
          content,
          updatedAt: new Date(),
        })
        .where(
          sql`${notes.id} = ${noteId.toString()} AND ${notes.userId} = ${user.id}`,
        )
        .returning()

      if (!updatedNote) {
        return toActionState({
          status: 'ERROR',
          message: 'Note not found or you do not have permission to update it',
        })
      }

      // Delete existing tag relationships
      await tx
        .delete(notesToTags)
        .where(sql`${notesToTags.noteId} = ${updatedNote.id}`)

      if (tagNames.length > 0) {
        // Batch tag operations for better performance
        const existingTags = await tx
          .select()
          .from(tags)
          .where(sql`${tags.name} = ANY(ARRAY[${tagNames}]::text[])`)

        const existingTagNames = new Set(existingTags.map((tag) => tag.name))
        const newTagNames = tagNames.filter(
          (name) => !existingTagNames.has(name),
        )

        // Create new tags in batch if needed
        let newTags: typeof existingTags = []
        if (newTagNames.length > 0) {
          newTags = await tx
            .insert(tags)
            .values(
              newTagNames.map((name) => ({
                userId: user.id,
                name,
              })),
            )
            .returning()
        }

        // Create all note-to-tag relationships in one batch
        const allTags = [...existingTags, ...newTags]
        await tx.insert(notesToTags).values(
          allTags.map((tag) => ({
            noteId: updatedNote.id,
            tagId: tag.id,
          })),
        )
      }

      revalidatePath('/')
      return toActionState({
        status: 'SUCCESS',
        message: 'Note updated successfully',
      })
    })
  } catch (error) {
    return fromErrorToActionState(error, formData)
  }
}

export async function deleteNote(noteId: string): Promise<ActionState> {
  const user = await currentUser()
  if (!user?.id) {
    return toActionState({
      status: 'ERROR',
      message: 'You must be logged in to delete a note',
    })
  }

  try {
    const [deletedNote] = await db
      .delete(notes)
      .where(sql`${notes.id} = ${noteId} AND ${notes.userId} = ${user.id}`)
      .returning()

    if (!deletedNote) {
      return toActionState({
        status: 'ERROR',
        message: 'Note not found or you do not have permission to delete it',
      })
    }

    revalidatePath('/')
    return toActionState({
      status: 'SUCCESS',
      message: 'Note deleted successfully',
    })
  } catch (error) {
    console.error(error)
    return toActionState({
      status: 'ERROR',
      message: 'Failed to delete note',
    })
  }
}

function fromErrorToActionState(
  error: unknown,
  formData: FormData,
): ActionState {
  const formDataAsRecord = Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [key, String(value)]),
  )

  if (error instanceof ZodError) {
    return {
      status: 'ERROR',
      message: 'Validation failed. Please check your inputs.',
      payload: formDataAsRecord,
      fieldErrors: error.flatten().fieldErrors,
      timestamp: Date.now(),
    }
  }

  if (error instanceof Error && 'code' in error) {
    const dbError = error as Error & { code: string }
    if (dbError.code === '23505') {
      return {
        status: 'ERROR',
        message: 'A note with this title already exists',
        payload: formDataAsRecord,
        fieldErrors: null,
        timestamp: Date.now(),
      }
    }
  }

  return {
    status: 'ERROR',
    message: 'An unexpected error occurred while creating your note',
    payload: formDataAsRecord,
    fieldErrors: null,
    timestamp: Date.now(),
  }
}

function toActionState({
  status,
  message,
}: {
  status: ActionState['status']
  message: string
}): ActionState {
  return {
    status,
    message,
    payload: null,
    fieldErrors: null,
    timestamp: Date.now(),
  }
}
