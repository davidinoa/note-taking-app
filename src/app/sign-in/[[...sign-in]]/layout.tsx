import { Suspense } from 'react'

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen place-items-center">
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </div>
  )
}
