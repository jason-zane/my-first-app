import { Suspense } from 'react'
import Link from 'next/link'
import { createAdminClient } from '@/utils/supabase/admin'
import { StatusBadge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { CopyEmail } from '@/components/ui/copy-email'
import { RelativeTime } from '@/components/ui/relative-time'
import { ActionFeedback } from '@/components/ui/action-feedback'
import { SubmissionRowActions } from '@/components/dashboard/submissions/submission-row-actions'

type InterestSubmission = {
  id: string
  first_name: string
  last_name: string
  email: string
  source: string | null
  status: string
  created_at: string
  contact_id: string | null
}

const feedbackMessages: Record<string, string> = {
  linked: 'Contact created and linked.',
  status: 'Status updated.',
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const adminClient = createAdminClient()

  const q =
    typeof params.q === 'string' ? params.q.trim().replaceAll(',', ' ').replaceAll('%', '') : ''
  const statusFilter = typeof params.status === 'string' ? params.status : 'all'
  const sourceFilter = typeof params.source === 'string' ? params.source : 'all'
  const hasFilters = q || statusFilter !== 'all' || sourceFilter !== 'all'

  let submissions: InterestSubmission[] = []
  let sourceOptions: string[] = []
  let loadError: string | null = null
  let totalCount = 0
  let newCount = 0
  let linkedCount = 0

  const submissionStatuses = ['new', 'reviewed', 'qualified', 'closed']

  if (!adminClient) {
    loadError = 'Missing SUPABASE_SERVICE_ROLE_KEY in environment.'
  } else {
    let query = adminClient
      .from('interest_submissions')
      .select('id, first_name, last_name, email, source, status, created_at, contact_id')
      .order('created_at', { ascending: false })
      .limit(100)

    if (statusFilter !== 'all') query = query.eq('status', statusFilter)
    if (sourceFilter !== 'all') query = query.eq('source', sourceFilter)
    if (q) {
      query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`)
    }

    const [
      { data, error },
      { count: totalCountValue },
      { count: newCountValue },
      { count: linkedCountValue },
      { data: allSourcesRows },
    ] = await Promise.all([
      query,
      adminClient.from('interest_submissions').select('*', { count: 'exact', head: true }),
      adminClient
        .from('interest_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new'),
      adminClient
        .from('interest_submissions')
        .select('*', { count: 'exact', head: true })
        .not('contact_id', 'is', null),
      adminClient.from('interest_submissions').select('source'),
    ])

    if (error) {
      loadError = error.message
    } else {
      submissions = (data ?? []) as InterestSubmission[]
      totalCount = totalCountValue ?? 0
      newCount = newCountValue ?? 0
      linkedCount = linkedCountValue ?? 0
      sourceOptions = Array.from(
        new Set(
          ((allSourcesRows ?? []) as Array<{ source: string | null }>)
            .map((r) => r.source)
            .filter((v): v is string => Boolean(v))
        )
      ).sort((a, b) => a.localeCompare(b))
    }
  }

  return (
    <section>
      <Suspense>
        <ActionFeedback messages={feedbackMessages} />
      </Suspense>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Submissions</h1>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          Interest form submissions from the public site.
        </p>
      </div>

      {/* Stat strip */}
      <div className="mb-5 flex flex-wrap gap-4">
        {[
          { label: 'Total', value: totalCount },
          { label: 'New', value: newCount },
          { label: 'Linked to contact', value: linkedCount },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex items-baseline gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{value}</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Filter toolbar */}
      <form className="mb-5 flex flex-wrap items-center gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search name or email…"
          className="h-9 min-w-48 rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-400"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="h-9 rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-400"
        >
          <option value="all">All statuses</option>
          {submissionStatuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          name="source"
          defaultValue={sourceFilter}
          className="h-9 rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-400"
        >
          <option value="all">All sources</option>
          {sourceOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          type="submit"
          className="h-9 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Apply
        </button>
        {hasFilters && (
          <Link
            href="/dashboard/submissions"
            className="h-9 flex items-center rounded-lg border border-zinc-300 px-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Clear
          </Link>
        )}
      </form>

      {loadError ? (
        <p className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          Could not load submissions: {loadError}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Submitted
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Person
              </th>
              <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 sm:table-cell">
                Email
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Status
              </th>
              <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 md:table-cell">
                Source
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  {hasFilters ? 'No submissions match your filters.' : 'No submissions yet.'}
                </td>
              </tr>
            ) : (
              submissions.map((sub) => {
                const fullName = `${sub.first_name} ${sub.last_name}`
                return (
                  <tr
                    key={sub.id}
                    className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                  >
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      <RelativeTime date={sub.created_at} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={fullName} />
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-900 dark:text-zinc-50">{fullName}</p>
                          {sub.contact_id && (
                            <Link
                              href={`/dashboard/contacts/${sub.contact_id}`}
                              className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                            >
                              View contact →
                            </Link>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <CopyEmail email={sub.email} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="hidden px-4 py-3 text-zinc-500 capitalize dark:text-zinc-400 md:table-cell">
                      {sub.source ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <SubmissionRowActions
                        submissionId={sub.id}
                        currentStatus={sub.status}
                        contactId={sub.contact_id}
                        firstName={sub.first_name}
                        lastName={sub.last_name}
                        email={sub.email}
                        source={sub.source}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
