'use client'

import { motion } from 'framer-motion'

const DEFAULT_ITEMS = [
  'Miles Between',
  'Southern Highlands',
  '24–27 September 2026',
  '12 Guests',
  'Bargo, NSW',
  'Nattai National Park',
  'From $5,899',
]

export function Marquee({ items = DEFAULT_ITEMS }: { items?: string[] }) {
  const all = [...items, ...items, ...items]

  return (
    <div className="overflow-hidden border-y border-[#FAF8F4]/10 bg-[#2C4A3E] py-3.5">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ['0%', '-33.333%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        {all.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-5 px-2 text-xs font-medium uppercase tracking-[0.2em] text-[#A8C4B8]"
          >
            {item}
            <span className="opacity-30">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}
