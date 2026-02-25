import { Playfair_Display, Lora } from 'next/font/google'
import { SiteNav } from '@/components/site/site-nav'
import { SiteFooter } from '@/components/site/site-footer'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${playfair.variable} ${lora.variable} font-lora`}>
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  )
}
