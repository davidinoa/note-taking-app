import AppHeader from '@/components/app-header'
import { ClerkProvider } from '@clerk/nextjs'
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${merriweatherSerif.variable} antialiased`}>
        <body suppressHydrationWarning>
          <Suspense fallback={<div>Loading...</div>}>
            <AppHeader />
            {children}
          </Suspense>
        </body>
      </html>
    </ClerkProvider>
  )
}
