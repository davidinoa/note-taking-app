import { createTag } from '@/features/tags/db'
import { useCommandState } from 'cmdk'
import { revalidateTag } from 'next/cache'
import { Button } from './ui/button'

export default function CreateNewTagButton({
  onTagCreated,
}: {
  onTagCreated: () => void
}) {
  const searchValue = useCommandState((state) => state.search)

  return (
    <Button
      variant="outline"
      onClick={() => {
        createTag(searchValue).then(() => {
          onTagCreated()
          revalidateTag('tags')
        })
      }}>
      Create new tag: <span className="bold">{searchValue}</span>
    </Button>
  )
}
