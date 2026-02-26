import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireDashboardUser } from '@/utils/dashboard-auth'
import { getRetreatCmsById } from '@/utils/services/site-builder/retreats'
import {
  publishRetreatAction,
  saveRetreatDraftAction,
  unpublishRetreatAction,
} from '@/app/dashboard/site/retreats-actions'
import { RetreatEditor } from '@/components/dashboard/site/retreats/editor'

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function toRouteArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => typeof item === 'object' && item !== null)
    .map((item) => {
      const row = item as Record<string, unknown>
      return {
        name: typeof row.name === 'string' ? row.name : '',
        distance: typeof row.distance === 'string' ? row.distance : '',
        terrain: typeof row.terrain === 'string' ? row.terrain : '',
        elevation: typeof row.elevation === 'string' ? row.elevation : '',
        description: typeof row.description === 'string' ? row.description : '',
      }
    })
}

function toItineraryArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => typeof item === 'object' && item !== null)
    .map((item) => {
      const row = item as Record<string, unknown>
      const events = Array.isArray(row.events)
        ? row.events
            .filter((event) => typeof event === 'object' && event !== null)
            .map((event) => {
              const record = event as Record<string, unknown>
              return {
                time: typeof record.time === 'string' ? record.time : '',
                label: typeof record.label === 'string' ? record.label : '',
              }
            })
        : []

      return {
        day: typeof row.day === 'string' ? row.day : '',
        date: typeof row.date === 'string' ? row.date : '',
        events,
      }
    })
}

export default async function RetreatEditorPage({
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
  const error = typeof query.error === 'string' ? query.error : ''

  const retreat = await getRetreatCmsById(id)
  if (!retreat) notFound()

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Edit Retreat</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{retreat.name} /{retreat.slug}</p>
        </div>
        <Link
          href="/dashboard/site/retreats"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Back to Retreats
        </Link>
      </div>

      {saved ? (
        <p className="mb-4 rounded bg-emerald-50 px-4 py-2 text-sm text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
          {saved === 'published' ? 'Published.' : saved === 'unpublished' ? 'Unpublished.' : 'Draft saved.'}
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          Error: {error}
        </p>
      ) : null}

      <div className="mb-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Workflow: <span className="font-medium capitalize">{retreat.workflow_status}</span>
            {retreat.published_at ? ` • Published ${new Date(retreat.published_at).toLocaleString()}` : ''}
          </p>
          {auth.role === 'admin' ? (
            <div className="flex gap-2">
              <form action={publishRetreatAction}>
                <input type="hidden" name="id" value={retreat.id} />
                <button
                  type="submit"
                  className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                >
                  Publish
                </button>
              </form>

              {retreat.workflow_status === 'published' ? (
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
          ) : null}
        </div>
      </div>

      <form action={saveRetreatDraftAction} className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <input type="hidden" name="id" value={retreat.id} />
        <RetreatEditor
          value={{
            ...retreat,
            venue_highlights: toStringArray(retreat.venue_highlights),
            included: toStringArray(retreat.included),
            not_included: toStringArray(retreat.not_included),
            routes: toRouteArray(retreat.routes),
            itinerary: toItineraryArray(retreat.itinerary),
            seo_title: retreat.seo_title ?? '',
            seo_description: retreat.seo_description ?? '',
            seo_og_image_url: retreat.seo_og_image_url ?? '',
          }}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Save Draft
          </button>
        </div>
      </form>
    </section>
  )
}
