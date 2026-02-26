import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireDashboardUser } from '@/utils/dashboard-auth'
import { getSitePageById, listPageVersions } from '@/utils/services/site-builder/data'
import { createPreviewAction, rollbackAction } from '@/app/dashboard/site/actions'

export default async function SitePageHistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const auth = await requireDashboardUser()
  if (!auth.authorized) return null

  const { id } = await params
  const query = await searchParams
  const saved = typeof query.saved === 'string' ? query.saved : ''

  const page = await getSitePageById(id)
  if (!page) notFound()

  const versions = await listPageVersions(page.id)

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Version History</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{page.name} ({page.slug})</p>
        </div>
        <Link
          href={`/dashboard/site/${page.id}`}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Back to Editor
        </Link>
      </div>

      {saved ? (
        <p className="mb-4 rounded bg-emerald-50 px-4 py-2 text-sm text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
          Saved: {saved}
        </p>
      ) : null}

      <div className="space-y-3">
        {versions.map((version) => (
          <div key={version.id} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Version {version.version_number}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(version.created_at).toLocaleString()}</p>
            </div>
            <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{version.notes ?? 'No notes'}</p>
            <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">Blocks: {version.document.blocks.length}</p>

            <div className="flex flex-wrap gap-2">
              <form action={createPreviewAction}>
                <input type="hidden" name="page_id" value={page.id} />
                <input type="hidden" name="version_id" value={version.id} />
                <button
                  type="submit"
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Preview
                </button>
              </form>

              {auth.role === 'admin' ? (
                <form action={rollbackAction}>
                  <input type="hidden" name="page_id" value={page.id} />
                  <input type="hidden" name="version_id" value={version.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/20"
                  >
                    Rollback to this version
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
