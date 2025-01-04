import { db } from '@/server/db'

type Props = {
  searchParams: Promise<{ query: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const query = (await searchParams).query
  const notes = await db.query.notes.findMany({
    where: (notes, { ilike, or }) =>
      or(ilike(notes.title, `%${query}%`), ilike(notes.content, `%${query}%`)),
  })

  return (
    <div>
      <ul className="grid gap-8">
        {notes.map((note) => (
          <li key={note.id}>
            <h2 className="text-md font-bold">{note.title}</h2>
            <p className="text-muted-foreground text-sm">{note.content}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
