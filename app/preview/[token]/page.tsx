import { notFound } from 'next/navigation'
import { resolvePreviewToken } from '@/utils/services/site-builder/data'
import { SitePageRenderer } from '@/components/site/builder/page-renderer'

export default async function SitePreviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const preview = await resolvePreviewToken(token)
  if (!preview) notFound()

  return (
    <div className="site-theme-v1 min-h-screen bg-[var(--site-bg)] text-[var(--site-text-primary)]">
      <div className="border-b border-[var(--site-border-soft)] bg-[var(--site-surface-elevated)] px-6 py-3">
        <p className="text-xs uppercase tracking-wider text-[var(--site-text-muted)]">Preview Mode</p>
        <p className="text-sm text-[var(--site-text-body)]">
          {preview.page.name} · version {preview.version.version_number}
        </p>
      </div>
      <SitePageRenderer document={preview.version.document} />
    </div>
  )
}
