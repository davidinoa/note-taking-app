import { env } from '@/env'
import { db } from '@/server/db'
import { notes, notesToTags, tags } from '@/server/db/schema'
import { faker } from '@faker-js/faker'

async function main() {
  const userId = env.SEED_USER_ID

  // Clear existing data
  await db.delete(notesToTags)
  await db.delete(notes)
  await db.delete(tags)

  const tagNames = [
    'work',
    'personal',
    'ideas',
    'todo',
    'research',
    'meeting',
    'project',
    'learning',
    'important',
    'archive',
    'reference',
  ]

  const createdTags = await Promise.all(
    tagNames.map((name) =>
      db
        .insert(tags)
        .values({ name, userId })
        .returning()
        .then((res) => res[0]),
    ),
  )

  const NOTE_COUNT = 26
  const START_DATE = '2024-01-01'
  const END_DATE = '2025-01-01'

  const createdNotes = await Promise.all(
    Array.from({ length: NOTE_COUNT }, async () => {
      const randomDate = faker.date.between({
        from: START_DATE,
        to: END_DATE,
      })

      return db
        .insert(notes)
        .values({
          title: faker.helpers.arrayElement([
            faker.company.catchPhrase(),
            faker.hacker.phrase(),
            faker.lorem.sentence(3),
            `Meeting: ${faker.company.buzzPhrase()}`,
            `Project: ${faker.commerce.productName()}`,
            `Ideas for ${faker.company.buzzNoun()}`,
          ]),
          content: faker.lorem.paragraphs(3),
          status: faker.helpers.arrayElement([
            'draft',
            'published',
            'archived',
          ]),
          createdAt: randomDate,
          userId,
        })
        .returning()
        .then((res) => res[0])
    }),
  )

  // Randomly assign 1-3 tags to each note
  await Promise.all(
    createdNotes.map((note) => {
      const numberOfTags = faker.number.int({ min: 1, max: 3 })
      const selectedTags = faker.helpers.arrayElements(
        createdTags,
        numberOfTags,
      )

      return Promise.all(
        selectedTags.map((tag) =>
          db.insert(notesToTags).values({
            noteId: note.id,
            tagId: tag.id,
          }),
        ),
      )
    }),
  )

  console.log('✅ Seeding completed')
}

main().catch((err) => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})
