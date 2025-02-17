'use client'

import { Check } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { createTag } from '@/features/tags/db'
import { cn } from '@/lib/utils'
import { useCommandState } from 'cmdk'

type TagSelectorProps = {
  items: {
    value: string
    label: string
  }[]
}

export default function TagSelector({ items }: TagSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between">
          {value
            ? items.find((item) => item.value === value)?.label
            : 'Search or create a tag...'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search tags..." className="h-9" />
          <CommandList>
            <CommandEmpty>
              <CreateNewTagButton onTagCreated={() => setOpen(false)} />
            </CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue: string) => {
                    setValue(currentValue === value ? '' : currentValue)
                    setOpen(false)
                  }}>
                  {item.label}
                  <Check
                    className={cn(
                      'ml-auto',
                      value === item.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function CreateNewTagButton({ onTagCreated }: { onTagCreated: () => void }) {
  const searchValue = useCommandState((state) => state.search)

  return (
    <Button
      variant="outline"
      onClick={async () => {
        createTag(searchValue).then(() => {
          onTagCreated()
        })
      }}>
      Create new tag: <span className="bold">{searchValue}</span>
    </Button>
  )
}
