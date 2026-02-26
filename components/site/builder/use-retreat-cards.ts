'use client'

import { useEffect, useState } from 'react'

type RetreatCard = {
  slug: string
  name: string
  region: string
  priceFrom: number
  heroImage: string
  heroImageAlt: string
}

export function useRetreatCards() {
  const [cards, setCards] = useState<RetreatCard[]>([])

  useEffect(() => {
    let active = true

    fetch('/api/site/retreats', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) return null
        return (await res.json()) as { ok: boolean; retreats?: RetreatCard[] }
      })
      .then((payload) => {
        if (!active || !payload?.ok || !Array.isArray(payload.retreats)) return
        setCards(payload.retreats)
      })
      .catch(() => {
        if (!active) return
      })

    return () => {
      active = false
    }
  }, [])

  return cards
}
