import Link from 'next/link'
import { requireDashboardUser } from '@/utils/dashboard-auth'
import { listRetreatCmsRows } from '@/utils/services/site-builder/retreats'
import {
  createRetreatAction,
  publishRetreatAction,
  unpublishRetreatAction,
} from '@/app/dashboard/site/retreats-actions'

export default async function RetreatsManagerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const auth = await requireDashboardUser()
  if (!auth.authorized) return null

  const query = await searchParams
  const error = typeof query.error === 'string' ? query.error : ''
  const saved = typeof query.saved === 'string' ? query.saved : ''

  const retreats = await listRetreatCmsRows()

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Retreat Pages</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage retreat detail pages with draft and publish workflow.
          </p>
        </div>
        <Link
          href="/dashboard/site"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Back to Site Builder
        </Link>
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

      <form
        action={createRetreatAction}
        className="mb-6 grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-3"
      >
        <input
          name="name"
          placeholder="New retreat name"
          required
          className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
        <input
          name="slug"
          placeholder="slug (optional)"
          className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Create Retreat Page
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {retreats.map((retreat) => (
          <div
            key={retreat.id}
            className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{retreat.name}</h2>
              <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {retreat.workflow_status}
              </span>
            </div>
            <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">/{retreat.slug}</p>
            <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
              Updated {new Date(retreat.updated_at).toLocaleString()}
            </p>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/dashboard/site/retreats/${retreat.id}`}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Edit Retreat
              </Link>
              <Link
                href={`/retreats/${retreat.slug}`}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                View Live
              </Link>
              {auth.role === 'admin' ? (
                <form action={publishRetreatAction}>
                  <input type="hidden" name="id" value={retreat.id} />
                  <button
                    type="submit"
                    className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                  >
                    Publish
                  </button>
                </form>
              ) : null}
              {auth.role === 'admin' && retreat.workflow_status === 'published' ? (
                <form action={unpublishRetreatAction}>
                  <input type="hidden" name="id" value={retreat.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-amber-300 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/20"
                  >
                    Unpublish
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
