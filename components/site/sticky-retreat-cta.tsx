'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import type { Retreat } from '@/lib/retreats'
import { trackSiteEvent } from '@/utils/analytics'
import { siteButtonClasses, siteTextClasses } from '@/utils/brand/site-brand'
import { useStickyCtaVisibility } from '@/components/site/use-sticky-cta-visibility'

export function StickyRetreatCta({ retreat }: { retreat: Retreat }) {
  const shouldReduceMotion = useReducedMotion()
  const { visible, dismiss } = useStickyCtaVisibility({
    ctaKey: 'retreat',
  })

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="relative fixed bottom-5 right-5 z-40 w-[300px] rounded-md border border-[color:var(--site-on-dark-primary)]/10 bg-[color:var(--site-accent-strong)]/70 p-4 shadow-2xl backdrop-blur-md"
        >
          <button
            type="button"
            aria-label="Dismiss popup"
            onClick={dismiss}
            className="absolute right-3 top-3 text-xs text-[var(--site-on-dark-muted)] transition hover:text-[var(--site-on-dark-primary)]"
          >
            Close
          </button>
          <div className="space-y-2">
            <p className={`${siteTextClasses.meta} text-[var(--site-on-dark-muted)]`}>Current retreat</p>
            <p className="font-serif text-base font-semibold text-[var(--site-on-dark-primary)]">{retreat.name}</p>
            <p className="text-xs text-[var(--site-on-dark-muted)]">{retreat.dates}</p>
            <p className="text-xs text-[var(--site-on-dark-muted)]">Limited spaces remaining</p>
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
            className={`mt-3 inline-flex w-full items-center justify-center px-4 py-2 text-xs font-medium transition-colors ${siteButtonClasses.primary}`}
          >
            Apply for This Retreat
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
