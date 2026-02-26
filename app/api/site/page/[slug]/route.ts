import { NextResponse } from 'next/server'
import { getPublishedPageBySlug } from '@/utils/services/site-builder/data'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const page = await getPublishedPageBySlug(slug)
    if (!page) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      page: {
        id: page.page.id,
        slug: page.page.slug,
        name: page.page.name,
      },
      version: {
        id: page.version.id,
        versionNumber: page.version.version_number,
        document: page.version.document,
      },
    })
  } catch {
    return NextResponse.json({ error: 'load_failed' }, { status: 500 })
  }
}
