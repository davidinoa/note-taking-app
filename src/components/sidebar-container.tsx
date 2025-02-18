import { fetchTags } from '@/features/tags/db'
import Sidebar from './sidebar'

export default async function SidebarContainer() {
  const tagsData = await fetchTags()
  return <Sidebar tagsData={tagsData} />
}
