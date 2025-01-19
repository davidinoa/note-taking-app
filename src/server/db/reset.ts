import { sql } from '@vercel/postgres'

async function reset() {
  console.log('🗑️  Dropping all tables...')

  try {
    await sql`DROP TABLE IF EXISTS notes_app_notes_to_tags CASCADE;`
    console.log('✓ Dropped notes_to_tags table')

    await sql`DROP TABLE IF EXISTS notes_app_note CASCADE;`
    console.log('✓ Dropped notes table')

    await sql`DROP TABLE IF EXISTS notes_app_tag CASCADE;`
    console.log('✓ Dropped tags table')

    await sql`DROP TYPE IF EXISTS note_status CASCADE;`
    console.log('✓ Dropped note_status enum')

    console.log('✅ All tables dropped successfully')
  } catch (error) {
    console.error('❌ Error dropping tables:', error)
    process.exit(1)
  }
}

reset().catch((err) => {
  console.error('❌ Unexpected error:', err)
  process.exit(1)
})
