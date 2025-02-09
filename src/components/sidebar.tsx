import { fetchTags } from '@/features/tags/db'
import { Tag } from 'lucide-react'

export default async function Sidebar() {
  const tagsData = await fetchTags()
  return (
    <aside className="border-ds-neutral-200 ds-md:block hidden h-full w-xs border-r p-8">
      <h2 className="text-lg font-bold">Tags</h2>
      <ul className="space-y-4">
        {tagsData.map((tag) => (
          <li key={tag.id} className="flex items-center gap-2">
            <Tag className="size-4" />
            {tag.name}
          </li>
        ))}
      </ul>
    </aside>
  )
}
