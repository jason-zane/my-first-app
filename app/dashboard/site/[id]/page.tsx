import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireDashboardUser } from '@/utils/dashboard-auth'
import { getDraftDocument, getSitePageById } from '@/utils/services/site-builder/data'
import { SitePageEditor } from '@/components/dashboard/site/page-editor'

export default async function SiteBuilderEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requireDashboardUser()
  if (!auth.authorized) return null

  const { id } = await params
  const page = await getSitePageById(id)
  if (!page) notFound()

  const draft = await getDraftDocument(page)

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href="/dashboard/site"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Back to Site Builder
        </Link>
        <Link
          href={`/dashboard/site/${page.id}/history`}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Version History
        </Link>
      </div>

      <SitePageEditor
        page={page}
        initialDocument={draft.document}
        draftVersionId={draft.versionId}
        role={auth.role}
      />
    </section>
  )
}
