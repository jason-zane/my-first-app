import { NextResponse } from 'next/server'
import { getPublishedRetreats } from '@/utils/services/site-builder/retreats'

export async function GET() {
  try {
    const rows = await getPublishedRetreats()
    return NextResponse.json({
      ok: true,
      retreats: rows.map((row) => ({
        slug: row.slug,
        name: row.name,
        region: row.region,
        priceFrom: row.priceFrom,
        heroImage: row.heroImage,
        heroImageAlt: row.heroImageAlt,
      })),
    })
  } catch {
    return NextResponse.json({ ok: true, retreats: [] })
  }
}
