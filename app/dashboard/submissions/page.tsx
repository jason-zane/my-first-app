import Link from 'next/link'
import { createAdminClient } from '@/utils/supabase/admin'
import { linkSubmissionContact, updateSubmissionStatus } from '@/app/dashboard/submissions/actions'

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

const submissionStatuses = ['new', 'reviewed', 'qualified', 'closed']

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

  let submissions: InterestSubmission[] = []
  let sourceOptions: string[] = []
  let loadError: string | null = null
  let totalCount = 0
  let newCount = 0
  let linkedCount = 0

  if (!adminClient) {
    loadError = 'Missing SUPABASE_SERVICE_ROLE_KEY in environment.'
  } else {
    let query = adminClient
      .from('interest_submissions')
      .select('id, first_name, last_name, email, source, status, created_at, contact_id')
      .order('created_at', { ascending: false })
      .limit(100)

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }
    if (sourceFilter !== 'all') {
      query = query.eq('source', sourceFilter)
    }
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
            .map((row) => row.source)
            .filter((value): value is string => Boolean(value))
        )
      ).sort((a, b) => a.localeCompare(b))
    }
  }

  const saved = typeof params.saved === 'string' ? params.saved : null
  const hasError = typeof params.error === 'string'

  return (
    <section>
      <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Submissions</h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Latest interest form submissions.
      </p>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Total</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{totalCount}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">New</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{newCount}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Linked</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{linkedCount}</p>
        </div>
      </div>

      <form className="mb-6 grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-4">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search name or email"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-400"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-400"
        >
          <option value="all">All Statuses</option>
          {submissionStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          name="source"
          defaultValue={sourceFilter}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-400"
        >
          <option value="all">All Sources</option>
          {sourceOptions.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Apply
          </button>
          <Link
            href="/dashboard/submissions"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Reset
          </Link>
        </div>
      </form>

      {saved ? (
        <p className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
          {saved === 'linked' ? 'Submission contact linked.' : 'Submission status updated.'}
        </p>
      ) : null}

      {hasError ? (
        <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          Could not save submission update.
        </p>
      ) : null}

      {loadError ? (
        <p className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          Could not load submissions: {loadError}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <tr>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Contact</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-500 dark:text-zinc-400">
                  No submissions yet.
                </td>
              </tr>
            ) : (
              submissions.map((submission) => (
                <tr
                  key={submission.id}
                  className="border-t border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:text-zinc-200"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(submission.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {submission.first_name} {submission.last_name}
                  </td>
                  <td className="px-4 py-3">{submission.email}</td>
                  <td className="px-4 py-3">{submission.source ?? 'N/A'}</td>
                  <td className="px-4 py-3">
                    <form action={updateSubmissionStatus} className="flex items-center gap-2">
                      <input type="hidden" name="submission_id" value={submission.id} />
                      <input type="hidden" name="contact_id" value={submission.contact_id ?? ''} />
                      <select
                        name="status"
                        defaultValue={submission.status}
                        className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-400"
                      >
                        {submissionStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-full border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    {submission.contact_id ? (
                      <Link
                        href={`/dashboard/contacts/${submission.contact_id}`}
                        className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
                      >
                        View Contact
                      </Link>
                    ) : (
                      <form action={linkSubmissionContact}>
                        <input type="hidden" name="submission_id" value={submission.id} />
                        <input type="hidden" name="first_name" value={submission.first_name} />
                        <input type="hidden" name="last_name" value={submission.last_name} />
                        <input type="hidden" name="email" value={submission.email} />
                        <input type="hidden" name="source" value={submission.source ?? ''} />
                        <button
                          type="submit"
                          className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
                        >
                          Create/Link Contact
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
