'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import type { Retreat } from '@/lib/retreats'
import { trackSiteEvent } from '@/utils/analytics'
import { siteButtonClasses, siteTextClasses } from '@/utils/brand/site-brand'
import { useStickyCtaVisibility } from '@/components/site/use-sticky-cta-visibility'

export function StickySiteCta({ retreat }: { retreat: Retreat }) {
  const shouldReduceMotion = useReducedMotion()
  const { visible, dismiss } = useStickyCtaVisibility({
    ctaKey: 'site',
  })

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="fixed bottom-3 right-3 z-40 w-[280px] rounded-md border border-[var(--site-border-soft)] bg-[var(--site-surface-elevated)]/70 p-4 shadow-xl backdrop-blur-md sm:bottom-5 sm:right-5"
        >
          <button
            type="button"
            aria-label="Dismiss popup"
            onClick={dismiss}
            className="absolute right-3 top-3 text-xs text-[var(--site-text-muted)] transition hover:text-[var(--site-text-primary)]"
          >
            Close
          </button>
          <div className="space-y-2">
            <p className={`${siteTextClasses.meta} text-[var(--site-text-muted)]`}>Next retreat</p>
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
