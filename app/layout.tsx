import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Miles Between | Running Retreats',
  description:
    'Small-group running retreats with guided trail routes, thoughtful recovery time, and strong shared-table culture.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster position="bottom-right" richColors closeButton />
        <SpeedInsights />
      </body>
    </html>
  )
}
