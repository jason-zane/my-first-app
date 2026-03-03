'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const DEFAULT_ITEMS = [
  'MILES // BETWEEN RETREATS',
  'Small Group Experiences',
  'Trail Running + Recovery',
  'New Dates Announced First',
  'Explore Current Retreats',
  'Join the Retreat List',
]

export function Marquee({ items = DEFAULT_ITEMS, href = '/retreats' }: { items?: string[]; href?: string }) {
  const all = [...items, ...items, ...items]

  return (
    <Link
      href={href}
      className="block overflow-hidden border-y border-[color:var(--site-on-dark-primary)]/12 bg-[var(--site-accent-strong)] py-4 transition-colors hover:bg-[var(--site-accent-deep)]"
      aria-label="View retreat pages"
    >
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ['0%', '-33.333%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        {all.map((item, i) => (
          <span
            key={i}
            className="font-ui inline-flex items-center gap-5 px-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--site-on-dark-muted)]"
          >
            {item}
            <span className="text-[var(--site-cta-bg)]/85">·</span>
          </span>
        ))}
      </motion.div>
    </Link>
  )
}
