'use client'

import { usePathname } from 'next/navigation'
import type { Retreat } from '@/lib/retreats'
import { StickySiteCta } from '@/components/site/sticky-site-cta'

export function StickySiteCtaWrapper({ retreat }: { retreat: Retreat }) {
  const pathname = usePathname()
  const isRetreatDetail = pathname.startsWith('/retreats/')
  if (isRetreatDetail) return null
  return <StickySiteCta retreat={retreat} />
}
