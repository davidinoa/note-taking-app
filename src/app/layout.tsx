import AppHeader from '@/components/app-header'
import { MenuBar } from '@/components/menu-bar'
import SidebarContainer from '@/components/sidebar-container'
import { Toaster } from '@/components/ui/toaster'
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/nextjs'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Suspense } from 'react'
import './globals.css'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

const merriweatherSerif = localFont({
  src: [
    {
      path: './fonts/Merriweather.woff2',
      style: 'normal',
    },
    {
      path: './fonts/MerriweatherItalic.woff2',
      style: 'italic',
    },
  ],
  variable: '--font-merriweather-serif',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Notes',
  description: 'A simple app to save your notes',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const mobileLayout = (
    <div className="ds-md:hidden grid h-screen grid-rows-[auto_1fr_auto]">
      <AppHeader />
      <div className="grid grow grid-rows-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      <MenuBar />
    </div>
  )
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${merriweatherSerif.variable} antialiased`}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body suppressHydrationWarning>
        <Suspense fallback={<div>Loading...</div>}>
          <ClerkProvider>
            <SignedIn>
              <div className="ds-md:grid hidden h-screen grid-rows-[auto_1fr_auto]">
                <AppHeader />
                <div className="flex overflow-hidden">
                  <SidebarContainer />
                  <div className="grid grow grid-rows-1 overflow-hidden">
                    {children}
                  </div>
                </div>
              </div>
              {mobileLayout}
            </SignedIn>
            <SignedOut>{children}</SignedOut>
            <Toaster />
          </ClerkProvider>
        </Suspense>
      </body>
    </html>
  )
}
