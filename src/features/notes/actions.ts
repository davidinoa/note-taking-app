'use server'

import { db, notes } from '@/server/db'
import { currentUser } from '@clerk/nextjs/server'

export async function createNote(formData: FormData) {
  const user = await currentUser()
  const userId = user?.id ?? ''

  // Validate the form data
  const title = formData.get('title') as string
  const tags = formData.get('tags') as string
  const content = formData.get('content') as string
  if (!title || !content) return

  const tagArray = tags
    ? tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : []

  try {
    await db.insert(notes).values({
      userId,
      title,
      content,
    })
    console.log('Saving note:', { title, tags: tagArray, content })
  } catch (error) {
    console.error('Error creating note:', error)
  }
}
