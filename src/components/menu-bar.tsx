'use client'

import { cn } from '@/lib/utils'
import { Download, Home, Search, Settings, Tag } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
}

const menuItems: MenuItem[] = [
  { icon: Home, label: 'Home', href: '/notes' },
  { icon: Search, label: 'Search', href: '/search' },
  { icon: Download, label: 'Archived', href: '/archived' },
  { icon: Tag, label: 'Tags', href: '/tags' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export function MenuBar() {
  const pathname = usePathname()

  return (
    <nav className="border-border bg-background fixed bottom-0 left-0 w-full border-t md:relative md:border-none">
      <ul className="ds-md:justify-center ds-md:gap-16 flex h-16 items-center justify-around">
        {menuItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'text-muted-foreground hover:text-foreground flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-sm transition-colors',
                  isActive && 'bg-primary/10 text-primary',
                )}>
                <Icon className="h-5 w-5" />
                <span className="sr-only md:not-sr-only">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
