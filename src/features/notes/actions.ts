'use server'

import { CACHE_TAGS } from '@/lib/cache-tags'
import type { ActionState } from '@/lib/utils/to-action-state'
import { db, notes, notesToTags, tags } from '@/server/db'
import { currentUser } from '@clerk/nextjs/server'
import { sql } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { ZodError } from 'zod'
import {
  archiveNote as archiveNoteDb,
  restoreNote as restoreNoteDb,
} from './db'
import { createFormSchema } from './schema'

// Get static tags once
const notesTag = CACHE_TAGS.notes()
const tagsTag = CACHE_TAGS.tags()

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
          .where(
            sql`${tags.name} IN (${tagNames.map((tag) => `'${tag.replace(/'/g, "''")}'`).join(',')})`,
          )

        const existingTagsByName = new Map(
          existingTags.map((tag) => [tag.name, tag]),
        )

        // Get or create user-specific tags
        const userTags = await Promise.all(
          tagNames.map(async (name) => {
            const existingTag = existingTagsByName.get(name)
            if (existingTag?.userId === user.id) {
              return existingTag
            }
            // If tag exists but belongs to another user, or doesn't exist at all
            const [userTag] = await tx
              .insert(tags)
              .values({
                userId: user.id,
                name,
              })
              .onConflictDoNothing()
              .returning()

            if (!userTag) {
              // If insert failed due to conflict, fetch the existing tag
              const [existingUserTag] = await tx
                .select()
                .from(tags)
                .where(
                  sql`${tags.name} = ${name} AND ${tags.userId} = ${user.id}`,
                )
              return existingUserTag
            }

            return userTag
          }),
        )

        // Create all note-to-tag relationships in one batch
        await tx.insert(notesToTags).values(
          userTags.map((tag) => ({
            noteId: note.id,
            tagId: tag.id,
          })),
        )
      }

      revalidateTag(notesTag)
      revalidateTag(tagsTag)
      if (tagNames.length > 0) {
        revalidateTag(tagsTag)
      }

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
    console.log('Form data:', Object.fromEntries(formData.entries()))
    const result = createFormSchema.safeParse({
      title: formData.get('title'),
      content: formData.get('content'),
      tags: formData.get('tags'),
    })
    console.log('Parsed result:', result)
    console.log(
      'Title after parsing:',
      result.success ? result.data.title : 'parsing failed',
    )

    if (!result.success) return fromErrorToActionState(result.error, formData)
    const { title, content, tags: tagNames } = result.data
    console.log('Title before update:', title)

    const noteId = formData.get('id')
    if (!noteId) {
      return toActionState({
        status: 'ERROR',
        message: 'Note ID is required for updating',
      })
    }

    try {
      // First try a direct update without a transaction
      const [directUpdateResult] = await db
        .update(notes)
        .set({
          title,
          content,
          updatedAt: new Date(),
        })
        .where(sql`id = ${noteId.toString()} AND user_id = ${user.id}`)
        .returning()

      console.log('Direct update result:', directUpdateResult)

      if (!directUpdateResult) {
        return toActionState({
          status: 'ERROR',
          message: 'Note not found or you do not have permission to update it',
        })
      }

      // Process tags in a separate transaction
      await db.transaction(async (tx) => {
        await tx
          .delete(notesToTags)
          .where(sql`${notesToTags.noteId} = ${directUpdateResult.id}`)

        if (tagNames.length > 0) {
          const existingTags = await tx
            .select()
            .from(tags)
            .where(
              sql`${tags.name} IN (${tagNames.map((tag) => `'${tag.replace(/'/g, "''")}'`).join(',')})`,
            )

          const existingTagsByName = new Map(
            existingTags.map((tag) => [tag.name, tag]),
          )

          const newTagNames = tagNames.filter(
            (name) => !existingTagsByName.has(name),
          )
          let newTags: typeof existingTags = []

          if (newTagNames.length > 0) {
            try {
              newTags = await tx
                .insert(tags)
                .values(
                  newTagNames.map((name) => ({
                    userId: user.id,
                    name,
                  })),
                )
                .returning()
            } catch (error) {
              if (
                error instanceof Error &&
                'code' in error &&
                error.code === '23505'
              ) {
                const additionalTags = await tx
                  .select()
                  .from(tags)
                  .where(
                    sql`${tags.name} IN (${newTagNames.map((tag) => `'${tag.replace(/'/g, "''")}'`).join(',')})`,
                  )
                newTags = additionalTags
              } else {
                throw error
              }
            }
          }

          const allTags = [...existingTags, ...newTags]

          if (allTags.length > 0) {
            await tx.insert(notesToTags).values(
              allTags.map((tag) => ({
                noteId: directUpdateResult.id,
                tagId: tag.id,
              })),
            )
          }
        }
      })

      // Verify the update after everything is done
      const [verifiedNote] = await db
        .select()
        .from(notes)
        .where(sql`id = ${noteId.toString()} AND user_id = ${user.id}`)

      console.log('Final verification:', verifiedNote)

      if (!verifiedNote || verifiedNote.title !== title) {
        throw new Error(
          'Update verification failed - changes were not persisted',
        )
      }

      revalidateTag(notesTag)
      revalidateTag(tagsTag)

      return toActionState({
        status: 'SUCCESS',
        message: 'Note updated successfully',
      })
    } catch (error) {
      console.error('Error updating note:', error)
      return fromErrorToActionState(error, formData)
    }
  } catch (error) {
    console.error({ error })
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

    revalidateTag(notesTag)
    revalidateTag(tagsTag)

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

export async function archiveNote(noteId: string): Promise<ActionState> {
  const user = await currentUser()
  if (!user?.id) {
    return toActionState({
      status: 'ERROR',
      message: 'You must be logged in to archive notes',
    })
  }

  try {
    await archiveNoteDb(noteId)

    revalidateTag(notesTag)
    revalidateTag(tagsTag)

    return toActionState({
      status: 'SUCCESS',
      message: 'Note archived successfully',
    })
  } catch (error) {
    return fromErrorToActionState(error, new FormData())
  }
}

export async function restoreNote(noteId: string): Promise<ActionState> {
  const user = await currentUser()
  if (!user?.id) {
    return toActionState({
      status: 'ERROR',
      message: 'You must be logged in to restore notes',
    })
  }

  try {
    await restoreNoteDb(noteId)
    revalidateTag(notesTag)
    revalidateTag('archived-notes')
    return toActionState({
      status: 'SUCCESS',
      message: 'Note restored successfully',
    })
  } catch (error) {
    console.error(error)
    return toActionState({
      status: 'ERROR',
      message: 'Failed to restore note',
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
