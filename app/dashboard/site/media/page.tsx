import Link from 'next/link'
import { requireDashboardUser } from '@/utils/dashboard-auth'
import { listMediaAssets } from '@/utils/services/site-builder/data'
import { refreshMediaAction, uploadMediaAction } from '@/app/dashboard/site/actions'

export default async function SiteMediaLibraryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const auth = await requireDashboardUser()
  if (!auth.authorized) return null

  const query = await searchParams
  const saved = typeof query.saved === 'string' ? query.saved : ''
  const error = typeof query.error === 'string' ? query.error : ''

  const assets = await listMediaAssets()

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Site Media Library</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Upload and reuse assets across builder blocks.</p>
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

      <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Upload Asset</h2>
        <form action={uploadMediaAction} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <input
            name="file"
            type="file"
            required
            className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          <input
            name="alt_text"
            type="text"
            placeholder="Alt text"
            className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Upload
          </button>
        </form>
      </div>

      <form action={refreshMediaAction} className="mb-4">
        <button
          type="submit"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Refresh list
        </button>
      </form>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <div key={String(asset.id)} className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
            <img
              src={String(asset.public_url)}
              alt={String(asset.alt_text ?? '')}
              className="mb-2 h-40 w-full rounded object-cover"
            />
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{String(asset.storage_path)}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{String(asset.alt_text ?? 'No alt text')}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
