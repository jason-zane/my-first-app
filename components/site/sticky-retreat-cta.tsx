'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Retreat } from '@/lib/retreats'
import { trackSiteEvent } from '@/utils/analytics'

export function StickyRetreatCta({ retreat }: { retreat: Retreat }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.85)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-[#FAF8F4]/10 bg-[#2C4A3E]/95 px-6 py-4 shadow-xl backdrop-blur-sm"
        >
          <div className="min-w-0">
            <p className="font-medium text-[#FAF8F4]">{retreat.name}</p>
            <p className="text-sm text-[#7A9E8E]">
              {retreat.dates} · From ${retreat.priceFrom.toLocaleString()} pp
            </p>
          </div>
          <a
            href="#register"
            onClick={() =>
              trackSiteEvent('cta_clicked', {
                cta_id: 'sticky_retreat_apply',
                page_type: 'retreat',
                retreat_slug: retreat.slug,
              })
            }
            className="shrink-0 bg-[#FAF8F4] px-6 py-3 text-sm font-medium text-[#2C4A3E] transition-colors hover:bg-white"
          >
            Apply for This Retreat
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
