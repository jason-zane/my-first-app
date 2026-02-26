import Link from 'next/link'
import { requireDashboardUser } from '@/utils/dashboard-auth'

export default async function SiteBuilderIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const auth = await requireDashboardUser()
  if (!auth.authorized) return null

  const params = await searchParams
  const saved = typeof params.saved === 'string' ? params.saved : ''
  const error = typeof params.error === 'string' ? params.error : ''

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Site Builder</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Core marketing pages are currently hardcoded. Retreat pages are managed here with draft and publish workflow.
        </p>
      </div>

      {saved ? (
        <p className="mb-4 rounded bg-emerald-50 px-4 py-2 text-sm text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
          Saved: {saved}
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          Error: {error}
        </p>
      ) : null}

      <div className="mt-6">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/site/media"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Open Media Library
          </Link>
          <Link
            href="/dashboard/site/retreats"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Manage Retreat Pages (Draft / Publish)
          </Link>
        </div>
      </div>
    </section>
  )
}
