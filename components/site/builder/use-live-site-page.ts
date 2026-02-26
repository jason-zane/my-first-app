'use client'

import { useEffect, useState } from 'react'
import type { PageDocument } from '@/utils/services/site-builder/types'

type SiteLivePayload = {
  ok: true
  page: { id: string; slug: string; name: string }
  version: { id: string; versionNumber: number; document: PageDocument }
}

export function useLiveSitePage(slug: string) {
  const [data, setData] = useState<SiteLivePayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetch(`/api/site/page/${slug}`, { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) return null
        return (await res.json()) as SiteLivePayload
      })
      .then((payload) => {
        if (!active) return
        setData(payload)
      })
      .catch(() => {
        if (!active) return
        setData(null)
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [slug])

  return { data, loading }
}
