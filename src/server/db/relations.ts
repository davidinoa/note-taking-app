import { relations } from 'drizzle-orm'
import { notes, notesToTags, tags } from './schema'

export const notesRelations = relations(notes, ({ many }) => ({
  notesToTags: many(notesToTags),
}))

export const notesToTagsRelations = relations(notesToTags, ({ one }) => ({
  note: one(notes, {
    fields: [notesToTags.noteId],
    references: [notes.id],
  }),
  tag: one(tags, {
    fields: [notesToTags.tagId],
    references: [tags.id],
  }),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  notesToTags: many(notesToTags),
}))
