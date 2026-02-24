import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Miles Between — Running Retreats",
  description:
    "Escape the everyday. Run through stunning landscapes. Connect with like-minded people. Miles Between is a running retreat for people who love the journey.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
