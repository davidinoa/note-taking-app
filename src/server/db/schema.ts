import { sql } from 'drizzle-orm'
import {
  customType,
  index,
  pgEnum,
  pgTableCreator,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { nanoid } from 'nanoid'

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `notes_app_${name}`)

const NANO_ID_LENGTH = 10

const nanoId = customType<{ data: string }>({
  dataType: () => `varchar(${NANO_ID_LENGTH})`,
  toDriver: (value: string) => value,
})

const createId = (name = 'id') =>
  nanoId(name)
    .notNull()
    .$default(() => nanoid(NANO_ID_LENGTH))

export const noteStatusEnum = pgEnum('note_status', [
  'draft',
  'published',
  'archived',
])

export const tags = createTable(
  'tag',
  {
    id: createId().primaryKey(),
    userId: varchar('user_id', { length: 32 }).notNull(),
    name: varchar('name', { length: 50 }).notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('tag_name_idx').on(table.name),
    index('tag_user_id_idx').on(table.userId),
  ],
)

export const notes = createTable(
  'note',
  {
    id: createId().primaryKey(),
    userId: varchar('user_id', { length: 32 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content'),
    status: noteStatusEnum('status').default('draft').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => [
    index('note_title_idx').on(table.title),
    index('note_user_id_idx').on(table.userId),
  ],
)

export const notesToTags = createTable(
  'notes_to_tags',
  {
    id: createId().primaryKey(),
    noteId: createId('note_id').references(() => notes.id, {
      onDelete: 'cascade',
    }),
    tagId: createId('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('note_id_idx').on(table.noteId),
    index('tag_id_idx').on(table.tagId),
  ],
)
