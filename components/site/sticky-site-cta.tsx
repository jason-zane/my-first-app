'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Retreat } from '@/lib/retreats'
import { trackSiteEvent } from '@/utils/analytics'
import { siteButtonClasses, siteTextClasses } from '@/utils/brand/site-brand'

export function StickySiteCta({ retreat }: { retreat: Retreat }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.85)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="fixed bottom-5 right-5 z-40 w-[280px] rounded-md border border-[var(--site-border-soft)] bg-[var(--site-surface-elevated)] p-4 shadow-xl"
        >
          <div className="space-y-2">
            <p className={`${siteTextClasses.meta} text-[var(--site-text-muted)]`}>Current retreat</p>
            <p className="font-serif text-base font-semibold text-[var(--site-text-primary)]">{retreat.name}</p>
            <p className="text-xs text-[var(--site-text-muted)]">{retreat.dates}</p>
            <p className="text-xs text-[var(--site-text-muted)]">Limited spaces remaining</p>
          </div>
          <a
            href={`/retreats/${retreat.slug}`}
            onClick={() =>
              trackSiteEvent('cta_clicked', {
                cta_id: 'sticky_site_retreat',
                page_type: 'site',
                retreat_slug: retreat.slug,
              })
            }
            className={`mt-3 inline-flex w-full items-center justify-center px-4 py-2 text-xs font-medium transition-colors ${siteButtonClasses.primary}`}
          >
            View Retreat
          </a>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
